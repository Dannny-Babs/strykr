import "server-only";

import { and, asc, desc, eq, gt, inArray, like, ne, or, sql } from "drizzle-orm";
import type { SessionUser } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { audits, dealerships, documents, exceptions, importBatches, reconciliationRuns, reportingPeriods, transactions, vehicles } from "@/server/db/schema";
import { getWorkspace } from "./workspace";
import { aggregateMonthlyValues, buildReadinessBuckets, reconciliationOutcomeCategories } from "@/domain/product/ui-system";
import { parseDatasetSort } from "@/domain/product/ui-system";

const asActor = (actor: SessionUser) => ({ id: actor.id, organizationId: actor.organizationId, dealershipId: actor.dealershipId, role: actor.role });

export function getDealerProductData(actor: SessionUser) {
  if (!actor.dealershipId) throw new Error("Dealer account is not connected to a dealership.");
  const workspace = getWorkspace(asActor(actor), actor.dealershipId);
  const imports = db.select().from(importBatches).where(eq(importBatches.dealershipId, actor.dealershipId)).orderBy(desc(importBatches.createdAt)).limit(30).all();
  const documentRows = db.select().from(documents).where(eq(documents.dealershipId, actor.dealershipId)).orderBy(desc(documents.uploadedAt)).limit(30).all();
  const monthlyRows = workspace.reportingPeriod ? db.select({ date: transactions.transactionDate }).from(transactions).where(and(eq(transactions.dealershipId, actor.dealershipId), eq(transactions.reportingPeriodId, workspace.reportingPeriod.id))).all() : [];
  const transactionVolume = workspace.reportingPeriod ? aggregateMonthlyValues(monthlyRows, workspace.reportingPeriod.startDate, workspace.reportingPeriod.endDate) : [];
  const reconciliationOutcomes = reconciliationOutcomeCategories({ matched: workspace.latestRun?.matchedCount ?? 0, warnings: workspace.latestRun?.warningCount ?? 0, exceptions: workspace.latestRun?.exceptionCount ?? 0 });
  return { ...workspace, imports, documents: documentRows, charts: { transactionVolume, reconciliationOutcomes } };
}

export function getReviewerProductData() {
  const dealerRows = db.select().from(dealerships).orderBy(dealerships.tradeName).all();
  const openExceptions = db.select().from(exceptions).where(ne(exceptions.status, "RESOLVED")).orderBy(desc(exceptions.estimatedFeeImpact), desc(exceptions.createdAt)).all();
  const auditRows = db.select({ audit: audits, dealership: dealerships }).from(audits).innerJoin(dealerships, eq(audits.dealershipId, dealerships.id)).orderBy(desc(audits.createdAt)).all();
  const latestRuns = db.select().from(reconciliationRuns).orderBy(desc(reconciliationRuns.startedAt)).all();
  const dealerSummaries = dealerRows.map((dealer) => {
    const dealerExceptions = openExceptions.filter((item) => item.dealershipId === dealer.id);
    const run = latestRuns.find((item) => item.dealershipId === dealer.id);
    return { ...dealer, openExceptions: dealerExceptions.length, highPriority: dealerExceptions.filter((item) => item.priority === "HIGH" || item.priority === "CRITICAL").length, estimatedFeeImpact: dealerExceptions.reduce((sum, item) => sum + item.estimatedFeeImpact, 0), matchRate: run && Math.max(run.transactionCount, run.registrationRecordCount) ? Math.round((run.matchedCount / Math.max(run.transactionCount, run.registrationRecordCount)) * 1000) / 10 : null, lastRunAt: run?.completedAt ?? null };
  });
  const allExceptionDates = db.select({ date: exceptions.createdAt }).from(exceptions).orderBy(exceptions.createdAt).all();
  const latestExceptionDate = allExceptionDates.at(-1)?.date; const earliestExceptionDate = allExceptionDates[0]?.date;
  const exceptionsByMonth = latestExceptionDate && earliestExceptionDate ? aggregateMonthlyValues(allExceptionDates, earliestExceptionDate, latestExceptionDate) : [];
  const readinessDistribution = buildReadinessBuckets(dealerSummaries.map((item) => item.matchRate));
  return { dealerships: dealerSummaries, exceptions: openExceptions, audits: auditRows, charts: { exceptionsByMonth, readinessDistribution }, metrics: { dealerships: dealerRows.length, openExceptions: openExceptions.length, highPriority: openExceptions.filter((item) => item.priority === "HIGH" || item.priority === "CRITICAL").length, responsesReceived: openExceptions.filter((item) => item.status === "RESPONSE_RECEIVED").length, estimatedFeeImpact: openExceptions.reduce((sum, item) => sum + item.estimatedFeeImpact, 0), activeAudits: auditRows.filter(({ audit }) => !["COMPLETE", "CLOSED"].includes(audit.status)).length } };
}

export function getDealerContext(dealershipId: string) {
  return db.select().from(dealerships).where(eq(dealerships.id, dealershipId)).get();
}

export function getAuthorizedTransactionsByIds(actor: SessionUser, ids: string[]) {
  if (!actor.dealershipId || !ids.length) return [];
  return db.select().from(transactions).where(and(eq(transactions.dealershipId, actor.dealershipId), inArray(transactions.id, ids))).orderBy(asc(transactions.id)).all();
}

export function getDealerTransactionsPage(actor: SessionUser, input: { page?: number; query?: string; state?: string; sort?: string; pageSize?: number }) {
  if (!actor.dealershipId) throw new Error("Dealer account is not connected to a dealership.");
  const pageSize = Math.min(Math.max(input.pageSize ?? 25, 10), 50); const page = Math.max(input.page ?? 1, 1); const query = input.query?.trim().toUpperCase();
  const period = db.select().from(reportingPeriods).where(eq(reportingPeriods.dealershipId, actor.dealershipId)).orderBy(desc(reportingPeriods.startDate)).get();
  if (!period) return { rows: [], total: 0, page: 1, pageCount: 1, pageSize };
  const conditions = [eq(transactions.dealershipId, actor.dealershipId), eq(transactions.reportingPeriodId, period.id)];
  if (query) conditions.push(like(transactions.normalizedVin, `%${query}%`));
  if (input.state && input.state !== "all") conditions.push(eq(transactions.reconciliationState, input.state));
  const where = and(...conditions)!; const total = Number(db.select({ count: sql<number>`count(*)` }).from(transactions).where(where).get()?.count ?? 0); const pageCount = Math.max(Math.ceil(total / pageSize), 1); const safePage = Math.min(page, pageCount);
  const sort = parseDatasetSort("dealerTransactions", input.sort); const ordering = sort === "date-asc" ? [asc(transactions.transactionDate), asc(transactions.id)] : sort === "vin-asc" ? [asc(transactions.normalizedVin), asc(transactions.id)] : [desc(transactions.transactionDate), asc(transactions.id)];
  const rows = db.select({ transaction: transactions, vehicle: vehicles }).from(transactions).innerJoin(vehicles, eq(transactions.vehicleId, vehicles.id)).where(where).orderBy(...ordering).limit(pageSize).offset((safePage - 1) * pageSize).all().map(({ transaction, vehicle }) => ({ ...transaction, vehicle: `${vehicle.year ?? ""} ${vehicle.make ?? ""} ${vehicle.model ?? ""}`.trim(), stockNumber: vehicle.stockNumber }));
  return { rows, total, page: safePage, pageCount, pageSize };
}

export function getExceptionsPage(actor: SessionUser, input: { page?: number; query?: string; status?: string; impact?: string; sort?: string; pageSize?: number; reviewer?: boolean }) {
  const reviewer = input.reviewer === true;
  if (!reviewer && !actor.dealershipId) throw new Error("Dealer account is not connected to a dealership.");
  const pageSize = Math.min(Math.max(input.pageSize ?? 25, 10), 50); const page = Math.max(input.page ?? 1, 1); const query = input.query?.trim().toUpperCase(); const conditions = [];
  if (!reviewer) conditions.push(eq(exceptions.dealershipId, actor.dealershipId!));
  if (query) conditions.push(or(like(exceptions.normalizedVin, `%${query}%`), like(exceptions.id, `%${query}%`), like(exceptions.ruleId, `%${query}%`))!);
  if (input.status === "open") conditions.push(ne(exceptions.status, "RESOLVED")); else if (input.status) conditions.push(eq(exceptions.status, input.status));
  if (input.impact === "positive") conditions.push(gt(exceptions.estimatedFeeImpact, 0));
  const where = conditions.length ? and(...conditions) : undefined; const total = Number(db.select({ count: sql<number>`count(*)` }).from(exceptions).where(where).get()?.count ?? 0); const pageCount = Math.max(Math.ceil(total / pageSize), 1); const safePage = Math.min(page, pageCount);
  const sort = parseDatasetSort(reviewer ? "reviewerExceptions" : "dealerExceptions", input.sort); const priorityOrder = sql`case ${exceptions.priority} when 'CRITICAL' then 4 when 'HIGH' then 3 when 'MEDIUM' then 2 else 1 end`; const ordering = sort === "newest" ? [desc(exceptions.createdAt), asc(exceptions.id)] : sort === "oldest" ? [asc(exceptions.createdAt), asc(exceptions.id)] : sort === "priority-desc" ? [desc(priorityOrder), desc(exceptions.createdAt), asc(exceptions.id)] : [desc(exceptions.estimatedFeeImpact), desc(exceptions.createdAt), asc(exceptions.id)];
  const rows = db.select({ exception: exceptions, dealershipName: dealerships.tradeName }).from(exceptions).innerJoin(dealerships, eq(exceptions.dealershipId, dealerships.id)).where(where).orderBy(...ordering).limit(pageSize).offset((safePage - 1) * pageSize).all().map(({ exception, dealershipName }) => ({ ...exception, dealershipName }));
  return { rows, total, page: safePage, pageCount, pageSize };
}

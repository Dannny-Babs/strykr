import "server-only";

import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { assertCan, type Actor } from "@/domain/auth/permissions";
import type { EntityType } from "@/product/entity-navigation";
import { db } from "@/server/db/client";
import { activityEvents, auditFindings, audits, dealerResponses, dealerships, documents, evidence, exceptions, importBatches, matchResults, reconciliationRules, reconciliationRuns, registrationRecords, reportingPeriods, transactions, users, vehicles } from "@/server/db/schema";

const safeJson = (value: string | null | undefined) => {
  try { return value ? JSON.parse(value) : null; } catch { return value; }
};

function authorize(actor: Actor, dealershipId: string) {
  assertCan(actor, "dealership:read", dealershipId);
}

async function activityFor(entityType: string, entityIds: string[]) {
  if (!entityIds.length) return [];
  return (await db.select({ event: activityEvents, actorName: users.name }).from(activityEvents).innerJoin(users, eq(activityEvents.actorId, users.id)).where(and(eq(activityEvents.entityType, entityType), inArray(activityEvents.entityId, entityIds))).orderBy(desc(activityEvents.timestamp)).limit(30)).map(({ event, actorName }) => ({ ...event, actorName, metadata: safeJson(event.metadata) }));
}

async function dealershipDetail(actor: Actor, id: string) {
  const [dealership] = await db.select().from(dealerships).where(eq(dealerships.id, id)).limit(1);
  if (!dealership) throw new Error("Dealership was not found.");
  authorize(actor, dealership.id);
  const [period] = await db.select().from(reportingPeriods).where(eq(reportingPeriods.dealershipId, id)).orderBy(desc(reportingPeriods.startDate)).limit(1);
  const [run] = period ? await db.select().from(reconciliationRuns).where(and(eq(reconciliationRuns.dealershipId, id), eq(reconciliationRuns.reportingPeriodId, period.id))).orderBy(desc(reconciliationRuns.startedAt)).limit(1) : [];
  const open = await db.select().from(exceptions).where(and(eq(exceptions.dealershipId, id), sql`${exceptions.status} != 'RESOLVED'`));
  const [transactionMetric] = await db.select({ count: sql<number>`count(*)` }).from(transactions).where(eq(transactions.dealershipId, id)).limit(1);
  const [latestImport] = await db.select().from(importBatches).where(eq(importBatches.dealershipId, id)).orderBy(desc(importBatches.createdAt)).limit(1);
  const [activeAudit] = await db.select().from(audits).where(and(eq(audits.dealershipId, id), sql`${audits.status} not in ('COMPLETE','CLOSED')`)).orderBy(desc(audits.createdAt)).limit(1);
  const activity = (await db.select({ event: activityEvents, actorName: users.name }).from(activityEvents).innerJoin(users, eq(activityEvents.actorId, users.id)).where(eq(activityEvents.dealershipId, id)).orderBy(desc(activityEvents.timestamp)).limit(12)).map(({ event, actorName }) => ({ ...event, actorName, metadata: safeJson(event.metadata) }));
  return { type: "dealership" as const, dealership, period, run: run ?? null, latestImport, activeAudit, metrics: { transactionCount: Number(transactionMetric?.count ?? 0), reconciliationRate: run && Math.max(run.transactionCount, run.registrationRecordCount) ? Math.round(run.matchedCount / Math.max(run.transactionCount, run.registrationRecordCount) * 1000) / 10 : null, openExceptions: open.length, highPriority: open.filter((item) => ["HIGH", "CRITICAL"].includes(item.priority)).length, unresolvedFeeImpact: open.reduce((sum, item) => sum + item.estimatedFeeImpact, 0) }, activity };
}

async function transactionDetail(actor: Actor, id: string) {
  const [row] = await db.select({ transaction: transactions, vehicle: vehicles, dealership: dealerships, period: reportingPeriods }).from(transactions).innerJoin(vehicles, eq(transactions.vehicleId, vehicles.id)).innerJoin(dealerships, eq(transactions.dealershipId, dealerships.id)).innerJoin(reportingPeriods, eq(transactions.reportingPeriodId, reportingPeriods.id)).where(eq(transactions.id, id)).limit(1);
  if (!row) throw new Error("Transaction was not found.");
  authorize(actor, row.transaction.dealershipId);
  const [registration] = await db.select().from(registrationRecords).where(and(eq(registrationRecords.dealershipId, row.transaction.dealershipId), eq(registrationRecords.reportingPeriodId, row.transaction.reportingPeriodId), eq(registrationRecords.normalizedVin, row.transaction.normalizedVin))).orderBy(desc(registrationRecords.registrationDate)).limit(1);
  const relatedExceptions = await db.select().from(exceptions).where(eq(exceptions.transactionId, id)).orderBy(desc(exceptions.createdAt));
  const relatedDocuments = await db.select().from(documents).where(eq(documents.transactionId, id)).orderBy(desc(documents.uploadedAt));
  const [match] = await db.select({ match: matchResults, run: reconciliationRuns }).from(matchResults).innerJoin(reconciliationRuns, eq(matchResults.reconciliationRunId, reconciliationRuns.id)).where(eq(matchResults.transactionId, id)).orderBy(desc(reconciliationRuns.startedAt)).limit(1);
  return { type: "transaction" as const, ...row, registration: registration ? { ...registration, originalValues: safeJson(registration.originalValues) } : null, match: match ? { ...match.match, run: match.run, matchedFields: safeJson(match.match.matchedFields), conflictingFields: safeJson(match.match.conflictingFields) } : null, exceptions: relatedExceptions, documents: relatedDocuments, originalValues: safeJson(row.transaction.originalValues), correctedValues: safeJson(row.transaction.correctedValues), activity: await activityFor("TRANSACTION", [id]) };
}

async function exceptionDetail(actor: Actor, id: string) {
  const [row] = await db.select({ exception: exceptions, dealership: dealerships, transaction: transactions, vehicle: vehicles, run: reconciliationRuns }).from(exceptions).innerJoin(dealerships, eq(exceptions.dealershipId, dealerships.id)).leftJoin(transactions, eq(exceptions.transactionId, transactions.id)).leftJoin(vehicles, eq(exceptions.vehicleId, vehicles.id)).innerJoin(reconciliationRuns, eq(exceptions.reconciliationRunId, reconciliationRuns.id)).where(eq(exceptions.id, id)).limit(1);
  if (!row) throw new Error("Exception was not found.");
  assertCan(actor, "exception:read", row.exception.dealershipId);
  const responseRows = await db.select({ response: dealerResponses, submittedByName: users.name }).from(dealerResponses).innerJoin(users, eq(dealerResponses.submittedBy, users.id)).where(eq(dealerResponses.exceptionId, id)).orderBy(desc(dealerResponses.submittedAt));
  const documentRows = await db.select().from(documents).where(eq(documents.exceptionId, id)).orderBy(desc(documents.uploadedAt));
  const evidenceRows = await db.select().from(evidence).where(eq(evidence.exceptionId, id)).orderBy(desc(evidence.createdAt));
  const [versionedRule] = await db.select().from(reconciliationRules).where(and(eq(reconciliationRules.code, row.exception.ruleId), eq(reconciliationRules.version, row.run.ruleVersion))).limit(1);
  const [fallbackRule] = versionedRule ? [] : await db.select().from(reconciliationRules).where(eq(reconciliationRules.code, row.exception.ruleId)).limit(1);
  return { type: "exception" as const, ...row, rule: versionedRule ?? fallbackRule, responses: responseRows.map(({ response, submittedByName }) => ({ ...response, submittedByName })), documents: documentRows, evidence: evidenceRows, triggeringValues: safeJson(row.exception.triggeringValues), activity: await activityFor("EXCEPTION", [id]) };
}

async function importDetail(actor: Actor, id: string) {
  const [row] = await db.select({ batch: importBatches, dealership: dealerships, period: reportingPeriods, uploaderName: users.name }).from(importBatches).innerJoin(dealerships, eq(importBatches.dealershipId, dealerships.id)).innerJoin(reportingPeriods, eq(importBatches.reportingPeriodId, reportingPeriods.id)).innerJoin(users, eq(importBatches.createdBy, users.id)).where(eq(importBatches.id, id)).limit(1);
  if (!row) throw new Error("Import batch was not found.");
  authorize(actor, row.batch.dealershipId);
  const [metric] = await db.select({ count: sql<number>`count(*)` }).from(transactions).where(eq(transactions.importBatchId, id)).limit(1);
  return { type: "import" as const, ...row, resultingTransactions: Number(metric?.count ?? 0), activity: await activityFor("IMPORT_BATCH", [id]) };
}

async function documentDetail(actor: Actor, id: string) {
  const [row] = await db.select({ document: documents, dealership: dealerships, uploaderName: users.name }).from(documents).innerJoin(dealerships, eq(documents.dealershipId, dealerships.id)).innerJoin(users, eq(documents.uploadedBy, users.id)).where(eq(documents.id, id)).limit(1);
  if (!row) throw new Error("Document was not found.");
  authorize(actor, row.document.dealershipId);
  const relatedEvidence = await db.select().from(evidence).where(eq(evidence.documentId, id));
  return { type: "document" as const, ...row, evidence: relatedEvidence, activity: await activityFor("DOCUMENT", [id]) };
}

async function auditDetail(actor: Actor, id: string) {
  const [row] = await db.select({ audit: audits, dealership: dealerships, period: reportingPeriods, reviewerName: users.name }).from(audits).innerJoin(dealerships, eq(audits.dealershipId, dealerships.id)).innerJoin(reportingPeriods, eq(audits.reportingPeriodId, reportingPeriods.id)).leftJoin(users, eq(audits.assignedReviewer, users.id)).where(eq(audits.id, id)).limit(1);
  if (!row) throw new Error("Audit was not found.");
  authorize(actor, row.audit.dealershipId);
  const findings = await db.select().from(auditFindings).where(eq(auditFindings.auditId, id)).orderBy(desc(auditFindings.createdAt));
  const exceptionRows = await db.select().from(exceptions).where(and(eq(exceptions.dealershipId, row.audit.dealershipId), eq(exceptions.reportingPeriodId, row.audit.reportingPeriodId))).orderBy(desc(exceptions.createdAt));
  const [run] = await db.select().from(reconciliationRuns).where(and(eq(reconciliationRuns.dealershipId, row.audit.dealershipId), eq(reconciliationRuns.reportingPeriodId, row.audit.reportingPeriodId))).orderBy(desc(reconciliationRuns.startedAt)).limit(1);
  const [metric] = await db.select({ count: sql<number>`count(*)` }).from(importBatches).where(and(eq(importBatches.dealershipId, row.audit.dealershipId), eq(importBatches.reportingPeriodId, row.audit.reportingPeriodId), eq(importBatches.status, "COMPLETED"))).limit(1);
  return { type: "audit" as const, ...row, run, findings, exceptions: exceptionRows, summary: { completedImports: Number(metric?.count ?? 0), openExceptions: exceptionRows.filter((item) => item.status !== "RESOLVED").length, resolvedExceptions: exceptionRows.filter((item) => item.status === "RESOLVED").length, responsesReceived: exceptionRows.filter((item) => item.status === "RESPONSE_RECEIVED").length, feeImpact: exceptionRows.filter((item) => item.status !== "RESOLVED").reduce((sum, item) => sum + item.estimatedFeeImpact, 0) }, activity: await activityFor("AUDIT", [id]) };
}

async function runDetail(actor: Actor, id: string) {
  const [row] = await db.select({ run: reconciliationRuns, dealership: dealerships, period: reportingPeriods, starterName: users.name }).from(reconciliationRuns).innerJoin(dealerships, eq(reconciliationRuns.dealershipId, dealerships.id)).innerJoin(reportingPeriods, eq(reconciliationRuns.reportingPeriodId, reportingPeriods.id)).innerJoin(users, eq(reconciliationRuns.startedBy, users.id)).where(eq(reconciliationRuns.id, id)).limit(1);
  if (!row) throw new Error("Reconciliation run was not found.");
  authorize(actor, row.run.dealershipId);
  const breakdown = await db.select({ ruleId: exceptions.ruleId, count: sql<number>`count(*)`, impact: sql<number>`coalesce(sum(${exceptions.estimatedFeeImpact}),0)` }).from(exceptions).where(eq(exceptions.reconciliationRunId, id)).groupBy(exceptions.ruleId);
  return { type: "run" as const, ...row, breakdown, activity: await activityFor("RECONCILIATION_RUN", [id]) };
}

export async function getEntityDetail(actor: Actor, type: EntityType, id: string) {
  if (type === "dealership") return await dealershipDetail(actor, id);
  if (type === "transaction") return await transactionDetail(actor, id);
  if (type === "exception") return await exceptionDetail(actor, id);
  if (type === "import") return await importDetail(actor, id);
  if (type === "document") return await documentDetail(actor, id);
  if (type === "audit") return await auditDetail(actor, id);
  return await runDetail(actor, id);
}

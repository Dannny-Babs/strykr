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

function activityFor(entityType: string, entityIds: string[]) {
  if (!entityIds.length) return [];
  return db.select({ event: activityEvents, actorName: users.name }).from(activityEvents).innerJoin(users, eq(activityEvents.actorId, users.id)).where(and(eq(activityEvents.entityType, entityType), inArray(activityEvents.entityId, entityIds))).orderBy(desc(activityEvents.timestamp)).limit(30).all().map(({ event, actorName }) => ({ ...event, actorName, metadata: safeJson(event.metadata) }));
}

function dealershipDetail(actor: Actor, id: string) {
  const dealership = db.select().from(dealerships).where(eq(dealerships.id, id)).get();
  if (!dealership) throw new Error("Dealership was not found.");
  authorize(actor, dealership.id);
  const period = db.select().from(reportingPeriods).where(eq(reportingPeriods.dealershipId, id)).orderBy(desc(reportingPeriods.startDate)).get();
  const run = period ? db.select().from(reconciliationRuns).where(and(eq(reconciliationRuns.dealershipId, id), eq(reconciliationRuns.reportingPeriodId, period.id))).orderBy(desc(reconciliationRuns.startedAt)).get() : null;
  const open = db.select().from(exceptions).where(and(eq(exceptions.dealershipId, id), sql`${exceptions.status} != 'RESOLVED'`)).all();
  const transactionCount = db.select({ count: sql<number>`count(*)` }).from(transactions).where(eq(transactions.dealershipId, id)).get()?.count ?? 0;
  const latestImport = db.select().from(importBatches).where(eq(importBatches.dealershipId, id)).orderBy(desc(importBatches.createdAt)).get();
  const activeAudit = db.select().from(audits).where(and(eq(audits.dealershipId, id), sql`${audits.status} not in ('COMPLETE','CLOSED')`)).orderBy(desc(audits.createdAt)).get();
  return { type: "dealership" as const, dealership, period, run, latestImport, activeAudit, metrics: { transactionCount: Number(transactionCount), reconciliationRate: run && Math.max(run.transactionCount, run.registrationRecordCount) ? Math.round(run.matchedCount / Math.max(run.transactionCount, run.registrationRecordCount) * 1000) / 10 : null, openExceptions: open.length, highPriority: open.filter((item) => ["HIGH", "CRITICAL"].includes(item.priority)).length, unresolvedFeeImpact: open.reduce((sum, item) => sum + item.estimatedFeeImpact, 0) }, activity: db.select({ event: activityEvents, actorName: users.name }).from(activityEvents).innerJoin(users, eq(activityEvents.actorId, users.id)).where(eq(activityEvents.dealershipId, id)).orderBy(desc(activityEvents.timestamp)).limit(12).all().map(({ event, actorName }) => ({ ...event, actorName, metadata: safeJson(event.metadata) })) };
}

function transactionDetail(actor: Actor, id: string) {
  const row = db.select({ transaction: transactions, vehicle: vehicles, dealership: dealerships, period: reportingPeriods }).from(transactions).innerJoin(vehicles, eq(transactions.vehicleId, vehicles.id)).innerJoin(dealerships, eq(transactions.dealershipId, dealerships.id)).innerJoin(reportingPeriods, eq(transactions.reportingPeriodId, reportingPeriods.id)).where(eq(transactions.id, id)).get();
  if (!row) throw new Error("Transaction was not found.");
  authorize(actor, row.transaction.dealershipId);
  const registration = db.select().from(registrationRecords).where(and(eq(registrationRecords.dealershipId, row.transaction.dealershipId), eq(registrationRecords.reportingPeriodId, row.transaction.reportingPeriodId), eq(registrationRecords.normalizedVin, row.transaction.normalizedVin))).orderBy(desc(registrationRecords.registrationDate)).get();
  const relatedExceptions = db.select().from(exceptions).where(eq(exceptions.transactionId, id)).orderBy(desc(exceptions.createdAt)).all();
  const relatedDocuments = db.select().from(documents).where(eq(documents.transactionId, id)).orderBy(desc(documents.uploadedAt)).all();
  const match = db.select({ match: matchResults, run: reconciliationRuns }).from(matchResults).innerJoin(reconciliationRuns, eq(matchResults.reconciliationRunId, reconciliationRuns.id)).where(eq(matchResults.transactionId, id)).orderBy(desc(reconciliationRuns.startedAt)).get();
  return { type: "transaction" as const, ...row, registration: registration ? { ...registration, originalValues: safeJson(registration.originalValues) } : null, match: match ? { ...match.match, run: match.run, matchedFields: safeJson(match.match.matchedFields), conflictingFields: safeJson(match.match.conflictingFields) } : null, exceptions: relatedExceptions, documents: relatedDocuments, originalValues: safeJson(row.transaction.originalValues), correctedValues: safeJson(row.transaction.correctedValues), activity: activityFor("TRANSACTION", [id]) };
}

function exceptionDetail(actor: Actor, id: string) {
  const row = db.select({ exception: exceptions, dealership: dealerships, transaction: transactions, vehicle: vehicles, run: reconciliationRuns }).from(exceptions).innerJoin(dealerships, eq(exceptions.dealershipId, dealerships.id)).leftJoin(transactions, eq(exceptions.transactionId, transactions.id)).leftJoin(vehicles, eq(exceptions.vehicleId, vehicles.id)).innerJoin(reconciliationRuns, eq(exceptions.reconciliationRunId, reconciliationRuns.id)).where(eq(exceptions.id, id)).get();
  if (!row) throw new Error("Exception was not found.");
  assertCan(actor, "exception:read", row.exception.dealershipId);
  const responseRows = db.select({ response: dealerResponses, submittedByName: users.name }).from(dealerResponses).innerJoin(users, eq(dealerResponses.submittedBy, users.id)).where(eq(dealerResponses.exceptionId, id)).orderBy(desc(dealerResponses.submittedAt)).all();
  const documentRows = db.select().from(documents).where(eq(documents.exceptionId, id)).orderBy(desc(documents.uploadedAt)).all();
  const evidenceRows = db.select().from(evidence).where(eq(evidence.exceptionId, id)).orderBy(desc(evidence.createdAt)).all();
  const rule = db.select().from(reconciliationRules).where(and(eq(reconciliationRules.code, row.exception.ruleId), eq(reconciliationRules.version, row.run.ruleVersion))).get() ?? db.select().from(reconciliationRules).where(eq(reconciliationRules.code, row.exception.ruleId)).get();
  return { type: "exception" as const, ...row, rule, responses: responseRows.map(({ response, submittedByName }) => ({ ...response, submittedByName })), documents: documentRows, evidence: evidenceRows, triggeringValues: safeJson(row.exception.triggeringValues), activity: activityFor("EXCEPTION", [id]) };
}

function importDetail(actor: Actor, id: string) {
  const row = db.select({ batch: importBatches, dealership: dealerships, period: reportingPeriods, uploaderName: users.name }).from(importBatches).innerJoin(dealerships, eq(importBatches.dealershipId, dealerships.id)).innerJoin(reportingPeriods, eq(importBatches.reportingPeriodId, reportingPeriods.id)).innerJoin(users, eq(importBatches.createdBy, users.id)).where(eq(importBatches.id, id)).get();
  if (!row) throw new Error("Import batch was not found.");
  authorize(actor, row.batch.dealershipId);
  const resultingTransactions = db.select({ count: sql<number>`count(*)` }).from(transactions).where(eq(transactions.importBatchId, id)).get()?.count ?? 0;
  return { type: "import" as const, ...row, resultingTransactions: Number(resultingTransactions), activity: activityFor("IMPORT_BATCH", [id]) };
}

function documentDetail(actor: Actor, id: string) {
  const row = db.select({ document: documents, dealership: dealerships, uploaderName: users.name }).from(documents).innerJoin(dealerships, eq(documents.dealershipId, dealerships.id)).innerJoin(users, eq(documents.uploadedBy, users.id)).where(eq(documents.id, id)).get();
  if (!row) throw new Error("Document was not found.");
  authorize(actor, row.document.dealershipId);
  const relatedEvidence = db.select().from(evidence).where(eq(evidence.documentId, id)).all();
  return { type: "document" as const, ...row, evidence: relatedEvidence, activity: activityFor("DOCUMENT", [id]) };
}

function auditDetail(actor: Actor, id: string) {
  const row = db.select({ audit: audits, dealership: dealerships, period: reportingPeriods, reviewerName: users.name }).from(audits).innerJoin(dealerships, eq(audits.dealershipId, dealerships.id)).innerJoin(reportingPeriods, eq(audits.reportingPeriodId, reportingPeriods.id)).leftJoin(users, eq(audits.assignedReviewer, users.id)).where(eq(audits.id, id)).get();
  if (!row) throw new Error("Audit was not found.");
  authorize(actor, row.audit.dealershipId);
  const findings = db.select().from(auditFindings).where(eq(auditFindings.auditId, id)).orderBy(desc(auditFindings.createdAt)).all();
  const exceptionRows = db.select().from(exceptions).where(and(eq(exceptions.dealershipId, row.audit.dealershipId), eq(exceptions.reportingPeriodId, row.audit.reportingPeriodId))).orderBy(desc(exceptions.createdAt)).all();
  const run = db.select().from(reconciliationRuns).where(and(eq(reconciliationRuns.dealershipId, row.audit.dealershipId), eq(reconciliationRuns.reportingPeriodId, row.audit.reportingPeriodId))).orderBy(desc(reconciliationRuns.startedAt)).get();
  const completedImports = db.select({ count: sql<number>`count(*)` }).from(importBatches).where(and(eq(importBatches.dealershipId, row.audit.dealershipId), eq(importBatches.reportingPeriodId, row.audit.reportingPeriodId), eq(importBatches.status, "COMPLETED"))).get()?.count ?? 0;
  return { type: "audit" as const, ...row, run, findings, exceptions: exceptionRows, summary: { completedImports: Number(completedImports), openExceptions: exceptionRows.filter((item) => item.status !== "RESOLVED").length, resolvedExceptions: exceptionRows.filter((item) => item.status === "RESOLVED").length, responsesReceived: exceptionRows.filter((item) => item.status === "RESPONSE_RECEIVED").length, feeImpact: exceptionRows.filter((item) => item.status !== "RESOLVED").reduce((sum, item) => sum + item.estimatedFeeImpact, 0) }, activity: activityFor("AUDIT", [id]) };
}

function runDetail(actor: Actor, id: string) {
  const row = db.select({ run: reconciliationRuns, dealership: dealerships, period: reportingPeriods, starterName: users.name }).from(reconciliationRuns).innerJoin(dealerships, eq(reconciliationRuns.dealershipId, dealerships.id)).innerJoin(reportingPeriods, eq(reconciliationRuns.reportingPeriodId, reportingPeriods.id)).innerJoin(users, eq(reconciliationRuns.startedBy, users.id)).where(eq(reconciliationRuns.id, id)).get();
  if (!row) throw new Error("Reconciliation run was not found.");
  authorize(actor, row.run.dealershipId);
  const breakdown = db.select({ ruleId: exceptions.ruleId, count: sql<number>`count(*)`, impact: sql<number>`coalesce(sum(${exceptions.estimatedFeeImpact}),0)` }).from(exceptions).where(eq(exceptions.reconciliationRunId, id)).groupBy(exceptions.ruleId).all();
  return { type: "run" as const, ...row, breakdown, activity: activityFor("RECONCILIATION_RUN", [id]) };
}

export function getEntityDetail(actor: Actor, type: EntityType, id: string) {
  if (type === "dealership") return dealershipDetail(actor, id);
  if (type === "transaction") return transactionDetail(actor, id);
  if (type === "exception") return exceptionDetail(actor, id);
  if (type === "import") return importDetail(actor, id);
  if (type === "document") return documentDetail(actor, id);
  if (type === "audit") return auditDetail(actor, id);
  return runDetail(actor, id);
}

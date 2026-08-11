import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { assertCan, type Actor } from "@/domain/auth/permissions";
import type { TransactionType } from "@/domain/enums";
import { reconcile } from "@/domain/reconciliation/engine";
import { db } from "@/server/db/client";
import { exceptions, matchResults, reconciliationRuns, registrationRecords, reportingPeriods, transactions } from "@/server/db/schema";
import { recordActivity } from "./activity";

export function runReconciliation(input: { dealershipId: string; reportingPeriodId: string; actor: Actor }) {
  assertCan(input.actor, "reconciliation:run", input.dealershipId);
  const period = db.select().from(reportingPeriods).where(and(eq(reportingPeriods.id, input.reportingPeriodId), eq(reportingPeriods.dealershipId, input.dealershipId))).get();
  if (!period) throw new Error("Reporting period was not found for this dealership.");
  const transactionRows = db.select().from(transactions).where(and(eq(transactions.dealershipId, input.dealershipId), eq(transactions.reportingPeriodId, input.reportingPeriodId))).all();
  const registrationRows = db.select().from(registrationRecords).where(and(eq(registrationRecords.dealershipId, input.dealershipId), eq(registrationRecords.reportingPeriodId, input.reportingPeriodId))).all();
  const output = reconcile({ period, transactions: transactionRows.map((row) => ({ ...row, transactionType: row.transactionType as TransactionType, evidenceCount: 0 })), registrationRecords: registrationRows });
  const runId = randomUUID();
  const now = new Date().toISOString();
  db.transaction((transaction) => {
    transaction.insert(reconciliationRuns).values({ id: runId, dealershipId: input.dealershipId, reportingPeriodId: input.reportingPeriodId, status: "COMPLETED", ruleVersion: output.ruleVersion, ...output.metrics, startedBy: input.actor.id, startedAt: now, completedAt: now }).run();
    for (const match of output.matches) transaction.insert(matchResults).values({ id: randomUUID(), reconciliationRunId: runId, ...match, matchedFields: JSON.stringify(match.matchedFields), conflictingFields: JSON.stringify(match.conflictingFields), createdAt: now }).run();
    for (const item of output.exceptions) transaction.insert(exceptions).values({ id: randomUUID(), reconciliationRunId: runId, dealershipId: input.dealershipId, reportingPeriodId: input.reportingPeriodId, ...item, triggeringValues: JSON.stringify(item.triggeringValues), status: "NEW", createdAt: now, updatedAt: now }).run();
    for (const outcome of output.transactionOutcomes) transaction.update(transactions).set({ reconciliationState: outcome.state, updatedAt: now }).where(eq(transactions.id, outcome.transactionId)).run();
    recordActivity(transaction, { organizationId: input.actor.organizationId, dealershipId: input.dealershipId, actorId: input.actor.id, entityType: "RECONCILIATION_RUN", entityId: runId, action: "RECONCILIATION_COMPLETED", metadata: { reportingPeriodId: input.reportingPeriodId, ruleVersion: output.ruleVersion, metrics: output.metrics }, timestamp: now });
  });
  return { id: runId, ...output };
}

import "server-only";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { assertCan, type Actor } from "@/domain/auth/permissions";
import { db } from "@/server/db/client";
import { auditFindings, audits, dealerships, evidence, exceptions } from "@/server/db/schema";
import { recordActivity } from "./activity";

export const findingTypes = ["CONFIRMED_REPORTING_ISSUE", "CORRECTED_RECORD", "VALID_DEALER_EXPLANATION", "INSUFFICIENT_EVIDENCE", "NO_ISSUE_IDENTIFIED", "FURTHER_REVIEW_REQUIRED"] as const;

export async function createAuditFinding(input: { auditId: string; exceptionId: string; type: (typeof findingTypes)[number]; conclusion: string; feeImpact: number; actor: Actor }) {
  const [audit] = await db.select().from(audits).where(eq(audits.id, input.auditId)).limit(1);
  if (!audit) throw new Error("Audit was not found.");
  assertCan(input.actor, "audit:write", audit.dealershipId);
  const [exception] = await db.select().from(exceptions).where(and(eq(exceptions.id, input.exceptionId), eq(exceptions.dealershipId, audit.dealershipId), eq(exceptions.reportingPeriodId, audit.reportingPeriodId))).limit(1);
  if (!exception) throw new Error("The selected exception is not inside this audit scope.");
  const evidenceRows = await db.select().from(evidence).where(eq(evidence.exceptionId, exception.id));
  if (!evidenceRows.length && input.type !== "INSUFFICIENT_EVIDENCE") throw new Error("Link supporting evidence or classify the finding as insufficient evidence.");
  const now = new Date().toISOString(); const id = randomUUID(); const [dealer] = await db.select().from(dealerships).where(eq(dealerships.id, audit.dealershipId)).limit(1);
  if (!dealer) throw new Error("Dealership was not found.");
  await db.transaction(async (transaction) => {
    await transaction.insert(auditFindings).values({ id, auditId: audit.id, exceptionId: exception.id, type: input.type, title: `${exception.ruleId}: ${exception.summary}`, description: input.conclusion, evidenceIds: JSON.stringify(evidenceRows.map((item) => item.id)), feeImpact: Math.max(input.feeImpact, 0), conclusion: input.conclusion, status: "DRAFT", createdAt: now, updatedAt: now });
    await recordActivity(transaction, { organizationId: dealer.organizationId, dealershipId: audit.dealershipId, actorId: input.actor.id, entityType: "AUDIT", entityId: audit.id, action: "FINDING_CREATED", metadata: { findingId: id, exceptionId: exception.id, type: input.type, evidenceIds: evidenceRows.map((item) => item.id) }, timestamp: now });
  });
  return { id, auditId: audit.id, exceptionId: exception.id, status: "DRAFT" };
}

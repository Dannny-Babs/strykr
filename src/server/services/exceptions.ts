import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { assertCan, type Actor } from "@/domain/auth/permissions";
import type { ExceptionStatus } from "@/domain/enums";
import { assertTransition } from "@/domain/exceptions/transitions";
import { db } from "@/server/db/client";
import { dealerResponses, dealerships, exceptions } from "@/server/db/schema";
import { recordActivity } from "./activity";

async function loadException(id: string) {
  const [item] = await db.select().from(exceptions).where(eq(exceptions.id, id)).limit(1);
  if (!item) throw new Error("Exception was not found.");
  return item;
}

export async function submitDealerResponse(input: { exceptionId: string; explanationCategory: string; explanation: string; actor: Actor }) {
  const item = await loadException(input.exceptionId); assertCan(input.actor, "exception:respond", item.dealershipId);
  assertTransition(item.status as ExceptionStatus, "RESPONSE_RECEIVED", input.actor.role);
  const [dealer] = await db.select().from(dealerships).where(eq(dealerships.id, item.dealershipId)).limit(1); if (!dealer) throw new Error("Dealership was not found."); const now = new Date().toISOString(); const responseId = randomUUID();
  await db.transaction(async (transaction) => {
    await transaction.insert(dealerResponses).values({ id: responseId, exceptionId: item.id, submittedBy: input.actor.id, explanationCategory: input.explanationCategory, explanation: input.explanation, status: "SUBMITTED", submittedAt: now, reviewedAt: null, reviewedBy: null });
    await transaction.update(exceptions).set({ status: "RESPONSE_RECEIVED", updatedAt: now }).where(and(eq(exceptions.id, item.id), eq(exceptions.status, item.status)));
    await recordActivity(transaction, { organizationId: dealer.organizationId, dealershipId: item.dealershipId, actorId: input.actor.id, entityType: "EXCEPTION", entityId: item.id, action: "DEALER_RESPONSE_SUBMITTED", metadata: { responseId, explanationCategory: input.explanationCategory }, timestamp: now });
  });
  return { id: responseId, exceptionId: item.id, status: "RESPONSE_RECEIVED" };
}

export async function transitionException(input: { exceptionId: string; status: ExceptionStatus; resolutionType?: string; resolutionReason?: string; actor: Actor }) {
  const item = await loadException(input.exceptionId); assertCan(input.actor, "exception:resolve", item.dealershipId); assertTransition(item.status as ExceptionStatus, input.status, input.actor.role);
  if (input.status === "RESOLVED" && (!input.resolutionType || !input.resolutionReason?.trim())) throw new Error("Resolution type and reason are required to resolve an exception.");
  const [dealer] = await db.select().from(dealerships).where(eq(dealerships.id, item.dealershipId)).limit(1); if (!dealer) throw new Error("Dealership was not found."); const now = new Date().toISOString();
  await db.transaction(async (transaction) => {
    await transaction.update(exceptions).set({ status: input.status, resolutionType: input.resolutionType ?? item.resolutionType, resolutionReason: input.resolutionReason ?? item.resolutionReason, resolvedAt: input.status === "RESOLVED" ? now : null, updatedAt: now }).where(and(eq(exceptions.id, item.id), eq(exceptions.status, item.status)));
    await recordActivity(transaction, { organizationId: dealer.organizationId, dealershipId: item.dealershipId, actorId: input.actor.id, entityType: "EXCEPTION", entityId: item.id, action: input.status === "RESOLVED" ? "EXCEPTION_RESOLVED" : `EXCEPTION_${input.status}`, metadata: { from: item.status, to: input.status, resolutionType: input.resolutionType, resolutionReason: input.resolutionReason }, timestamp: now });
  });
  return { id: item.id, status: input.status };
}

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { assertCan, type Actor } from "@/domain/auth/permissions";
import type { ExceptionStatus } from "@/domain/enums";
import { assertTransition } from "@/domain/exceptions/transitions";
import { db } from "@/server/db/client";
import { dealerResponses, dealerships, exceptions } from "@/server/db/schema";
import { recordActivity } from "./activity";

function loadException(id: string) {
  const item = db.select().from(exceptions).where(eq(exceptions.id, id)).get();
  if (!item) throw new Error("Exception was not found.");
  return item;
}

export function submitDealerResponse(input: { exceptionId: string; explanationCategory: string; explanation: string; actor: Actor }) {
  const item = loadException(input.exceptionId); assertCan(input.actor, "exception:respond", item.dealershipId);
  assertTransition(item.status as ExceptionStatus, "RESPONSE_RECEIVED", input.actor.role);
  const dealer = db.select().from(dealerships).where(eq(dealerships.id, item.dealershipId)).get()!; const now = new Date().toISOString(); const responseId = randomUUID();
  db.transaction((transaction) => {
    transaction.insert(dealerResponses).values({ id: responseId, exceptionId: item.id, submittedBy: input.actor.id, explanationCategory: input.explanationCategory, explanation: input.explanation, status: "SUBMITTED", submittedAt: now, reviewedAt: null, reviewedBy: null }).run();
    transaction.update(exceptions).set({ status: "RESPONSE_RECEIVED", updatedAt: now }).where(and(eq(exceptions.id, item.id), eq(exceptions.status, item.status))).run();
    recordActivity(transaction, { organizationId: dealer.organizationId, dealershipId: item.dealershipId, actorId: input.actor.id, entityType: "EXCEPTION", entityId: item.id, action: "DEALER_RESPONSE_SUBMITTED", metadata: { responseId, explanationCategory: input.explanationCategory }, timestamp: now });
  });
  return { id: responseId, exceptionId: item.id, status: "RESPONSE_RECEIVED" };
}

export function transitionException(input: { exceptionId: string; status: ExceptionStatus; resolutionType?: string; resolutionReason?: string; actor: Actor }) {
  const item = loadException(input.exceptionId); assertCan(input.actor, "exception:resolve", item.dealershipId); assertTransition(item.status as ExceptionStatus, input.status, input.actor.role);
  if (input.status === "RESOLVED" && (!input.resolutionType || !input.resolutionReason?.trim())) throw new Error("Resolution type and reason are required to resolve an exception.");
  const dealer = db.select().from(dealerships).where(eq(dealerships.id, item.dealershipId)).get()!; const now = new Date().toISOString();
  db.transaction((transaction) => {
    transaction.update(exceptions).set({ status: input.status, resolutionType: input.resolutionType ?? item.resolutionType, resolutionReason: input.resolutionReason ?? item.resolutionReason, resolvedAt: input.status === "RESOLVED" ? now : null, updatedAt: now }).where(and(eq(exceptions.id, item.id), eq(exceptions.status, item.status))).run();
    recordActivity(transaction, { organizationId: dealer.organizationId, dealershipId: item.dealershipId, actorId: input.actor.id, entityType: "EXCEPTION", entityId: item.id, action: input.status === "RESOLVED" ? "EXCEPTION_RESOLVED" : `EXCEPTION_${input.status}`, metadata: { from: item.status, to: input.status, resolutionType: input.resolutionType, resolutionReason: input.resolutionReason }, timestamp: now });
  });
  return { id: item.id, status: input.status };
}

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { destinationForActor } from "@/domain/auth/navigation";
import { dealerOnboardingSchema, reviewerOnboardingSchema } from "@/domain/onboarding/schemas";
import type { SessionUser } from "@/server/auth/types";
import { db } from "@/server/db/client";
import { dealerships, organizations, reportingPeriods, users } from "@/server/db/schema";

export async function completeDealerOnboarding(actor: SessionUser, rawInput: unknown) {
  if (actor.role !== "DEALER_ADMIN" && actor.role !== "DEALER_USER") throw new Error("This onboarding route is for dealership accounts.");
  const input = dealerOnboardingSchema.parse(rawInput); const now = new Date().toISOString(); const dealershipId = actor.dealershipId ?? randomUUID();
  await db.transaction(async (transaction) => {
    await transaction.update(organizations).set({ name: input.tradeName, type: "DEALERSHIP", updatedAt: now }).where(eq(organizations.id, actor.organizationId));
    if (!actor.dealershipId) {
      await transaction.insert(dealerships).values({ id: dealershipId, organizationId: actor.organizationId, legalName: input.legalName, tradeName: input.tradeName, registrationNumber: input.registrationNumber, address: null, city: input.city, province: input.province, postalCode: null, contactName: actor.name, contactEmail: actor.email, contactPhone: null, status: "ACTIVE", createdAt: now, updatedAt: now });
      await transaction.insert(reportingPeriods).values({ id: randomUUID(), dealershipId, name: "Current reporting period", startDate: `${new Date().getUTCFullYear()}-01-01`, endDate: `${new Date().getUTCFullYear()}-12-31`, status: "OPEN", createdAt: now, closedAt: null });
    }
    await transaction.update(users).set({ dealershipId, onboardingData: JSON.stringify(input), onboardingCompletedAt: now, updatedAt: now }).where(eq(users.id, actor.id));
  });
  return { destination: destinationForActor(actor.role, true) };
}

export async function completeReviewerOnboarding(actor: SessionUser, rawInput: unknown) {
  if (actor.role !== "REGULATOR_REVIEWER") throw new Error("This onboarding route is for review accounts.");
  const input = reviewerOnboardingSchema.parse(rawInput); const now = new Date().toISOString();
  await db.transaction(async (transaction) => {
    await transaction.update(organizations).set({ name: input.organizationName, type: "REGULATOR", updatedAt: now }).where(eq(organizations.id, actor.organizationId));
    await transaction.update(users).set({ onboardingData: JSON.stringify(input), onboardingCompletedAt: now, updatedAt: now }).where(eq(users.id, actor.id));
  });
  return { destination: destinationForActor(actor.role, true) };
}

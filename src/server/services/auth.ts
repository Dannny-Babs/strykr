import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/domain/auth/credentials";
import { destinationForActor } from "@/domain/auth/navigation";
import type { Role } from "@/domain/enums";
import { signInSchema, signUpSchema } from "@/domain/onboarding/schemas";
import { createSession } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { organizations, users } from "@/server/db/schema";

const INVALID_CREDENTIALS = "Email or password is incorrect.";

export async function signUp(rawInput: unknown) {
  const input = signUpSchema.parse(rawInput);
  if (db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).get()) throw new Error("An account already exists for this email.");
  const now = new Date().toISOString(); const organizationId = randomUUID(); const userId = randomUUID(); const role: Role = input.accountType === "reviewer" ? "REGULATOR_REVIEWER" : "DEALER_ADMIN";
  const passwordHash = await hashPassword(input.password);
  db.transaction((transaction) => {
    transaction.insert(organizations).values({ id: organizationId, name: `${input.name}'s ${input.accountType === "reviewer" ? "review organization" : "dealership"}`, type: input.accountType === "reviewer" ? "REGULATOR" : "DEALERSHIP", status: "ACTIVE", createdAt: now, updatedAt: now }).run();
    transaction.insert(users).values({ id: userId, organizationId, dealershipId: null, name: input.name, email: input.email, passwordHash, role, status: "ACTIVE", onboardingData: "{}", onboardingCompletedAt: null, lastSignedInAt: now, createdAt: now, updatedAt: now }).run();
  });
  const session = createSession(userId);
  return { ...session, destination: destinationForActor(role, false), user: { id: userId, name: input.name, email: input.email, role } };
}

export async function signIn(rawInput: unknown) {
  const input = signInSchema.parse(rawInput);
  const user = db.select().from(users).where(eq(users.email, input.email)).get();
  if (!user || user.status !== "ACTIVE") throw new Error(INVALID_CREDENTIALS);
  let passwordHash = user.passwordHash;
  if (process.env.CORDENA_DEV_AUTH === "true" && user.email.endsWith("@example.test") && input.password === "Cordena2026!" && (!passwordHash || !(await verifyPassword(input.password, passwordHash)))) {
    passwordHash = await hashPassword(input.password);
    db.update(users).set({ passwordHash, updatedAt: new Date().toISOString() }).where(eq(users.id, user.id)).run();
  }
  if (!passwordHash || !(await verifyPassword(input.password, passwordHash))) throw new Error(INVALID_CREDENTIALS);
  const now = new Date().toISOString(); db.update(users).set({ lastSignedInAt: now, updatedAt: now }).where(eq(users.id, user.id)).run();
  const onboardingComplete = Boolean(user.onboardingCompletedAt) || user.email.endsWith("@example.test");
  const session = createSession(user.id);
  return { ...session, destination: destinationForActor(user.role as Role, onboardingComplete), user: { id: user.id, name: user.name, email: user.email, role: user.role as Role } };
}

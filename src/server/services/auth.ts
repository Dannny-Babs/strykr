import { randomUUID } from "node:crypto";
import type { User } from "@supabase/supabase-js";
import { eq, or } from "drizzle-orm";
import { destinationForActor } from "@/domain/auth/navigation";
import type { Role } from "@/domain/enums";
import { emailSchema, passwordUpdateSchema, signInSchema, signUpSchema } from "@/domain/onboarding/schemas";
import type { SessionUser } from "@/server/auth/types";
import { db } from "@/server/db/client";
import { organizations, users } from "@/server/db/schema";
import { createSupabaseServerClient } from "@/server/supabase/server";

const INVALID_CREDENTIALS = "Email or password is incorrect.";

function displayName(user: User) {
  const candidate = user.user_metadata?.display_name;
  if (typeof candidate === "string" && candidate.trim()) return candidate.trim().slice(0, 100);
  return (user.email?.split("@")[0] || "Cordena user").slice(0, 100);
}

function toSessionUser(user: typeof users.$inferSelect): SessionUser {
  const seededComplete = user.email.endsWith("@example.test");
  return {
    id: user.id,
    organizationId: user.organizationId,
    dealershipId: user.dealershipId,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    onboardingComplete: Boolean(user.onboardingCompletedAt) || seededComplete,
  };
}

export async function provisionSupabaseUser(authUser: User): Promise<SessionUser> {
  if (!authUser.email || !authUser.email_confirmed_at) throw new Error("Verify your email before signing in.");
  const normalizedEmail = authUser.email.trim().toLowerCase();
  const [existing] = await db.select().from(users).where(or(eq(users.authProviderId, authUser.id), eq(users.email, normalizedEmail))).limit(1);
  const now = new Date().toISOString();

  if (existing) {
    if (existing.status !== "ACTIVE") throw new Error("This account is not active.");
    await db.update(users).set({ authProviderId: authUser.id, email: normalizedEmail, emailVerifiedAt: authUser.email_confirmed_at, lastSignedInAt: now, updatedAt: now }).where(eq(users.id, existing.id));
    return toSessionUser({ ...existing, authProviderId: authUser.id, email: normalizedEmail, emailVerifiedAt: authUser.email_confirmed_at, lastSignedInAt: now, updatedAt: now });
  }

  const organizationId = randomUUID();
  const userId = randomUUID();
  const name = displayName(authUser);
  await db.transaction(async (transaction) => {
    await transaction.insert(organizations).values({ id: organizationId, name: `${name}'s dealership`, type: "DEALERSHIP", status: "ACTIVE", createdAt: now, updatedAt: now });
    await transaction.insert(users).values({ id: userId, organizationId, dealershipId: null, authProviderId: authUser.id, name, email: normalizedEmail, emailVerifiedAt: authUser.email_confirmed_at, role: "DEALER_ADMIN", status: "ACTIVE", onboardingData: "{}", onboardingCompletedAt: null, lastSignedInAt: now, createdAt: now, updatedAt: now });
  });

  return { id: userId, organizationId, dealershipId: null, name, email: normalizedEmail, role: "DEALER_ADMIN", onboardingComplete: false };
}

export async function signUp(rawInput: unknown, origin: string) {
  const input = signUpSchema.parse(rawInput);
  if (input.accountType === "reviewer") throw new Error("Reviewer accounts are invite-only.");
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { display_name: input.name }, emailRedirectTo: `${origin}/auth/confirm?next=/onboarding/dealer` },
  });
  if (error) throw new Error(error.message);
  if (data.session && data.user?.email_confirmed_at) await provisionSupabaseUser(data.user);
  return { destination: `/verify-email/pending?email=${encodeURIComponent(input.email)}` };
}

export async function signIn(rawInput: unknown) {
  const input = signInSchema.parse(rawInput);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: input.email, password: input.password });
  if (error || !data.user) throw new Error(INVALID_CREDENTIALS);
  const actor = await provisionSupabaseUser(data.user);
  return { destination: destinationForActor(actor.role, actor.onboardingComplete), user: actor };
}

export async function resendVerification(rawInput: unknown, origin: string) {
  const { email } = emailSchema.parse(rawInput);
  const supabase = await createSupabaseServerClient();
  await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: `${origin}/auth/confirm?next=/onboarding/dealer` } });
  return { message: "If that address has an unverified account, a new link is on its way." };
}

export async function requestPasswordReset(rawInput: unknown, origin: string) {
  const { email } = emailSchema.parse(rawInput);
  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/confirm?next=/reset-password` });
  return { message: "If an account exists for that address, a reset link is on its way." };
}

export async function resetPassword(rawInput: unknown) {
  const { password } = passwordUpdateSchema.parse(rawInput);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error("This password reset session is invalid or has expired.");
  await supabase.auth.signOut({ scope: "local" });
  return { destination: "/sign-in?reset=complete" };
}

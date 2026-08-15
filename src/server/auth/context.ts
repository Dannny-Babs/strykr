import "server-only";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { Role } from "@/domain/enums";
import type { Actor } from "@/domain/auth/permissions";
import { db } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { type SessionUser } from "./types";
import { provisionSupabaseUser } from "@/server/services/auth";
import { createSupabaseServerClient } from "@/server/supabase/server";

const personas: Record<string, string> = {
  regulator_reviewer: "user-regulator",
  dealer_admin: "user-dealer-admin",
  dealer_user: "user-dealer-compliance",
  system_admin: "user-system-admin",
};

export async function getActor(): Promise<Actor> {
  const sessionUser = await getCurrentSessionUser();
  if (sessionUser) return { id: sessionUser.id, organizationId: sessionUser.organizationId, dealershipId: sessionUser.dealershipId, role: sessionUser.role };
  if (process.env.NODE_ENV === "production" && process.env.CORDENA_DEV_AUTH !== "true") {
    throw new Error("Authentication required.");
  }
  const requestHeaders = await headers();
  const persona = requestHeaders.get("x-cordena-persona") ?? process.env.CORDENA_DEFAULT_PERSONA ?? "dealer_admin";
  const userId = personas[persona];
  if (!userId) throw new Error("Unknown development persona.");
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error("Seeded development user is missing. Run npm run seed.");
  return { id: user.id, organizationId: user.organizationId, dealershipId: user.dealershipId, role: user.role as Role };
}

export async function getCurrentSessionUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !data.user.email_confirmed_at) return null;
  return provisionSupabaseUser(data.user);
}

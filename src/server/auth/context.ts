import "server-only";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { cookies } from "next/headers";
import type { Role } from "@/domain/enums";
import type { Actor } from "@/domain/auth/permissions";
import { db } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { getSessionUser, SESSION_COOKIE, type SessionUser } from "./session";

const personas: Record<string, string> = {
  regulator_reviewer: "user-regulator",
  dealer_admin: "user-dealer-admin",
  dealer_user: "user-dealer-compliance",
  system_admin: "user-system-admin",
};

export async function getActor(): Promise<Actor> {
  const sessionUser = await getCurrentSessionUser();
  if (sessionUser) return { id: sessionUser.id, organizationId: sessionUser.organizationId, dealershipId: sessionUser.dealershipId, role: sessionUser.role };
  if (process.env.NODE_ENV === "production" && process.env.DEALERSYNC_DEV_AUTH !== "true") {
    throw new Error("Production authentication provider is not configured.");
  }
  const requestHeaders = await headers();
  const persona = requestHeaders.get("x-dealersync-persona") ?? process.env.DEALERSYNC_DEFAULT_PERSONA ?? "dealer_admin";
  const userId = personas[persona];
  if (!userId) throw new Error("Unknown development persona.");
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) throw new Error("Seeded development user is missing. Run npm run seed.");
  return { id: user.id, organizationId: user.organizationId, dealershipId: user.dealershipId, role: user.role as Role };
}

export async function getCurrentSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  return getSessionUser(cookieStore.get(SESSION_COOKIE)?.value);
}

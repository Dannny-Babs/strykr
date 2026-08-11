import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/server/db/client";
import { authSessions, users } from "@/server/db/schema";
import type { Role } from "@/domain/enums";

export const SESSION_COOKIE = "dealersync_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export type SessionUser = {
  id: string;
  organizationId: string;
  dealershipId: string | null;
  name: string;
  email: string;
  role: Role;
  onboardingComplete: boolean;
};

export function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.valueOf() + SESSION_DURATION_MS);
  db.insert(authSessions).values({ id: randomUUID(), userId, tokenHash: hashToken(token), expiresAt: expiresAt.toISOString(), createdAt: now.toISOString(), lastSeenAt: now.toISOString() }).run();
  return { token, expiresAt };
}

export function getSessionUser(token: string | undefined): SessionUser | null {
  if (!token) return null;
  const now = new Date().toISOString();
  const result = db.select({ session: authSessions, user: users }).from(authSessions).innerJoin(users, eq(authSessions.userId, users.id)).where(and(eq(authSessions.tokenHash, hashToken(token)), gt(authSessions.expiresAt, now))).get();
  if (!result || result.user.status !== "ACTIVE") return null;
  const seededComplete = result.user.email.endsWith("@example.test");
  return { id: result.user.id, organizationId: result.user.organizationId, dealershipId: result.user.dealershipId, name: result.user.name, email: result.user.email, role: result.user.role as Role, onboardingComplete: Boolean(result.user.onboardingCompletedAt) || seededComplete };
}

export function destroySession(token: string | undefined) {
  if (token) db.delete(authSessions).where(eq(authSessions.tokenHash, hashToken(token))).run();
}

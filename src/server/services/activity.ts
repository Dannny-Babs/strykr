import { randomUUID } from "node:crypto";
import type { db } from "@/server/db/client";
import { activityEvents } from "@/server/db/schema";

type Database = Pick<typeof db, "insert">;

export async function recordActivity(database: Database, event: { organizationId: string; dealershipId?: string | null; actorId: string; entityType: string; entityId: string; action: string; metadata?: Record<string, unknown>; timestamp?: string }) {
  await database.insert(activityEvents).values({ id: randomUUID(), organizationId: event.organizationId, dealershipId: event.dealershipId ?? null, actorId: event.actorId, entityType: event.entityType, entityId: event.entityId, action: event.action, metadata: JSON.stringify(event.metadata ?? {}), timestamp: event.timestamp ?? new Date().toISOString() });
}

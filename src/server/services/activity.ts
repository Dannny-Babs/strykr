import { randomUUID } from "node:crypto";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type * as schema from "@/server/db/schema";
import { activityEvents } from "@/server/db/schema";

type Database = BetterSQLite3Database<typeof schema>;

export function recordActivity(database: Database, event: { organizationId: string; dealershipId?: string | null; actorId: string; entityType: string; entityId: string; action: string; metadata?: Record<string, unknown>; timestamp?: string }) {
  database.insert(activityEvents).values({ id: randomUUID(), organizationId: event.organizationId, dealershipId: event.dealershipId ?? null, actorId: event.actorId, entityType: event.entityType, entityId: event.entityId, action: event.action, metadata: JSON.stringify(event.metadata ?? {}), timestamp: event.timestamp ?? new Date().toISOString() }).run();
}

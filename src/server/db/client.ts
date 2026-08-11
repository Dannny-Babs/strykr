import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as schema from "./schema";

const databasePath = resolve(process.cwd(), process.env.DATABASE_URL ?? "./data/dealersync.db");
mkdirSync(dirname(databasePath), { recursive: true });

const globalDatabase = globalThis as typeof globalThis & { dealerSyncSqlite?: Database.Database };
const sqlite = globalDatabase.dealerSyncSqlite ?? new Database(databasePath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

if (process.env.NODE_ENV !== "production") globalDatabase.dealerSyncSqlite = sqlite;

export const db = drizzle(sqlite, { schema });
export { sqlite, databasePath };

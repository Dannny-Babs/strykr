import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { withVerifiedSsl } from "./connection";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required. Pull the linked Vercel environment before starting Cordena.");
}

const globalDatabase = globalThis as typeof globalThis & { cordenaPool?: Pool };
const pool = globalDatabase.cordenaPool ?? new Pool({ connectionString: withVerifiedSsl(connectionString), max: 10 });

if (!globalDatabase.cordenaPool) {
  attachDatabasePool(pool);
  globalDatabase.cordenaPool = pool;
}

export const db = drizzle(pool, { schema });
export { pool };

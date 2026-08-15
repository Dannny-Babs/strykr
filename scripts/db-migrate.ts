import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { withVerifiedSsl } from "../src/server/db/connection";

async function main() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED;
  if (!connectionString) throw new Error("DATABASE_URL_UNPOOLED is required for migrations.");

  const pool = new Pool({ connectionString: withVerifiedSsl(connectionString), max: 1 });

  try {
    await migrate(drizzle(pool), { migrationsFolder: "./drizzle/postgres" });
    console.log("PostgreSQL migrations applied.");
  } finally {
    await pool.end();
  }
}

void main().catch((error) => { console.error(error); process.exitCode = 1; });

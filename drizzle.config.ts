import { defineConfig } from "drizzle-kit";
import { existsSync } from "node:fs";
import { withVerifiedSsl } from "./src/server/db/connection";

if (!process.env.DATABASE_URL_UNPOOLED && existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const migrationUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!migrationUrl) throw new Error("DATABASE_URL_UNPOOLED is required for PostgreSQL migrations.");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle/postgres",
  dbCredentials: {
    url: withVerifiedSsl(migrationUrl),
  },
  strict: true,
});

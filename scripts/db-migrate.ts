import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { databasePath, db } from "../src/server/db/client";

migrate(db, { migrationsFolder: "./drizzle" });
console.log(`Database migrated: ${databasePath}`);

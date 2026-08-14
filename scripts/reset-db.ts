import { rmSync } from "node:fs";
import { databasePath } from "../src/server/db/client";

for (const path of [databasePath, `${databasePath}-wal`, `${databasePath}-shm`]) rmSync(path, { force: true });
console.log("Local database removed. Run npm run db:migrate && npm run seed.");

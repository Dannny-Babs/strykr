import { and, eq } from "drizzle-orm";
import { db, pool } from "../src/server/db/client";
import { feeSchedules, reconciliationRules } from "../src/server/db/schema";

const now = new Date().toISOString();
const rules = [
  ["TXN001", "Possible missing transaction", "Registration exists without a dealer transaction", "HIGH", "MATCHING"],
  ["TXN002", "Unmatched dealer transaction", "Dealer transaction exists without registration", "MEDIUM", "MATCHING"],
  ["TXN003", "Potential duplicate", "VIN appears more than once", "HIGH", "DATA_QUALITY"],
  ["DATE001", "Date variance", "Dates exceed tolerance", "MEDIUM", "DATES"],
  ["TYPE001", "Classification discrepancy", "Classifications conflict", "MEDIUM", "CLASSIFICATION"],
  ["FEE001", "Missing fee", "Fee-required transaction contains no fee", "HIGH", "FINANCIAL"],
  ["FEE002", "Fee variance", "Reported fee differs from expected", "HIGH", "FINANCIAL"],
  ["DOC001", "Evidence required", "Classification requires evidence", "MEDIUM", "EVIDENCE"],
  ["VIN001", "Invalid VIN", "VIN fails validation", "HIGH", "DATA_QUALITY"],
  ["PERIOD001", "Reporting period discrepancy", "Date falls outside period", "MEDIUM", "DATES"],
] as const;

async function main() {
  try {
    await db.transaction(async (transaction) => {
    for (const [code, name, description, severity, category] of rules) {
      await transaction.insert(reconciliationRules).values({
        id: `rule-${code.toLowerCase()}`,
        code,
        name,
        description,
        severity,
        category,
        enabled: true,
        version: "ruleset-v1",
        configuration: code === "DATE001" ? JSON.stringify({ toleranceDays: 7 }) : "{}",
      }).onConflictDoNothing();
    }

    const [existingFee] = await transaction.select({ id: feeSchedules.id }).from(feeSchedules).where(and(eq(feeSchedules.jurisdiction, "ON"), eq(feeSchedules.effectiveFrom, "2025-01-01"))).limit(1);
    if (!existingFee) {
      await transaction.insert(feeSchedules).values({ id: "fee-on-2025", amount: 22, effectiveFrom: "2025-01-01", effectiveTo: null, jurisdiction: "ON", createdAt: now });
    }
    });
    console.log("Production configuration bootstrapped: ruleset-v1 and Ontario fee schedule.");
  } finally {
    await pool.end();
  }
}

void main().catch((error) => { console.error(error); process.exitCode = 1; });

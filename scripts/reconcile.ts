import { runReconciliation } from "../src/server/services/reconciliation";

const result = runReconciliation({ dealershipId: process.argv[2] ?? "dealer-1", reportingPeriodId: process.argv[3] ?? "period-1-2025", actor: { id: "user-system-admin", organizationId: "org-system", dealershipId: null, role: "SYSTEM_ADMIN" } });
console.log(JSON.stringify({ id: result.id, ruleVersion: result.ruleVersion, metrics: result.metrics }, null, 2));

import { getActor } from "@/server/auth/context";
import { apiError } from "@/server/http/errors";
import { getWorkspace } from "@/server/services/workspace";

function csvCell(value: unknown) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
export async function GET(request: Request) {
  try {
    const actor = await getActor(); const workspace = getWorkspace(actor, new URL(request.url).searchParams.get("dealershipId") ?? undefined);
    const rows = [["Dealer", workspace.dealership.tradeName], ["Reporting period", workspace.reportingPeriod?.name ?? ""], ["Rule version", workspace.latestRun?.ruleVersion ?? ""], ["Total transactions", workspace.metrics.totalTransactions], ["Match rate", `${workspace.metrics.matchRate}%`], ["Open exceptions", workspace.metrics.openExceptions], [], ["Exception ID", "VIN", "Rule", "Summary", "Status", "Estimated fee impact"], ...workspace.exceptions.map((item) => [item.id, item.vin, item.rule, item.type, item.status, item.feeImpact])];
    return new Response(rows.map((row) => row.map(csvCell).join(",")).join("\n"), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${workspace.dealership.id}-reconciliation.csv"` } });
  } catch (error) { return apiError(error); }
}

import { assertCan } from "@/domain/auth/permissions";
import { getActor } from "@/server/auth/context";
import { apiError } from "@/server/http/errors";
import { getReviewerProductData } from "@/server/services/product";
import { normalizeSelectedIds } from "@/domain/product/ui-system";

const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET(request: Request) {
  try {
    const actor = await getActor(); assertCan(actor, "report:export"); const data = getReviewerProductData(); const params = new URL(request.url).searchParams; const status = params.get("status"); const priority = params.get("priority"); const dealershipId = params.get("dealershipId"); const selected = params.has("ids") ? new Set(normalizeSelectedIds((params.get("ids") ?? "").split(","), 50)) : null; const dealershipNames = new Map(data.dealerships.map((item) => [item.id, item.tradeName]));
    const records = data.exceptions.filter((item) => (!selected || selected.has(item.id)) && (!status || status === "open" ? item.status !== "RESOLVED" : item.status === status) && (!priority || item.priority === priority) && (!dealershipId || item.dealershipId === dealershipId));
    const rows = [["Generated at", new Date().toISOString()], ["Scope", dealershipId ? dealershipNames.get(dealershipId) ?? dealershipId : "Accessible reviewer portfolio"], ["Status filter", status ?? "All"], ["Priority filter", priority ?? "All"], ["Record count", records.length], [], ["Exception ID", "Dealership", "VIN", "Rule", "Summary", "Status", "Priority", "Estimated fee impact", "Created"], ...records.map((item) => [item.id, dealershipNames.get(item.dealershipId) ?? item.dealershipId, item.normalizedVin, item.ruleId, item.summary, item.status, item.priority, item.estimatedFeeImpact, item.createdAt])];
    return new Response(rows.map((row) => row.map(csvCell).join(",")).join("\n"), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="dealersync-exception-review.csv"' } });
  } catch (error) { return apiError(error); }
}

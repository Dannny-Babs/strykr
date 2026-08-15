import { normalizeSelectedIds } from "@/domain/product/ui-system";
import { getCurrentSessionUser } from "@/server/auth/context";
import { apiError } from "@/server/http/errors";
import { getAuthorizedTransactionsByIds } from "@/server/services/product";

const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
export async function GET(request: Request) {
  try {
    const actor = await getCurrentSessionUser(); if (!actor) return Response.json({ error: "Authentication required." }, { status: 401 });
    const ids = normalizeSelectedIds((new URL(request.url).searchParams.get("ids") ?? "").split(","), 50); const records = await getAuthorizedTransactionsByIds(actor, ids);
    const rows = [["Transaction ID", "VIN", "Type", "Date", "Source", "Reconciliation state", "Expected fee", "Reported fee"], ...records.map((item) => [item.id, item.normalizedVin, item.transactionType, item.transactionDate, item.source, item.reconciliationState, item.expectedFee, item.reportedFee])];
    return new Response(rows.map((row) => row.map(csvCell).join(",")).join("\n"), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="cordena-selected-transactions.csv"' } });
  } catch (error) { return apiError(error); }
}

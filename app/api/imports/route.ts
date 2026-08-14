import { getActor } from "@/server/auth/context";
import { apiError } from "@/server/http/errors";
import { commitImport, previewImport } from "@/server/services/imports";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const actor = await getActor(); const form = await request.formData(); const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Attach a CSV file in the file field." }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return Response.json({ error: "CSV files must be 10 MB or smaller." }, { status: 413 });
    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") return Response.json({ error: "Only CSV imports are supported in this phase." }, { status: 415 });
    const sourceType = form.get("sourceType") === "REGISTRATION_RECORD" ? "REGISTRATION_RECORD" : "TRANSACTION_REGISTER";
    const csv = await file.text(); const mappingText = String(form.get("mapping") ?? "{}"); const mapping = JSON.parse(mappingText);
    if (form.get("mode") === "commit") return Response.json(commitImport({ sourceType, csv, mapping, fileName: file.name.replace(/[^a-zA-Z0-9._-]/g, "_"), dealershipId: String(form.get("dealershipId") ?? actor.dealershipId ?? ""), reportingPeriodId: String(form.get("reportingPeriodId") ?? "period-1-2025"), actor }), { status: 201 });
    return Response.json(previewImport({ sourceType, csv, mapping }));
  } catch (error) { return apiError(error); }
}

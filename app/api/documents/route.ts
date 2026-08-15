import { getActor } from "@/server/auth/context";
import { apiError } from "@/server/http/errors";
import { enforceRateLimit } from "@/server/security/rate-limit";
import { uploadDocument } from "@/server/services/documents";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try { const actor = await getActor(); await enforceRateLimit(request, { scope: "document-upload", limit: 20, windowMs: 60 * 60 * 1000, discriminator: actor.id }); const form = await request.formData(); const file = form.get("file"); if (!(file instanceof File)) return Response.json({ error: "Attach a document in the file field." }, { status: 400 }); return Response.json(await uploadDocument({ file, dealershipId: String(form.get("dealershipId") ?? actor.dealershipId ?? ""), transactionId: form.get("transactionId") ? String(form.get("transactionId")) : undefined, exceptionId: form.get("exceptionId") ? String(form.get("exceptionId")) : undefined, documentType: String(form.get("documentType") ?? "SUPPORTING_EVIDENCE"), actor }), { status: 201 }); }
  catch (error) { return apiError(error); }
}

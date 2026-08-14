import { getActor } from "@/server/auth/context";
import { apiError } from "@/server/http/errors";
import { downloadDocument } from "@/server/services/documents";

export const runtime = "nodejs";
export async function GET(_request: Request, context: { params: Promise<{ documentId: string }> }) {
  try { const actor = await getActor(); const { documentId } = await context.params; const { item, bytes } = await downloadDocument(documentId, actor); return new Response(Buffer.from(bytes), { headers: { "content-type": item.mimeType, "content-length": String(item.fileSize), "content-disposition": `attachment; filename="${item.fileName.replaceAll('"', "")}"` } }); }
  catch (error) { return apiError(error); }
}

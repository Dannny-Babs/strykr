import { getActor } from "@/server/auth/context";
import { apiError } from "@/server/http/errors";
import { getWorkspace } from "@/server/services/workspace";

export const runtime = "nodejs";
export async function GET(request: Request) {
  try { const actor = await getActor(); const dealershipId = new URL(request.url).searchParams.get("dealershipId") ?? undefined; return Response.json(await getWorkspace(actor, dealershipId)); }
  catch (error) { return apiError(error); }
}

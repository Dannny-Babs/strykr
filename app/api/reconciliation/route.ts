import { z } from "zod";
import { getActor } from "@/server/auth/context";
import { apiError } from "@/server/http/errors";
import { runReconciliation } from "@/server/services/reconciliation";

export const runtime = "nodejs";
const requestSchema = z.object({ dealershipId: z.string().min(1), reportingPeriodId: z.string().min(1) });

export async function POST(request: Request) {
  try { const actor = await getActor(); const input = requestSchema.parse(await request.json()); return Response.json(await runReconciliation({ ...input, actor }), { status: 201 }); }
  catch (error) { return apiError(error); }
}

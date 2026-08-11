import { z } from "zod";
import { getActor } from "@/server/auth/context";
import { apiError } from "@/server/http/errors";
import { createAuditFinding, findingTypes } from "@/server/services/audits";

const requestSchema = z.object({ exceptionId: z.string().min(1), type: z.enum(findingTypes), conclusion: z.string().trim().min(10).max(5000), feeImpact: z.number().min(0).max(100000000) });

export async function POST(request: Request, context: { params: Promise<{ auditId: string }> }) {
  try { const actor = await getActor(); const { auditId } = await context.params; return Response.json(createAuditFinding({ auditId, ...requestSchema.parse(await request.json()), actor }), { status: 201 }); }
  catch (error) { return apiError(error); }
}

import { z } from "zod";
import { exceptionStatuses } from "@/domain/enums";
import { getActor } from "@/server/auth/context";
import { apiError } from "@/server/http/errors";
import { submitDealerResponse, transitionException } from "@/server/services/exceptions";

const requestSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("submit_response"), explanationCategory: z.string().min(1), explanation: z.string().min(3).max(5000) }),
  z.object({ operation: z.literal("transition"), status: z.enum(exceptionStatuses), resolutionType: z.string().optional(), resolutionReason: z.string().optional() }),
]);

export async function PATCH(request: Request, context: { params: Promise<{ exceptionId: string }> }) {
  try { const actor = await getActor(); const { exceptionId } = await context.params; const body = requestSchema.parse(await request.json()); return Response.json(body.operation === "submit_response" ? submitDealerResponse({ exceptionId, explanationCategory: body.explanationCategory, explanation: body.explanation, actor }) : transitionException({ exceptionId, status: body.status, resolutionType: body.resolutionType, resolutionReason: body.resolutionReason, actor })); }
  catch (error) { return apiError(error); }
}

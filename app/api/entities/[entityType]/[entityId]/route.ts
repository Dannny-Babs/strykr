import { z } from "zod";
import { entityTypes } from "@/product/entity-navigation";
import { getActor } from "@/server/auth/context";
import { apiError } from "@/server/http/errors";
import { getEntityDetail } from "@/server/services/entities";

const typeSchema = z.enum(entityTypes);

export async function GET(_request: Request, context: { params: Promise<{ entityType: string; entityId: string }> }) {
  try {
    const actor = await getActor();
    const params = await context.params;
    return Response.json(await getEntityDetail(actor, typeSchema.parse(params.entityType), params.entityId));
  } catch (error) {
    return apiError(error);
  }
}

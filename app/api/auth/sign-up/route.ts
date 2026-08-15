import { apiError } from "@/server/http/errors";
import { enforceRateLimit } from "@/server/security/rate-limit";
import { signUp } from "@/server/services/auth";
import { authRedirectOrigin } from "@/server/auth/origin";

export async function POST(request: Request) {
  try { const body = await request.json(); await enforceRateLimit(request, { scope: "auth-sign-up", limit: 5, windowMs: 60 * 60 * 1000, discriminator: typeof body?.email === "string" ? body.email : "" }); const result = await signUp(body, authRedirectOrigin(request)); return Response.json(result, { status: 201 }); }
  catch (error) { return apiError(error); }
}

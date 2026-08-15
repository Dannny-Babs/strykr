import { apiError } from "@/server/http/errors";
import { enforceRateLimit } from "@/server/security/rate-limit";
import { requestPasswordReset } from "@/server/services/auth";
import { authRedirectOrigin } from "@/server/auth/origin";

export async function POST(request: Request) {
  try { const body = await request.json(); await enforceRateLimit(request, { scope: "auth-password-request", limit: 3, windowMs: 60 * 60 * 1000, discriminator: typeof body?.email === "string" ? body.email : "" }); return Response.json(await requestPasswordReset(body, authRedirectOrigin(request))); }
  catch (error) { return apiError(error); }
}

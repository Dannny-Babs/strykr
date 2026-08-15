import { apiError } from "@/server/http/errors";
import { enforceRateLimit } from "@/server/security/rate-limit";
import { resetPassword } from "@/server/services/auth";

export async function POST(request: Request) {
  try { await enforceRateLimit(request, { scope: "auth-password-confirm", limit: 5, windowMs: 60 * 60 * 1000 }); return Response.json(await resetPassword(await request.json())); }
  catch (error) { return apiError(error); }
}

import { apiError } from "@/server/http/errors";
import { enforceRateLimit } from "@/server/security/rate-limit";
import { signIn } from "@/server/services/auth";

export async function POST(request: Request) {
  try { const body = await request.json(); await enforceRateLimit(request, { scope: "auth-sign-in", limit: 10, windowMs: 15 * 60 * 1000, discriminator: typeof body?.email === "string" ? body.email : "" }); return Response.json(await signIn(body)); }
  catch (error) { return apiError(error); }
}

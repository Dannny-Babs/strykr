import { setSessionCookie } from "@/server/auth/cookie";
import { apiError } from "@/server/http/errors";
import { signIn } from "@/server/services/auth";

export async function POST(request: Request) {
  try { const result = await signIn(await request.json()); await setSessionCookie(result.token, result.expiresAt); return Response.json({ destination: result.destination, user: result.user }); }
  catch (error) { return apiError(error); }
}

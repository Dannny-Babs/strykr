import { setSessionCookie } from "@/server/auth/cookie";
import { apiError } from "@/server/http/errors";
import { signUp } from "@/server/services/auth";

export async function POST(request: Request) {
  try { const result = await signUp(await request.json()); await setSessionCookie(result.token, result.expiresAt); return Response.json({ destination: result.destination, user: result.user }, { status: 201 }); }
  catch (error) { return apiError(error); }
}

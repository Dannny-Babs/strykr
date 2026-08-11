import { cookies } from "next/headers";
import { clearSessionCookie } from "@/server/auth/cookie";
import { destroySession, SESSION_COOKIE } from "@/server/auth/session";

export async function POST() {
  const cookieStore = await cookies(); destroySession(cookieStore.get(SESSION_COOKIE)?.value); await clearSessionCookie(); return Response.json({ destination: "/sign-in" });
}

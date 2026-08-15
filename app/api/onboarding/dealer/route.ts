import { getCurrentSessionUser } from "@/server/auth/context";
import { apiError } from "@/server/http/errors";
import { completeDealerOnboarding } from "@/server/services/onboarding";

export async function POST(request: Request) {
  try { const actor = await getCurrentSessionUser(); if (!actor) return Response.json({ error: "Sign in to continue." }, { status: 401 }); return Response.json(await completeDealerOnboarding(actor, await request.json())); }
  catch (error) { return apiError(error); }
}

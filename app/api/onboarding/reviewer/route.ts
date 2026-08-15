import { getCurrentSessionUser } from "@/server/auth/context";
import { apiError } from "@/server/http/errors";
import { completeReviewerOnboarding } from "@/server/services/onboarding";

export async function POST(request: Request) {
  try { const actor = await getCurrentSessionUser(); if (!actor) return Response.json({ error: "Sign in to continue." }, { status: 401 }); return Response.json(await completeReviewerOnboarding(actor, await request.json())); }
  catch (error) { return apiError(error); }
}

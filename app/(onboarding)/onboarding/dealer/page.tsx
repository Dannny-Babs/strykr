import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { DealerOnboardingForm } from "@/components/auth/onboarding-form";
import { getCurrentSessionUser } from "@/server/auth/context";

export default async function DealerOnboardingPage() {
  const actor = await getCurrentSessionUser(); if (!actor) redirect("/sign-in"); if (actor.role !== "DEALER_ADMIN" && actor.role !== "DEALER_USER") redirect("/onboarding/reviewer"); if (actor.onboardingComplete) redirect("/dealer/dashboard");
  return <AuthShell eyebrow="Account / Workspace · Step 2 of 2" title="Tell us which dealership you represent" description="This creates the organization boundary used for transaction records, imports, evidence, and team access."><DealerOnboardingForm /></AuthShell>;
}

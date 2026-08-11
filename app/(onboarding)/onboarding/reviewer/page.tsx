import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ReviewerOnboardingForm } from "@/components/auth/onboarding-form";
import { getCurrentSessionUser } from "@/server/auth/context";

export default async function ReviewerOnboardingPage() {
  const actor = await getCurrentSessionUser(); if (!actor) redirect("/sign-in"); if (actor.role !== "REGULATOR_REVIEWER") redirect("/onboarding/dealer"); if (actor.onboardingComplete) redirect("/reviewer/dashboard");
  return <AuthShell eyebrow="Review organization setup" title="Set up your review workspace" description="Your organization and jurisdiction define the review context. Dealership data access is assigned separately."><ReviewerOnboardingForm /></AuthShell>;
}

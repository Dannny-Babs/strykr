import { redirect } from "next/navigation";
import { destinationForActor } from "@/domain/auth/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { getCurrentSessionUser } from "@/server/auth/context";

export default async function SignUpPage() {
  const actor = await getCurrentSessionUser(); if (actor) redirect(destinationForActor(actor.role, actor.onboardingComplete));
  return <AuthShell title="Create your account" description="Create a dealership workspace. Reviewer access is provisioned by invitation."><SignUpForm allowReviewer={process.env.NODE_ENV !== "production"} /></AuthShell>;
}

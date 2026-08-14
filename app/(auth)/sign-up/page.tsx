import { redirect } from "next/navigation";
import { destinationForActor } from "@/domain/auth/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { getCurrentSessionUser } from "@/server/auth/context";

export default async function SignUpPage() {
  const actor = await getCurrentSessionUser(); if (actor) redirect(destinationForActor(actor.role, actor.onboardingComplete));
  return <AuthShell title="Create your account" description="Your account type determines the product workspace you can access. It cannot be switched from inside the application."><SignUpForm /></AuthShell>;
}

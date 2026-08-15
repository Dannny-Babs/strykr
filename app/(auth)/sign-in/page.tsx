import Link from "next/link";
import { redirect } from "next/navigation";
import { destinationForActor } from "@/domain/auth/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getCurrentSessionUser } from "@/server/auth/context";

export default async function SignInPage() {
  const actor = await getCurrentSessionUser(); if (actor) redirect(destinationForActor(actor.role, actor.onboardingComplete));
  const showLocalCredentials = process.env.NODE_ENV !== "production" && process.env.CORDENA_DEV_AUTH === "true";
  return <AuthShell title="Welcome back" description="Sign in to continue to your dealership or review workspace." footer={<>{showLocalCredentials ? <details><summary className="cursor-pointer font-medium text-foreground">Local pilot credentials</summary><p className="mt-2">Use a seeded email ending in <code>@example.test</code> with password <code>Cordena2026!</code>.</p></details> : null}<Link href="/" className="mt-3 inline-block font-medium text-foreground hover:underline">Return to the product overview</Link></>}><SignInForm /></AuthShell>;
}

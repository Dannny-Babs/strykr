import { AuthShell } from "@/components/auth/auth-shell";
import { ResendVerificationForm } from "@/components/auth/account-recovery-forms";

export default async function VerificationPendingPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email = "" } = await searchParams;
  return <AuthShell title="Check your inbox" description="We sent a one-time verification link. It expires after 24 hours."><ResendVerificationForm initialEmail={email} /></AuthShell>;
}

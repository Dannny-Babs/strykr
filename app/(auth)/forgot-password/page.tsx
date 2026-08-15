import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/account-recovery-forms";

export default function ForgotPasswordPage() {
  return <AuthShell title="Reset your password" description="Enter your work email and we’ll send a one-time reset link."><ForgotPasswordForm /></AuthShell>;
}

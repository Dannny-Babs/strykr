import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/account-recovery-forms";

export default function ResetPasswordPage() {
  return <AuthShell title="Choose a new password" description="Your secure recovery session is active."><ResetPasswordForm /></AuthShell>;
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function post(url: string, body: unknown) {
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "The request could not be completed.");
  return result;
}

function Status({ error, message }: { error: string; message: string }) {
  if (error) return <Alert role="alert" variant="destructive"><AlertCircle className="size-4" /><AlertDescription>{error}</AlertDescription></Alert>;
  if (message) return <Alert role="status"><CheckCircle2 className="size-4" /><AlertDescription>{message}</AlertDescription></Alert>;
  return null;
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState(""); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); setBusy(true); setError(""); try { const result = await post("/api/auth/password-reset/request", { email }); setMessage(result.message); } catch (reason) { setError(reason instanceof Error ? reason.message : "Request failed."); } finally { setBusy(false); } }
  return <form className="space-y-5" onSubmit={submit}><Status error={error} message={message} /><div className="space-y-2"><Label htmlFor="email">Work email</Label><Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div><Button className="w-full" size="form" type="submit" disabled={busy}>{busy ? "Sending…" : <>Send reset link <ArrowRight className="size-4" /></>}</Button><p className="text-center text-sm text-muted-foreground"><Link href="/sign-in" className="font-medium text-foreground hover:underline">Return to sign in</Link></p></form>;
}

export function ResetPasswordForm() {
  const router = useRouter(); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); setBusy(true); setError(""); try { const result = await post("/api/auth/password-reset/confirm", { password }); router.push(result.destination); } catch (reason) { setError(reason instanceof Error ? reason.message : "Reset failed."); } finally { setBusy(false); } }
  return <form className="space-y-5" onSubmit={submit}><Status error={error} message="" /><div className="space-y-2"><Label htmlFor="password">New password</Label><Input id="password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={12} required /><p className="text-xs text-muted-foreground">Use at least 12 characters with uppercase, lowercase, and a number.</p></div><Button className="w-full" size="form" type="submit" disabled={busy}>{busy ? "Updating…" : <>Update password <ArrowRight className="size-4" /></>}</Button></form>;
}

export function ResendVerificationForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); setBusy(true); setError(""); try { const result = await post("/api/auth/verify-email/resend", { email }); setMessage(result.message); } catch (reason) { setError(reason instanceof Error ? reason.message : "Request failed."); } finally { setBusy(false); } }
  return <form className="space-y-5" onSubmit={submit}><Status error={error} message={message} /><div className="space-y-2"><Label htmlFor="email">Work email</Label><Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div><Button className="w-full" size="form" type="submit" disabled={busy}>{busy ? "Sending…" : "Send another link"}</Button><p className="text-center text-sm text-muted-foreground"><Link href="/sign-in" className="font-medium text-foreground hover:underline">Return to sign in</Link></p></form>;
}

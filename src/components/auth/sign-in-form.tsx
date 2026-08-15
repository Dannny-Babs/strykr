"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm() {
  const router = useRouter(); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { const response = await fetch("/api/auth/sign-in", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error); router.push(body.destination); router.refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Sign-in failed."); }
    finally { setBusy(false); }
  }
  return (
    <form className="space-y-5" onSubmit={submit} noValidate>
      {error && <Alert role="alert" variant="destructive"><AlertCircle className="size-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      <div className="space-y-2"><Label htmlFor="email">Work email</Label><Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.ca" required /></div>
      <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required /></div>
      <div className="text-right"><Link href="/forgot-password" className="text-sm font-medium text-foreground underline-offset-4 hover:underline">Forgot password?</Link></div>
      <Button className="w-full" size="form" type="submit" disabled={busy}>{busy ? "Signing in…" : <>Sign in <ArrowRight className="size-4" /></>}</Button>
      <p className="text-center text-sm text-muted-foreground">New to Cordena? <Link href="/sign-up" className="font-medium text-foreground underline-offset-4 hover:underline">Create an account</Link></p>
    </form>
  );
}

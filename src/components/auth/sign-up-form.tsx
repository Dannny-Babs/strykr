"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SignUpForm() {
  const router = useRouter(); const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [accountType, setAccountType] = useState<"dealer" | "reviewer">("dealer"); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { const response = await fetch("/api/auth/sign-up", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, email, password, accountType }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error); router.push(body.destination); router.refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Account creation failed."); }
    finally { setBusy(false); }
  }
  return (
    <form className="space-y-5" onSubmit={submit} noValidate>
      {error && <Alert role="alert" variant="destructive"><AlertCircle className="size-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      <div className="space-y-2"><Label htmlFor="account-type">I&apos;m joining as</Label><Select value={accountType} onValueChange={(value) => setAccountType(value as "dealer" | "reviewer")}><SelectTrigger id="account-type" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dealer">Dealership team</SelectItem><SelectItem value="reviewer">Review organization</SelectItem></SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="name">Full name</Label><Input id="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Jordan Smith" required /></div>
      <div className="space-y-2"><Label htmlFor="email">Work email</Label><Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.ca" required /></div>
      <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 12 characters" required /><p className="text-xs leading-5 text-muted-foreground">Use 12+ characters with uppercase, lowercase, and a number.</p></div>
      <Button className="h-10 w-full" type="submit" disabled={busy}>{busy ? "Creating account…" : <>Create account <ArrowRight className="size-4" /></>}</Button>
      <p className="text-center text-sm text-muted-foreground">Already have an account? <Link href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">Sign in</Link></p>
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SegmentedControl } from "@/components/ui/segmented-control";

export function SignUpForm({ allowReviewer = false }: { allowReviewer?: boolean }) {
  const router = useRouter(); const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [accountType, setAccountType] = useState<"dealer" | "reviewer">("dealer"); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); setBusy(true); setError(""); try { const response = await fetch("/api/auth/sign-up", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, email, password, accountType }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error); router.push(body.destination); router.refresh(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Account creation failed."); } finally { setBusy(false); } }
  const charactersMet = /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
  return <form className="space-y-4" onSubmit={submit} noValidate>{error ? <Alert role="alert" variant="destructive"><AlertCircle className="size-4" /><AlertDescription>{error}</AlertDescription></Alert> : null}{allowReviewer ? <div className="space-y-1.5"><Label>I&apos;m joining as</Label><SegmentedControl value={accountType} onValueChange={setAccountType} ariaLabel="Account type" className="w-full" options={[{ value: "dealer", label: "Dealership team" }, { value: "reviewer", label: "Review organization" }]} /><p className="text-xs leading-4 text-muted-foreground">Account type sets the permanent workspace boundary and available records.</p></div> : null}<div className="space-y-1.5"><Label htmlFor="name">Full name</Label><Input id="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Jordan Smith" required /></div><div className="space-y-1.5"><Label htmlFor="email">Work email</Label><Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.ca" required /></div><div className="space-y-1.5"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 12 characters" required /><p className="text-xs leading-4 text-muted-foreground">{password.length >= 12 ? "Length requirement met." : "Use at least 12 characters."} {charactersMet ? "Character requirements met." : "Include uppercase, lowercase, and a number."}</p></div><Button className="w-full" size="form" type="submit" disabled={busy}>{busy ? <><LoaderCircle className="size-3.5 animate-spin" /> Creating account</> : <>Create account <ArrowRight className="size-4" /></>}</Button><p className="text-center text-[13px] text-muted-foreground">Already have an account? <Link href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">Sign in</Link></p></form>;
}

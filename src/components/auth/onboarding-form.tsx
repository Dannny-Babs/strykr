"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";

export function DealerOnboardingForm() {
  const router = useRouter(); const [values, setValues] = useState({ tradeName: "", legalName: "", registrationNumber: "", city: "", province: "ON" }); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); setBusy(true); setError(""); try { const response = await fetch("/api/onboarding/dealer", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(values) }); const body = await response.json(); if (!response.ok) throw new Error(body.error); router.push(body.destination); router.refresh(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Setup failed."); } finally { setBusy(false); } }
  const field = (name: keyof typeof values) => ({ value: values[name], onChange: (event: React.ChangeEvent<HTMLInputElement>) => setValues((current) => ({ ...current, [name]: event.target.value })) });
  return <form className="space-y-5" onSubmit={submit}>{error && <Alert role="alert" variant="destructive"><AlertCircle className="size-4" /><AlertDescription>{error}</AlertDescription></Alert>}<div className="space-y-2"><Label htmlFor="tradeName">Dealership name</Label><Input id="tradeName" placeholder="Northfield Auto Group" {...field("tradeName")} /></div><div className="space-y-2"><Label htmlFor="legalName">Legal business name</Label><Input id="legalName" placeholder="Northfield Auto Holdings Inc." {...field("legalName")} /></div><div className="space-y-2"><Label htmlFor="registrationNumber">Registration number</Label><Input id="registrationNumber" placeholder="ON-041023" {...field("registrationNumber")} /></div><div className="grid grid-cols-[1fr_128px] gap-3"><div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" placeholder="Hamilton" {...field("city")} /></div><div className="space-y-2"><Label htmlFor="province">Province</Label><Select value="ON" disabled><SelectTrigger id="province" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ON">Ontario</SelectItem></SelectContent></Select></div></div><Button className="w-full" size="form" type="submit" disabled={busy}>{busy ? "Saving…" : <>Continue to Cordena <ArrowRight className="size-4" /></>}</Button></form>;
}

export function ReviewerOnboardingForm() {
  const router = useRouter(); const [values, setValues] = useState({ organizationName: "", jurisdiction: "Ontario", jobTitle: "" }); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); setBusy(true); setError(""); try { const response = await fetch("/api/onboarding/reviewer", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(values) }); const body = await response.json(); if (!response.ok) throw new Error(body.error); router.push(body.destination); router.refresh(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Setup failed."); } finally { setBusy(false); } }
  const field = (name: keyof typeof values) => ({ value: values[name], onChange: (event: React.ChangeEvent<HTMLInputElement>) => setValues((current) => ({ ...current, [name]: event.target.value })) });
  return <form className="space-y-5" onSubmit={submit}>{error && <Alert role="alert" variant="destructive"><AlertCircle className="size-4" /><AlertDescription>{error}</AlertDescription></Alert>}<div className="space-y-2"><Label htmlFor="organizationName">Organization name</Label><Input id="organizationName" placeholder="Ontario Vehicle Transaction Review" {...field("organizationName")} /></div><div className="space-y-2"><Label htmlFor="jobTitle">Your role</Label><Input id="jobTitle" placeholder="Compliance reviewer" {...field("jobTitle")} /></div><div className="space-y-2"><Label>Jurisdiction</Label><SegmentedControl value={values.jurisdiction} onValueChange={(jurisdiction) => setValues((current) => ({ ...current, jurisdiction }))} ariaLabel="Jurisdiction" className="w-full" options={[{ value: "Ontario", label: "Ontario" }, { value: "Canada", label: "Canada" }, { value: "Other", label: "Other" }]} /></div><Button className="w-full" size="form" type="submit" disabled={busy}>{busy ? "Saving…" : <>Continue to review workspace <ArrowRight className="size-4" /></>}</Button></form>;
}

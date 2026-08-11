import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductPageHeader } from "@/components/product/page-primitives";

export default function ReviewerReportsPage() {
  return <><ProductPageHeader title="Reports" description="Regulatory review outputs generated from persisted runs, exceptions, responses, findings, and activity." /><section className="border bg-background"><div className="flex items-center gap-4 border-b p-5"><span className="grid size-10 place-items-center rounded-md bg-muted"><FileText className="size-5" /></span><div className="min-w-0 flex-1"><h2 className="font-medium">Exception review report</h2><p className="mt-1 text-sm text-muted-foreground">Open exceptions, rules, explanations, status, and estimated financial impact.</p></div><Button variant="outline" disabled><Download className="size-4" /> Export soon</Button></div><p className="p-5 text-sm text-muted-foreground">Reviewer-wide reporting remains behind dealership scoping and finding-linkage controls. The UI does not pretend a compliant aggregate export exists yet.</p></section></>;
}

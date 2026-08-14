import { PageFrame, ProductPageHeader } from "@/components/product/page-primitives";
import { ReportCard } from "@/components/product/report-card";

export default function ReviewerReportsPage() {
  return <PageFrame><ProductPageHeader title="Reports" description="Regulatory review outputs generated from persisted runs, exceptions, responses, findings, and activity." /><section className="grid gap-4 md:grid-cols-2"><ReportCard title="Exception review report" purpose="Open exceptions, rules, explanations, status, priority, provenance, and estimated financial impact." scope="Accessible review portfolio" href="/api/reports/exceptions?status=open" /><ReportCard title="Audit finding report" purpose="Evidence-linked findings, classifications, conclusions, statuses, and financial impact." scope="Accessible audits" href="/api/reports/findings" /></section><p className="max-w-3xl text-xs leading-4 text-muted-foreground">Validate report terminology and required fields with authorized Ontario stakeholders before pilot use.</p></PageFrame>;
}

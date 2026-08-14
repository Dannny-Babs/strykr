import { PageFrame, ProductPageHeader } from "@/components/product/page-primitives";
import { ReportCard } from "@/components/product/report-card";

export default function DealerReportsPage() {
  return <PageFrame><ProductPageHeader title="Reports" description="Exports generated from persisted dealership records and the latest immutable reconciliation run." /><section className="grid gap-4 md:grid-cols-2"><ReportCard title="Dealership reconciliation report" purpose="Transactions, match rate, open exceptions, rules, and estimated fee impact." scope="Current dealership" href="/api/reports/reconciliation" /></section><p className="max-w-3xl text-xs leading-4 text-muted-foreground">Printable and evidence-package exports remain intentionally behind the stable CSV content model.</p></PageFrame>;
}

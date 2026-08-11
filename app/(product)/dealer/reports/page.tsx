import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductPageHeader } from "@/components/product/page-primitives";

export default function DealerReportsPage() {
  return <><ProductPageHeader title="Reports" description="Exports are generated from persisted records and the latest immutable reconciliation run." /><section className="border bg-background"><div className="flex items-center gap-4 border-b p-5"><span className="grid size-10 place-items-center rounded-md bg-muted"><FileText className="size-5" /></span><div className="min-w-0 flex-1"><h2 className="font-medium">Dealership reconciliation report</h2><p className="mt-1 text-sm text-muted-foreground">Transactions, match rate, open exceptions, rules, and estimated fee impact.</p></div><Button variant="outline" asChild><a href="/api/reports/reconciliation"><Download className="size-4" /> Download CSV</a></Button></div><div className="p-5 text-sm text-muted-foreground">Printable HTML and evidence-package exports remain intentionally behind the stable CSV content model.</div></section></>;
}

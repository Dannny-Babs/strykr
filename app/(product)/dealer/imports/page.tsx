import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DealerImportPanel } from "@/components/product/dealer-import-panel";
import { EmptyState } from "@/components/product/empty-state";
import { ProductPageHeader } from "@/components/product/page-primitives";
import { dateLabel, StatusBadge } from "@/components/product/status";
import { requireProductActor } from "@/server/auth/guards";
import { getDealerProductData } from "@/server/services/product";

export default async function DealerImportsPage() {
  const actor = await requireProductActor(["DEALER_ADMIN", "DEALER_USER"]); const data = getDealerProductData(actor);
  return <><ProductPageHeader title="Import history" description="Validate and import source records without hiding warnings, rejected rows, or provenance." /><DealerImportPanel dealershipId={data.dealership.id} reportingPeriodId={data.reportingPeriod!.id} /><section className="overflow-hidden border bg-background">{data.imports.length ? <Table><TableHeader><TableRow><TableHead>File</TableHead><TableHead>Source</TableHead><TableHead>Imported</TableHead><TableHead>Rows</TableHead><TableHead>Warnings</TableHead><TableHead>Rejected</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{data.imports.map((item) => <TableRow key={item.id}><TableCell><p className="font-medium">{item.fileName}</p><p className="mt-1 font-mono text-[11px] text-muted-foreground">{item.id.slice(0, 12)}</p></TableCell><TableCell>{item.sourceType.replaceAll("_", " ")}</TableCell><TableCell>{dateLabel(item.completedAt ?? item.createdAt)}</TableCell><TableCell>{item.totalRows.toLocaleString()}</TableCell><TableCell>{item.warningRows}</TableCell><TableCell>{item.rejectedRows}</TableCell><TableCell><StatusBadge value={item.status} /></TableCell></TableRow>)}</TableBody></Table> : <EmptyState kind="import-data" title="No imports yet" description="Choose a source type and CSV above to create the first import batch." />}</section></>;
}

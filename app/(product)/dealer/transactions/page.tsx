import { Download } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/product/empty-state";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductPageHeader } from "@/components/product/page-primitives";
import { money, StatusBadge } from "@/components/product/status";
import { requireProductActor } from "@/server/auth/guards";
import { getDealerProductData } from "@/server/services/product";

export default async function DealerTransactionsPage() {
  const actor = await requireProductActor(["DEALER_ADMIN", "DEALER_USER"]); const data = getDealerProductData(actor);
  return <><ProductPageHeader title="Transaction register" description="Canonical dealer records from the selected reporting period. Original import values remain preserved." actions={<Button variant="outline" asChild><a href="/api/reports/reconciliation"><Download className="size-4" /> Export CSV</a></Button>} /><section className="overflow-hidden border bg-background">{data.transactions.length ? <Table><TableHeader><TableRow><TableHead>VIN / vehicle</TableHead><TableHead>Transaction</TableHead><TableHead>Date</TableHead><TableHead>Source</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Reported fee</TableHead></TableRow></TableHeader><TableBody>{data.transactions.map((item) => <TableRow key={item.id}><TableCell><p className="font-mono text-xs">{item.normalizedVin}</p><p className="mt-1 text-xs text-muted-foreground">{item.vehicle || "Vehicle details unavailable"} · {item.stockNumber ?? "No stock number"}</p></TableCell><TableCell>{item.transactionType.replaceAll("_", " ")}</TableCell><TableCell>{item.transactionDate}</TableCell><TableCell className="text-xs text-muted-foreground">{item.source.replaceAll("_", " ")}</TableCell><TableCell><StatusBadge value={item.reconciliationState} /></TableCell><TableCell className="text-right font-mono">{money(item.reportedFee)}</TableCell></TableRow>)}</TableBody></Table> : <EmptyState kind="no-transactions" title="No transactions yet" description="Import a transaction register to create the first canonical records." action={<Button asChild><Link href="/dealer/imports">Import records</Link></Button>} />}</section>{data.transactions.length > 0 && <p className="mt-3 text-xs text-muted-foreground">Showing the latest {data.transactions.length} records. Database pagination is the next register milestone.</p>}</>;
}

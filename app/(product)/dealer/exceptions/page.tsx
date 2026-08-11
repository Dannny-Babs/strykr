import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductPageHeader } from "@/components/product/page-primitives";
import { EmptyState } from "@/components/product/empty-state";
import { money, StatusBadge } from "@/components/product/status";
import { requireProductActor } from "@/server/auth/guards";
import { getDealerProductData } from "@/server/services/product";

export default async function DealerExceptionsPage() {
  const actor = await requireProductActor(["DEALER_ADMIN", "DEALER_USER"]); const data = getDealerProductData(actor);
  return <><ProductPageHeader title="Exceptions" description="Explain discrepancies, add evidence, and track reviewer requests without changing the original source record." /><section className="overflow-hidden border bg-background">{data.exceptions.length ? <Table><TableHeader><TableRow><TableHead>Exception</TableHead><TableHead>VIN</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead className="text-right">Estimated impact</TableHead><TableHead><span className="sr-only">Action</span></TableHead></TableRow></TableHeader><TableBody>{data.exceptions.map((item) => <TableRow key={item.id}><TableCell><p className="max-w-md font-medium">{item.type}</p><p className="mt-1 max-w-lg text-xs text-muted-foreground">{item.reason}</p></TableCell><TableCell className="font-mono text-xs">…{item.vin.slice(-8)}</TableCell><TableCell><StatusBadge value={item.domainStatus ?? item.status} /></TableCell><TableCell><StatusBadge value={item.priority} /></TableCell><TableCell className="text-right font-mono">{money(item.feeImpact)}</TableCell><TableCell className="text-right"><Button variant="ghost" size="sm"><Paperclip className="size-4" /> Review</Button></TableCell></TableRow>)}</TableBody></Table> : <EmptyState kind="all-clear" title="No open exceptions" description="New discrepancies will appear here after reconciliation runs." />}</section></>;
}

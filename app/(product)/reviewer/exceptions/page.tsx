import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductPageHeader } from "@/components/product/page-primitives";
import { EmptyState } from "@/components/product/empty-state";
import { money, StatusBadge } from "@/components/product/status";
import { requireProductActor } from "@/server/auth/guards";
import { getReviewerProductData } from "@/server/services/product";

export default async function ReviewerExceptionsPage() {
  await requireProductActor(["REGULATOR_REVIEWER"]); const data = getReviewerProductData(); const dealerNames = new Map(data.dealerships.map((dealer) => [dealer.id, dealer.tradeName]));
  return <><ProductPageHeader title="Investigation queue" description="Review discrepancies as evidence-backed cases. A flag is not a finding until a reviewer makes that decision." /><section className="overflow-hidden border bg-background">{data.exceptions.length ? <Table><TableHeader><TableRow><TableHead>Dealership / VIN</TableHead><TableHead>Why it was flagged</TableHead><TableHead>Rule</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead className="text-right">Impact</TableHead><TableHead><span className="sr-only">Action</span></TableHead></TableRow></TableHeader><TableBody>{data.exceptions.slice(0, 100).map((item) => <TableRow key={item.id}><TableCell><p className="font-medium">{dealerNames.get(item.dealershipId) ?? item.dealershipId}</p><p className="mt-1 font-mono text-xs text-muted-foreground">…{item.vin.slice(-8)}</p></TableCell><TableCell><p className="max-w-md font-medium">{item.summary}</p><p className="mt-1 max-w-lg text-xs text-muted-foreground">{item.recommendedAction}</p></TableCell><TableCell className="font-mono text-xs">{item.ruleId}</TableCell><TableCell><StatusBadge value={item.status} /></TableCell><TableCell><StatusBadge value={item.priority} /></TableCell><TableCell className="text-right font-mono">{money(item.estimatedFeeImpact)}</TableCell><TableCell><Button variant="outline" size="sm">Review</Button></TableCell></TableRow>)}</TableBody></Table> : <EmptyState kind="all-clear" title="Investigation queue cleared" description="There are no evidence-backed cases waiting for review." />}</section></>;
}

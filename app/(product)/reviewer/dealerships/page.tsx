import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductPageHeader } from "@/components/product/page-primitives";
import { EmptyState } from "@/components/product/empty-state";
import { dateLabel, money, StatusBadge } from "@/components/product/status";
import { requireProductActor } from "@/server/auth/guards";
import { getReviewerProductData } from "@/server/services/product";

export default async function ReviewerDealershipsPage() {
  await requireProductActor(["REGULATOR_REVIEWER"]); const data = getReviewerProductData();
  return <><ProductPageHeader title="Dealerships" description="Operational review status across the dealerships available to your organization." /><section className="overflow-hidden border bg-background">{data.dealerships.length ? <Table><TableHeader><TableRow><TableHead>Dealership</TableHead><TableHead>Registration</TableHead><TableHead>Location</TableHead><TableHead>Latest run</TableHead><TableHead>Match rate</TableHead><TableHead>Open items</TableHead><TableHead className="text-right">Impact</TableHead></TableRow></TableHeader><TableBody>{data.dealerships.map((item) => <TableRow key={item.id}><TableCell className="font-medium">{item.tradeName}</TableCell><TableCell className="font-mono text-xs">{item.registrationNumber}</TableCell><TableCell>{item.city}, {item.province}</TableCell><TableCell>{dateLabel(item.lastRunAt)}</TableCell><TableCell>{item.matchRate === null ? <StatusBadge value="No run" /> : `${item.matchRate}%`}</TableCell><TableCell>{item.openExceptions}</TableCell><TableCell className="text-right font-mono">{money(item.estimatedFeeImpact)}</TableCell></TableRow>)}</TableBody></Table> : <EmptyState kind="no-dealerships" title="No dealerships yet" description="Dealerships will appear here when they are assigned to your review organization." />}</section></>;
}

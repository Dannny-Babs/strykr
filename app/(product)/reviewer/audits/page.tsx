import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductPageHeader } from "@/components/product/page-primitives";
import { EmptyState } from "@/components/product/empty-state";
import { dateLabel, StatusBadge } from "@/components/product/status";
import { requireProductActor } from "@/server/auth/guards";
import { getReviewerProductData } from "@/server/services/product";

export default async function ReviewerAuditsPage() {
  await requireProductActor(["REGULATOR_REVIEWER"]); const data = getReviewerProductData();
  return <><ProductPageHeader title="Audits" description="Investigation containers for scope, reconciliation runs, requests, exceptions, evidence, and findings." actions={<Button><Plus className="size-4" /> New audit</Button>} /><section className="overflow-hidden border bg-background">{data.audits.length ? <Table><TableHeader><TableRow><TableHead>Audit</TableHead><TableHead>Dealership</TableHead><TableHead>Scope</TableHead><TableHead>Status</TableHead><TableHead>Started</TableHead><TableHead>Due</TableHead></TableRow></TableHeader><TableBody>{data.audits.map(({ audit, dealership }) => <TableRow key={audit.id}><TableCell><p className="font-medium">{audit.name}</p><p className="mt-1 font-mono text-[11px] text-muted-foreground">{audit.id}</p></TableCell><TableCell>{dealership.tradeName}</TableCell><TableCell>{audit.scope}</TableCell><TableCell><StatusBadge value={audit.status} /></TableCell><TableCell>{dateLabel(audit.startedAt)}</TableCell><TableCell>{dateLabel(audit.dueAt)}</TableCell></TableRow>)}</TableBody></Table> : <EmptyState kind="no-activity" title="No audits yet" description="Create an audit when a dealership needs a scoped investigation." />}</section></>;
}

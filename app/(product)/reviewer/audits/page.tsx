import { EmptyState } from "@/components/product/empty-state";
import { EntityLink } from "@/components/product/entity-link";
import { PageFrame, ProductPageHeader } from "@/components/product/page-primitives";
import { dateLabel, StatusBadge } from "@/components/product/status";
import { TableToolbar } from "@/components/product/table-toolbar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { parseDatasetSort } from "@/domain/product/ui-system";
import { requireProductActor } from "@/server/auth/guards";
import { getReviewerProductData } from "@/server/services/product";

const sorts = [
  { value: "newest", label: "Newest" },
  { value: "due-soonest", label: "Due soonest" },
  { value: "status", label: "Status" },
];

export default async function ReviewerAuditsPage({ searchParams }: { searchParams: Promise<{ q?: string; sort?: string }> }) {
  await requireProductActor(["REGULATOR_REVIEWER"]);
  const params = await searchParams;
  const data = await getReviewerProductData();
  const query = params.q?.trim().toLowerCase();
  const sort = parseDatasetSort("reviewerAudits", params.sort);
  const rows = data.audits
    .filter(({ audit, dealership }) => !query || audit.name.toLowerCase().includes(query) || dealership.tradeName.toLowerCase().includes(query) || audit.id.toLowerCase().includes(query))
    .sort((a, b) => {
      if (sort === "due-soonest") return (a.audit.dueAt ?? "9999").localeCompare(b.audit.dueAt ?? "9999") || a.audit.id.localeCompare(b.audit.id);
      if (sort === "status") return a.audit.status.localeCompare(b.audit.status) || a.audit.id.localeCompare(b.audit.id);
      return (b.audit.createdAt ?? "").localeCompare(a.audit.createdAt ?? "") || a.audit.id.localeCompare(b.audit.id);
    });

  return <PageFrame>
    <ProductPageHeader title="Audits" description="Investigation containers for scope, reconciliation runs, requests, exceptions, evidence, and findings." />
    <div>
      <TableToolbar searchPlaceholder="Search audit or dealership" sortOptions={sorts} defaultSort="newest" page={1} pageCount={1} total={rows.length} />
      <section className="overflow-hidden rounded-b-[14px] border bg-white">
        {rows.length ? <>
          <div className="hidden overflow-x-auto md:block">
            <Table><TableHeader><TableRow><TableHead>Audit</TableHead><TableHead>Dealership</TableHead><TableHead>Scope</TableHead><TableHead>Status</TableHead><TableHead>Started</TableHead><TableHead>Due</TableHead></TableRow></TableHeader><TableBody>{rows.map(({ audit, dealership }) => <TableRow key={audit.id}><TableCell><EntityLink type="audit" id={audit.id}>{audit.name}</EntityLink><p className="font-mono text-xs text-muted-foreground">{audit.id}</p></TableCell><TableCell><EntityLink type="dealership" id={dealership.id}>{dealership.tradeName}</EntityLink></TableCell><TableCell>{audit.scope}</TableCell><TableCell><StatusBadge value={audit.status} /></TableCell><TableCell>{dateLabel(audit.startedAt)}</TableCell><TableCell>{dateLabel(audit.dueAt)}</TableCell></TableRow>)}</TableBody></Table>
          </div>
          <div className="divide-y md:hidden">{rows.map(({ audit, dealership }) => <article key={audit.id} className="p-4"><EntityLink type="audit" id={audit.id}>{audit.name}</EntityLink><p className="mt-1 text-xs text-muted-foreground">{dealership.tradeName} · Due {dateLabel(audit.dueAt)}</p><div className="mt-3"><StatusBadge value={audit.status} /></div></article>)}</div>
        </> : <EmptyState kind="no-activity" title={query ? "No audits match this search" : "No audits yet"} description={query ? "Change the search to return to the audit list." : "Audits appear when a scoped investigation is created."} compact />}
      </section>
    </div>
  </PageFrame>;
}

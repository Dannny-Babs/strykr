import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DealerImportDialog } from "@/components/product/dealer-import-dialog";
import { EmptyState } from "@/components/product/empty-state";
import { PageFrame, ProductPageHeader, SectionHeading } from "@/components/product/page-primitives";
import { dateLabel, StatusBadge } from "@/components/product/status";
import { requireProductActor } from "@/server/auth/guards";
import { getDealerProductData } from "@/server/services/product";
import { EntityLink } from "@/components/product/entity-link";

export default async function DealerImportsPage() {
  const actor = await requireProductActor(["DEALER_ADMIN", "DEALER_USER"]);
  const data = await getDealerProductData(actor);

  return (
    <PageFrame>
      <ProductPageHeader
        title="Imports"
        description="Review source files, record counts, and validation outcomes for this dealership."
        actions={<DealerImportDialog dealershipId={data.dealership.id} reportingPeriodId={data.reportingPeriod!.id} />}
      />
      <section className="overflow-hidden rounded-[14px] border bg-white">
        <SectionHeading
          title="Import history"
          description="Every import keeps its original file and validation result."
        />
        {data.imports.length ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Imported</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Warnings</TableHead>
                    <TableHead>Rejected</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.imports.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <EntityLink type="import" id={item.id}>{item.fileName}</EntityLink>
                        <p className="font-mono text-xs text-muted-foreground">{item.id.slice(0, 12)}</p>
                      </TableCell>
                      <TableCell>{item.sourceType.replaceAll("_", " ")}</TableCell>
                      <TableCell>{dateLabel(item.completedAt ?? item.createdAt)}</TableCell>
                      <TableCell>{item.totalRows.toLocaleString()}</TableCell>
                      <TableCell>{item.warningRows}</TableCell>
                      <TableCell>{item.rejectedRows}</TableCell>
                      <TableCell><StatusBadge value={item.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="divide-y md:hidden">
              {data.imports.map((item) => (
                <article key={item.id} className="p-4">
                  <EntityLink type="import" id={item.id}>{item.fileName}</EntityLink>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.sourceType.replaceAll("_", " ")} · {item.totalRows.toLocaleString()} records · {dateLabel(item.completedAt ?? item.createdAt)}
                  </p>
                  <div className="mt-3"><StatusBadge value={item.status} /></div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            kind="import-data"
            title="No imports yet"
            description="Use Import records to add the first transaction or registration file."
            compact
          />
        )}
      </section>
    </PageFrame>
  );
}

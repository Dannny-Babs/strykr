import Link from "next/link";
import { EmptyState } from "@/components/product/empty-state";
import { PageFrame, ProductPageHeader } from "@/components/product/page-primitives";
import { SelectableRecordTable } from "@/components/product/selectable-record-table";
import { TableToolbar } from "@/components/product/table-toolbar";
import { Button } from "@/components/ui/button";
import { requireProductActor } from "@/server/auth/guards";
import { getDealerTransactionsPage } from "@/server/services/product";

const sorts = [{ value: "date-desc", label: "Date newest" }, { value: "date-asc", label: "Date oldest" }, { value: "vin-asc", label: "VIN A–Z" }];
export default async function DealerTransactionsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; state?: string; sort?: string }> }) {
  const actor = await requireProductActor(["DEALER_ADMIN", "DEALER_USER"]); const params = await searchParams; const data = getDealerTransactionsPage(actor, { page: Number(params.page ?? 1), query: params.q, state: params.state, sort: params.sort });
  return <PageFrame><ProductPageHeader title="Transaction register" description="Canonical dealer records from the selected reporting period. Original import values remain preserved." /><div><TableToolbar searchPlaceholder="Search VIN" filterLabel="Reconciliation state" filterKey="state" filterOptions={["MATCHED","MATCHED_WITH_WARNING","REVIEW_REQUIRED","DEALER_RESPONSE_REQUIRED","EVIDENCE_REQUIRED","UNMATCHED","EXCLUDED","RESOLVED"].map((value) => ({ value, label: value.replaceAll("_", " ") }))} sortOptions={sorts} defaultSort="date-desc" page={data.page} pageCount={data.pageCount} total={data.total} />{data.rows.length ? <SelectableRecordTable kind="dealer-transactions" rows={data.rows} /> : <section className="rounded-b-[14px] border bg-white"><EmptyState kind="no-transactions" title={params.q || params.state ? "No records match these filters" : "No transactions yet"} description={params.q || params.state ? "Clear or change the filters to return to the transaction register." : "Import a transaction register to create the first canonical records."} action={!params.q && !params.state ? <Button asChild><Link href="/dealer/imports">Import records</Link></Button> : undefined} compact /></section>}</div></PageFrame>;
}

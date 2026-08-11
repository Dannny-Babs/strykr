import { EmptyState } from "@/components/product/empty-state";
import { PageFrame, ProductPageHeader } from "@/components/product/page-primitives";
import { SelectableRecordTable } from "@/components/product/selectable-record-table";
import { TableToolbar } from "@/components/product/table-toolbar";
import { requireProductActor } from "@/server/auth/guards";
import { getExceptionsPage } from "@/server/services/product";

const sorts = [{ value: "impact-desc", label: "Impact high to low" }, { value: "newest", label: "Newest" }, { value: "oldest", label: "Oldest" }, { value: "priority-desc", label: "Priority high to low" }];
export default async function ReviewerExceptionsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; status?: string; impact?: string; sort?: string }> }) {
  const actor = await requireProductActor(["REGULATOR_REVIEWER"]); const params = await searchParams; const data = getExceptionsPage(actor, { page: Number(params.page ?? 1), query: params.q, status: params.status, impact: params.impact, sort: params.sort, reviewer: true });
  return <PageFrame><ProductPageHeader title="Investigation queue" description="Review discrepancies as evidence-backed cases. A flag is not a finding until a reviewer makes that decision." /><div><TableToolbar searchPlaceholder="Search VIN, rule, or exception ID" filterLabel="Exception status" filterOptions={["NEW","UNDER_REVIEW","AWAITING_DEALER","RESPONSE_RECEIVED","REVIEWER_ACTION","RESOLVED","ESCALATED"].map((value) => ({ value, label: value.replaceAll("_", " ") }))} sortOptions={sorts} defaultSort="impact-desc" page={data.page} pageCount={data.pageCount} total={data.total} />{data.rows.length ? <SelectableRecordTable kind="reviewer-exceptions" rows={data.rows} /> : <section className="rounded-b-[14px] border bg-white"><EmptyState kind="all-clear" title={params.q || params.status || params.impact ? "No cases match these filters" : "Investigation queue cleared"} description={params.q || params.status || params.impact ? "Clear or change the filters to return to the investigation queue." : "There are no evidence-backed cases waiting for review."} compact /></section>}</div></PageFrame>;
}

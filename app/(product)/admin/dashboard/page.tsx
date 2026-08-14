import { ProductPageHeader } from "@/components/product/page-primitives";
import { requireProductActor } from "@/server/auth/guards";

export default async function AdminDashboardPage() {
  await requireProductActor(["SYSTEM_ADMIN"]);
  return <main className="mx-auto max-w-5xl px-6 py-10"><ProductPageHeader title="System administration" description="Manage organizations, users, rules, fee schedules, and deployment configuration." /><p className="border bg-background p-6 text-sm text-muted-foreground">The administrator route is intentionally separate from dealership and reviewer workspaces. Full configuration screens remain a later milestone.</p></main>;
}

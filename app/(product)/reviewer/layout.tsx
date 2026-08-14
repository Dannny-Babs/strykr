import { requireProductActor } from "@/server/auth/guards";
import { ProductShell } from "@/components/product/product-shell";
import { reviewerNavigation } from "@/product/navigation";
import { getReviewerProductData } from "@/server/services/product";
import { cookies } from "next/headers";

export default async function ReviewerLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireProductActor(["REGULATOR_REVIEWER"]); const data = getReviewerProductData(); const cookieStore = await cookies();
  return <ProductShell productLabel="Review workspace" contextLabel="Ontario review portfolio" groups={reviewerNavigation} navigationCount={data.metrics.openExceptions} defaultSidebarOpen={cookieStore.get("sidebar_state")?.value !== "false"} user={actor}>{children}</ProductShell>;
}

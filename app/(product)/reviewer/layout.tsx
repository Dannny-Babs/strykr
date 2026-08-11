import { requireProductActor } from "@/server/auth/guards";
import { ProductShell } from "@/components/product/product-shell";
import { reviewerNavigation } from "@/product/navigation";

export default async function ReviewerLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireProductActor(["REGULATOR_REVIEWER"]);
  return <ProductShell productLabel="Review workspace" contextLabel="Ontario review portfolio" items={reviewerNavigation} user={actor}>{children}</ProductShell>;
}

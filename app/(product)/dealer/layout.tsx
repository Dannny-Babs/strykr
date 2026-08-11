import { requireProductActor } from "@/server/auth/guards";
import { getDealerContext } from "@/server/services/product";
import { ProductShell } from "@/components/product/product-shell";
import { dealerNavigation } from "@/product/navigation";

export default async function DealerLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireProductActor(["DEALER_ADMIN", "DEALER_USER"]); const dealership = actor.dealershipId ? getDealerContext(actor.dealershipId) : null;
  return <ProductShell productLabel="Dealership workspace" contextLabel={dealership?.tradeName ?? "Dealership setup"} items={dealerNavigation} user={actor}>{children}</ProductShell>;
}

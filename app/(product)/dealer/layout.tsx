import { requireProductActor } from "@/server/auth/guards";
import { getDealerContext, getDealerProductData } from "@/server/services/product";
import { ProductShell } from "@/components/product/product-shell";
import { dealerNavigation } from "@/product/navigation";
import { cookies } from "next/headers";

export default async function DealerLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireProductActor(["DEALER_ADMIN", "DEALER_USER"]); const dealership = actor.dealershipId ? await getDealerContext(actor.dealershipId) : null; const data = await getDealerProductData(actor); const cookieStore = await cookies();
  return <ProductShell productLabel="Dealership workspace" contextLabel={dealership?.tradeName ?? "Dealership setup"} groups={dealerNavigation} navigationCount={data.metrics.openExceptions} defaultSidebarOpen={cookieStore.get("sidebar_state")?.value !== "false"} user={actor}>{children}</ProductShell>;
}

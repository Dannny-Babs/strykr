"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState, type EmptyStateKind } from "@/components/product/empty-state";

const previews: Array<{
  path: string;
  kind: EmptyStateKind;
  title: string;
  description: string;
}> = [
  { path: "/transactions", kind: "no-transactions", title: "No transactions yet", description: "Import a transaction register to create the first canonical records." },
  { path: "/documents", kind: "no-documents", title: "No documents yet", description: "Upload supporting evidence from this page or attach it to an exception." },
  { path: "/imports", kind: "import-data", title: "No imports yet", description: "Choose a source type and CSV to create the first import batch." },
  { path: "/dealerships", kind: "no-dealerships", title: "No dealerships yet", description: "Dealerships appear when they are assigned to your review organization." },
  { path: "/audits", kind: "no-activity", title: "No audits yet", description: "Audits will appear here when review work is opened." },
  { path: "/exceptions", kind: "all-clear", title: "No open exceptions", description: "New discrepancies will appear here after reconciliation runs." },
  { path: "/dashboard", kind: "all-clear", title: "Nothing needs attention", description: "There is no unresolved priority work for this reporting period." },
];

function previewFor(pathname: string) {
  return previews.find((preview) => pathname.endsWith(preview.path)) ?? {
    kind: "no-results" as const,
    title: "Nothing here yet",
    description: "New records will appear here when they become available.",
  };
}

function previewHref(pathname: string, searchParams: URLSearchParams, active: boolean) {
  const params = new URLSearchParams(searchParams.toString());
  if (active) params.delete("preview");
  else params.set("preview", "empty");
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function EmptyStatePreviewToggle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("preview") === "empty";

  if (process.env.NODE_ENV === "production") return null;

  return (
    <Button variant="outline" size="sm" asChild>
      <Link href={previewHref(pathname, searchParams, active)}>
        {active ? "Hide empty preview" : "Preview empty"}
      </Link>
    </Button>
  );
}

export function EmptyStatePreviewPanel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("preview") === "empty";

  if (process.env.NODE_ENV === "production" || !active) return null;

  const preview = previewFor(pathname);
  return (
    <section className="overflow-hidden rounded-[14px] border bg-white" aria-label="Empty-state preview">
      <div className="border-b bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground">
        Development preview — seeded data is unchanged
      </div>
      <EmptyState {...preview} compact />
    </section>
  );
}

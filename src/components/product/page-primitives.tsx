import Link from "next/link";
import { ArrowUpRight, CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EmptyStatePreviewPanel, EmptyStatePreviewToggle } from "@/components/product/empty-state-preview";

export function PageFrame({ children, className }: { children: React.ReactNode; className?: string }) { return <div className={cn("product-page", className)}><EmptyStatePreviewPanel />{children}</div>; }

export function ProductPageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: React.ReactNode }) {
  return <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between"><div className="min-w-0">{eyebrow ? <p className="mb-1 text-xs font-medium text-muted-foreground">{eyebrow}</p> : null}<h1 className="text-base font-medium leading-6 tracking-[-0.15px] text-foreground">{title}</h1><p className="mt-1 max-w-2xl text-sm leading-5 text-secondary-foreground">{description}</p></div><div className="flex shrink-0 flex-wrap items-center gap-2"><EmptyStatePreviewToggle />{actions}</div></header>;
}

export function MetricRow({ items }: { items: Array<{ label: string; value: string; note?: string; tone?: "default" | "warning" | "danger"; href?: string }> }) {
  const palette = ["border-border bg-card"];

  return <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key metrics">{items.map((item, index) => { const body = <><div className="flex items-start justify-between gap-3"><p className="text-xs font-medium text-muted-foreground">{item.label}</p>{item.tone && item.tone !== "default" ? <Badge variant={item.tone === "danger" ? "destructive" : "warning"}><CircleAlert className="size-3" />{item.tone === "danger" ? "Attention" : "Review"}</Badge> : null}</div><strong className="mt-4 block text-lg font-semibold leading-6 tracking-[-0.1px] text-foreground tabular-nums">{item.value}</strong>{item.note ? <p className="mt-1 text-xs text-muted-foreground">{item.note}</p> : null}</>; const className = cn("min-h-32 rounded-[14px] border p-5", palette[index % palette.length]); return item.href ? <Link key={item.label} href={item.href} className={cn(className, "group block transition-colors hover:bg-muted active:bg-muted")} aria-label={`${item.label}: ${item.value}. Open related records`}>{body}<ArrowUpRight className="absolute size-0" /></Link> : <div key={item.label} className={className}>{body}</div>; })}</section>;
}

export function SectionHeading({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return <div className="flex items-start justify-between gap-4 border-b px-5 py-4"><div><h2 className="text-base font-medium leading-6 text-foreground">{title}</h2>{description ? <p className="mt-0.5 text-[13px] leading-4 text-secondary-foreground">{description}</p> : null}</div>{action}</div>;
}

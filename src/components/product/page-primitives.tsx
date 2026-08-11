import { Badge } from "@/components/ui/badge";

export function ProductPageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: React.ReactNode }) {
  return <header className="mb-7 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between"><div>{eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</p>}<h1 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p></div>{actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}</header>;
}

export function MetricRow({ items }: { items: Array<{ label: string; value: string; note?: string; tone?: "default" | "warning" | "danger" }> }) {
  return <section className="grid border-y bg-background sm:grid-cols-2 xl:grid-cols-4">{items.map((item) => <div key={item.label} className="border-b px-5 py-5 last:border-b-0 sm:border-r sm:[&:nth-last-child(-n+2)]:border-b-0 xl:border-b-0 xl:last:border-r-0"><div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-muted-foreground">{item.label}</p>{item.tone && item.tone !== "default" && <Badge variant={item.tone === "danger" ? "destructive" : "secondary"}>{item.tone === "danger" ? "Attention" : "Review"}</Badge>}</div><strong className="mt-2 block text-2xl font-semibold tracking-[-0.03em]">{item.value}</strong>{item.note && <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>}</div>)}</section>;
}

export function SectionHeading({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return <div className="flex items-start justify-between gap-4 border-b px-5 py-4"><div><h2 className="text-sm font-semibold">{title}</h2>{description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}</div>{action}</div>;
}

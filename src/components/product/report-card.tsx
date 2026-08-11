import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportCard({ title, purpose, scope, href }: { title: string; purpose: string; scope: string; href: string }) {
  return <article className="flex min-h-60 flex-col rounded-[14px] border bg-white p-5"><span className="grid size-10 place-items-center rounded-[10px] border bg-muted text-muted-foreground"><FileText className="size-4" /></span><h2 className="mt-5 text-base font-medium leading-6">{title}</h2><p className="mt-1 text-[13px] leading-4 text-muted-foreground">{purpose}</p><dl className="mt-5 grid grid-cols-[88px_1fr] gap-y-2 border-t pt-4 text-xs"><dt className="text-muted-foreground">Scope</dt><dd>{scope}</dd><dt className="text-muted-foreground">Format</dt><dd>CSV</dd><dt className="text-muted-foreground">Availability</dt><dd>Generated on download</dd></dl><Button variant="outline" className="mt-auto w-full" asChild><a href={href}><Download className="size-4" /> Download CSV</a></Button></article>;
}

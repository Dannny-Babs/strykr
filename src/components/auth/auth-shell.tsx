import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function AuthShell({ eyebrow, title, description, children, footer }: { eyebrow?: string; title: string; description: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground sm:py-16">
      <div className="mx-auto w-full max-w-[420px]">
        <Link href="/" className="mb-14 inline-flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><ShieldCheck className="size-4" /></span>
          DealerSync
        </Link>
        <section aria-labelledby="auth-heading">
          {eyebrow && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p>}
          <h1 id="auth-heading" className="text-3xl font-semibold tracking-[-0.035em]">{title}</h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
          <div className="mt-9">{children}</div>
          {footer && <div className="mt-8 border-t pt-6 text-sm text-muted-foreground">{footer}</div>}
        </section>
      </div>
    </main>
  );
}

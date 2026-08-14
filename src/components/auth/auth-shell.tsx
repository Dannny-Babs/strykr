import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function AuthShell({ eyebrow, title, description, children, footer }: { eyebrow?: string; title: string; description: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <main className="entry-app grid min-h-screen place-items-center bg-background px-4 py-10 text-foreground">
      <section aria-labelledby="auth-heading" className="w-full max-w-[440px] rounded-[14px] border bg-white p-6">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-[13px] font-medium">
          <span className="grid size-8 place-items-center rounded-lg border bg-muted text-foreground"><ShieldCheck className="size-4" /></span>Cordena
        </Link>
        {eyebrow && <p className="mb-2 text-xs font-medium text-muted-foreground">{eyebrow}</p>}
        <h1 id="auth-heading" className="text-base font-medium leading-6">{title}</h1>
        <p className="mt-2 max-w-sm text-sm leading-5 text-muted-foreground">{description}</p>
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 border-t pt-5 text-[13px] text-muted-foreground">{footer}</div>}
      </section>
    </main>
  );
}

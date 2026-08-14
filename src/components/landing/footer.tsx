import Link from "next/link";

const links = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "For dealerships", href: "#for-dealerships" },
  { label: "For reviewers", href: "#for-reviewers" },
  { label: "Sign in", href: "/sign-in" },
  { label: "Create an account", href: "/sign-up" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <p className="font-display text-2xl font-normal tracking-[-0.01em] text-foreground">
              Cordena
            </p>
            <p className="mt-2 text-[13px] leading-relaxed font-light text-muted-foreground">
              VIN-level transaction reconciliation for Ontario dealerships and
              regulatory review teams.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-12 gap-y-2.5 sm:grid-cols-3">
            {links.map((link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        </div>
        <p className="mt-12 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
          Cordena is an early product prototype. Sample data is used for
          demonstration, and live regulatory-system integrations are not
          currently connected.
        </p>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

const variants = {
  dark: "bg-foreground text-background hover:opacity-85",
  outline: "border border-border bg-transparent text-foreground hover:bg-muted",
  light: "bg-background text-foreground hover:bg-muted",
} as const;

type PillLinkProps = {
  href: string;
  variant?: keyof typeof variants;
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function PillLink({
  href,
  variant = "dark",
  arrow = false,
  className,
  children,
}: PillLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-11 items-center gap-1.5 rounded-full px-5 text-sm font-medium transition-[opacity,background-color,transform] duration-150 active:scale-[0.98]",
        variants[variant],
        className,
      )}
    >
      {arrow ? <ArrowUpRight size={15} weight="bold" /> : null}
      {children}
    </Link>
  );
}

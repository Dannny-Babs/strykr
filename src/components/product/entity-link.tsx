"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { entityHref, type EntityType } from "@/product/entity-navigation";

export function EntityLink({ type, id, children, className, ariaLabel, appearance = "primary" }: { type: EntityType; id: string; children: React.ReactNode; className?: string; ariaLabel?: string; appearance?: "primary" | "secondary" | "action" | "record" }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;
  const variant = appearance === "record" ? "primary" : appearance;
  return <Link href={entityHref(current, type, id)} aria-label={ariaLabel} className={cn("group/entity inline-flex min-h-7 items-center rounded-md text-[13px] font-medium transition-colors", variant === "primary" && "entity-link-primary", variant === "secondary" && "entity-link-secondary", variant === "action" && "text-inherit no-underline", className)}>{children}</Link>;
}

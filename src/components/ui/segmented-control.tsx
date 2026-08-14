"use client";

import { cn } from "@/lib/utils";

type SegmentedOption<T extends string> = { value: T; label: string };

export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  className,
  ariaLabel,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  className?: string;
  ariaLabel: string;
}) {
  if (options.length > 5) throw new Error("Segmented controls support at most five options.");

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("inline-flex h-7 max-w-full items-center gap-0.5 rounded-lg bg-muted p-0.5", className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "h-6 min-w-0 flex-1 rounded-md border border-transparent px-2.5 text-[13px] leading-4 font-medium whitespace-nowrap text-secondary-foreground transition-colors focus-visible:ring-3 focus-visible:ring-ring/40",
              active && "border-border bg-card text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

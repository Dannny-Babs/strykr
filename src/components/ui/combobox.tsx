"use client";

import { useId, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Popover } from "radix-ui";
import { cn } from "@/lib/utils";

export type ComboboxOption = { value: string; label: string };

export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  searchPlaceholder = "Search",
  emptyLabel = "No matches",
  id,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  id?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const generatedId = useId();
  const listboxId = `${id ?? generatedId}-listbox`;
  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? options.filter((option) => option.label.toLowerCase().includes(normalized)) : options;
  }, [options, query]);

  return (
    <Popover.Root open={open} onOpenChange={(next) => { setOpen(next); if (!next) setQuery(""); }}>
      <Popover.Trigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          className={cn("flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 text-left text-[13px] leading-4 text-foreground transition-colors hover:border-input-hover focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40", className)}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>{selected?.label ?? placeholder}</span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="start" sideOffset={4} className="z-50 w-[var(--radix-popover-trigger-width)] rounded-[10px] border bg-popover p-1" onOpenAutoFocus={(event) => event.preventDefault()}>
          <div className="relative border-b p-1.5">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-lg border border-input bg-card pr-3 pl-8 text-[13px] leading-4 text-foreground outline-none placeholder:text-muted-foreground hover:border-input-hover focus:border-ring focus:ring-3 focus:ring-ring/40"
            />
          </div>
          <div id={listboxId} className="max-h-64 overflow-y-auto py-1" role="listbox">
            {filtered.length ? filtered.slice(0, 8).map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => { onValueChange(option.value); setOpen(false); }}
                className="flex h-8 w-full items-center gap-2 rounded-md px-2.5 text-left text-[13px] leading-4 text-secondary-foreground hover:bg-muted hover:text-foreground"
              >
                <span className="min-w-0 flex-1 truncate"><Match text={option.label} query={query} /></span>
                {option.value === value ? <Check className="size-3.5 shrink-0" /> : null}
              </button>
            )) : <div className="px-6 py-8 text-center text-[13px] text-muted-foreground">{emptyLabel}</div>}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function Match({ text, query }: { text: string; query: string }) {
  const start = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (!query.trim() || start < 0) return text;
  const end = start + query.trim().length;
  return <>{text.slice(0, start)}<span className="font-medium text-foreground">{text.slice(start, end)}</span>{text.slice(end)}</>;
}

import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type EmptyStateKind =
  | "all-clear"
  | "disconnected-source"
  | "import-data"
  | "no-activity"
  | "no-dealerships"
  | "no-documents"
  | "no-results"
  | "no-transactions"
  | "no-vehicles"
  | "processing-error"
  | "restricted-access";

export const EMPTY_STATE_ASSETS: Record<EmptyStateKind, string> = {
  "all-clear": "/empty-states/all-clear-line.png",
  "disconnected-source": "/empty-states/disconnected-source-line.png",
  "import-data": "/empty-states/import-data-line.png",
  "no-activity": "/empty-states/no-activity-line.png",
  "no-dealerships": "/empty-states/no-dealerships-line.png",
  "no-documents": "/empty-states/no-documents-line.png",
  "no-results": "/empty-states/no-results-line.png",
  "no-transactions": "/empty-states/no-transactions-line.png",
  "no-vehicles": "/empty-states/no-vehicles-line.png",
  "processing-error": "/empty-states/processing-error-line.png",
  "restricted-access": "/empty-states/restricted-access-line.png",
};

export function EmptyState({
  kind,
  title,
  description,
  action,
  compact = false,
  className,
}: {
  kind: EmptyStateKind;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-72 flex-col items-center justify-center bg-white px-6 py-9 text-center",
        compact && "min-h-64 py-7",
        className,
      )}
      role="status"
    >
      <Image
        src={EMPTY_STATE_ASSETS[kind]}
        alt=""
        width={1254}
        height={1254}
        sizes={compact ? "176px" : "224px"}
        className={cn(
          "h-auto w-56 select-none mix-blend-multiply",
          compact && "w-44",
        )}
        priority={false}
      />
      <div className="mt-2 max-w-sm">
        <h3 className="text-base font-medium leading-6">{title}</h3>
        <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

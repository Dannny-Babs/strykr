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
        "empty-state flex min-h-[370px] flex-col items-center justify-center bg-background px-6 py-9 text-center",
        compact && "compact min-h-[290px] py-7",
        className,
      )}
      role="status"
    >
      <Image
        className="empty-state-image mb-1 h-auto w-[clamp(156px,20vw,220px)] object-contain"
        src={EMPTY_STATE_ASSETS[kind]}
        alt=""
        width={1254}
        height={1254}
        aria-hidden="true"
      />
      <div className="empty-state-copy max-w-md">
        <h3 className="text-lg font-semibold tracking-[-0.015em] text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

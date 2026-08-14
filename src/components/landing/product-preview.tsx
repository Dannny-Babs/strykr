import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

const metrics = [
  { label: "Transactions", value: "1,284" },
  { label: "Open exceptions", value: "37" },
  { label: "Estimated fee impact", value: "$18,420" },
  { label: "Reconciliation rate", value: "94.2%" },
] as const;

const rows = [
  {
    vin: "2HGFC2F59KH512384",
    reason: "Fee amount disagrees with source record",
    status: "Needs explanation",
    tone: "warning",
    action: "Submit explanation",
  },
  {
    vin: "1FTEW1EP4LFA20917",
    reason: "Transaction date precedes registration event",
    status: "Date needs review",
    tone: "warning",
    action: "Review dates",
  },
  {
    vin: "5YJ3E1EA8MF102446",
    reason: "Wholesale transfer missing supporting document",
    status: "Evidence required",
    tone: "info",
    action: "Upload evidence",
  },
  {
    vin: "3VWC57BU2KM098133",
    reason: "Explanation submitted for cancelled sale",
    status: "Ready for review",
    tone: "success",
    action: "Open review",
  },
] as const;

const toneStyles = {
  warning: "border-warning-border bg-warning-soft text-warning-foreground",
  info: "border-primary-border bg-info-soft text-info-foreground",
  success: "border-success-border bg-success-soft text-success-foreground",
} as const;

export function ProductPreview() {
  return (
    <section id="product" className="mx-auto max-w-6xl px-6 pb-24">
      <Reveal>
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_32px_80px_-40px_rgb(41_37_30/0.35)]">
          <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
            <span className="size-2.5 rounded-full bg-danger-soft" />
            <span className="size-2.5 rounded-full bg-warning-soft" />
            <span className="size-2.5 rounded-full bg-success-soft" />
            <span className="ml-3 hidden rounded-md border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground sm:block">
              cordena.app/dealer/dashboard
            </span>
          </div>

          <div className="p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">
                Northfield Auto Group
              </p>
              <p className="text-xs text-muted-foreground">
                2025 annual transaction register
              </p>
            </div>
            <h3 className="mt-4 font-display text-2xl font-normal tracking-[-0.01em] text-foreground">
              Compliance overview
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Review the records, responses, and evidence your dealership needs
              to complete next.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <p className="text-xs text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 hidden overflow-hidden rounded-xl border border-border sm:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">VIN</th>
                    <th className="px-4 py-2.5 font-medium">Reason</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium">Next action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {rows.map((row) => (
                    <tr key={row.vin}>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">
                        {row.vin}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.reason}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill tone={row.tone}>{row.status}</StatusPill>
                      </td>
                      <td className="px-4 py-3 font-medium text-primary">
                        {row.action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:hidden">
              {rows.map((row) => (
                <div
                  key={row.vin}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-xs text-foreground">
                      {row.vin}
                    </p>
                    <StatusPill tone={row.tone}>{row.status}</StatusPill>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {row.reason}
                  </p>
                  <p className="mt-2 text-sm font-medium text-primary">
                    {row.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function StatusPill({
  tone,
  children,
}: {
  tone: keyof typeof toneStyles;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        toneStyles[tone],
      )}
    >
      {children}
    </span>
  );
}

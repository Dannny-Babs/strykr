import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

const steps = [
  {
    number: "01",
    title: "Import your records",
    body: "Bring in transaction registers, registration-style records, and supporting documents. Review the validation results before anything is committed.",
    vignette: <ImportVignette />,
  },
  {
    number: "02",
    title: "Match records by VIN",
    body: "Normalize the important fields and connect related records using deterministic reconciliation rules.",
    vignette: <MatchVignette />,
  },
  {
    number: "03",
    title: "Review exceptions",
    body: "See exactly why a record was flagged, which fields disagree, what the estimated impact is, and what action is recommended.",
    vignette: <ExceptionVignette />,
  },
  {
    number: "04",
    title: "Resolve with evidence",
    body: "Add an explanation, attach supporting documents, preserve the activity history, and export the resulting review record.",
    vignette: <TimelineVignette />,
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <SectionHeading
          index="02"
          eyebrow="How it works"
          eyebrowRight="Four steps"
          title="Import the records. Explain the differences. Preserve the decision."
          description="DealerSync organizes the work around the records people already use, while keeping the final compliance decision with the people responsible for making it."
        />
      </Reveal>

      <div className="mt-16 flex flex-col gap-16">
        {steps.map((step, i) => (
          <Reveal key={step.number}>
            <div
              className={cn(
                "grid items-center gap-8 lg:grid-cols-2 lg:gap-16",
                i % 2 === 1 && "lg:[&>*:first-child]:order-2",
              )}
            >
              <div>
                <p className="font-mono text-xs tracking-[0.14em] text-muted-foreground">
                  [{step.number}]
                </p>
                <h3 className="mt-3 font-display text-3xl leading-tight font-normal tracking-[-0.015em] text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed font-light text-muted-foreground">
                  {step.body}
                </p>
              </div>
              <div className="rounded-2xl bg-muted p-6 sm:p-8">
                {step.vignette}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function VignetteCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-xl bg-card p-4 shadow-[0_1px_2px_rgb(0_0_0/0.05)]", className)}>
      {children}
    </div>
  );
}

function ImportVignette() {
  return (
    <VignetteCard>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          transactions-2025.csv
        </p>
        <span className="rounded-full border border-success-border bg-success-soft px-2 py-0.5 text-xs font-medium text-success-foreground">
          Validated
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-[86%] rounded-full bg-primary" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          ["1,204", "Valid"],
          ["61", "Warnings"],
          ["19", "Rejected"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-lg bg-muted px-2 py-2.5">
            <p className="text-sm font-semibold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </VignetteCard>
  );
}

function MatchVignette() {
  return (
    <div className="flex flex-col items-stretch gap-2">
      <VignetteCard>
        <p className="text-xs text-muted-foreground">Dealer record</p>
        <p className="mt-1 font-mono text-xs text-foreground">
          VIN 2HGFC2F59KH512384 · Retail sale · 2025-03-14
        </p>
      </VignetteCard>
      <div className="flex items-center justify-center gap-2 py-1 text-xs font-medium text-primary">
        <span className="h-px w-10 bg-primary-border" />
        Matched by VIN
        <span className="h-px w-10 bg-primary-border" />
      </div>
      <VignetteCard>
        <p className="text-xs text-muted-foreground">Registration record</p>
        <p className="mt-1 font-mono text-xs text-foreground">
          VIN 2HGFC2F59KH512384 · Transfer event · 2025-03-16
        </p>
      </VignetteCard>
    </div>
  );
}

function ExceptionVignette() {
  return (
    <VignetteCard>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">
          Fee discrepancy detected
        </p>
        <span className="rounded-full border border-warning-border bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning-foreground">
          Needs explanation
        </span>
      </div>
      <dl className="mt-4 space-y-2 text-xs">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Rule</dt>
          <dd className="font-mono text-foreground">FEE-MISMATCH-002</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Dealer record</dt>
          <dd className="text-foreground">$146.00</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Registration record</dt>
          <dd className="text-foreground">$186.00</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Estimated impact</dt>
          <dd className="font-medium text-foreground">$40.00</dd>
        </div>
      </dl>
      <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
        Recommended: submit an explanation and attach the bill of sale.
      </p>
    </VignetteCard>
  );
}

function TimelineVignette() {
  const events = [
    ["Explanation submitted", "Dealer · classified as fee correction"],
    ["Evidence attached", "bill-of-sale.pdf"],
    ["Decision recorded", "Reviewer · exception resolved"],
  ] as const;
  return (
    <VignetteCard>
      <ol className="space-y-4">
        {events.map(([title, meta], i) => (
          <li key={title} className="relative flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-0.5 size-2.5 shrink-0 rounded-full",
                  i === events.length - 1 ? "bg-success" : "bg-primary",
                )}
              />
              {i < events.length - 1 ? (
                <span className="mt-1 w-px flex-1 bg-border" />
              ) : null}
            </div>
            <div className="pb-1">
              <p className="text-sm font-medium text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground">{meta}</p>
            </div>
          </li>
        ))}
      </ol>
    </VignetteCard>
  );
}

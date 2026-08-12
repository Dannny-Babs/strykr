import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

const steps = [
  "Transaction imported",
  "VIN matched to related records",
  "Date or fee discrepancy detected",
  "Dealer explanation requested",
  "Supporting evidence uploaded",
  "Reviewer decision recorded",
  "Exception resolved or escalated",
] as const;

export function WorkflowExample() {
  return (
    <section className="bg-muted/50">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <SectionHeading
            index="05"
            eyebrow="Example workflow"
            eyebrowRight="Seven transitions"
            title="One exception. One shared history."
            description="A transaction is flagged because the dealer record and registration-style record do not agree. The dealer can inspect the discrepancy, provide an explanation, and attach evidence. The reviewer can then assess the response, record a decision, and preserve the full history."
          />
        </Reveal>
        <ol className="mx-auto mt-14 max-w-xl">
          {steps.map((step, i) => (
            <Reveal key={step} delay={i * 70}>
              <li className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-xs",
                      i === steps.length - 1
                        ? "bg-foreground text-background"
                        : "border border-border bg-card text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                  {i < steps.length - 1 ? (
                    <span className="my-1 w-px flex-1 bg-border" />
                  ) : null}
                </div>
                <p
                  className={cn(
                    "pt-1.5 text-base font-medium text-foreground",
                    i < steps.length - 1 && "pb-8",
                  )}
                >
                  {step}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

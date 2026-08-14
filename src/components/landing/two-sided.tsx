import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { PillLink } from "./pill-link";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

const panels = [
  {
    id: "for-dealerships",
    eyebrow: "For dealerships",
    title: "Get ahead of the questions before they become delays.",
    body: "See what needs attention, correct incomplete records, respond to exceptions, and keep the evidence connected to the transaction it supports.",
    benefits: [
      "Find missing and inconsistent records",
      "Explain wholesale, cancelled, export, lease, and other transaction types",
      "Upload supporting documents",
      "Track responses and outstanding requests",
      "Export the current reconciliation state",
    ],
    cta: "Create a dealership account",
  },
  {
    id: "for-reviewers",
    eyebrow: "For reviewers",
    title: "Investigate the record, not just the flag.",
    body: "Prioritize material exceptions, compare the underlying records, request evidence, and preserve the reasoning behind every decision.",
    benefits: [
      "Prioritize high-impact exceptions",
      "Compare transaction and registration-style records",
      "Review dealer explanations and supporting evidence",
      "Track investigation activity",
      "Create audit findings and export review reports",
    ],
    cta: "Create a reviewer account",
  },
] as const;

export function TwoSided() {
  return (
    <section className="bg-muted/50">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <SectionHeading
            index="03"
            eyebrow="One shared ledger"
            eyebrowRight="Two workspaces"
            title="Built for both sides of the review."
            description="Dealerships prepare and explain their records. Reviewers investigate discrepancies and make the decision. Everyone works from the same source-linked history."
          />
        </Reveal>
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {panels.map((panel, i) => (
            <Reveal key={panel.id} delay={i * 100}>
              <div
                id={panel.id}
                className="flex h-full scroll-mt-24 flex-col rounded-3xl bg-card p-8 shadow-[0_1px_2px_rgb(0_0_0/0.04)] sm:p-10"
              >
                <p className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                  {panel.eyebrow}
                </p>
                <h3 className="mt-4 font-display text-3xl leading-tight font-normal tracking-[-0.015em] text-balance text-foreground">
                  {panel.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed font-light text-muted-foreground">
                  {panel.body}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {panel.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2.5">
                      <CheckCircle
                        size={18}
                        weight="light"
                        className="mt-0.5 shrink-0 text-foreground/60"
                      />
                      <span className="text-sm text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <PillLink href="/sign-up" arrow>
                    {panel.cta}
                  </PillLink>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

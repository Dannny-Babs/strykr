import {
  ArrowsLeftRight,
  ClockCounterClockwise,
  Files,
  MagnifyingGlass,
} from "@phosphor-icons/react/dist/ssr";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

const problems = [
  {
    icon: Files,
    title: "Fragmented source records",
    body: "Registers, DMS exports, accounting data, and documents arrive in different shapes at different times.",
  },
  {
    icon: MagnifyingGlass,
    title: "Manual VIN comparison",
    body: "Confirming what actually happened means checking the same VIN across several disconnected systems.",
  },
  {
    icon: ArrowsLeftRight,
    title: "Repeated evidence requests",
    body: "Without a shared record, the same questions and document requests get asked again and again.",
  },
  {
    icon: ClockCounterClockwise,
    title: "No shared resolution history",
    body: "Decisions live in inboxes and spreadsheets, so nobody can see how a discrepancy was actually settled.",
  },
] as const;

export function Problem() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <SectionHeading
          index="01"
          eyebrow="The operational problem"
          eyebrowRight="Why reconciliation stalls"
          title="Compliance work gets stuck between systems."
          description="Dealer registers, DMS exports, accounting records, registration-style events, and supporting documents rarely arrive as one clean story. When a VIN, date, fee, or transaction type does not line up, teams spend hours reconstructing what happened by hand."
        />
      </Reveal>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {problems.map((problem, i) => (
          <Reveal key={problem.title} delay={i * 80}>
            <div className="h-full rounded-2xl bg-muted p-6">
              <problem.icon
                size={24}
                weight="light"
                className="text-foreground/70"
              />
              <h3 className="mt-14 font-display text-2xl leading-snug font-normal tracking-[-0.01em] text-foreground">
                {problem.title}
              </h3>
              <p className="mt-2.5 text-[13px] leading-relaxed font-light text-muted-foreground">
                {problem.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

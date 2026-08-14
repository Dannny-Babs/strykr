import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

const points = [
  "Deterministic reconciliation rules",
  "Source-linked records",
  "Explicit status and decision history",
  "Role-scoped access",
  "Evidence preserved with the relevant record",
] as const;

export function Trust() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <SectionHeading
          align="center"
          title="Automation helps organize the work. People make the decision."
          description="Cordena does not turn a reconciliation flag into a regulatory finding. It gives dealerships and reviewers a clearer way to inspect records, exchange evidence, and document what happened."
        />
      </Reveal>
      <Reveal delay={120}>
        <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2.5">
          {points.map((point) => (
            <li
              key={point}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-light text-foreground"
            >
              <CheckCircle
                size={16}
                weight="light"
                className="shrink-0 text-foreground/60"
              />
              {point}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

const capabilities = [
  {
    title: "VIN-level matching",
    body: "Connect each transaction to the related source records, vehicle history, reporting period, and reconciliation run.",
  },
  {
    title: "Explainable exceptions",
    body: "Every exception includes the rule, discrepancy, triggering values, estimated impact, and recommended next action.",
  },
  {
    title: "Evidence timeline",
    body: "Keep requests, explanations, uploaded documents, reviewer decisions, and activity history together.",
  },
  {
    title: "Source preservation",
    body: "Imported source values remain available for comparison. Corrections do not erase the original record.",
  },
  {
    title: "Role-based workspaces",
    body: "Dealers see their dealership. Reviewers see their permitted portfolio. Each side has the tools needed for its own responsibilities.",
  },
  {
    title: "Review-ready exports",
    body: "Download transaction, exception, reconciliation, and findings reports from persisted records without rebuilding spreadsheets manually.",
  },
] as const;

export function Capabilities() {
  return (
    <section className="bg-[oklch(0.24_0.008_75)]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <SectionHeading
            index="04"
            eyebrow="Core capabilities"
            eyebrowRight="What the workspace does"
            title="Workflow depth, not dashboard theatre."
            onDark
          />
        </Reveal>
        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((capability, i) => (
            <Reveal key={capability.title} delay={(i % 3) * 80}>
              <div className="h-full rounded-2xl bg-white/[0.045] p-7 transition-colors hover:bg-white/[0.07]">
                <p className="font-mono text-[11px] tracking-[0.14em] text-white/40">
                  [{String(i + 1).padStart(2, "0")}]
                </p>
                <h3 className="mt-10 font-display text-2xl leading-snug font-normal tracking-[-0.01em] text-[oklch(0.94_0.005_85)]">
                  {capability.title}
                </h3>
                <p className="mt-2.5 text-[13px] leading-relaxed font-light text-white/55">
                  {capability.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

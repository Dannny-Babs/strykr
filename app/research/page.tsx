import Link from "next/link";
import findings from "../../data/research-findings.json";
import { PAIN_TAXONOMY, type PainLabel } from "../../lib/taxonomy";
import type { ResearchFinding } from "../../lib/types";
import type { SourceCategory } from "../../lib/sources";

const CATEGORY_LABELS: Record<SourceCategory, string> = {
  official: "OMVIC (Official)",
  government: "Government / Auditor General",
  industry_association: "UCDA (Industry Association)",
  dms_vendor: "DMS Vendors",
};

const typedFindings = findings as ResearchFinding[];

export default function ResearchPage() {
  const grouped = typedFindings.reduce<Record<string, ResearchFinding[]>>((acc, f) => {
    (acc[f.category] ??= []).push(f);
    return acc;
  }, {});

  return (
    <div className="font-sans min-h-screen bg-white text-[#171717]">
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-extrabold tracking-tight">DealerSync</Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/analysis" className="hover:text-black">NLP Analysis</Link>
            <Link href="/" className="hover:text-black">Back to home</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-bold">Authoritative-source research</h1>
        <p className="mt-3 text-neutral-700 max-w-3xl">
          Tier-1 findings from OMVIC, government oversight, UCDA, and DMS vendors —
          the low-risk, highest-signal sources per the source-acquisition plan. No
          social scraping (LinkedIn, Facebook, Reddit, YouTube) is included here by
          design; those carry ToS/legal risk and rank lowest priority.
        </p>

        {Object.entries(grouped).map(([category, items]) => (
          <section key={category} className="mt-12">
            <h2 className="text-xl font-bold">{CATEGORY_LABELS[category as SourceCategory]}</h2>
            <div className="mt-4 space-y-4">
              {items.map((f) => (
                <article key={f.sourceId} className="rounded-lg border border-neutral-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold">
                      <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {f.sourceLabel}
                      </a>
                    </h3>
                    <span className="text-xs text-neutral-500 whitespace-nowrap">{f.capturedAt}</span>
                  </div>
                  <p className="mt-2 text-neutral-700 text-sm">{f.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {f.painLabels.map((label: PainLabel) => (
                      <span key={label} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
                        {PAIN_TAXONOMY[label].label}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-16 rounded-lg border border-neutral-200 p-6 bg-neutral-50">
          <h2 className="text-lg font-bold">About this collector</h2>
          <p className="mt-2 text-neutral-700 text-sm">
            The findings above were captured manually and verified against live
            sources. The registry (<code>lib/sources.ts</code>) and fetch logic
            (<code>lib/collector.ts</code>, <code>/api/collect</code>) are built to
            refresh this automatically wherever the app is deployed with normal
            outbound internet access.
          </p>
        </section>
      </main>
    </div>
  );
}

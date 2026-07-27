import Link from "next/link";
import analysis from "../../data/nlp-analysis.json";
import { PAIN_TAXONOMY } from "../../lib/taxonomy";
import type { NlpAnalysis } from "../../lib/types";

const data = analysis as NlpAnalysis;

const SENTIMENT_COLOR: Record<string, string> = {
  positive: "bg-green-100 text-green-800",
  neutral: "bg-neutral-100 text-neutral-700",
  negative: "bg-red-100 text-red-800",
};

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max).trim() + "…" : clean;
}

export default function AnalysisPage() {
  const maxTaxonomyCount = Math.max(...data.taxonomyDistribution.map((t) => t.count), 1);
  const sentimentTotal =
    data.sentimentDistribution.positive + data.sentimentDistribution.neutral + data.sentimentDistribution.negative;

  return (
    <div className="font-sans min-h-screen bg-white text-[#171717]">
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-extrabold tracking-tight">DealerSync</Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/research" className="hover:text-black">Research</Link>
            <Link href="/" className="hover:text-black">Back to home</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-bold">NLP analysis of the research corpus</h1>
        <p className="mt-3 text-neutral-700 max-w-3xl">
          Embeddings, deduplication, density clustering, zero-shot taxonomy
          classification, and sentiment scoring run against the crawled OMVIC /
          Auditor General / UCDA / DMS-vendor corpus — the &ldquo;Analytics and
          NLP methods&rdquo; layer of the source-acquisition plan, scoped to what
          a corpus this size actually supports.
        </p>

        <section className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Total chunks" value={data.corpus.totalChunks} />
          <Stat label="Unique (deduped)" value={data.corpus.uniqueChunks} />
          <Stat label="Duplicates removed" value={data.corpus.duplicateChunks} />
          <Stat label="Clusters found" value={data.corpus.clusterCount} />
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold">Taxonomy distribution</h2>
          <p className="mt-1 text-sm text-neutral-500">Zero-shot entailment classification against the pain-signal taxonomy.</p>
          <div className="mt-4 space-y-2">
            {data.taxonomyDistribution
              .slice()
              .sort((a, b) => b.count - a.count)
              .map((t) => (
                <div key={t.label} className="flex items-center gap-3">
                  <span className="w-52 shrink-0 text-sm text-neutral-700">{t.title}</span>
                  <div className="flex-1 h-3 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className="h-full bg-black"
                      style={{ width: `${(t.count / maxTaxonomyCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-sm text-neutral-500">{t.count}</span>
                </div>
              ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold">Sentiment distribution (VADER)</h2>
          <div className="mt-4 flex h-4 w-full overflow-hidden rounded-full">
            <div className="bg-green-400" style={{ width: `${(data.sentimentDistribution.positive / sentimentTotal) * 100}%` }} />
            <div className="bg-neutral-300" style={{ width: `${(data.sentimentDistribution.neutral / sentimentTotal) * 100}%` }} />
            <div className="bg-red-400" style={{ width: `${(data.sentimentDistribution.negative / sentimentTotal) * 100}%` }} />
          </div>
          <div className="mt-2 flex gap-4 text-sm text-neutral-600">
            <span>Positive {data.sentimentDistribution.positive}</span>
            <span>Neutral {data.sentimentDistribution.neutral}</span>
            <span>Negative {data.sentimentDistribution.negative}</span>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold">Tagged findings</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Every chunk that crossed the entailment confidence threshold, after manual removal of nav artifacts (see limitations below).
          </p>
          <div className="mt-4 space-y-4">
            {data.findings.map((f) => (
              <article key={f.chunkId} className="rounded-lg border border-neutral-200 p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold hover:underline">
                    {f.sourceLabel}
                  </a>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
                      {PAIN_TAXONOMY[f.label].label} · {(f.score * 100).toFixed(0)}%
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs ${SENTIMENT_COLOR[f.sentiment]}`}>{f.sentiment}</span>
                  </div>
                </div>
                <p className="mt-3 text-neutral-700 text-sm">{truncate(f.text, 320)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold">Topic clusters</h2>
          <p className="mt-1 text-sm text-neutral-500">DBSCAN over sentence embeddings (cosine, eps=0.15) — density-based groups, not fixed categories.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {data.topClusters.map((c) => (
              <div key={c.clusterId} className="rounded-lg border border-neutral-200 p-5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Cluster {c.clusterId}</span>
                  <span className="text-xs text-neutral-500">{c.size} chunks</span>
                </div>
                <p className="mt-2 text-xs text-neutral-500">{c.sourceLabels.join(", ")}</p>
                <p className="mt-3 text-sm text-neutral-700">{truncate(c.exampleTexts[0], 180)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-lg font-bold">Known limitations</h2>
          <ul className="mt-3 space-y-3 text-sm text-neutral-800 list-disc pl-5">
            {data.knownLimitations.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-lg border border-neutral-200 p-6 bg-neutral-50">
          <h2 className="text-lg font-bold">Method</h2>
          <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-neutral-700">
            <div className="flex justify-between border-b border-neutral-200 py-1"><dt>Embeddings</dt><dd className="font-mono text-xs">{data.method.embeddingModel}</dd></div>
            <div className="flex justify-between border-b border-neutral-200 py-1"><dt>Zero-shot NLI</dt><dd className="font-mono text-xs">{data.method.nliModel}</dd></div>
            <div className="flex justify-between border-b border-neutral-200 py-1"><dt>Clustering</dt><dd className="font-mono text-xs">{data.method.clustering}</dd></div>
            <div className="flex justify-between border-b border-neutral-200 py-1"><dt>Sentiment</dt><dd className="font-mono text-xs">{data.method.sentiment}</dd></div>
          </dl>
          <p className="mt-4 text-neutral-700 text-sm">
            Generated by <code>scripts/nlp/pipeline.py</code> from{" "}
            <code>scripts/crawl_output/</code>, distilled by{" "}
            <code>scripts/nlp/build_app_summary.py</code> into this committed
            file. Regenerate after a fresh crawl with both scripts in sequence.
          </p>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-neutral-500 mt-1">{label}</div>
    </div>
  );
}

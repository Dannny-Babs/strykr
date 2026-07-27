# DealerSync

VIN-level reconciliation for Ontario's OMVIC Transaction Fee Register — not scraping,
not a dashboard. DealerSync ingests a dealer's own authorized records (DMS export,
accounting, bills of sale), classifies each VIN as exempt or fee-applicable against
the OMVIC registrant search, and produces a defensible, source-linked transaction
ledger that both the dealer and the regulator can trust.

## Why this exists

- **Stop overpaying.** Flag genuinely exempt transactions (dealer-to-dealer
  consignments, most commercial/bus sales) so dealers don't remit $22 on
  transactions they never owed.
- **Audit-proof.** Hand an inspector a VIN-level evidence pack in minutes —
  every figure source-linked and rule-cited.
- **Kill the admin.** The Transaction Fee Register became a mandatory renewal
  submission as of January 6, 2025. Most dealers still build it by hand.

The moat is neutrality: a tool that helps dealers hide loses OMVIC's trust, and a
pure enforcement tool loses dealer participation. DealerSync's value is being the
neutral ledger both sides accept because every number follows the rules.

## Product boundary

- **Real sources:** the dealer's own DMS, accounting, and bills of sale (primary
  evidence); the OMVIC Transaction Fee Register (the output); OMVIC registrant
  search (exemption classification).
- **Out of scope:** replicating inspector-level access, scraping gated MTO
  registration data, or anything not authorized directly by the dealer.

## Research: authoritative-source collector

`/research` renders a tier-1 research corpus built from OMVIC, government
oversight (Auditor General, Legislative Assembly), UCDA, and DMS vendor pages —
the low-risk, high-signal sources in the source-acquisition plan. Deliberately
excludes LinkedIn/Facebook/Reddit/YouTube: those carry ToS/legal risk (LinkedIn
and Meta prohibit scraping without permission) and rank lowest priority.

- `lib/sources.ts` — the source registry (19 verified URLs across 4 categories).
- `lib/taxonomy.ts` — the pain-signal taxonomy used to tag findings.
- `lib/collector.ts` + `app/api/collect/route.ts` — fetch logic that refreshes
  the corpus live. Requires normal outbound internet access (works on a real
  deploy target like Vercel; will fail in network-sandboxed environments).
- `data/research-findings.json` — the current seeded findings, captured and
  verified manually, that back the `/research` page today.
- `scripts/crawl_sources.py` — a standalone Crawl4AI verification script (see
  `scripts/requirements.txt`). Crawls the same source registry, extracts
  clean markdown (with a `pdfplumber` fallback for direct PDF links, since
  Crawl4AI's browser strategy can't read Chromium's built-in PDF viewer as
  text), and regex-checks specific claims from `research-findings.json`
  against the live source text. Run with `python scripts/crawl_sources.py`;
  output lands in `scripts/crawl_output/` (gitignored).

## NLP analysis

`/analysis` renders the "Analytics and NLP methods" layer from the
deep-research report — embeddings, deduplication, density clustering,
zero-shot taxonomy classification, and sentiment — run against the crawled
corpus. Scoped to what's actually installed rather than pulling in
BERTopic/UMAP/HDBSCAN for a corpus this size:

- `scripts/nlp/chunking.py` — cleans Crawl4AI markdown (strips links, PDF
  page-number/header artifacts) and splits into paragraph chunks, dropping
  nav/breadcrumb text and low-stopword-ratio junk (catches PDF text-extraction
  artifacts like reversed/rotated chart labels).
- `scripts/nlp/pipeline.py` — embeds with `sentence-transformers/all-MiniLM-L6-v2`,
  dedupes near-identical chunks (cosine similarity), clusters with DBSCAN
  (cosine, density-based — no fixed cluster count), zero-shot classifies
  against the pain taxonomy with a small NLI cross-encoder (entailment
  framing, not a fine-tuned model — matches the report's own recommendation
  to start with zero-shot before weak supervision), and scores sentiment with
  NLTK's VADER. Run with `python scripts/nlp/pipeline.py`; output lands in
  `scripts/nlp_output/` (gitignored).
- `scripts/nlp/build_app_summary.py` — distills that output into
  `data/nlp-analysis.json` (committed), after one manual QA pass: 2 of 6
  zero-shot-tagged chunks turned out to be nav artifacts the automatic filter
  missed, excluded by hand rather than shipped as findings.

The `/analysis` page also documents known limitations directly (narrow-corpus
zero-shot precision, VADER's poor fit for non-social-media text, the eps
tuning DBSCAN needed) — this is a first-pass instrument, not a finished
classifier, consistent with the deep-research report's own methodology.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS.

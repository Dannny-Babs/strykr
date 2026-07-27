"""
NLP layer for the DealerSync research corpus: embeddings for dedup/clustering,
zero-shot entailment classification against the pain taxonomy, and sentiment
baselining — per the deep-research report's "Analytics and NLP methods"
section, scoped to what's actually installed locally rather than pulling in
BERTopic/UMAP/HDBSCAN for a corpus this size. A density-based clustering pass
over sentence embeddings gets the same practical outcome (topic groups
without a fixed k) at a fraction of the dependency weight.

Usage:
    python scripts/nlp/pipeline.py

Reads:
    scripts/crawl_output/*.md + summary.json   (from scripts/crawl_sources.py)

Writes:
    scripts/nlp_output/chunks.json   - every chunk with taxonomy + sentiment
    scripts/nlp_output/summary.json  - aggregate stats + cluster examples
"""

import json
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path

import nltk
import numpy as np
from sentence_transformers import CrossEncoder, SentenceTransformer, util
from sklearn.cluster import DBSCAN

sys.path.insert(0, str(Path(__file__).parent))
from chunking import chunk_markdown  # noqa: E402
from taxonomy import PAIN_TAXONOMY  # noqa: E402

CRAWL_DIR = Path(__file__).parent.parent / "crawl_output"
OUTPUT_DIR = Path(__file__).parent.parent / "nlp_output"

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
NLI_MODEL = "cross-encoder/nli-MiniLM2-L6-H768"
DEDUP_SIM_THRESHOLD = 0.92
CLUSTER_EPS = 0.15
CLUSTER_MIN_SAMPLES = 2
ENTAILMENT_THRESHOLD = 0.5


@dataclass
class ChunkRecord:
    chunk_id: str
    doc_id: str
    source_label: str
    source_url: str
    text: str
    word_count: int
    is_duplicate: bool = False
    duplicate_of: str | None = None
    cluster_id: int | None = None
    taxonomy: list[dict] = field(default_factory=list)
    sentiment: dict = field(default_factory=dict)


class UnionFind:
    def __init__(self, n: int):
        self.parent = list(range(n))

    def find(self, x: int) -> int:
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a: int, b: int) -> None:
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.parent[rb] = ra


def load_corpus() -> list[ChunkRecord]:
    summary = json.loads((CRAWL_DIR / "summary.json").read_text(encoding="utf-8"))
    meta_by_id = {r["id"]: r for r in summary}

    records: list[ChunkRecord] = []
    for md_path in sorted(CRAWL_DIR.glob("*.md")):
        doc_id = md_path.stem
        meta = meta_by_id.get(doc_id, {})
        markdown = md_path.read_text(encoding="utf-8")
        for chunk in chunk_markdown(doc_id, markdown):
            records.append(
                ChunkRecord(
                    chunk_id=f"{doc_id}::{chunk.chunk_index}",
                    doc_id=doc_id,
                    source_label=meta.get("label", doc_id),
                    source_url=meta.get("url", ""),
                    text=chunk.text,
                    word_count=chunk.word_count,
                )
            )
    return records


def dedup(records: list[ChunkRecord], embeddings: np.ndarray) -> None:
    sims = util.cos_sim(embeddings, embeddings).numpy()
    uf = UnionFind(len(records))
    n = len(records)
    for i in range(n):
        for j in range(i + 1, n):
            if sims[i][j] >= DEDUP_SIM_THRESHOLD:
                uf.union(i, j)

    canonical_for_root: dict[int, int] = {}
    for i in range(n):
        root = uf.find(i)
        if root not in canonical_for_root:
            canonical_for_root[root] = i  # first-seen member is canonical
        canon = canonical_for_root[root]
        if canon != i:
            records[i].is_duplicate = True
            records[i].duplicate_of = records[canon].chunk_id


def cluster(records: list[ChunkRecord], embeddings: np.ndarray) -> None:
    keep_idx = [i for i, r in enumerate(records) if not r.is_duplicate]
    if len(keep_idx) < CLUSTER_MIN_SAMPLES:
        return
    sub_embeddings = embeddings[keep_idx]
    labels = DBSCAN(eps=CLUSTER_EPS, min_samples=CLUSTER_MIN_SAMPLES, metric="cosine").fit_predict(sub_embeddings)
    for idx, label in zip(keep_idx, labels):
        records[idx].cluster_id = int(label) if label != -1 else None


def classify_taxonomy(records: list[ChunkRecord], nli: CrossEncoder) -> None:
    active = [r for r in records if not r.is_duplicate]
    if not active:
        return

    label_keys = list(PAIN_TAXONOMY.keys())
    pairs = [(r.text, PAIN_TAXONOMY[key]["hypothesis"]) for r in active for key in label_keys]
    raw_scores = nli.predict(pairs, apply_softmax=True, show_progress_bar=False)

    id2label = {int(k): v.lower() for k, v in nli.config.id2label.items()}
    entail_idx = next(i for i, name in id2label.items() if "entail" in name)

    i = 0
    for r in active:
        for key in label_keys:
            entail_prob = float(raw_scores[i][entail_idx])
            if entail_prob >= ENTAILMENT_THRESHOLD:
                r.taxonomy.append({"label": key, "score": round(entail_prob, 3)})
            i += 1
        r.taxonomy.sort(key=lambda t: t["score"], reverse=True)


def classify_sentiment(records: list[ChunkRecord]) -> None:
    try:
        nltk.data.find("sentiment/vader_lexicon.zip")
    except LookupError:
        nltk.download("vader_lexicon", quiet=True)
    from nltk.sentiment import SentimentIntensityAnalyzer

    sia = SentimentIntensityAnalyzer()
    for r in records:
        if r.is_duplicate:
            continue
        scores = sia.polarity_scores(r.text)
        compound = scores["compound"]
        label = "positive" if compound >= 0.05 else "negative" if compound <= -0.05 else "neutral"
        r.sentiment = {"compound": round(compound, 3), "label": label}


def build_summary(records: list[ChunkRecord]) -> dict:
    active = [r for r in records if not r.is_duplicate]

    taxonomy_counts: dict[str, int] = {k: 0 for k in PAIN_TAXONOMY}
    for r in active:
        for t in r.taxonomy:
            taxonomy_counts[t["label"]] += 1

    sentiment_counts = {"positive": 0, "neutral": 0, "negative": 0}
    for r in active:
        if r.sentiment:
            sentiment_counts[r.sentiment["label"]] += 1

    clusters: dict[int, list[ChunkRecord]] = {}
    for r in active:
        if r.cluster_id is not None:
            clusters.setdefault(r.cluster_id, []).append(r)

    cluster_summaries = [
        {
            "cluster_id": cid,
            "size": len(members),
            "example_texts": [m.text[:200] for m in members[:3]],
            "source_labels": sorted({m.source_label for m in members}),
        }
        for cid, members in sorted(clusters.items(), key=lambda kv: -len(kv[1]))
    ]

    return {
        "total_chunks": len(records),
        "unique_chunks": len(active),
        "duplicate_chunks": len(records) - len(active),
        "clustered_chunks": sum(len(v) for v in clusters.values()),
        "unclustered_chunks": len(active) - sum(len(v) for v in clusters.values()),
        "taxonomy_distribution": [
            {"label": k, "title": PAIN_TAXONOMY[k]["label"], "count": v} for k, v in taxonomy_counts.items()
        ],
        "sentiment_distribution": sentiment_counts,
        "clusters": cluster_summaries,
    }


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("Loading + chunking corpus...")
    records = load_corpus()
    print(f"  {len(records)} chunks from {len(set(r.doc_id for r in records))} documents")

    print(f"Embedding with {EMBEDDING_MODEL}...")
    embedder = SentenceTransformer(EMBEDDING_MODEL)
    embeddings = embedder.encode([r.text for r in records], show_progress_bar=False, convert_to_numpy=True)

    print("Deduplicating near-identical chunks...")
    dedup(records, embeddings)
    print(f"  {sum(r.is_duplicate for r in records)} duplicates found")

    print("Clustering (DBSCAN, cosine)...")
    cluster(records, embeddings)

    print(f"Zero-shot classifying against {len(PAIN_TAXONOMY)} taxonomy labels with {NLI_MODEL}...")
    nli = CrossEncoder(NLI_MODEL)
    classify_taxonomy(records, nli)

    print("Scoring sentiment (VADER)...")
    classify_sentiment(records)

    summary = build_summary(records)
    (OUTPUT_DIR / "chunks.json").write_text(
        json.dumps([asdict(r) for r in records], indent=2), encoding="utf-8"
    )
    (OUTPUT_DIR / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")

    print(f"\n{summary['total_chunks']} chunks -> {summary['unique_chunks']} unique "
          f"({summary['duplicate_chunks']} dedup'd), {len(summary['clusters'])} clusters")
    print("\nTaxonomy distribution:")
    for t in sorted(summary["taxonomy_distribution"], key=lambda x: -x["count"]):
        print(f"  {t['count']:4d}  {t['title']}")
    print("\nSentiment distribution:", summary["sentiment_distribution"])


if __name__ == "__main__":
    main()

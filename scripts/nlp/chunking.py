"""
Cleans Crawl4AI markdown output and splits it into paragraph-level chunks
worth feeding to embeddings/classification. The raw crawl is full-page
markdown — nav menus, footers, and social links dominate the byte count on
every OMVIC/UCDA page, so naive chunking would mostly classify boilerplate.
"""

import re
from dataclasses import dataclass

MD_LINK = re.compile(r"!?\[([^\]]*)\]\([^)]*\)")
WHITESPACE = re.compile(r"[ \t]+")
PDF_PAGE_HEADER = re.compile(r"^(Ontario Motor Vehicle Industry Council\s*\d*|\d{1,4})\s*\n", re.MULTILINE)

# High-frequency English function words. Real prose uses these constantly;
# PDF-extraction artifacts (reversed/rotated text, glued header fragments,
# breadcrumb nav without markdown links) mostly don't, regardless of how
# many words they have — so a low ratio is a strong low-effort noise signal.
STOPWORDS = {
    "the", "of", "and", "to", "a", "in", "is", "that", "for", "on", "as",
    "with", "by", "or", "an", "be", "this", "are", "was", "at", "from",
    "it", "its", "not", "has", "have", "will", "must", "must", "which",
}


def stopword_ratio(cleaned: str) -> float:
    words = [w.strip(".,;:!?()\"'").lower() for w in cleaned.split()]
    words = [w for w in words if w]
    if not words:
        return 0.0
    return sum(1 for w in words if w in STOPWORDS) / len(words)


@dataclass
class Chunk:
    doc_id: str
    chunk_index: int
    text: str
    word_count: int


def clean_paragraph(raw: str) -> str:
    # Strip markdown images/links, keeping link text (nav items become bare
    # words, which the noise filter below then screens out on their own).
    text = MD_LINK.sub(r"\1", raw)
    text = PDF_PAGE_HEADER.sub("", text)  # repeated PDF header/page-number lines
    text = WHITESPACE.sub(" ", text)
    return text.strip()


def is_probably_nav(raw_paragraph: str, cleaned: str) -> bool:
    """Heuristic: paragraphs that were mostly markdown links before cleaning
    are nav/footer/menu blocks, not prose, regardless of resulting length."""
    link_count = len(MD_LINK.findall(raw_paragraph))
    word_count = len(cleaned.split())
    if word_count == 0:
        return True
    if link_count >= 3 and (link_count / max(word_count, 1)) > 0.25:
        return True
    return False


def chunk_markdown(doc_id: str, markdown: str, min_words: int = 8) -> list[Chunk]:
    paragraphs = [p for p in markdown.split("\n\n") if p.strip()]
    chunks: list[Chunk] = []
    seen: set[str] = set()

    for para in paragraphs:
        cleaned = clean_paragraph(para)
        if is_probably_nav(para, cleaned):
            continue
        if len(cleaned.split()) < min_words:
            continue
        if stopword_ratio(cleaned) < 0.06:  # reversed/garbled text or glued header/nav fragments
            continue
        key = cleaned.lower()
        if key in seen:  # exact-duplicate boilerplate (repeated across a domain's pages)
            continue
        seen.add(key)
        chunks.append(Chunk(doc_id=doc_id, chunk_index=len(chunks), text=cleaned, word_count=len(cleaned.split())))

    return chunks

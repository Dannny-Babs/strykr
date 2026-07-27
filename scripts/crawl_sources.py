"""
Crawls the DealerSync tier-1 source registry with Crawl4AI and verifies the
factual claims already seeded in data/research-findings.json.

This mirrors lib/sources.ts (kept in sync by hand — it's a one-off
verification script, not shared runtime code with the Next.js app).

Usage:
    python scripts/crawl_sources.py

Outputs:
    scripts/crawl_output/<source_id>.md   - full extracted markdown per source
    scripts/crawl_output/summary.json     - crawl status + verification results
"""

import asyncio
import json
import re
from dataclasses import dataclass, field
from pathlib import Path

import httpx
import pdfplumber
from crawl4ai import AsyncWebCrawler

OUTPUT_DIR = Path(__file__).parent / "crawl_output"

SOURCES = [
    {"id": "omvic-transaction-fees", "label": "OMVIC — Transaction Fees",
     "url": "https://www.omvic.ca/selling/fees/transaction-fees/"},
    {"id": "omvic-new-fee-reporting-bulletin", "label": "OMVIC — Introducing the New Transaction Fee Reporting Process",
     "url": "https://www.omvic.ca/news/dealer-bulletins/introducing-the-new-transaction-fee-reporting-process-effective-january-2025/"},
    {"id": "omvic-garage-register", "label": "OMVIC — Garage Register",
     "url": "https://www.omvic.ca/selling/sales-operations/garage-register/"},
    {"id": "omvic-fee-consultation-2025", "label": "OMVIC — Proposed Changes to Registration and Transaction Fees (2025)",
     "url": "https://www.omvic.ca/wp-content/uploads/2025/05/OMVIC-Fee-Consultation-Detail-2025.pdf"},
    {"id": "omvic-new-fees-2024", "label": "OMVIC — New Fees Effective April 1, 2024",
     "url": "https://www.omvic.ca/wp-content/uploads/2024/02/20240131NewFeesDealerBulletin-1.pdf"},
    {"id": "omvic-how-to-report-webinar", "label": "OMVIC — How To Report Transaction Fees (webinar)",
     "url": "https://www.omvic.ca/event/how-to-report-transaction-fees/"},
    {"id": "auditor-general-omvic-2021-full-report", "label": "Auditor General of Ontario — Value-for-Money Audit: OMVIC (2021, full report)",
     "url": "https://www.auditor.on.ca/en/content/annualreports/arreports/en21/AR_OMVIC_en21.pdf"},
    {"id": "auditor-general-omvic-followup-2023", "label": "Auditor General of Ontario — OMVIC Follow-Up (2023, Ch. 3.04)",
     "url": "https://www.auditor.on.ca/en/content/annualreports/arreports/en23/3-04FU-PAC_OMVIC_en23.pdf"},
    {"id": "auditor-general-omvic-2021-release", "label": "Auditor General of Ontario — 2021 News Release on OMVIC",
     "url": "https://www.auditor.on.ca/en/content/news/21_newsreleases/2021_news_AR_OMVIC.pdf"},
    {"id": "ola-public-accounts-omvic-2023", "label": "Legislative Assembly of Ontario — Public Accounts Committee Report on OMVIC",
     "url": "https://www.ola.org/en/legislative-business/committees/public-accounts/parliament-43/reports/2023-feb-21-value-for-money-audit-ontario-motor-vehicle-industry-council-2021-annual-report-office-a"},
    {"id": "ucda-omvic-transaction-fee", "label": "UCDA — OMVIC Transaction Fee",
     "url": "https://www.ucda.org/omvic-transaction-fee/"},
    {"id": "ucda-can-dealers-afford-omvic", "label": "UCDA — Can Dealers Afford OMVIC?",
     "url": "https://www.ucda.org/can-dealers-afford-omvic/"},
    {"id": "ucda-dealers-cant-afford-omvic", "label": "UCDA — Dealers Can't Afford OMVIC",
     "url": "https://www.ucda.org/dealers-cant-afford-omvic/"},
    {"id": "ucda-frontline-new-fee-process", "label": "UCDA Frontline — OMVIC's New Transaction Fee Reporting Process",
     "url": "https://frontline.ucda.org/omvics-new-transaction-fee-reporting-process/"},
    {"id": "ucda-dealer-faqs-omvic", "label": "UCDA — Dealer FAQs: OMVIC",
     "url": "https://www.ucda.org/dealer-faqs/omvic/"},
    {"id": "dealerpull-home", "label": "DealerPull — Dealer Management Software",
     "url": "https://www.dealerpull.com/"},
    {"id": "dealerpull-omvic-blog", "label": "DealerPull — OMVIC and Ontario Auto Dealers: Balancing Protection with Pressure",
     "url": "https://www.dealerpull.com/blog-posts/omvic-and-ontario-auto-dealers-balancing-protection-with-pressure"},
    {"id": "movemetal-audit-proof-guide", "label": "MoveMetal CRM — AMVIC to OMVIC: The Ultimate Audit-Proof Guide",
     "url": "https://www.movemetalcrm.com/amvic-to-omvic-audit-proof-guide"},
    {"id": "movemetal-bill-of-sale", "label": "MoveMetal CRM — OMVIC Bill of Sale Requirements",
     "url": "https://www.movemetalcrm.com/omvic-bill-of-sale-requirements"},
]

# Substrings that must appear (case-insensitive) in the crawled markdown to
# corroborate the specific claim seeded in data/research-findings.json.
# Each entry is (pattern, human description of what it proves).
VERIFICATIONS: dict[str, list[tuple[str, str]]] = {
    "omvic-transaction-fees": [
        (r"\$22", "fee is $22/vehicle"),
        (r"september\s*1,?\s*2025", "effective date Sept 1, 2025"),
    ],
    "omvic-new-fee-reporting-bulletin": [
        (r"january\s*6,?\s*2025", "mandatory as of Jan 6, 2025"),
        (r"transaction fee register", "register is named/required"),
    ],
    "ucda-omvic-transaction-fee": [
        (r"daily", "daily tracking recommendation"),
        (r"monthly", "monthly tracking recommendation"),
    ],
    "auditor-general-omvic-2021-full-report": [
        (r"670", "sample size of 670 dealers"),
        (r"9,000", "~9,000 under-reported transactions"),
        (r"\$?90,000", "~$90,000 underpaid fees"),
        (r"3,004", "inspections overstated by 3,004"),
    ],
    "dealerpull-home": [
        (r"omvic", "mentions OMVIC"),
        (r"garage register", "mentions garage register feature"),
    ],
}


@dataclass
class SourceResult:
    id: str
    label: str
    url: str
    success: bool
    status_code: int | None = None
    error: str | None = None
    markdown_length: int = 0
    checks: list[dict] = field(default_factory=list)


async def extract_pdf_text(url: str) -> tuple[str, int]:
    """Crawl4AI's browser strategy can't read Chromium's built-in PDF viewer as
    text, so PDFs are downloaded directly and parsed with pdfplumber instead."""
    async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
        resp = await client.get(url, headers={"User-Agent": "DealerSyncResearchBot/0.1"})
        resp.raise_for_status()
        status_code = resp.status_code
        pdf_bytes = resp.content

    def _extract() -> str:
        import io
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            return "\n\n".join(page.extract_text() or "" for page in pdf.pages)

    text = await asyncio.to_thread(_extract)
    return text, status_code


async def crawl_one(crawler: AsyncWebCrawler, source: dict) -> SourceResult:
    is_pdf = source["url"].lower().endswith(".pdf")

    if is_pdf:
        try:
            markdown, status_code = await extract_pdf_text(source["url"])
        except Exception as exc:
            return SourceResult(id=source["id"], label=source["label"], url=source["url"],
                                 success=False, error=str(exc))
        (OUTPUT_DIR / f"{source['id']}.md").write_text(markdown, encoding="utf-8")
        checks = []
        for pattern, description in VERIFICATIONS.get(source["id"], []):
            matched = re.search(pattern, markdown, re.IGNORECASE) is not None
            checks.append({"pattern": pattern, "description": description, "matched": matched})
        return SourceResult(id=source["id"], label=source["label"], url=source["url"],
                             success=True, status_code=status_code,
                             markdown_length=len(markdown), checks=checks)

    try:
        result = await crawler.arun(url=source["url"], bypass_cache=True, verbose=False)
    except Exception as exc:  # crawl4ai can raise on navigation/timeout errors
        return SourceResult(id=source["id"], label=source["label"], url=source["url"],
                             success=False, error=str(exc))

    if not result.success:
        return SourceResult(id=source["id"], label=source["label"], url=source["url"],
                             success=False, status_code=result.status_code,
                             error=result.error_message)

    markdown = result.markdown or ""
    (OUTPUT_DIR / f"{source['id']}.md").write_text(markdown, encoding="utf-8")

    checks = []
    for pattern, description in VERIFICATIONS.get(source["id"], []):
        matched = re.search(pattern, markdown, re.IGNORECASE) is not None
        checks.append({"pattern": pattern, "description": description, "matched": matched})

    return SourceResult(id=source["id"], label=source["label"], url=source["url"],
                         success=True, status_code=result.status_code,
                         markdown_length=len(markdown), checks=checks)


async def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    async with AsyncWebCrawler(verbose=False) as crawler:
        results = await asyncio.gather(*(crawl_one(crawler, s) for s in SOURCES))

    summary = [r.__dict__ for r in results]
    (OUTPUT_DIR / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")

    ok = [r for r in results if r.success]
    failed = [r for r in results if not r.success]
    print(f"\nCrawled {len(results)} sources — {len(ok)} ok, {len(failed)} failed\n")

    for r in failed:
        print(f"  FAILED  {r.id}: {r.error}")

    print("\nVerification checks:")
    for r in ok:
        if not r.checks:
            continue
        for c in r.checks:
            status = "PASS" if c["matched"] else "FAIL"
            print(f"  [{status}] {r.id}: {c['description']} (/{c['pattern']}/)")


if __name__ == "__main__":
    asyncio.run(main())

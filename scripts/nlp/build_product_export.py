"""Create a product-facing extraction envelope from the existing research pipeline.

The current corpus contains regulatory research rather than VIN-level transaction
evidence, so this exporter intentionally emits zero product records. Future
extractors must add records that satisfy docs/python-extraction-contract.md.
"""

import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "data" / "python-extraction.json"

payload = {
    "schemaVersion": "cordena-extraction-v1",
    "generatedAt": datetime.now(timezone.utc).isoformat(),
    "source": {
        "name": "existing-research-nlp-pipeline",
        "reference": "data/nlp-analysis.json",
        "extractionMethod": "research-summary-export",
    },
    "records": [],
    "notes": [
        "The current NLP corpus contains regulatory research, not VIN-level evidence.",
        "No transaction or listing evidence was inferred from research text.",
    ],
}

OUTPUT.write_text(json.dumps(payload, indent=2), encoding="utf-8")
print(f"Wrote {OUTPUT} with 0 product records (expected for the current corpus).")

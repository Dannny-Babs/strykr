# Python extraction contract

The existing research/NLP pipeline remains independent from compliance decisions. Product-facing Python output must be JSON matching `cordena-extraction-v1` and is ingested through `PythonExtractionAdapter` rather than imported directly by UI code.

```json
{
  "schemaVersion": "cordena-extraction-v1",
  "generatedAt": "2026-08-10T12:00:00.000Z",
  "source": { "name": "local-nlp-pipeline", "reference": "crawl-output/run-1", "extractionMethod": "sentence-transformer-plus-human-review" },
  "records": [{ "sourceRecordId": "source-1", "vin": "2HG00000000000001", "observedAt": "2026-08-10", "recordType": "LISTING_OBSERVATION", "fields": { "listingStatus": "LISTING_REMOVED" }, "confidence": 0.82, "sourceUrl": "https://example.test/listing/1" }]
}
```

`LISTING_REMOVED` remains a possible disposition signal, never a confirmed sale. The JSON preserves source reference, extraction method, time, and confidence. The TypeScript boundary validates this contract with Zod before any record enters normalization.

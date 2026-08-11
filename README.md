# DealerSync

DealerSync is a local-first vehicle transaction reconciliation and compliance workspace. It ingests dealer transaction records and registration-style evidence, normalizes them around VIN, runs deterministic/versioned rules, creates explainable exceptions, and preserves human responses, evidence, resolutions, and activity.

It does not determine wrongdoing. It presents discrepancies for review.

## Current product boundary

The implemented pilot foundation supports:

- SQLite persistence with deterministic seeds and migrations.
- CSV transaction-register and registration-record ingestion.
- Automatic column suggestions, explicit mapping, validation, normalization, deduplication, and raw-row provenance.
- VIN matching and ten deterministic reconciliation rules.
- Immutable reconciliation runs and match/exception history.
- Development personas with backend RBAC and dealership isolation.
- Dealer responses, reviewer resolutions, protected local document uploads/downloads, activity events, and persisted CSV reporting.
- Existing research collection/NLP tooling through a documented product export boundary.

It does not include live OMVIC/MTO access, dealer DMS connectors, enterprise SSO, automated email, cloud infrastructure, government identity, or security certification.

See [repository audit and remaining gaps](docs/gap-analysis.md) and [architecture details](docs/architecture.md).

## Stack

- Next.js 15 App Router, React 19, TypeScript, Tailwind CSS.
- Drizzle ORM with `better-sqlite3` for local persistence.
- Zod for request/connector contracts and `csv-parse` for ingestion.
- Vitest for framework-independent domain tests.
- Python/Crawl4AI/sentence-transformers tooling remains an optional, separate research pipeline.

## Local setup

Requirements: Node.js 22+, npm, and Python 3 only if running the existing research/NLP scripts.

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run seed
npm run dev
```

Open `http://localhost:3000/demo`. The seed creates 25 dealerships, 2,000 dealer transactions, 1,965 registration-style records, users, fee/rule configuration, an audit, and an initial reconciliation run.

## Commands

```bash
npm run dev                 # Next.js development server
npm run db:generate         # generate SQL after a schema change
npm run db:migrate          # apply committed migrations
npm run seed                # deterministic local seed and initial reconciliation
npm run reset-db            # remove local SQLite files (then migrate + seed)
npm run reconcile           # new immutable run for dealer-1 / period-1-2025
npm run test                # domain unit tests
npm run typecheck
npm run lint
npm run build
npm run python:process      # emit a validated product extraction envelope
```

`npm run reconcile -- dealer-2 period-2-2025` accepts explicit IDs. Only Northfield (`dealer-1`) has the canonical high-volume scenario in the current seed.

## Environment variables

- `DATABASE_URL`: local SQLite file for this adapter.
- `DOCUMENT_STORAGE_PATH`: protected local evidence directory.
- `APP_URL`: application base URL.
- `DEALERSYNC_DEV_AUTH`: enables local persona resolution. This is not production authentication.
- `DEALERSYNC_DEFAULT_PERSONA`: default seeded persona.
- `PYTHON_EXPORT_PATH`: future Python adapter input location.
- `AI_PROVIDER_API_KEY`: reserved; no LLM compliance decision path exists.

## Import formats

CSV is supported first. Transaction registers require VIN, transaction date, and transaction type. Registration extracts require VIN and registration date. Common aliases such as `Vehicle Identification Number`, `VIN Number`, `vehicle_vin`, `Date of sale`, and `transaction category` are suggested automatically. Manual mappings are accepted by the API contract.

Errors do not enter reconciliation. Warnings can enter with their warning detail. Every source row is kept in `import_records`, including rejected and duplicate rows.

Future adapters belong behind the same import contract: DMS/accounting exports, XLSX, SFTP, authorized APIs, CDK, Reynolds, PBS, Dealertrack, MTO-style records, and OMVIC submissions. None are faked here.

## Reconciliation rules

- `TXN001`: registration without dealer transaction.
- `TXN002`: dealer transaction without registration.
- `TXN003`: duplicate VIN in the same transaction context.
- `DATE001`: dates exceed configured tolerance.
- `TYPE001`: source classification discrepancy.
- `FEE001`: fee required but missing.
- `FEE002`: reported and expected fee differ.
- `DOC001`: configured classification lacks evidence.
- `VIN001`: structural VIN validation failure.
- `PERIOD001`: transaction outside the reporting period.

All results include the triggering values, explanation, severity, recommended action, and calculable estimated fee effect. `ruleset-v1` is stored on every run.

## Python integration

The existing NLP scripts analyze a regulatory/research corpus; they do not contain vehicle transaction evidence. `npm run python:process` therefore emits a valid `dealersync-extraction-v1` envelope with zero VIN records instead of manufacturing them. Future product extractors must follow [the documented contract](docs/python-extraction-contract.md), and their output enters the same normalization/import boundary as other sources.

## Testing and limitations

Tests cover VIN/value normalization, exact matching, date variance, duplicates, missing records, fee rules, evidence requirements, period classification, rule versioning/determinism, exception transitions, permissions/isolation, and import validation.

The existing UI still contains some demonstration-oriented tables and generic pages. Persisted dashboards, exceptions, imports, documents, and CSV reports now work through services/APIs, but dedicated audit finding, rejected-row inspection, correction history, historical-run comparison, printable reports, and Playwright flows remain the next product milestone.

The original critical Next.js advisory was removed by upgrading to Next 15.5.23. The latest production audit still reports five high transitive findings and proposes a Next 16.3 major upgrade for the Next-bundled paths. This is a documented deployment blocker, not a production-ready security posture.

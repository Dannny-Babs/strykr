# Cordena

Cordena is a vehicle transaction reconciliation and compliance workspace. It ingests dealer transaction records and registration-style evidence, normalizes them around VIN, runs deterministic/versioned rules, creates explainable exceptions, and preserves human responses, evidence, resolutions, and activity.

It does not determine wrongdoing. It presents discrepancies for review.

## Current product boundary

The implemented pilot foundation supports:

- PostgreSQL persistence with deterministic seeds and committed migrations.
- CSV transaction-register and registration-record ingestion.
- Automatic column suggestions, explicit mapping, validation, normalization, deduplication, and raw-row provenance.
- VIN matching and ten deterministic reconciliation rules.
- Immutable reconciliation runs and match/exception history.
- Development personas with backend RBAC and dealership isolation.
- Dealer responses, reviewer resolutions, private object-storage uploads/downloads, activity events, and persisted CSV reporting.
- Existing research collection/NLP tooling through a documented product export boundary.

It does not include live OMVIC/MTO access, dealer DMS connectors, enterprise SSO, government identity, or security certification. Supabase Auth is integrated, but public production email delivery still requires custom SMTP credentials.

See [repository audit and remaining gaps](docs/gap-analysis.md) and [architecture details](docs/architecture.md).

## Stack

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS.
- Drizzle ORM with pooled PostgreSQL connections to Neon.
- Private Vercel Blob storage for production evidence documents, with a local filesystem fallback in development.
- Zod for request/connector contracts and `csv-parse` for ingestion.
- Vitest for framework-independent domain tests.
- Python/Crawl4AI/sentence-transformers tooling remains an optional, separate research pipeline.

## Local setup

Requirements: Node.js 22+, npm, and Python 3 only if running the existing research/NLP scripts.

```bash
npm install
npx vercel@latest link
npx vercel@latest env pull .env.local --yes
npm run db:migrate
npm run db:bootstrap
npm run dev
```

Open `http://localhost:3000/demo`. The seed creates 25 dealerships, 2,000 dealer transactions, 1,965 registration-style records, users, fee/rule configuration, an audit, and an initial reconciliation run.

## Commands

```bash
npm run dev                 # Next.js development server
npm run db:generate         # generate SQL after a schema change
npm run db:migrate          # apply committed migrations
npm run db:bootstrap        # idempotent production rules/fee configuration
npm run seed                # deterministic local seed and initial reconciliation
npm run reconcile           # new immutable run for dealer-1 / period-1-2025
npm run test                # domain unit tests
npm run typecheck
npm run lint
npm run build
npm run python:process      # emit a validated product extraction envelope
```

`npm run reconcile -- dealer-2 period-2-2025` accepts explicit IDs. Only Northfield (`dealer-1`) has the canonical high-volume scenario in the current seed.

## Environment variables

- `DATABASE_URL`: pooled PostgreSQL URL for application traffic.
- `DATABASE_URL_UNPOOLED`: direct PostgreSQL URL used only for migrations.
- `BLOB_READ_WRITE_TOKEN`: private Vercel Blob access; required in production.
- `NEXT_PUBLIC_SUPABASE_URL`: Cordena's hosted Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: the modern publishable browser/server key; RLS remains the data boundary.
- `NEXT_PUBLIC_APP_URL`: canonical application origin used as the fallback for authentication redirects.
- `MALWARE_SCAN_URL` and `MALWARE_SCAN_API_TOKEN`: optional remote scanner endpoint and credential.
- `MALWARE_SCAN_REQUIRED`: when `true`, evidence upload fails closed unless the remote scanner returns a clean verdict.
- `CORDENA_DEV_AUTH`: enables local persona resolution only when no Supabase session exists. This is never production authentication.
- `CORDENA_DEFAULT_PERSONA`: default seeded persona.
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

The existing NLP scripts analyze a regulatory/research corpus; they do not contain vehicle transaction evidence. `npm run python:process` therefore emits a valid `cordena-extraction-v1` envelope with zero VIN records instead of manufacturing them. Future product extractors must follow [the documented contract](docs/python-extraction-contract.md), and their output enters the same normalization/import boundary as other sources.

## Production infrastructure

The Vercel project uses Neon Postgres for product state, Supabase Auth for verified identity and secure cookie sessions, and a private Vercel Blob store for evidence files. Application queries use the pooled database URL; migrations use the direct URL. Reviewer accounts are invite-only, while dealership accounts can self-onboard after Supabase email verification. A unique Supabase user ID links each identity to its Neon organization and role; authorization still runs in Cordena's server services. Auth endpoint and upload limits are shared through Postgres rather than process memory.

Evidence is private, fingerprinted with SHA-256, locally inspected for executable signatures, MIME mismatch, invalid text, EICAR content, and macro-enabled Office packages, and blocked from download unless its security status is clean. Configure a remote scanning service and set `MALWARE_SCAN_REQUIRED=true` for fail-closed external malware scanning.

Do not run seed data against a populated database. Test schema changes on a Neon branch before applying them to production.

## Testing and limitations

Tests cover VIN/value normalization, exact matching, date variance, duplicates, missing records, fee rules, evidence requirements, period classification, rule versioning/determinism, exception transitions, permissions/isolation, and import validation.

The existing UI still contains some demonstration-oriented tables and generic pages. Persisted dashboards, exceptions, imports, documents, and CSV reports now work through services/APIs, but dedicated audit finding, rejected-row inspection, correction history, historical-run comparison, printable reports, and Playwright flows remain the next product milestone.

Next.js is upgraded to 16.3.1 and `npm audit --omit=dev` reports zero production vulnerabilities. Four moderate findings remain through Drizzle Kit's development-only esbuild loader; npm's proposed force fix is a breaking Drizzle Kit downgrade and is intentionally not applied.

# Repository audit and gap analysis

Audited on 2026-08-10 before foundational implementation. The checkout already contained substantial uncommitted UI polish; that work was preserved.

## What existed

- Next.js 15 App Router routes: `/`, `/demo/[[...view]]`, `/research`, `/analysis`, and `/api/collect`.
- A polished, single-client-component operational prototype in `components/cordena-demo.tsx`.
- Hard-coded dealerships, transactions, exceptions, and metrics in `lib/demo-data.ts`.
- Browser-only exception changes in `localStorage` and document binaries in IndexedDB.
- A source collector, verified research JSON, Crawl4AI script, and an independent Python NLP pipeline.
- No database, migrations, authentication boundary, backend authorization, durable activity trail, versioned reconciliation engine, formal import adapters, document service, audit persistence, or tests of compliance rules.
- No live OMVIC, MTO, DMS, accounting, identity, email, or cloud-storage integrations.

## Implemented in this phase

- Relational domain schema in Drizzle with Neon Postgres migrations, a deterministic seed, indexes, and 25 dealerships / 2,000 transactions.
- Explicit normalization, fee, permissions, transition, import, and reconciliation domain modules.
- Immutable reconciliation runs with a stored rule version, match results, explainable exceptions, transaction outcomes, and append-only activity events.
- CSV adapters for dealer transaction registers and registration-style records with column suggestions, manual mapping contract, errors vs warnings, provenance, raw rows, normalized rows, and duplicate handling.
- Local development personas and backend-enforced RBAC/organization isolation.
- Durable dealer responses, reviewer transitions/resolution reasons, private Vercel Blob evidence storage, safe upload checks, metadata, protected downloads, and CSV reconciliation reports.
- A versioned JSON contract for Python-generated product evidence. Current research NLP exports no VIN records because none can be defensibly derived from that corpus.
- The existing demo now reads persisted exceptions/metrics, imports real CSV files, persists uploads, invokes backend workflow actions, and exports from the database.
- Unit tests for normalization, matching, deterministic rules, transitions, authorization, and imports.

## Remaining gaps before a real pilot

1. Add reviewer invitation/admin provisioning and session-management UI. Dealer email verification, password reset, secure cookie sessions, and profile RLS are handled by Supabase Auth; reviewer self-signup remains blocked.
2. Finish dedicated persisted pages for import history/rejected rows, transaction corrections, audit findings, evidence association, and historical reconciliation-run comparison. The database/services exist; several current UI surfaces remain demonstration-oriented.
3. Add server-side pagination and database-backed filters to the existing transaction/dealership tables, which still render seeded client arrays.
4. Add saved column mappings and transaction-level correction commands that preserve field-by-field revision history beyond the current original/corrected JSON boundary.
5. Add evidence counts to reconciliation rule evaluation and re-run orchestration after evidence/correction events.
6. Implement an audit finding service that requires linked exceptions and evidence; only the relational model and seed audit currently exist.
7. Add printable HTML report templates, import/data-quality reports, and activity reports. CSV reconciliation export is the only live report.
8. Add Playwright after the core routes stabilize. The requested flows are not yet covered end to end in a browser.
9. Configure and test backup/restore drills, evidence retention controls, and production observability. Uploads now receive local signature/MIME/macro inspection, an SHA-256 fingerprint, a persisted security verdict, and download blocking unless clean. A remote scanner contract is available and can be made fail-closed with `MALWARE_SCAN_REQUIRED=true`; production still needs an external scanning service and a restore drill.
10. Validate actual regulatory requirements, fee schedules, permissions, privacy controls, and pilot workflows with authorized Ontario stakeholders. No government integration or compliance certification is implied.
11. Next.js was upgraded to 16.3.1 with React 19.2.8. `npm audit --omit=dev` reports zero production vulnerabilities. Four moderate findings remain only through Drizzle Kit's development-time esbuild loader; npm's proposed force fix is a breaking downgrade and is intentionally not applied.

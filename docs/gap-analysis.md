# Repository audit and gap analysis

Audited on 2026-08-10 before foundational implementation. The checkout already contained substantial uncommitted UI polish; that work was preserved.

## What existed

- Next.js 15 App Router routes: `/`, `/demo/[[...view]]`, `/research`, `/analysis`, and `/api/collect`.
- A polished, single-client-component operational prototype in `components/dealersync-demo.tsx`.
- Hard-coded dealerships, transactions, exceptions, and metrics in `lib/demo-data.ts`.
- Browser-only exception changes in `localStorage` and document binaries in IndexedDB.
- A source collector, verified research JSON, Crawl4AI script, and an independent Python NLP pipeline.
- No database, migrations, authentication boundary, backend authorization, durable activity trail, versioned reconciliation engine, formal import adapters, document service, audit persistence, or tests of compliance rules.
- No live OMVIC, MTO, DMS, accounting, identity, email, or cloud-storage integrations.

## Implemented in this phase

- Portable relational domain schema in Drizzle with a local SQLite adapter, SQL migration, deterministic seed, indexes, and 25 dealerships / 2,000 transactions.
- Explicit normalization, fee, permissions, transition, import, and reconciliation domain modules.
- Immutable reconciliation runs with a stored rule version, match results, explainable exceptions, transaction outcomes, and append-only activity events.
- CSV adapters for dealer transaction registers and registration-style records with column suggestions, manual mapping contract, errors vs warnings, provenance, raw rows, normalized rows, and duplicate handling.
- Local development personas and backend-enforced RBAC/organization isolation.
- Durable dealer responses, reviewer transitions/resolution reasons, local document storage abstraction, safe upload checks, metadata, protected downloads, and CSV reconciliation reports.
- A versioned JSON contract for Python-generated product evidence. Current research NLP exports no VIN records because none can be defensibly derived from that corpus.
- The existing demo now reads persisted exceptions/metrics, imports real CSV files, persists uploads, invokes backend workflow actions, and exports from the database.
- Unit tests for normalization, matching, deterministic rules, transitions, authorization, and imports.

## Remaining gaps before a real pilot

1. Replace development persona headers with a production authentication provider and secure sessions.
2. Finish dedicated persisted pages for import history/rejected rows, transaction corrections, audit findings, evidence association, and historical reconciliation-run comparison. The database/services exist; several current UI surfaces remain demonstration-oriented.
3. Add server-side pagination and database-backed filters to the existing transaction/dealership tables, which still render seeded client arrays.
4. Add saved column mappings and transaction-level correction commands that preserve field-by-field revision history beyond the current original/corrected JSON boundary.
5. Add evidence counts to reconciliation rule evaluation and re-run orchestration after evidence/correction events.
6. Implement an audit finding service that requires linked exceptions and evidence; only the relational model and seed audit currently exist.
7. Add printable HTML report templates, import/data-quality reports, and activity reports. CSV reconciliation export is the only live report.
8. Add Playwright after the core routes stabilize. The requested flows are not yet covered end to end in a browser.
9. Move from SQLite/local files to PostgreSQL/object storage for multi-user deployment, plus backups, encryption, malware scanning, retention controls, rate limiting, and production observability.
10. Validate actual regulatory requirements, fee schedules, permissions, privacy controls, and pilot workflows with authorized Ontario stakeholders. No government integration or compliance certification is implied.
11. The direct critical advisory in Next 15.5.2 was removed by upgrading to 15.5.23. As of this implementation, `npm audit --omit=dev` still reports five high transitive findings (`postcss`, `sharp`, `js-yaml`, and `picomatch` paths); npm proposes Next 16.3 for the Next-bundled findings. Treat the app as local-only until those remaining upgrades are assessed and cleared.

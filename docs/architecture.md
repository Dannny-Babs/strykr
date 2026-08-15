# Cordena architecture

## Product lifecycle

`source → parse/map → validate → normalize → persist provenance → deterministic match → versioned rules → exception → evidence/response → human resolution → activity → report`

## Boundaries

- `src/domain`: framework-independent business rules. No React, route, or database logic.
- `src/server/db`: Drizzle PostgreSQL schema and pooled Neon database adapter.
- `src/server/services`: authorization-aware application commands and queries. Routes do not own business logic.
- `src/server/storage`: document binary abstraction. Production uses private Vercel Blob storage; local development can fall back to the filesystem.
- `app/api`: HTTP validation and transport only.
- `components`: existing product presentation. It consumes APIs for persisted workflows.
- `scripts/nlp`: independent research/extraction process. Product imports require the versioned JSON contract.

## Reconciliation

The engine in `src/domain/reconciliation` accepts canonical records and a reporting period. It matches exact normalized VINs within a dealership, selects deterministic nearest-date candidates where duplicate source records exist, evaluates rules, and returns data without writing it. The application service persists a new immutable run, match rows, exceptions, current transaction outcomes, and one activity event in a transaction. Previous runs remain queryable.

Rule version: `ruleset-v1`.

Implemented rules: `TXN001`, `TXN002`, `TXN003`, `DATE001`, `TYPE001`, `FEE001`, `FEE002`, `DOC001`, `VIN001`, and `PERIOD001`.

The engine does not infer wrongdoing, silently merge uncertain records, or treat public listing removal as a confirmed sale.

## Authentication and authorization

Local requests can use one of four seeded personas through `x-cordena-persona`: `regulator_reviewer`, `dealer_admin`, `dealer_user`, or `system_admin`. This is explicitly development-only. Production uses Supabase Auth with PKCE-compatible secure cookie sessions and server-side `getUser()` validation; reviewer account creation is invite-only. Supabase user metadata is never trusted for roles. A unique provider ID links the verified identity to the Neon `users` row, and services call `assertCan` while enforcing a dealer user's `dealershipId` regardless of what the UI sends.

## Persistence and provenance

Imported rows preserve raw JSON and normalized JSON. Canonical transactions preserve original and corrected values. Reconciliation runs and activity events are append-only from application workflows. Documents store only metadata/references in the database; binary storage is abstracted.

Neon Postgres is the shared durable store. JSON-like provenance remains serialized in text fields so the deterministic domain model and historical imports preserve their existing contract.

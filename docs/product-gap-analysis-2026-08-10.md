# Cordena product gap analysis

Audit date: 2026-08-10. Scope: every current dealer and reviewer product route, desktop screenshots at the active 1280px browser viewport, a 390x844 reviewer mobile pass, DOM/semantic inspection, and current service/schema review. Evidence was captured under `/tmp/cordena-product-audit-2026-08-10/`.

## Current health

The product has a strong, calm operational shell and credible persisted domain model. Authentication, role separation, import/reconciliation services, activity storage, and report authorization form a coherent local-pilot foundation. The principal product gap is connectivity: most rows, IDs, metrics, search affordances, and workflow buttons do not currently lead to investigation or action. Large datasets are rendered as inert tables, so the system is understandable at a glance but not yet operable for hours of real review work.

## Route audit

| # | Surface | Health | Evidence-backed finding |
|---|---|---|---|
| 1 | Sign up/sign in | Healthy foundation | Clear role choice and appropriately sized native controls. Inline validation, password affordances, loading, and failure screenshots remain unverified. |
| 2 | Dealer dashboard | Needs work | Good hierarchy; metrics, VINs, and action rows are inert. Search and settings are dead. |
| 3 | Dealer transactions | Blocking at scale | Latest 100 records render in one long table. No pagination, query, filter, sort, or entity detail. |
| 4 | Dealer exceptions | Blocking workflow | “Review” has no behavior. VIN and exception are inert; explanation, evidence, and response workflow are unavailable here. |
| 5 | Dealer imports | Partial | Real validate/import foundation exists. Batch row is inert; mapping, warnings, rejected rows, provenance, and resulting entities are not inspectable. |
| 6 | Dealer documents | Partial | Clear true-empty state, but upload action and document relationships need end-to-end validation and detail views. |
| 7 | Dealer reports | Partial | Authorized CSV exists. Other promised operational reports and filters do not. |
| 8 | Reviewer dashboard | Needs work | Priorities are visible, but cards and dealership rows are inert; zero responses and 25 dealerships dominate without strong next-action paths. |
| 9 | Reviewer dealerships | Blocking investigation | 25-row portfolio is readable but has no filtering, pagination, or dealership quick view. |
| 10 | Reviewer exceptions | Blocking workflow | 100 repeated cases render; Review is inert. No rule context, comparison, response, evidence, decision, or activity surface. |
| 11 | Reviewer audits | Blocking workflow | Seed audit exists but cannot be opened. New audit is inert; findings and run detail are absent. |
| 12 | Reviewer reports | Incomplete | Export is explicitly disabled; no reviewer output is currently usable. |
| 13 | Mobile reviewer dashboard | Usable with overflow | Shell and metrics adapt well. Dense table horizontally overflows and clips later columns without a strong cue or compact mobile identity/action pattern. |

## Prioritized findings

### P0 — workflow blocking

1. Important domain entities are inert across both products; users cannot move from a table/dashboard into an investigation.
2. Dealer exception response and reviewer resolution cannot be completed from the primary product routes despite backend services existing.
3. Audit rows and “New audit” do not open a workflow; findings cannot be created or managed.
4. Reviewer reporting has no working export.
5. Large transaction and exception queues have no database pagination or filters.

### P1 — major product gaps

1. No shared URL-addressable dealership, transaction/VIN, exception, document, import, audit, or run quick view.
2. Transaction comparison does not expose registration data, match results, evidence, exceptions, or provenance.
3. Exception views do not expose triggering values, dealer response, documents/evidence, activity, or clear primary action.
4. Search button and keyboard hint are non-functional.
5. Dashboard metrics do not open filtered work queues.
6. Import batches, audit names, dealership names, VINs, and related records lack cross-links.
7. Activity events are persisted but absent from the product.
8. Correction JSON exists but no field-level correction experience/history is available.

### P2 — usability problems

1. Tables show too many rows by default and lack count/pagination context.
2. Mobile tables rely on clipping/horizontal scroll; primary identity remains visible, but action/state can disappear off-screen.
3. Status vocabulary is partly centralized for visuals but contains role-specific label drift.
4. Settings and account settings affordances are dead.
5. Reports do not expose filters, scope, or generated timestamp in the interface.
6. No loading, filtered-empty, or recoverable error states were observable in primary routes.
7. Rows lack hover/focus treatment that communicates clickability.

### P3 — polish issues

1. Full-page captures of very long tables create repetitive/stitching artifacts, reflecting excessive initial page height.
2. Desktop page titles and tables are visually consistent, but table rhythm becomes monotonous over hundreds of repeated exceptions.
3. Mobile account identity collapses to initials without an adjacent workspace cue.
4. Search and settings affordances imply capabilities that are not available.

## Implementation decision

The highest-value next slice is a shared URL-addressable entity drawer system plus authorized entity detail payloads, followed by transaction/exception table filters and pagination. This connects existing domain objects without rebuilding backend foundations. Audit detail/findings, activity/provenance, and expanded reports follow on the same interaction model.

## Post-audit outcome

The shared entity system, transaction/exception investigation, dealer response/reviewer request transition, audit quick view, evidence-gated draft findings, dashboard routing, transaction/exception pagination and filtering, and reviewer exception/finding CSVs were implemented and browser-verified in this phase. See `docs/implementation-status-2026-08-10.md` for the completed slice and remaining boundaries.

## Validation limits

- Desktop audit used the active in-app browser viewport rather than every requested exact desktop size.
- One representative 390x844 mobile route was captured; every mobile route remains to be rechecked after implementation.
- Loading/error/destructive-confirmation states could not be fully audited because most primary actions are currently inert.
- Production security, concurrency, performance, and stakeholder correctness were not asserted from local seeded data.

# Cordena product-completeness implementation status

This document records what changed after the 2026-08-10 product audit and what intentionally remains for the next milestone.

## Implemented in this phase

### Shared entity interaction system

- Added one URL-addressable quick-view pattern using `entity` and `entityId` query parameters.
- Added authorized server detail payloads for dealerships, transactions/VINs, exceptions, documents, import batches, audits, and reconciliation runs.
- Added subtle, keyboard-accessible entity links across dealer and reviewer dashboards and tables.
- Related objects replace the open drawer in place, preserving the current page, filters, and pagination.
- Close, Escape, browser Back/Forward, refresh, and copied deep links preserve surrounding context.
- Right-side drawers are full-width on mobile and 576–672px on larger viewports.

### Dealership quick view

- Identity, registration, location, status, reporting period, transaction count, reconciliation rate, exception counts, fee impact, last import/run, active audit, and recent activity.
- Cross-links to import, run, and audit quick views.

### Transaction/VIN investigation

- Vehicle and stock identity, dealer, period, dates, fees, source, reconciliation state, and match/run context.
- Dealer-to-registration field comparison with Match/Difference/Unavailable states.
- Current exceptions, documents, import provenance, source record, ruleset, and activity.
- VIN links use the same transaction detail surface from dealer and reviewer contexts.

### Exception investigation and response

- Rule, reason, triggering values, priority, status, fee impact, due/assignee, run/ruleset, dealer responses, evidence/documents, and activity.
- Reviewer can start review or request dealer evidence using validated domain transitions.
- Dealer can submit a categorized response only when the exception is awaiting the dealer.
- Reviewer resolution requires a classification and written reason.
- Actions re-fetch the authorized record and expose the resulting activity.

### Audit and findings

- Audit quick view now includes scope, reviewer, dates, operational metrics, derived seven-step compliance progress, reconciliation run, scoped exceptions, findings, and activity.
- Reviewer can create a draft finding linked to an exception.
- Findings require linked evidence unless explicitly classified as insufficient evidence.
- Finding creation records evidence IDs, conclusion, classification, fee impact, actor, and activity.
- Findings link back to their source exception.

### Queues and dashboards

- Dealer transaction register now uses database-backed VIN search, reconciliation-state filtering, bounded 25-row pages, counts, and URL state.
- Dealer and reviewer exception queues now use database-backed VIN/rule/ID search, status filtering, impact filtering from dashboard links, bounded 25-row pages, counts, and URL state.
- Dashboard metrics now route to the relevant filtered queue, run, transaction register, dealership list, or audit work.
- Primary table entities have consistent hover and focus treatment without turning every cell blue.

### Reports

- Existing dealer reconciliation CSV remains available.
- Added reviewer exception CSV with generated timestamp, scope, filters, counts, status, priority, and impact.
- Added audit finding CSV with audit, dealership, exception, VIN, rule, classification, status, conclusion, evidence IDs, and impact.

### Design system, accessibility, and responsive changes

- Preserved the existing calm, flat, operational visual language and shadcn-owned native form controls.
- Kept 40–56px control sizes and 44px+ mobile targets.
- Added named, semantic links and forms; Radix Sheet retains focus trap, Escape close, overlay, and focus return.
- Added explicit pending, disabled, success, retry/error, true-empty, and filtered-empty behavior in the new workflows.
- Hardened date formatting against invalid/missing values after browser QA found a runtime exception.
- Converted mobile comparison rows to a readable stacked layout and made investigation drawers full-width.

## Verified workflows

1. Reviewer opens Northfield from the portfolio without leaving the dealership table.
2. Reviewer moves from dealership to run/import/audit through related links.
3. Reviewer opens an exception, understands FEE001, and requests dealer evidence.
4. Dealer opens the same exception and submits a categorized explanation.
5. Reviewer queue filtered to `RESPONSE_RECEIVED` shows the submitted case.
6. Dealer searches `A3B`, receives one transaction result, and opens its VIN detail without losing the query.
7. Transaction detail links back to exceptions and import provenance.
8. Reviewer opens the seeded audit and creates an evidence-gated `INSUFFICIENT_EVIDENCE` draft finding.
9. Audit progress, findings, and activity update from persisted state.
10. Mobile transaction quick view renders full-width with stacked comparison fields.

## Remaining product gaps

### P0/P1 next

- Production identity provider and explicit reviewer-portfolio assignment.
- Full audit creation/edit/status workflow, finding status transitions/approval, and audit close safeguards.
- Transaction correction command with field-level immutable revisions and re-reconciliation orchestration.
- Document upload UI from the product routes, protected preview, and evidence association workflow.
- Import rejected-row and mapping inspection beyond batch summary.
- Global VIN/entity search and command palette; the shell search affordance remains intentionally non-functional.
- Full dealership and transaction pages for investigations that exceed drawer depth.

### P2 next

- Database pagination/filter parity for dealerships, imports, documents, audits, and activity.
- Saved/predefined reviewer views for overdue, unassigned, evidence received, and high-impact cases.
- Human-readable activity grouping and resolved entity names for all automated events.
- Audit run-to-run delta display and historical exception/match comparison.
- Dealer readiness and evidence-requirement exports plus activity/fee-variance reports.
- Settings/account administration surfaces; current settings links should remain considered placeholders.

### Stakeholder validation

- Regulatory terminology, rules, fee schedules, resolution/finding classifications, evidence sufficiency, report columns, retention, reviewer assignment, and audit approval requirements.
- Whether reviewers can see a province-wide portfolio or require explicit organization/dealership assignments.
- Whether a reviewer “request evidence” transition needs due date, message, notification, and escalation policy.

## Recommended next milestone

Build the complete audit close-out and correction loop: field-level transaction correction -> immutable activity -> new reconciliation run -> response review -> evidence-backed finding approval -> scoped audit report. This closes the remaining gap between an interactive pilot and a defensible end-to-end compliance review.

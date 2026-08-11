# DealerSync user story matrix

Legend: **Complete** = usable end to end in primary product routes; **Partial** = domain/service or surface exists but workflow is incomplete; **Gap** = absent or inert.

## Dealer

| User story | Status before this phase | Acceptance signal |
|---|---|---|
| See what requires attention | Partial | Dashboard work metrics and rows open the matching filtered queue/entity. |
| See dealership transactions | Partial | Paginated, searchable register with count and stable URL state. |
| Inspect a transaction without losing table context | Gap | URL-addressable transaction/VIN drawer opens and Back restores the table. |
| Understand why a transaction was flagged | Gap | Related exception rule, trigger, comparison, and recommended action are visible. |
| Compare dealer and registration records | Gap | Field comparison labels match/difference/unavailable and identifies source. |
| See every exception for a VIN | Gap | VIN detail lists current and historical exceptions. |
| Provide an explanation | Partial | Categorized response form persists, shows feedback, and changes status. |
| Attach evidence | Partial | Authorized upload links document/evidence to the exception and refreshes detail. |
| See response review state | Gap | Response and reviewer outcome appear in exception history. |
| See missing documents | Partial | Missing-evidence rules link to required documents and upload action. |
| Import transaction data | Partial | Map, validate, commit, and see completion feedback. |
| Inspect import errors | Gap | Batch detail exposes rejected/warning rows and recovery guidance. |
| Correct bad records while preserving source | Gap | Field correction records source/current value, actor, time, and reason. |
| Export current records | Partial | CSV works; readiness/evidence outputs remain. |
| Understand reporting readiness | Partial | Metrics connect to contributing records and show period/run provenance. |

## Reviewer

| User story | Status before this phase | Acceptance signal |
|---|---|---|
| See dealerships needing attention | Partial | Prioritized dashboard rows and metrics open filtered records. |
| Understand a dealership's position | Gap | Reusable dealership drawer shows period, run, counts, impact, audit, and activity. |
| Inspect every open exception | Partial | Paginated, filterable queue with authorized detail. |
| Click a VIN anywhere | Gap | Same VIN/transaction drawer opens throughout reviewer product. |
| See the generating rule | Partial | Rule description, version, trigger values, and run are present in detail. |
| Compare source records | Gap | Transaction comparison exposes dealer vs registration values and provenance. |
| Inspect evidence | Gap | Related documents/evidence have metadata and protected preview/download. |
| Request additional evidence | Gap | Reviewer action transitions status and records request/activity. |
| Review dealer explanations | Gap | Latest and historical responses are visible with actor/timestamp. |
| Make a resolution decision | Partial | Required type/reason, confirmation, persisted transition, and feedback. |
| Understand previous decisions | Gap | VIN/dealership history resolves human-readable activity. |
| Create and manage an audit | Gap | Audit create/detail/checkpoints and status flow work. |
| Create findings from exceptions | Gap | Finding requires linked exception and supporting evidence/insufficiency. |
| Export findings | Gap | Filtered findings CSV/printable output with scope and generated time. |
| See full activity history | Gap | Readable, grouped activity with entity links. |
| Determine provenance | Gap | Source/batch/raw/normalized/corrected/run/human layers are inspectable. |

## Administrator

| User story | Status before this phase | Acceptance signal |
|---|---|---|
| Configure reconciliation rules | Gap | Versioned rule changes require permission and create activity. |
| Configure fee schedules | Gap | Effective-dated fees are validated and auditable. |
| Manage organizations and users | Gap | Scoped CRUD, role validation, invitation/deactivation, and audit trail. |
| Inspect system configuration | Gap | Read-only configuration and version surface. |

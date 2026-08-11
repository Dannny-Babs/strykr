# DealerSync UI redesign — design QA

## Sources and comparison setup

- Governing specification: `DealerSync UI System Redesign — Implementation Plan v2` supplied in the task.
- Structural reference: `/var/folders/wm/mchwgsg907zgrvp9ggfqhcf00000gp/T/codex-clipboard-040b2fea-0e4c-4e05-8f5a-29f8b23748aa.png` (2048×1365). This is a density, sidebar, chrome, and spacing reference rather than the same product state.
- Exact prior product state: `/tmp/dealersync-ui-plan-audit-2026-08-10/01-reviewer-dashboard.png` (1440×900 source capture).
- Redesigned reviewer dashboard: `/private/tmp/dealersync-redesign-reviewer-dashboard-1084.png` (1084×774) and `/private/tmp/dealersync-redesign-reviewer-dashboard-1440.png` (1440×900).
- Redesigned dealer dashboard: `/private/tmp/dealersync-redesign-dealer-dashboard-1440.png` (1440×900).
- Redesigned reviewer reports: `/private/tmp/dealersync-redesign-reviewer-reports-1440.png` (1440×900).
- Redesigned mobile reviewer dashboard: `/private/tmp/dealersync-redesign-reviewer-dashboard-390.png` (390×844).
- Redesigned mobile dealer transactions: `/private/tmp/dealersync-redesign-dealer-transactions-390.png` (390×844).
- Browser density: device-scale output normalized to CSS-pixel captures.

## States inspected

- Reviewer and dealer authenticated shells, expanded desktop navigation, 288px mobile navigation, and route breadcrumbs.
- Reviewer and dealer dashboards with persisted KPI values, chart summaries, tooltips, tables, and mobile stacking.
- Reviewer reports, reviewer investigation queue, dealer transactions, mobile record cards, pagination, filters, sorting, and empty-state implementations.
- Page-scoped transaction selection, selected count, clear-selection action, and selected export action.
- Global search minimum-query, loading, grouped result, keyboard selection, and no-result states.
- Entity drawer loading skeleton, loaded details, nested navigation, full-screen mobile width, retry/copy-link/close behavior.
- Sign-in at desktop and mobile widths, reviewer and dealer authentication, account menu, and sign-out.
- Document upload and CSV import controls were checked against their live API-backed implementations.

## Comparison and findings history

1. P2 — the first redesigned desktop capture overflowed horizontally because the content inset retained `w-full` beside the 264px sidebar. Fixed by making the inset `min-w-0 flex-1`; recapture confirmed the shell and content grid remain inside the viewport.
2. P2 — reviewer dashboard metrics and sidebar count were capped at 200 while the persisted investigation queue contained 272 open exceptions. Removed the query limit; the dashboard, sidebar, and queue now share the live count.
3. P2 — drawer loading used a centered spinner, inconsistent with the final content geometry. Replaced it with a two-column definition-grid and section-row skeleton.
4. P2 — reviewer audit sort controls from the contract were absent. Added URL-backed Newest, Due soonest, and Status sorting with stable ID tie-breaks and audit/dealership search.
5. P2 — small button variants and drawer microcopy could render outside the locked control/type scale. Normalized button variants to 28/32px permitted targets and forced legacy 10/11px utility remnants inside the product boundary to the 12/16 scale.
6. P3 — compared with the inspiration image, DealerSync intentionally retains less empty canvas because operational metrics, charts, and work queues are decision-supporting content. The shared qualities—achromatic chrome, grouped navigation, thin borders, restrained radii, compact typography, and low-shadow surfaces—are preserved.

## Final rubric

- Hierarchy and readability: passed. Page identity, primary action, metrics, analysis, and prioritized work read in the correct order.
- Layout and spacing: passed. Sidebar is 264px expanded, 64px collapsed, 288px mobile; header is 56px; product frame uses 16/24/32px responsive padding and a 1440px maximum.
- Typography and tokens: passed. Inter is loaded at 400/500/600; product output is constrained to the six-size scale, approved neutral/status/chart colors, 6/8/10/14px radii, and tabular numerals.
- Components and chrome: passed. Resting cards, controls, tables, and drawers have no unapproved shadow; blue is reserved for record links, focus, and chart data.
- Responsive behavior: passed. KPI 4→2→1 behavior, stacked chart cards, mobile record lists, mobile navigation, and full-screen drawers were exercised at 390×844.
- Interaction and accessibility: passed. Search keyboard navigation, Escape dismissal, focus-visible treatment, accessible chart summaries/tables, status text/glyphs, live result counts, and selection feedback are present.
- Runtime health: passed. No Next.js error overlay, failed record state, or failed API response appeared during the exercised browser flows; test, lint, typecheck, and production build all pass.

final result: passed

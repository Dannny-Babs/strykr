# Cordena UI redesign — design QA

## Sources and comparison setup

- Governing specification: `Cordena UI System Redesign — Implementation Plan v2` supplied in the task.
- Structural reference: `/var/folders/wm/mchwgsg907zgrvp9ggfqhcf00000gp/T/codex-clipboard-040b2fea-0e4c-4e05-8f5a-29f8b23748aa.png` (2048×1365). This is a density, sidebar, chrome, and spacing reference rather than the same product state.
- Exact prior product state: `/tmp/cordena-ui-plan-audit-2026-08-10/01-reviewer-dashboard.png` (1440×900 source capture).
- Redesigned reviewer dashboard: `/private/tmp/cordena-redesign-reviewer-dashboard-1084.png` (1084×774) and `/private/tmp/cordena-redesign-reviewer-dashboard-1440.png` (1440×900).
- Redesigned dealer dashboard: `/private/tmp/cordena-redesign-dealer-dashboard-1440.png` (1440×900).
- Redesigned reviewer reports: `/private/tmp/cordena-redesign-reviewer-reports-1440.png` (1440×900).
- Redesigned mobile reviewer dashboard: `/private/tmp/cordena-redesign-reviewer-dashboard-390.png` (390×844).
- Redesigned mobile dealer transactions: `/private/tmp/cordena-redesign-dealer-transactions-390.png` (390×844).
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
6. P3 — compared with the inspiration image, Cordena intentionally retains less empty canvas because operational metrics, charts, and work queues are decision-supporting content. The shared qualities—achromatic chrome, grouped navigation, thin borders, restrained radii, compact typography, and low-shadow surfaces—are preserved.

## Final rubric

- Hierarchy and readability: passed. Page identity, primary action, metrics, analysis, and prioritized work read in the correct order.
- Layout and spacing: passed. Sidebar is 264px expanded, 64px collapsed, 288px mobile; header is 56px; product frame uses 16/24/32px responsive padding and a 1440px maximum.
- Typography and tokens: passed. Inter is loaded at 400/500/600; product output is constrained to the six-size scale, approved neutral/status/chart colors, 6/8/10/14px radii, and tabular numerals.
- Components and chrome: passed. Resting cards, controls, tables, and drawers have no unapproved shadow; blue is reserved for record links, focus, and chart data.
- Responsive behavior: passed. KPI 4→2→1 behavior, stacked chart cards, mobile record lists, mobile navigation, and full-screen drawers were exercised at 390×844.
- Interaction and accessibility: passed. Search keyboard navigation, Escape dismissal, focus-visible treatment, accessible chart summaries/tables, status text/glyphs, live result counts, and selection feedback are present.
- Runtime health: passed. No Next.js error overlay, failed record state, or failed API response appeared during the exercised browser flows; test, lint, typecheck, and production build all pass.

final result: passed

---

# Shared import and document uploader refinement — design QA (2026-08-14)

## Sources and comparison setup

- Source visual truth: `/var/folders/wm/mchwgsg907zgrvp9ggfqhcf00000gp/T/codex-clipboard-9ba17729-e897-4e71-a317-e2ac434a14cb.png` (710×364 px), refined by the current browser annotation on `browser:Click to upload or drag and drop CSV files up to 25 MB` requesting a smaller upload surface with more breathing room around the dashed boundary.
- Selected-file source truth: `/var/folders/wm/mchwgsg907zgrvp9ggfqhcf00000gp/T/codex-clipboard-88a38326-a2f1-4793-8f87-26befc3f3ad8.png` (698×458 px), refined by current browser Comments 1–3 requesting a compact resting row, hover-only outline, select dropdown, and clearer guidance.
- Empty import implementation: `/private/tmp/cordena-import-modal-compact-empty-final.png` (779×1100 px).
- Selected-file implementation: `/private/tmp/cordena-import-modal-compact-resting-final.png` and `/private/tmp/cordena-import-modal-compact-hover-final.png` (779×1100 px each).
- Shared evidence-upload implementation: `/private/tmp/cordena-document-upload-shared-dropzone.png` (779×1100 px).
- CSS viewport: 779×1100 at device scale factor 1; all captures were compared at native 1× density.
- States: import modal empty, selected file resting, selected file hovered, record-type dropdown open/selected, selected file removed, validation review, and evidence-document modal empty.

## Full-view comparison evidence

- The import modal now uses a normal full-width select, a 176px-minimum upload target, compact icon and copy, and a shorter overall dialog that keeps the next action comfortably above the fold.
- The same upload geometry, icon treatment, dashed boundary, hover/focus behavior, and attachment-row pattern are shared with evidence-document upload rather than copied into a second implementation.
- The evidence dialog remains narrower than the import dialog, while the shared component adapts without clipping or crowding its longer supported-format line.

## Focused comparison evidence

- The selected-file resting capture has no visible enclosing border or tinted wrapper; the hover capture introduces a single subtle outline without changing the row's dimensions.
- Filename, file icon, size, progress/ready indicator, and removal action remain aligned in one 44px-minimum row.
- The upload target retains generous internal padding and a centered icon while removing the previous 300px height, 32px radius, 2px border, and oversized icon well.

## Findings and comparison history

1. P1 — the segmented record-type control did not match the requested form pattern. Replaced it with the existing Cordena select component and verified keyboard opening and option selection.
2. P1 — the 300px dropzone dominated the modal. Replaced it with the shared compact target at a 176px minimum height, 16px radius, 1px dashed boundary, 48px icon well, and balanced 40px horizontal/32px vertical padding.
3. P2 — the selected attachment retained a visible wrapper at rest. Removed the border source entirely; computed style now reports zero border width and a transparent ring at rest, with the outline appearing only on hover or focus-within.
4. P2 — the original bottom guidance was procedural and brand-led. Replaced it with: “We’ll check the file first. You’ll review any warnings or rejected rows before anything is added.”
5. P2 — evidence uploads still used a browser-native file input. Extracted the upload target and selected-file row into one shared component and applied it to both source imports and evidence documents.
6. P2 — the import UI advertised 25 MB while both server workflows enforce 10 MB. Client checks and visible helper copy now match the actual 10 MB limit.
7. Post-fix captures show no remaining actionable P0, P1, or P2 mismatch in the annotated regions.

## Required fidelity surfaces

- Fonts and typography: passed; compact 12–15px supporting text and the existing Cordena font hierarchy remain readable without competing with the modal title.
- Spacing and layout rhythm: passed; dropzone and attachment row are materially smaller, maintain consistent 20px section spacing, and do not cause footer displacement.
- Colors and visual tokens: passed; neutral resting surfaces and subdued cobalt focus/hover tokens follow the existing product system.
- Image quality and asset fidelity: passed; standard upload and document glyphs use the project's installed icon library with no placeholder or improvised image assets.
- Copy and content: passed; import and document formats are explicit, guidance is review-oriented, and displayed size limits match server behavior.
- Interaction and accessibility: passed; select keyboard interaction, file removal, validation transition, disabled actions, hover-only row outline, drag/drop semantics, and accessible control names were exercised.
- Runtime health: passed; targeted lint, TypeScript, and all 41 tests pass. Browser captures rendered without console errors.

final result: passed

---

# Dealer import modal — design QA (2026-08-14)

## Sources and comparison setup

- Source visual truth: `/var/folders/wm/mchwgsg907zgrvp9ggfqhcf00000gp/T/codex-clipboard-9ba17729-e897-4e71-a317-e2ac434a14cb.png` (710×364 px).
- Selected-file source truth: `/var/folders/wm/mchwgsg907zgrvp9ggfqhcf00000gp/T/codex-clipboard-88a38326-a2f1-4793-8f87-26befc3f3ad8.png` (698×458 px).
- Browser-rendered implementation: `/private/tmp/cordena-import-modal-empty-revised.png` (779×1100 px viewport).
- Focused implementation region: `/private/tmp/cordena-import-dropzone-focused.png` (622×301 px).
- Selected-file implementation: `/private/tmp/cordena-import-attachment-row.png` (1280×720 px viewport) and focused crop `/private/tmp/cordena-import-attachment-row-focused.png` (672×126 px).
- State: dealership source-record import modal open, transaction-register type selected, no file selected.
- Density normalization: both sources were reviewed at their native 1× pixel density; the focused implementation crop isolates the upload target for proportional comparison.

## Full-view comparison evidence

- The modal is centered with a restrained overlay, one clear heading, a vertical record-type → upload → validate flow, and a footer that keeps the disabled validation action visible.
- The import page implementation removes the former embedded import panel and places `Import records` in the page header, leaving the import-history table as the page's primary content.

## Focused comparison evidence

- The implementation matches the reference's large rounded dashed target, centered haloed upload icon, strong “Click to upload” lead, drag-and-drop instruction, and supported-file note.
- Cordena intentionally uses its subdued cobalt/neutral tokens rather than the reference's brown border and limits the accepted copy to CSV because the existing import API does not support image or document formats.
- The selected-file state matches the second reference's nested light surface, document icon, prominent filename, progress indicator, tabular file size, and clear × removal action. It is intentionally single-file because Cordena creates one import batch per source file.

## Findings and comparison history

1. P2 — the first browser capture used a 256px-high upload target, which felt compressed beside the 710×364 reference. Fixed by increasing the target to a 300px minimum height, 32px radius, 64px icon well, 28px icon, and larger upload copy.
2. Post-fix capture confirmed that the upload surface now carries the modal's visual weight and maintains clear spacing at the 779×1100 test viewport.
3. No remaining P0, P1, or P2 visual differences were found in the supplied empty-upload state.
4. P2 — the first selected-file implementation used a generic muted card, smaller metadata, and a trash icon. Replaced it with the reference's inset attachment-row treatment, inline size, validation progress/success state, and × action. Removal now cancels an active validation request instead of becoming disabled.
5. Post-fix capture confirmed the selected-file hierarchy and row geometry at the 1280×720 test viewport with no route-scoped console errors.

## Required fidelity surfaces

- Fonts and typography: passed; existing Cordena font and weights are preserved while the upload lead receives enough scale to match the reference hierarchy.
- Spacing and layout rhythm: passed; the drop target is 622×301 px in the focused capture, with centered content and deliberate separation from record type and footer.
- Colors and visual tokens: passed with intentional adaptation to Cordena's existing neutral/cobalt system.
- Image quality and asset fidelity: passed; the supplied design contains no raster asset beyond a standard upload icon, implemented with the project's existing icon library.
- Copy and content: passed with product-specific adaptation from general attachments to CSV source-record imports.
- Interaction and accessibility: modal open/close and responsive dialog rendering were exercised; drag/drop, keyboard-accessible file selection, CSV/25 MB client checks, cancellable file removal, validation, and import states are implemented. The selected-file validating state was rendered directly for browser comparison.
- Runtime health: targeted lint, TypeScript, and 41 tests pass. The isolated modal preview rendered with no route-scoped console errors.

final result: passed

# Accessibility findings and framework review

## Scope and evidence

The accessibility defects below are in the intentionally broken local exercise at `public/index.html` and `public/index.css`; they should not be interpreted as findings against the live GOV.UK calculator. I reviewed the page source and ran `npm run test:local-accessibility` on 3 November 2026.

The run reported 8 scenarios: the local keyboard smoke scenario passed; three local accessibility scenarios failed; and four calculator scenarios failed before reaching the service because this environment blocked `www.gov.uk` with `net::ERR_NETWORK_ACCESS_DENIED`. The local failures below are backed by the local tests and axe output. The remote failures provide no accessibility evidence about GOV.UK.

## Accessibility issues found

### Bug report: Contact fields have no programmatic labels

- **ID:** LOCAL-ACC-01
- **Severity:** High
- **Status:** Reproduced in the local exercise
- **Location:** `public/index.html`, contact form
- **Steps to reproduce:** Open the local accessibility exercise, tab through the contact form, and enter text into the Full name, Email, and message fields.
- **Expected:** Each form control has a persistent visible `<label>` associated with its input. A screen reader announces a meaningful name for each field, including after a value is entered.
- **Actual:** The controls have placeholder text but no associated labels. The placeholder is replaced by typed content, so the field has no persistent visible label. `LOCAL-04` fails because the populated fields have zero associated labels.
- **Impact:** Screen-reader users may encounter unnamed fields; sighted users can lose the field prompt once they start typing.
- **Suggested fix:** Add a visible `<label for="…">` for each input and textarea, with matching unique `id` values. Keep placeholders optional examples, not the only label.
- **Evidence:** `features/non-functional-testing/accessibility/local-app.feature` (`LOCAL-04`) and the failed assertion in `step-definitions/accessibility.steps.ts`.

### Other local page issues

- **LOCAL-ACC-02 — Missing document and landmark structure (serious/moderate axe findings):** The page has no `<title>`, no `lang` on `<html>`, no main landmark, no level-one heading, and most page content is outside landmarks. Axe reported `document-title`, `html-has-lang`, `landmark-one-main`, `page-has-heading-one`, and `region`.
- **LOCAL-ACC-03 — Robot illustration has no alternative text (critical axe finding):** The `<img>` in `public/index.html` has no `alt` attribute. Add descriptive alt text if the robot conveys information, or `alt=""` if it is decorative.
- **LOCAL-ACC-04 — Page does not reflow at 320 CSS pixels:** The local reflow check measured 1,090 CSS pixels of content against a 320-pixel viewport. The stylesheet gives the form section a fixed 800-pixel width and the image a fixed 700-pixel width; content is also hidden by `overflow: hidden`, which can conceal rather than solve overflow.
- **LOCAL-ACC-05 — Placeholder text has low contrast:** `#aaaaaa` placeholder text on the white input background has approximately 2.3:1 contrast, below the 4.5:1 WCAG AA target for normal-size text. Use a darker prompt color and retain a visible label so the prompt is not the sole instruction.

These violations are confirmed on the local teaching fixture. The automated axe scan reported six rule violations (document title, language, image alternative, main landmark, heading hierarchy, and landmark regions); the custom checks separately caught missing field labels and mobile overflow.

## Accessibility test coverage gaps

- **Keyboard journey uses native radio navigation:** The calculator journey now tabs to the first worker-type radio, then uses the down arrow to reach “No” for the regular-worker path. This follows native radio-group behavior, where the group is one Tab stop; Tab alone does not visit each radio. The test checks focus on the intended radio before selecting it. A full order assertion from a consistent document starting point remains useful future coverage.
- **Native browser zoom remains manual:** The feature correctly tags its 400% case as `@manual`; CSS `zoom` is only an approximation and should not be described as equivalent to browser zoom.
- **Automated scans are not conformance certification:** Axe catches many detectable issues but does not replace manual keyboard and assistive-technology checks, including announcements, reading order, and error recovery.

## Framework strengths

- Accessibility journeys cover keyboard use, focus visibility, narrow reflow, error/result states, and axe scans at several calculator stages.
- The local exercise deliberately contains defects and the scenarios fail on findings instead of treating known defects as expected passes.
- Page classes centralize browser interactions, while tests report actionable evidence.

## Follow-up changes

- The local calculator numeric question now renders a separate heading and an explicitly associated label for its number input, keeping the answer control discoverable by role and label.
- The representative regular-worker keyboard journey accounts for native radio-group Tab behavior by moving from the first radio to the second with an arrow key.
- These are source-level updates; this review has not been rerun to verify their effect.

## Further considerations with more time

1. Keep local accessibility selection separate from live calculator journeys. `test:local-accessibility` now selects the local exercise scenarios explicitly with `@LOCAL-01` through `@LOCAL-04`; verify this filter in the next run and consider replacing the individual IDs with a dedicated `@local_accessibility` tag if the local suite grows.
2. Make the local test page self-contained. It loads Google Fonts and a remote icon script; restricted-network runs record those requests as failures. Bundle dependencies or use local assets/fallbacks so accessibility results are deterministic.
3. Add a natural keyboard-order assertion that does not programmatically focus every element, and include a check that validation errors are announced and focus moves appropriately.
4. Run native 400% browser zoom and representative screen-reader checks manually on supported platforms; record browser, OS, assistive technology, and results with the report.
5. When network access is available, review the live calculator's axe and manual findings separately from the local defect fixture. Do not infer production accessibility status from this local exercise.


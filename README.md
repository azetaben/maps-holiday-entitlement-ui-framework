# MaPS QE UI technical task

An automated UI test framework for the
GOV.UK [Calculate holiday entitlement](https://www.gov.uk/calculate-your-holiday-entitlement) service. It uses
Playwright for browser automation, Cucumber for Gherkin scenarios, and TypeScript for implementation.

## What is included

The default test run starts the local app and runs a deterministic keyboard smoke journey and local link check. The
local suites (`test`, `test:local:all`, and `test:page-health:local`) use the checked-in local exercise and do not need
GOV.UK access. Scenarios tagged `@requires_network` depend on the live GOV.UK service and run with `test:network` (or
its `test:live` alias). Use `test:network` to check live behavior and `test:local:all` for deterministic local checks.
`npm run check:steps` performs a Cucumber dry run to find Gherkin steps without matching definitions, without opening
a browser. Independent expected-value fixtures live in `test_data/`; shared framework URLs, browser settings, viewports,
and timeouts live in `config/framework.json`.

The local calculator fixture in `public/calculator/` supports deterministic regular-days and irregular-hours journeys.
It is a controlled test target for framework behavior; live-service scenarios remain the authority for GOV.UK page
content and production calculations. Cucumber writes a `reliability-summary-*.json` artifact after each run, grouped
into local, live-service, and cross-browser suites with pass and retry rates.

## Fast checks and scheduled live monitoring

Run `npm run check` for type checking, Cucumber step and route audits, Gherkin parser compatibility,
unit tests, lint, and formatting. The Gherkin AST route audit is unit-tested with literal routes,
Scenario Outline values, and misspellings. Its parser and message dependencies are pinned to the
versions used by `@cucumber/cucumber`; `npm run check:gherkin` enforces that alignment.

Jenkins schedules the `@requires_network` suite weekly on the primary multibranch branch only. The
`RUN_NETWORK_TESTS` parameter remains available for an intentional manual run on another branch.
The live run has its own Cucumber JUnit and HTML reports under `reports/live-network/`; its Allure
results carry the `LIVE_SERVICE` label for filtering. Review the Jenkins JUnit trend and Allure
results after each scheduled run. Every build archives `reports/jenkins-branch-gate.json`, which
compares the expected branch-gate decision with whether the stage actually ran. See
[`docs/policy-decisions.md`](docs/policy-decisions.md) for the Jenkins verification evidence still
needed from the configured job and the unresolved 29 February anniversary rule.

## Prerequisites

- Node.js 20 or later with npm
- Network access to GOV.UK for `npm run test:network`
- Java 8 or later to generate Allure reports

## Install

From this directory, install the project dependencies and browser engines:

```bash
npm install
npx playwright install chromium firefox webkit
```

## Run

```bash
# Run the local deterministic smoke and link checks
npm test

# Run local accessibility and page-health checks, including known defects
npm run test:local:all

# Run core calculator journeys against the deterministic local target
npm run test:local:calculator

# Run the local core journeys in Chromium, Firefox, and WebKit
npm run test:local:browsers

# Run the GOV.UK scenarios requiring network access
npm run test:network

# Run one Chromium GOV.UK smoke journey
npm run test:live:smoke

# Alias for the live GOV.UK suite
npm run test:live

# Check Gherkin step bindings without opening a browser
npm run check:steps

# Verify calculator page names and Scenario Outline values against PageManager routes
npm run check:routes

# Run locally tagged smoke scenarios
npm run test:smoke

# Audit links, buttons, or images on local index.html and the GOV.UK calculator
npm run test:links
npm run test:buttons
npm run test:images

# Run the equivalent Cucumber BDD checks for both pages
npm run test:page-health

# Measure full document load times across a calculator journey (5-second default per page)
npm run test:performance

# Run GOV.UK cookie banner and settings scenarios
npm run test:cookies

# Run only the local page health checks (the server starts automatically)
npm run test:page-health:local

# Start the local accessibility exercise for manual review:
npm start

# Run its accessibility scenarios (the test command manages the local server):
npm run test:local-accessibility

# Show the browser while the scenarios run
npm run test:headed

# Run the cross-browser compatibility profile in Chromium, Firefox, and WebKit
npm run test:browsers

# Run the eight tagged end-to-end journeys across calculator capabilities
npm run test:e2e

# Check TypeScript types
npm run typecheck

# Run fast Playwright-native unit tests for the oracle, route map, and diagnostics
npm run test:unit

# Run the Cucumber hook integration check with a local failing first-party request
npm run test:hook-integration

# Run type, step-binding, unit-test, lint, and formatting checks
npm run check
```

The default browser mode is headless Chromium. To use another compatible deployment, set `HOLIDAY_BASE_URL` or
`BASE_URL`. The canonical GOV.UK URL is configured in `config/framework.json`. For example, in PowerShell:

```powershell
$env:BASE_URL = 'https://www.gov.uk/calculate-your-holiday-entitlement'
npm test
```

Framework logs are written to the console and `logs/framework.log`. They include scenario and step outcomes, browser
console errors, failed requests, and HTTP error responses. Set `LOG_FILE` to change the file path, `LOG_MAX_SIZE` and
`LOG_MAX_FILES` to control rotation, and `LOG_LEVEL` to control verbosity (`error`, `warn`, `info`, `http`, `verbose`,
`debug`, or `silly`); defaults are `info`, 5 MB, and five files.

`HEADLESS=false` is set by the `test:headed` script. Cucumber writes `reports/cucumber-report.html`, and the Allure
formatter writes raw results to `allure-results/` on each run. A full-page screenshot and browser diagnostic JSON are
attached to failed scenarios in both reports.

Browser matrices write a JSON summary per browser with scenario pass rate, retry rate, duration, failure category,
and explicit browser exclusions. Local journeys require a 100% pass rate; live profiles default to 100% and both
profiles allow at most a 5% retry rate. Override thresholds with `STABILITY_MIN_PASS_RATE_LOCAL`,
`STABILITY_MIN_PASS_RATE_LIVE`, and `STABILITY_MAX_RETRY_RATE`. Live browser exclusions require both
`LIVE_BROWSER_EXCLUDE` and a human-readable `LIVE_BROWSER_EXCLUDE_REASON`; TLS errors are never bypassed by ignoring
certificate validation. The live smoke profile runs only the tagged regular-worker journey in Chromium.

## Docker

The image uses Playwright 1.64.1 on Ubuntu Noble to match the installed Playwright package and browser binaries. It
installs dependencies with `npm ci` and runs the suite with Chromium headless.

```bash
docker build -t holiday-entitlement-ui .
docker run --rm holiday-entitlement-ui
```

Mount `/app/reports` and `/app/allure-results` as Docker volumes when you need generated reports on the host.

## Jenkins

The `Jenkinsfile` runs in the matching Playwright container, installs from the lockfile, runs `npm run check`, the
local suite, the local browser matrix, and the diagnostic-hook integration check. A weekly timer runs the live
network scenarios as a separate stage; parameters can also trigger the live smoke, network, and live cross-browser
profiles separately. The live-network stage writes its Cucumber HTML and JUnit reports under
`reports/live-network/`, labels its Allure results as `LIVE_SERVICE`, and retains Allure history across weekly runs.
Each build also archives `reports/jenkins-branch-gate.json`, recording branch metadata, timer causes, and whether
the live stage was expected to run. Jenkins publishes JUnit results so pass/fail trends can be reviewed separately
by suite, and archives Cucumber/browser-matrix summaries. Configure a Linux agent with
Docker and the Jenkins Allure plugin, including a command-line installation named `Allure-2.46.1`.

### Allure reporting

Every test command clears stale raw results, carries the previous generated report's history forward, and writes
executor metadata for local, GitHub Actions, or Jenkins runs. The reporter adds environment details, framework labels,
tag-derived labels, optional issue/test case links, and categories for assertion and browser/network failures.

Generate and open the report after running the suite:

```bash
npm run allure:generate
npm run allure:open
```

To serve a temporary report directly from the raw results, run `npm run allure:serve`. Allure report commands require
Java 8 or later. Generated Allure files are ignored by Git.

Feature/scenario tags can set Allure labels:

```gherkin
@epic:holiday-entitlement @feature:calculator-entry-journey @severity:critical @owner:team-name
```

Use `@story:name`, `@suite:name`, and `@layer:name` in the same way. Configure optional issue and test management link
templates with `ALLURE_ISSUE_URL_TEMPLATE` and `ALLURE_TMS_URL_TEMPLATE` (include `%s` where the tag identifier
belongs), then use `@issue:ID` or `@tms:ID`. `ALLURE_OWNER` and `ALLURE_LAYER` set report-wide labels.
`ALLURE_RESULTS_DIR`, `ALLURE_REPORT_DIR`, and `ALLURE_REPORT_NAME` customize output locations and report name. Keep the
results directory and report directory inside the project workspace.

## Project structure

```text
features/                            # Cucumber journeys, mostly flat with one non-functional-testing folder
pages/                               # Page-specific locators and actions
  base/                              # BasePage and PageManager
step-definitions/                    # Definitions grouped by behavior and page
support/                             # Browser lifecycle, diagnostics and journey helpers
config/framework.json               # Shared URLs, browser defaults, viewports, timeouts
public/                              # Local accessibility exercise, calculator fixture and assets
scripts/                             # Local server, reports, and suite runners
test_data/                           # Independent calculation fixtures, oracle, contracts and sample inputs
tests/unit/                          # Playwright-native fast unit tests
tests/integration/                   # Playwright-driven checks of Cucumber hook lifecycle
utils/                               # Reusable page-health checks
cucumber.js                          # Cucumber loading, reporting and Allure options
tsconfig.json                        # Strict TypeScript settings
package.json                         # Dependencies and common commands
```

The browser is launched once per Cucumber worker and closed after that worker finishes. Each scenario gets its own
browser context and page, so cookies and form state do not leak between cases. `PageManager` provides page classes that
extend `BasePage`. Shared defaults are in `config/framework.json`; environment variables such as `BROWSER`,
`BROWSER_WIDTH`, `BROWSER_HEIGHT`, `STEP_TIMEOUT`, `ACTION_TIMEOUT`, `NAVIGATION_TIMEOUT`, `EXPECT_TIMEOUT`,
`SCREENSHOT_TIMEOUT`, `RETRY`, `PARALLEL`, `CHANNEL`, `TRACE`, `HAR`, `HAR_DIR`, `REPORT_DIR`, and `ARTIFACTS_DIR`
override them. `HOLIDAY_BASE_URL` (or `BASE_URL`) selects the calculator deployment. `test-options.ts` validates these
values once and supplies the shared browser and reporting settings to both Playwright and the Cucumber browser
lifecycle. `TRACE` accepts `off`, `on-failure`, `on-first-retry`, or `on`; retained traces are attached to Cucumber
results. `HAR=record` writes one archive per worker under `HAR_DIR`; `HAR=replay` serves
`HAR_DIR/holiday-calculator.har` and fails requests absent from the archive.

## Adding coverage

For conventions on feature wording, page-class responsibilities, independent fixtures, and test layers, see the
[`contribution guide`](docs/contributing.md).
For the framework assessment, resolved bug report, and further considerations, see
[`framework-assessment.md`](docs/framework-assessment.md).
For the local accessibility issue list, bug report, and accessibility coverage review, see
[`accessibility-review.md`](docs/accessibility-review.md).

1. Add a scenario to the capability feature that owns the behavior: `holiday-entitlement.feature`,
   `regular-entitlement.feature`, `irregular-hours-accrual.feature`, `employment-periods.feature`, or
   `validation-and-recovery.feature`.
2. Reuse existing step definitions where possible; add a step in `step-definitions` only when it represents a
   new action or assertion.
3. Put page-specific locators and interactions in `pages`.
4. Use role-based locators (for example, `getByRole('button', { name: 'Continue' })`) and Playwright's auto-waiting
   assertions.
5. Use `@smoke` for fast, critical-path cases. Add other tags as the suite grows and select them with Cucumber tag
   expressions.
6. Add pure calculation, route mapping, and framework-helper coverage under `tests/unit/`; run it with `npm run test:unit`.
7. Keep expected calculation values traceable to an agreed decision table or an independent oracle; avoid deriving
   expected results from the same logic the application uses.

`npm run test:unit` runs only the Chromium project, skips the local web server, and uses tests that do not request a
browser page. Keep browser-driven Playwright tests separate, with their own command and server setup, if that suite is
introduced later.

The independent entitlement oracle deliberately rejects leave-year calculations anchored on 29 February until the
anniversary rule is confirmed. Do not turn that case into an expected numeric result without recording the agreed rule.

Suggested next coverage includes both employment-pattern branches, full leave year and part leave year calculations,
accrued leave per pay period, back navigation, invalid and boundary inputs, and keyboard-only journey completion.
Calculation scenarios should use independently reviewed expected results.

## Troubleshooting

- **Browser executable missing:** run `npx playwright install chromium` after `npm install`.
- **GOV.UK unreachable:** check network access and try the URL in a browser. The suite currently tests the public live
  service.
- **Selector assertion fails:** inspect the page and current service copy. GOV.UK can update wording or journey routes;
  update the page object only after confirming the UI change.
- **Type errors:** run `npm run typecheck` and ensure dependencies have been installed.

## Accessibility coverage

The accessibility features include keyboard-only calculator journeys, narrow viewport reflow checks, and axe-core WCAG
2.2 AA scans at key journey stages. Native 400% browser zoom is tagged `@manual` because viewport scaling does not
reproduce browser zoom faithfully; the default run excludes manual scenarios. The local exercise page is intentionally
supplied with accessibility defects so the audit and reflow scenarios report the real findings as failures.

### Findings in the local accessibility exercise

These findings are from the intentionally defective `public/index.html` exercise, not from the live GOV.UK calculator.
On 3 November 2026, the local accessibility scenarios reported:

- Missing document title and `lang` attribute, main landmark, level-one heading, and landmark regions.
- Robot image missing alternative text.
- Contact fields with no associated labels; placeholder text is the only visible prompt and disappears as users type.
- Horizontal overflow at 320 CSS pixels: the check measured 1,090 pixels of content against a 320-pixel viewport.
- Placeholder text color `#aaaaaa` on white, approximately 2.3:1 contrast, below the 4.5:1 target for normal text.

**Bug report — LOCAL-ACC-01, high:** Contact fields have no programmatic labels. Expected: each field has a persistent visible, associated label and an accessible name. Actual: the name, email, and message fields rely on placeholders; the `LOCAL-04` check finds no associated labels after entry. Suggested fix: add visible `<label>` elements with matching `for`/`id` values. See the [full accessibility review](docs/accessibility-review.md) for evidence and other findings.

The representative regular-worker keyboard journey follows native radio-group behavior: Tab reaches the first worker-type option, and an arrow key moves to “No.” Numeric questions in the local calculator expose a separately headed, labelled number input. Native 400% zoom remains a manual check; axe scans are useful but do not establish full WCAG conformance. See the [accessibility review](docs/accessibility-review.md) and [policy decisions](docs/policy-decisions.md) for details. These recent source updates have not yet been verified by rerunning the accessibility suite.

Start the local exercise with `npm start` (http://localhost:8080/) and run it with `npm run test:local-accessibility`.
The command selects the local exercise scenarios by their `@LOCAL-01` through `@LOCAL-04` tags, avoiding unrelated
live calculator journeys. It writes Cucumber and Allure artifacts. Further framework considerations are in the
[accessibility review](docs/accessibility-review.md).

## Page health scripts

The three standalone Playwright scripts open `public/index.html` and the published GOV.UK calculator, then check each
page for broken or unverifiable links, buttons with missing names, disabled state, or undefined inline handlers, and
images that fail to load or omit an `alt` attribute. Run them with `npm run test:links`, `npm run test:buttons`, or
`npm run test:images`. They return a failing exit code if they find issues or cannot reach a target page. External link
and GOV.UK checks need network access.

The equivalent Cucumber checks live in `non-functional-testing`. `npm run test:page-health` runs the GOV.UK
checks for links, buttons, and images. `npm run test:page-health:local` runs the local examples and manages the local
server. Set `HOLIDAY_BASE_URL` or `BASE_URL` to check a reachable calculator deployment instead of the configured GOV.UK
URL.

The full-navigation performance journey lives in `non-functional-testing`. Run it with
`npm run test:performance`; it records browser navigation timing for the landing page, each calculator question, and
the result page in the Cucumber report. The load-event budget is set in `config/framework.json` and can be overridden
for a run with `PAGE_LOAD_BUDGET_MS`. Shared URLs, browser settings, viewports, timeouts, and performance defaults are
maintained in that configuration file; environment variables provide run-specific overrides.

## Framework review and further considerations

The framework separates behavior scenarios, page interactions, and independent expected-value data. The local
calculator provides a deterministic target for framework behavior, while live GOV.UK scenarios check the public
service. Keep their evidence distinct: passing local journeys do not establish production content, accessibility, or
calculation correctness.

Accessibility coverage includes keyboard journeys, reflow checks, error and result states, and axe scans. The
regular-worker keyboard journey follows native radio-group behavior: Tab enters the group and arrow keys move between
options. A useful next step is to assert the complete focus sequence from a known starting point, including error
recovery and focus after navigation. Axe scans help find detectable issues but do not replace manual screen-reader
checks or native browser zoom checks.

The local calculator currently covers representative regular-days and irregular-hours journeys. Broader deterministic
coverage could include annualised hours, compressed hours, shifts, part-year calculations, back navigation, changed
answers, invalid and boundary inputs, and restart behavior. Add expected entitlement values only when they have an
independent source or an agreed product decision. In particular, the 29 February anniversary rule remains unresolved;
see [policy decisions](docs/policy-decisions.md).

With more time, I would also:

- Remove unnecessary remote dependencies from the local exercise and pin browser/runtime versions in CI to improve
  repeatability.
- Review page-object locators where similar controls appear across questions, while keeping scenario assertions in
  steps or shared contracts.
- Record manual screen-reader and 400% browser zoom checks with the browser, operating system, assistive technology,
  and outcome.
- Verify the Jenkins scheduled branch gate using primary and non-primary timer builds, and retain their links and
  archived evidence.
- Rerun the local accessibility suite after the latest keyboard and input-markup updates, then prioritize any
  confirmed findings before expanding coverage.

To launch the local page, run `npm install`, then `npm start`, and open the configured local URL in a browser. You can
override the local page URL with `LOCAL_APP_URL` or its port with `LOCAL_APP_PORT`.

## Design notes and limits

- This is a small maintainable foundation rather than broad coverage of all calculator rules.
- Tests target the public service and can be affected by service availability or content changes.
- The framework currently runs sequentially, keeping public-service load low and reports easy to diagnose. Parallel
  execution can be added after stable journey coverage is established.
- No API or internal GOV.UK implementation details are assumed.

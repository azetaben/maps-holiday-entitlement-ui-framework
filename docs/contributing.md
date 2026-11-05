# Contributing to the UI test framework

This guide describes where new coverage belongs and what each layer should own. Keep changes small and follow the existing naming and style in the neighboring files.

## Gherkin features

- Add scenarios to the feature that owns the capability. The current calculator features are mostly flat under `features/`; reuse a focused existing feature before creating another one.
- Describe the user's behavior and expected outcome. Keep selectors, CSS, browser mechanics, and implementation details out of feature text.
- Reuse existing steps. Add a step definition only for a new domain action or outcome, and keep it as glue between the feature and page/helper APIs.
- Add `@smoke` only to critical-path coverage. Use existing tags such as `@requires_network` and `@manual` consistently with their current suite selection.
- When a step names a calculator page, use a supported route name. `npm run check:routes` validates literal names and Scenario Outline examples against `PageManager`.

## Page classes

- Put page-specific locators and browser interactions in `pages/<page>.page.ts`; extend `BasePage` and register calculator routes in `pages/base/page-manager.ts` when applicable.
- Keep thin route-specific page classes when their names clarify PageManager dispatch or journey intent, even if they inherit shared date or numeric controls. Add a short comment explaining that role; remove an alias only when no route or caller benefits from the distinct name.
- Keep locators close to the action that uses them. Prefer accessible locators such as `getByRole` and `getByLabel`; use selectors only when the UI has no reliable accessible locator.
- Page classes perform actions and expose state. Keep expectations and scenario-specific assertions in step definitions or shared test contracts, not page classes.
- Do not add fixed sleeps to wait for the UI. Use Playwright actions and web-first assertions, which wait for the relevant state.
- For keyboard journeys, begin from a known focus position and use actual keyboard input. Native radio groups usually have one Tab stop; use arrow keys to move between options, then assert which option has focus before selecting it.
- Unknown calculator route names must throw. Add or update `tests/unit/page-manager.spec.ts` whenever the route map changes.

## Fixtures and calculation rules

- Store stable, named input and expected-value cases in `test_data/Fixtures.ts`. Keep the route-specific fields typed as a discriminated union so a fixture cannot omit required dates.
- Keep expected values independent from the UI and from the implementation being tested. Add a brief rationale beside each fixture and cite the applicable guidance or approved decision near the fixture set.
- Put reusable calculation logic in `test_data/EntitlementOracle.ts`; cover it directly in `tests/unit/entitlement-oracle.spec.ts`.
- Only encode rules supported by an authoritative source or an agreed product decision. The 29 February anniversary rule remains unsupported until the service owner confirms it; do not add a guessed expected value.
- Put shared runtime defaults such as URLs, timeouts, viewports, and performance budgets in `config/framework.json`; use environment variables only for intentional deployment or run-specific overrides. Keep test expectations as named contracts or fixtures in test code rather than runtime configuration, so a configuration change cannot silently weaken an assertion. Keep scenario examples explicit when their literal values explain the behavior under test.

## Tests and checks

- Add fast, deterministic logic and routing checks under `tests/unit/`. Avoid opening a browser page in these tests unless the behavior specifically requires one.
- Put browser-driven checks of Cucumber hooks and lifecycle under `tests/integration/`, and run them with `npm run test:hook-integration`.
- Keep GOV.UK-dependent journeys tagged for the live suite. Use local fixtures for deterministic framework behavior; do not make `npm run check` depend on external network access.
- Before submitting a change, run `npm run check`. For hook or report changes, also run `npm run test:hook-integration`. For service behavior changes, run the relevant live scenario when GOV.UK is reachable and report any environment limitation clearly.
- Keep new route names, fixture cases, and failure policies covered by tests. Update the README when adding a new test command or changing the suite layout.

## Review checklist

- [ ] Feature text describes behavior and uses existing steps where possible.
- [ ] Page-specific locators and actions live in page classes; assertions live in test steps or contracts.
- [ ] Expected values have a source or approved rationale and do not come from the system under test.
- [ ] New routes, fixtures, and policy exceptions have focused test coverage.
- [ ] Relevant checks pass, and live-service/network limitations are recorded.

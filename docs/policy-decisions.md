# Open policy decisions

## Keyboard navigation within radio groups

- **Decision:** Keyboard journeys follow the browser's native radio-group interaction: Tab enters the group at its current/default tab stop, and arrow keys move among its options.
- **Rationale:** Radio buttons in one named group are presented as one stop in sequential keyboard navigation. Requiring Tab to visit every radio would test behavior browsers do not provide by default.
- **Application:** The regular-worker keyboard scenario tabs to the first worker-type option and presses ArrowDown to reach “No,” then checks focus before selecting. Keep the scenario keyboard-only and avoid programmatically focusing the target.
- **Review:** Revisit this approach if the application introduces custom radio widgets or a custom keyboard interaction model.

## 29 February leave-year anniversary

- **Status:** Pending service-owner confirmation.
- **Current behavior:** The entitlement oracle rejects calculations whose leave-year anniversary falls on 29 February when the corresponding year is not a leap year.
- **Reason:** The oracle must not invent a product convention where the published rule does not specify one.
- **Decision needed:** Confirm whether the anniversary is treated as 28 February, 1 March, or another rule, and identify the authoritative service guidance or regulation.
- **After confirmation:** Record the owner and source here, update `test_data/EntitlementOracle.ts`, replace the unsupported-case assertion in `tests/unit/entitlement-oracle.spec.ts` with the agreed expected result, and add the matching calculation fixture.

## Jenkins multibranch scheduled live suite

- **Configured guard:** The weekly timer stage runs network scenarios only when Jenkins reports `BRANCH_IS_PRIMARY == 'true'`. A manually selected `RUN_NETWORK_TESTS` parameter can run them on another branch.
- **Runtime verification required:** Confirm the job is a multibranch pipeline, its primary branch is identified by Jenkins, and a timer-triggered non-primary build skips “Live network scenarios.” Confirm the primary branch runs it once per weekly cron and publishes JUnit/Allure results and archived artifacts.
- **Automated evidence:** Each build archives `reports/jenkins-branch-gate.json` with branch metadata, trigger causes, the expected gate decision, whether the live stage actually ran, and a `consistent`/`review` outcome.
- **Runtime verification required:** Inspect one primary timer build and one non-primary timer build, save their build URLs, and confirm the JSON reports `consistent` for both. Recheck after changing the job type or branch source plugin.

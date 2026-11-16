# VI Common Ground admin end-to-end tests

Playwright tests use the Page Object Model (POM) so page selectors and user
actions live outside the test cases.

## Structure

```text
agent/                 Planner Agent instructions for Playwright workflows
testcase-input/        Manual test-case .txt files for the Planner Agent
src/
  constants/          Shared routes, UI labels, and expected values
  pages/              Page objects and their locators/actions
  utils/              Cross-page helpers (auth, Flutter, page waits)
tests/
  auth/               Authentication-related test scenarios
  navigation/         Sidebar navigation scenarios
  fixtures/           Shared Playwright fixtures
playwright.config.ts   Base URL, browser projects, timeouts, and reporting
```

## Setup and run

Install dependencies and browser binaries:

```sh
npm ci
npx playwright install
```

Run the suite in Google Chrome:

```sh
npm test
```

Useful commands:

```sh
npm run test:ui
npm run test:headed
npm run test:debug
npm run test:regression
npm run report
```

Set `BASE_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `.env` (copy from
`.env.example`). Playwright loads `.env` automatically (requires Node.js 20.12+);
existing shell variables take precedence. Never commit credentials.

The **Planner Agent** workflow is saved in [agent/planner.md](agent/planner.md)
and applied through `AGENTS.md`. Add a `.txt` file under `testcase-input/`, then
in chat send **only that path** (for example `testcase-input/my-case.txt`). The
agent parses the file, creates or updates specs, runs tests, analyzes the Playwright
report and `test-results/`, fixes test issues when possible, and reports the final
result.

Reusable test instructions are in `skills/vi-commonground-playwright/SKILL.md`.
Shared authentication helpers are in `src/utils/auth.utils.ts`. Shared UI
expectation constants live under `src/constants/` and should be imported from
there instead of inlining lists in specs.

The HTML report is written to `playwright-report/`; failure artifacts are
written to `test-results/`.

# Test case input

Add one `.txt` file per manual scenario. In Cursor, send **only the file path** (for example `testcase-input/my-case.txt`). The Planner Agent will parse it, write or update Playwright tests, run them, analyze reports, fix test issues when possible, and return PASSED / FAILED / BLOCKED.

Required tags:

- `Testcase Name:`
- `Step to Reproduce:` (or `Steps to Reproduce:`)

Optional tags:

- `Tags:` — Playwright labels (default `regression`)
- `Preconditions:`
- `Environment:`
- `Suggestion:` (or `Suggestions:`) — Extra effort for a step when creating or updating a script

Do not include `Expected Result:` or `Test File:`. Assertions come from the steps; the planner picks or creates the spec and any missing page methods.

Copy [sign-in-form.example.txt](sign-in-form.example.txt) as a template.

Shared Admin Login cases live under [admin-login/](admin-login/). Positive scenarios include the `positive` tag; negative scenarios include the `negative` tag.

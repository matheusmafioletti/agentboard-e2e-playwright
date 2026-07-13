# AgentBoard — E2E Tests (Playwright)

[![E2E Tests](https://github.com/your-org/agentboard/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/agentboard/actions/workflows/ci.yml)

End-to-end test suite for the AgentBoard Kanban platform using [Playwright](https://playwright.dev/).
Covers the full user journey: register → login → tenant selection → board interaction → member invites.

---

## Prerequisites

- Node.js 20 LTS
- Running services: `auth-service` (`:8080`), `board-service` (`:8081`), `agentboard-web` (`:5173`)

---

## Setup

```bash
# 1. Install dependencies
npm ci

# 2. Install Playwright browsers
npx playwright install --with-deps chromium

# 3. Configure environment
cp .env.example .env
# Edit .env with your local values
```

---

## Running Tests

| Command | Description |
|---|---|
| `npm test` | Run all tests headless (Chromium) |
| `npm run test:headed` | Run with visible browser window |
| `npm run test:debug` | Open Playwright Inspector for step-by-step debug |
| `npm run test:report` | Open the last HTML report |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript compilation check |

### Run a specific project or file

```bash
# Chromium only
npx playwright test --project=chromium

# Single spec file
npx playwright test tests/auth/login.spec.ts

# Test matching a title pattern
npx playwright test -g "successful login"

# All browsers
npx playwright test --project=chromium --project=firefox --project=webkit
```

### Allure report

```bash
# Generate and open
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```

---

## Architecture

### Page Object Model (POM)

Every interactive UI surface has a dedicated Page Object under `page-objects/`:

| Class | Route | Responsibility |
|---|---|---|
| `BasePage` | — | Shared `navigate`, `waitForPageLoad`, `takeScreenshot` |
| `LoginPage` | `/login` | Email/password login, error assertion |
| `RegisterPage` | `/register` | New user + tenant registration |
| `BoardPage` | `/board` | Kanban: create items, drag-and-drop columns |
| `InviteAcceptPage` | `/invite/accept` | Token-based invite acceptance |

**Rule:** All locators live in Page Objects. Test files contain **zero** CSS selectors or `locator()` calls.

### Fixtures Pattern (`support/fixtures.ts`)

All tests import `{ test, expect }` from `../../support/fixtures`, never from `@playwright/test` directly.
This allows Page Objects to be injected per-test without `beforeEach` boilerplate:

```typescript
// test file
import { test, expect } from '../../support/fixtures';

test('login works', async ({ loginPage, page }) => {
  await loginPage.goto();
  await loginPage.login('user@example.com', 'secret');
  await expect(page).toHaveURL(/board/);
});
```

### API Clients & Test Data Service (`api/`)

HTTP calls are organized into service-specific clients that read base URLs from `support/environment.ts`:

| Layer | Path | Responsibility |
|---|---|---|
| `BaseApiClient` | `api/clients/BaseApiClient.ts` | Shared `fetch`, JSON headers, error handling |
| `AuthApiClient` | `api/clients/AuthApiClient.ts` | Register, login, tenants, invites |
| `BoardApiClient` | `api/clients/BoardApiClient.ts` | Projects, work-items |
| `TestDataService` | `api/services/TestDataService.ts` | High-level test setup workflows |

Tests import the singleton `testData` service for API setup — bypassing UI forms for fast, deterministic `beforeEach` hooks:

```typescript
import { testData } from '../../api/services/TestDataService';
import { generateEmail, generateTenantName } from '../../support/generators';
import { setAuthInLocalStorage } from '../../support/browser';

const user = await testData.createAuthenticatedUser(email, password, generateTenantName());
const project = await testData.createProject(user.jwt, user.tenantId, 'My Project');
await setAuthInLocalStorage(page, user.jwt, { userId: user.userId, ... });
```

Domain types live in `api/types/` (`auth.types.ts`, `board.types.ts`). Generators and browser helpers remain in `support/generators.ts` and `support/browser.ts`.

---

## Design Decisions

### Why Playwright?

- Native browser automation with true multi-browser support (Chromium, Firefox, WebKit)
- Built-in auto-waiting eliminates manual `sleep` calls
- First-class TypeScript support
- Trace viewer + screenshot/video on failure out of the box

### Why POM over inline selectors?

Centralizing locators means a single selector change in the UI requires updating exactly **one** file.
Test files describe **intent** (`loginPage.login()`), not implementation (`page.locator('#email').fill()`).

### Why fixtures instead of `beforeEach` for Page Objects?

Playwright's `test.extend` fixtures are composable, typed, and automatically scoped per test.
They avoid the need for `let` variables at `describe` scope and remove ordering dependencies between hooks.

### Why `fullyParallel: false`?

AgentBoard flows are stateful (shared DB with tenant data). Running in parallel without proper test isolation
would create race conditions. Workers are set to `1` locally and `2` in CI to balance speed and stability.

---

## CI / GitHub Actions

The workflow at `.github/workflows/ci.yml` runs on every push/PR to `main`:

1. Installs dependencies (`npm ci`)
2. Installs Chromium browser
3. Lints (`npm run lint`)
4. Type-checks (`npm run typecheck`)
5. Runs E2E tests against `BASE_URL` (configurable via GitHub variable `STAGING_URL`)
6. Uploads Allure results and Playwright HTML report as artifacts (30-day retention)

Firefox and WebKit are available via `workflow_dispatch` but skipped in the default CI run for speed.

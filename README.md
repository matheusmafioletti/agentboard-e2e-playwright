# AgentBoard — E2E Tests (Playwright)

End-to-end test suite for AgentBoard using [Playwright](https://playwright.dev/).

## Prerequisites

- Node.js 20 LTS
- Docker Compose v2 (for `@local` / `ENVIRONMENT=e2e`)
- GHCR read access (`docker login ghcr.io`)

## Setup

```bash
npm ci
npx playwright install --with-deps chromium
cp .env.example .env   # optional for native local dev
```

## Running Tests

| Command | Description |
|---------|-------------|
| `npm test` | All tests (default `ENVIRONMENT=local`) |
| `npm run test:local` | `@local` tests against compose (`ENVIRONMENT=e2e`) |
| `npm run test:staging` | `@staging` smoke against demo URL |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

### Full stack (recommended for @local)

From workspace root:

```bash
./scripts/run-e2e-local.sh playwright [--reset]
```

Or manually:

```bash
cd ../agentboard-infra
cp .env.e2e.example .env.e2e
./scripts/e2e-up.sh && ./scripts/seed-e2e-data.sh
cd ../agentboard-e2e-playwright
npm run test:local
```

## Environment presets

| `ENVIRONMENT` | Base URL |
|---------------|----------|
| `local` | `http://localhost:5173` (native dev) |
| `e2e` | `http://localhost:8080` (Docker Compose) |
| `staging` | `vars.BASE_URL` / demo |

Filter tags: `TEST_TAGS=@local` or `TEST_TAGS=@staging`.

## CI

Workflow `.github/workflows/ci.yml`:

- **PR** → `@local` against compose (`e2e-latest` images)
- **repository_dispatch** (`e2e-app-pr`) → compose with PR image SHA tags
- **push main** → `@staging` smoke (no compose)
- **workflow_dispatch** → choose `local` or `staging`

### Secrets

| Secret / Var | Purpose |
|--------------|---------|
| `GHCR_READ_TOKEN` | Pull private images (or `GITHUB_TOKEN`) |
| `E2E_STAGING_USER_EMAIL` / `PASSWORD` | Seed user for `@staging` |
| `vars.BASE_URL` | Staging demo URL |

## Tags

Every test has exactly one of `@local` or `@staging`. See [e2e-tests.mdc](../../.cursor/rules/e2e-tests.mdc).

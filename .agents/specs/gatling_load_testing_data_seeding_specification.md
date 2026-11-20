# Specification: Gatling Load Testing & Test Data Seeding App (`@repo/load-test`)

## 1. Project Context & Objective
Build a standalone workspace (`apps/load-test`) inside an existing **Turborepo** monorepo alongside `apps/web` (frontend) and `apps/api` (backend).

This package serves **two primary goals**:
1. **High-Throughput Data Seeding (Pre-E2E):** Rapidly generate and inject thousands of realistic records via `apps/api` before **Playwright** E2E tests execute, ensuring realistic pagination, search, filtering, and stress-state testing without slow UI-based setup.
2. **Performance & Load Testing:** Execute automated smoke, load, and stress simulations against `apps/api` and `apps/web` with strict latency and error-rate assertions.

---

## 2. Tech Stack & Runtime Requirements
* **Monorepo Orchestrator:** Turborepo (`turbo.json`)
* **Language / SDK:** TypeScript using Gatling JS/TS SDK (`@gatling.io/core`, `@gatling.io/http`, `@gatling.io/cli`)
* **Runtime:** Node.js v24+ LTS (64-bit)
* **Data Generation:** `@faker-js/faker` (for deterministic, realistic mock payloads)
* **E2E Integration Target:** Playwright (consumes seeded state / manifest files produced by Gatling runs)

---

## 3. Directory Structure
Create the following structure inside `apps/load-test`:

```text
apps/load-test/
├── package.json
├── tsconfig.json
├── spec.md
├── .env.example
├── data/                        # Generated CSV/JSON feeders & E2E handoff manifests (gitignored)
│   └── .gitkeep
└── src/
    ├── config/
    │   └── env.ts               # Typed environment variables & Gatling getParameter() helpers
    ├── generators/
    │   └── seed-factory.ts      # Deterministic Faker builders + CSV/JSON feeder exporters
    ├── simulations/
    │   ├── seed.gatling.ts      # High-concurrency API seeding simulation (pre-Playwright)
    │   ├── api-load.gatling.ts  # Core API endpoints load & latency assertion test
    │   └── web-smoke.gatling.ts # Frontend SSR/static route availability & TTFB check
    └── utils/
        └── auth.ts              # Reusable login/token injection chain
```

---

## 4. Configuration & Environment Variables
All URLs, credentials, and volume knobs must be configurable via environment variables and Gatling parameters (`getParameter`):

| Variable | Default | Description |
| :--- | :--- | :--- |
| `API_URL` | `http://localhost:4000` | Base URL for `apps/api` |
| `WEB_URL` | `http://localhost:3000` | Base URL for `apps/web` |
| `TARGET_ENV` | `local` | Environment guard (`local`, `staging`, `ci`). Must abort if `production`. |
| `SEED_COUNT` | `5000` | Total number of records to generate and POST during seeding |
| `SEED_USERS` | `50` | Concurrent virtual users during seeding |
| `SEED_OUTPUT_MANIFEST` | `./data/e2e-manifest.json` | Output file containing IDs/credentials for Playwright to consume |
| `AUTH_EMAIL` | `admin@example.com` | Service/admin user email for authenticated seeding |
| `AUTH_PASSWORD` | `changeme` | Service/admin user password |

---

## 5. Functional Requirements

### 5.1 Deterministic Data Generator (`src/generators/seed-factory.ts`)
* Use `@faker-js/faker` with a configurable seed (`faker.seed(42)`) so runs are reproducible across CI builds.
* Generate a CSV feeder file (`data/users-and-items.csv`) containing `SEED_COUNT` rows prior to running the Gatling simulation.
* Include a unique `runId` or prefix (e.g., `e2e_seed_<timestamp>_`) on generated entities so Playwright tests can filter/assert against known records and cleanup scripts can purge test data safely.
* Write a lightweight manifest (`data/e2e-manifest.json`) with sample created IDs, search keywords, and test user credentials that Playwright's `globalSetup` or fixtures can read.

### 5.2 Pre-Playwright Seeding Simulation (`src/simulations/seed.gatling.ts`)
* **Safety Guard:** Fail immediately if `TARGET_ENV === "production"`.
* **Authentication:** Authenticate once or per virtual user via `POST /auth/login` (adjust endpoint to match `apps/api`), extract the JWT/session token via `.check(jsonPath("$.token").saveAs("authToken"))`, and attach `Authorization: Bearer #{authToken}` to subsequent requests.
* **Feeder Strategy:** Consume `data/users-and-items.csv` using `csv("users-and-items.csv").queue()` so every virtual user picks a unique record and stops cleanly when all `SEED_COUNT` rows are inserted.
* **Injection Profile:** Ramp up `SEED_USERS` (e.g., `rampUsers(50).during(15)`) and loop until the `.queue()` feeder is exhausted.
* **Assertions:**
  * `global().failedRequests().percent().lte(0.5)` (Ensure >= 99.5% of seeded records succeed)
  * `global().responseTime().percentile(95).lt(1000)`

### 5.3 API & Web Load Simulations (`api-load.gatling.ts` & `web-smoke.gatling.ts`)
* **`api-load.gatling.ts`:**
  * Simulate realistic read/write traffic (e.g., 80% `GET` list/search/detail endpoints with pagination queries, 20% `POST`/`PATCH` mutations).
  * Assert `p95 < 300ms`, `p99 < 800ms`, and `failedRequests().percent().is(0)`.
* **`web-smoke.gatling.ts`:**
  * Hit critical `apps/web` pages (`/`, `/login`, `/dashboard`) to verify SSR/edge rendering under concurrent load without triggering client-side JS execution.

---

## 6. Scripts & Turborepo Integration

### `apps/load-test/package.json`
```json
{
  "name": "@repo/load-test",
  "private": true,
  "scripts": {
    "generate:data": "tsx src/generators/seed-factory.ts",
    "seed:e2e": "npm run generate:data && gatling run --sources-folder src/simulations --simulation seed",
    "load:api": "gatling run --sources-folder src/simulations --simulation api-load",
    "load:web": "gatling run --sources-folder src/simulations --simulation web-smoke",
    "check-types": "tsc --noEmit"
  },
  "dependencies": {
    "@faker-js/faker": "^9.0.0",
    "@gatling.io/core": "latest",
    "@gatling.io/http": "latest"
  },
  "devDependencies": {
    "@gatling.io/cli": "latest",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0"
  }
}
```

### Root `turbo.json` Additions
```json
{
  "tasks": {
    "seed:e2e": {
      "cache": false,
      "env": ["API_URL", "TARGET_ENV", "SEED_COUNT", "SEED_USERS", "AUTH_EMAIL", "AUTH_PASSWORD"]
    },
    "load:api": {
      "cache": false,
      "env": ["API_URL", "TARGET_ENV"]
    },
    "load:web": {
      "cache": false,
      "env": ["WEB_URL", "TARGET_ENV"]
    }
  }
}
```

---

## 7. Implementation Checklist for AI Assistant
1. Initialize `apps/load-test` with `package.json` and `tsconfig.json` extending the monorepo base TypeScript config.
2. Implement `src/config/env.ts` with validation and production-environment protection.
3. Implement `src/generators/seed-factory.ts` to produce CSV feeders and `data/e2e-manifest.json`.
4. Implement `src/simulations/seed.gatling.ts` using `.queue()` CSV feeding, auth token extraction, and completion assertions.
5. Implement `src/simulations/api-load.gatling.ts` and `src/simulations/web-smoke.gatling.ts`.
6. Add `apps/load-test/data/*.csv`, `apps/load-test/data/*.json`, and `apps/load-test/target/` to `.gitignore`.
7. Verify `turbo run check-types --filter=@repo/load-test` passes cleanly.
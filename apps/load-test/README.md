# Load testing and E2E data seeding

The `@repo/load-test` workspace generates deterministic people records and uses Gatling to seed or load-test the API and smoke-test the web app.

It is designed to run only against local or staging-like environments. A run aborts immediately when `TARGET_ENV=production`.

For API runs, Gatling can either use a pre-issued `AUTH_TOKEN` or obtain one automatically through an Auth0 password grant.

## What it provides

- `generate:data` creates 5,000 deterministic records by default.
- `seed:e2e` generates the feeder and posts records to the protected people API.
- `load:api` runs read/write traffic and latency/error assertions against the API.
- `load:web` checks the web app's landing, login, and people routes.

## Prerequisites

- Node.js 24 or newer.
- MongoDB and the API running.
- The web app running for web smoke tests.
- A valid Auth0 access token for API seeding and API load tests.
- Java dependencies managed automatically by the Gatling CLI.

From the repository root, start the API and web app in separate terminals:

```bash
npm run dev --workspace=express-api
npm run dev --workspace=people
```

The default API and web URLs are:

- API: `http://localhost:3000`
- Web: `http://localhost:3000` (start it on a different port if the API uses port 3000)

This load-test package supports Auth0 username/password login through the password grant. It can also use a pre-issued access token through `AUTH_TOKEN`.

## Configure

Copy the example file:

```bash
cp apps/load-test/.env.example apps/load-test/.env
```

Run Gatling commands from `apps/load-test` or export the variables in your shell. Shell variables and command parameters override the `.env` values.

| Variable | Default | Purpose |
| --- | --- | --- |
| `API_URL` | `http://localhost:3000` | API base URL |
| `WEB_URL` | `http://localhost:3000` | Web app base URL |
| `TARGET_ENV` | `local` | Environment guard; `production` is prohibited |
| `SEED_COUNT` | `5000` | Number of generated people |
| `SEED_USERS` | `50` | Virtual users used during seeding |
| `SEED_OUTPUT_MANIFEST` | `./data/e2e-manifest.json` | Playwright handoff manifest |
| `AUTH_EMAIL` | `admin@example.com` | Recorded service identity in the manifest |
| `AUTH_PASSWORD` | `changeme` | Recorded placeholder credential in the manifest |
| `AUTH_TOKEN` | none | Auth0 bearer token for protected API requests |
| `AUTH0_DOMAIN` | none | Auth0 tenant domain used for password-grant authentication |
| `AUTH0_AUDIENCE` | none | API audience issued in the Auth0 access token |
| `AUTH0_CLIENT_ID` | none | Auth0 application client ID |
| `AUTH0_CLIENT_SECRET` | none | Auth0 application client secret, required by confidential applications |

Do not put real passwords or tokens in `.env.example`, source code, or the manifest. Keep local secrets in an untracked environment file or secret manager.

## Authenticate to the API

Choose one of these methods.

### Gatling password grant

Set the user, password, tenant, audience, and application credentials before running:

```bash
export AUTH_EMAIL="load-user@example.com"
export AUTH_PASSWORD="<password>"
export AUTH0_DOMAIN="https://your-tenant.us.auth0.com"
export AUTH0_AUDIENCE="people-register"
export AUTH0_CLIENT_ID="<client-id>"
export AUTH0_CLIENT_SECRET="<client-secret>"
```

Do not set `AUTH_TOKEN` in this mode. Before each virtual user starts seeding or loading, Gatling posts to `${AUTH0_DOMAIN}/oauth/token`, extracts `access_token`, saves it as `authToken`, and attaches `Authorization: Bearer #{authToken}` to API requests.

Password grants require Auth0 to permit the grant for the application and database connection. This flow is intended for controlled test environments. It is generally preferable to use machine-to-machine client credentials for an automated load test when user-level claims are not required.

### Pre-issued token

If you already have a token, set it directly:

The API's REST client demonstrates the Auth0 client-credentials flow. Copy the REST client environment example and fill in its client credentials:

```bash
cp apps/api/rest-client/.env.example apps/api/rest-client/.env
```

Run `getAuthToken` in [people.http](../api/rest-client/people.http), then export the returned `access_token`:

```bash
export AUTH_TOKEN="<access_token>"
```

The token must be accepted by the API's `AUTH0_DOMAIN` and `AUTH0_AUDIENCE` configuration.

## Generate test data

Generate a reproducible CSV feeder and handoff manifest:

```bash
npm run generate:data --workspace=@repo/load-test
```

This creates:

- `apps/load-test/data/users-and-items.csv`
- `apps/load-test/data/e2e-manifest.json`

The Faker seed is fixed, and every generated name and email contains a unique run ID such as `e2e_seed_<timestamp>_`. The same run settings produce reproducible Faker data, while the run ID changes between executions.

The manifest can be consumed by Playwright `globalSetup` or fixtures. It includes the run ID, search keywords, sample credential metadata, and seed count. The API currently returns created IDs in responses; that data can be added to the manifest after seeding if Playwright needs exact record IDs.

## Seed the API

Start MongoDB and the API, then run:

```bash
npm run seed:e2e --workspace=@repo/load-test
```

Set `AUTH_TOKEN` to skip username/password authentication, or set `AUTH_EMAIL`, `AUTH_PASSWORD`, `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, and `AUTH0_CLIENT_ID` to authenticate automatically.

The seeding command first regenerates the CSV, then ramps virtual users over 15 seconds and posts one row per virtual-user iteration to `POST /api/people`.

Gatling assertions require:

- Failed requests below or equal to 0.5 percent.
- P95 response time below 1,000 ms.

Override volume from the environment or as Gatling parameters:

```bash
SEED_COUNT=1000 SEED_USERS=25 \
  npm run seed:e2e --workspace=@repo/load-test
```

## Run API load

With the API running and a valid token exported:

```bash
npm run load:api --workspace=@repo/load-test
```

The simulation combines read and write traffic:

- 80 percent read traffic to people list/search/detail-style routes.
- 20 percent person creation traffic.
- P95 response time below 300 ms.
- P99 response time below 800 ms.
- Zero failed requests.

Adjust URLs and environment guard with shell variables:

```bash
API_URL=http://localhost:3000 TARGET_ENV=staging \
  AUTH_TOKEN="<access_token>" \
  npm run load:api --workspace=@repo/load-test
```

## Run the web smoke test

Start the web app, then run:

```bash
WEB_URL=http://localhost:3000 npm run load:web --workspace=@repo/load-test
```

The simulation sends 20 virtual users to `/`, `/login`, and `/in/people` as static routes. Gatling checks that every request succeeds and that P95 response time is below 1,000 ms.

If the web app is running on the same port as the API, assign it a different port before starting Vite and set `WEB_URL` accordingly.

## Validate TypeScript

```bash
npm run check-types --workspace=@repo/load-test
```

This catches invalid Gatling DSL and configuration types without starting a simulation.

## Turborepo integration

The package participates in the monorepo under `@repo/load-test`. It can also be run through Turborepo:

```bash
turbo run generate:data --filter=@repo/load-test
turbo run seed:e2e --filter=@repo/load-test
turbo run load:api --filter=@repo/load-test
turbo run load:web --filter=@repo/load-test
```

The Turborepo tasks disable caching and pass relevant environment variables to Gatling.

## Generated output

Generated CSV, JSON, and Gatling reports are excluded from Git:

- `apps/load-test/data/*.csv`
- `apps/load-test/data/*.json`
- `apps/load-test/target/`

Gatling reports are written under `apps/load-test/results/` by the CLI. Keep them out of source control unless the team has an intentional reporting workflow.

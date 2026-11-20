# Load testing and E2E data seeding

The `@repo/load-test` workspace generates deterministic people records and uses Gatling to seed or load-test the API and smoke-test the web app.

It is designed to run only against local or staging-like environments. A run aborts immediately when `TARGET_ENV=production`.

Every simulation obtains its Auth0 access token through `getToken` before starting Gatling. A simulation is not launched if Auth0 cannot issue a token.

## What it provides

- `generate:manifest` writes a manifest describing the mock data used by the seed.
- `seed` posts every mock person to the protected people API.
- `load:api` runs read/write traffic and latency/error assertions against the API.
- `load:web` checks the web app's landing, login, and people routes.

## Prerequisites

- Node.js 24 or newer.
- MongoDB and the API running.
- The web app running for web smoke tests.
- Auth0 machine-to-machine application credentials.
- Java dependencies managed automatically by the Gatling CLI.

From the repository root, start the API and web app in separate terminals:

```bash
npm run dev --workspace=express-api
npm run dev --workspace=people
```

The default API and web URLs are:

- API: `http://localhost:3000`
- Web: `http://localhost:3000` (start it on a different port if the API uses port 3000)

The load-test package uses the Auth0 client-credentials grant. It does not accept a manually supplied token or use the password grant.

## Configure

Copy the example file and fill in the Auth0 values:

```bash
cp apps/load-test/.env.example apps/load-test/.env
```

All workspace scripts load `apps/load-test/.env` automatically using Node's `--env-file-if-exists` option. The file should contain `KEY=value` lines (without quotes around the variable name). Shell variables override values from `.env`.

To pass Gatling parameters explicitly, use its `name=value` CLI arguments. Environment variables in `.env` are also available to Gatling through the inherited process environment.

| Variable | Default | Purpose |
| --- | --- | --- |
| `API_URL` | `http://localhost:3000` | API base URL |
| `WEB_URL` | `http://localhost:3000` | Web app base URL |
| `TARGET_ENV` | `local` | Environment guard; `production` is prohibited |
| `SEED_OUTPUT_MANIFEST` | `./data/e2e-manifest.json` | Playwright handoff manifest |
| `AUTH0_DOMAIN` | none | Auth0 tenant origin |
| `AUTH0_AUDIENCE` | none | API audience issued in the Auth0 access token |
| `AUTH0_CLIENT_ID` | none | Auth0 application client ID |
| `AUTH0_CLIENT_SECRET` | none | Auth0 machine-to-machine application client secret |

Do not put real passwords or tokens in `.env.example`, source code, or the manifest. Keep local secrets in the untracked `apps/load-test/.env` file or a secret manager.

## Authenticate test runs

Set the Auth0 tenant, audience, and machine-to-machine application credentials:

```bash
export AUTH0_DOMAIN="https://your-tenant.us.auth0.com"
export AUTH0_AUDIENCE="people-register"
export AUTH0_CLIENT_ID="<client-id>"
export AUTH0_CLIENT_SECRET="<client-secret>"
```

All commands that run a simulation first call `getToken`, which requests a token with the client-credentials grant. The helper allows at most 20 Auth0 token requests per command execution; current commands request only one token and share it across the simulation. Authentication errors stop the command before seed data or load traffic is sent. The token is passed internally to Gatling and is not read from a user-provided `AUTH_TOKEN`.

## Generate test data

Generate the handoff manifest using all entries from `packages/mocks/src/people.ts`:

```bash
npm run generate:manifest --workspace=@repo/load-test
```

This creates `apps/load-test/data/e2e-manifest.json`. The Gatling simulation imports `mockPeople` from `@people/mocks` directly and feeds them to Gatling's in-memory `arrayFeeder`; no CSV file is involved.

The current mock dataset contains 125 people. Each mock's name and email are sent to the API; other mock properties are not accepted or stored by the current API.

The manifest can be consumed by Playwright `globalSetup` or fixtures. It includes the run ID, search keywords, and seed count. The API currently returns created IDs in responses; that data can be added to the manifest after seeding if Playwright needs exact record IDs.

## Seed the API

Start MongoDB and the API, then run:

```bash
npm run seed --workspace=@repo/load-test
```

Set the Auth0 environment variables described above. The seed command obtains a token before generating the handoff manifest, then starts Gatling and ramps 125 virtual users over 15 seconds. Each user consumes one unique mock record and sends one `POST /api/people`, so every mock is sent exactly once.

Gatling assertions require:

- Failed requests below or equal to 0.5 percent.
- P95 response time below 1,000 ms.

## Run API load

With the API running and Auth0 configured:

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
  npm run load:api --workspace=@repo/load-test
```

## Run the web smoke test

Start the web app, then run:

```bash
WEB_URL=http://localhost:3000 npm run load:web --workspace=@repo/load-test
```

This command also obtains an Auth0 token before Gatling starts. The simulation then sends 20 virtual users to `/`, `/login`, and `/in/people` as static routes. Gatling checks that every request succeeds and that P95 response time is below 1,000 ms.

If the web app is running on the same port as the API, assign it a different port before starting Vite and set `WEB_URL` accordingly.

## Validate TypeScript

```bash
npm run check-types --workspace=@repo/load-test
```

This catches invalid Gatling DSL and configuration types without starting a simulation.

## Turborepo integration

The package participates in the monorepo under `@repo/load-test`. It can also be run through Turborepo:

```bash
turbo run generate:manifest --filter=@repo/load-test
turbo run seed --filter=@repo/load-test
turbo run seed:e2e --filter=@repo/load-test
turbo run load:api --filter=@repo/load-test
turbo run load:web --filter=@repo/load-test
```

The Turborepo tasks disable caching and pass relevant environment variables to Gatling.

## Generated output

Generated JSON and Gatling reports are excluded from Git:

- `apps/load-test/data/*.json`
- `apps/load-test/target/`

Gatling reports are written under `apps/load-test/results/` by the CLI. Keep them out of source control unless the team has an intentional reporting workflow.

# Gatling Load Testing

This workspace seeds every person from `@people/mocks` using an in-memory Gatling feeder, then runs API load and web smoke simulations. It aborts when `TARGET_ENV=production`.

Every simulation must obtain a token through `getToken` before Gatling starts. Each command is capped at 20 Auth0 token requests; current commands request one token and share it for the run. Missing credentials or an invalid token response aborts the command before test traffic starts.

Commands:

- `npm run generate:manifest --workspace=@repo/load-test`
- `npm run seed --workspace=@repo/load-test`
- `npm run load:api --workspace=@repo/load-test`
- `npm run load:web --workspace=@repo/load-test`
- `npm run check-types --workspace=@repo/load-test`

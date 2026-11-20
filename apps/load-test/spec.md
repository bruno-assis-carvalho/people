# Gatling Load Testing

This workspace generates deterministic people records, seeds the protected API, and runs API load and web smoke simulations. It aborts when `TARGET_ENV=production`.

Commands:

- `npm run generate:data --workspace=@repo/load-test`
- `npm run seed:e2e --workspace=@repo/load-test`
- `npm run load:api --workspace=@repo/load-test`
- `npm run load:web --workspace=@repo/load-test`
- `npm run check-types --workspace=@repo/load-test`

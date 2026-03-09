# E2E Test Database Setup

## One-time setup

### 1. Recreate Docker volumes (to trigger init-db.sh)

The init script creates the `skye-hosts-test` database automatically when the postgres container initialises for the first time. Since you already have a running container, you need to recreate it:

```bash
cd apps/skye-hosts-api
pnpm db-down   # removes volumes
pnpm db        # recreates with init-db.sh
```

### 2. Copy `.env.e2e` from `.env.e2e` (already created)

The `.env.e2e` file has been created pointing to the test database (`skye-hosts-test` on port 25433). It's gitignored. If you need to update secrets, edit it like you would `.env.local`.

### 3. Run migrations on the test database

```bash
cd apps/skye-hosts-api
env-cmd -f .env.e2e pnpm typeorm migration:run
```

Or just start the API with `pnpm dev:e2e` — migrations run automatically on startup.

## Running e2e tests

From any frontend app:

```bash
# From the app directory (e.g. apps/skye-hosts-guest-website)
pnpm test:e2e
```

This will automatically:

1. Start the API server connected to the test DB (port 3003)
2. Start the frontend dev server
3. Reset and seed the test DB via `POST /seed/e2e-reset`
4. Run the Playwright tests

Or from the root:

```bash
pnpm test:e2e
```

## Test accounts (seeded automatically)

| Role  | Email          | Password     |
| ----- | -------------- | ------------ |
| Host  | host@test.com  | Password123! |
| Guest | guest@test.com | Password123! |

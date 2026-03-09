# Run PIN migration

After deploying the API, run the TypeORM migration to add `pinHash` and `pinSalt` columns to the `account` table:

```bash
pnpm --filter skye-hosts-api migration:run
```

This adds two nullable `character varying` columns. No data migration needed — existing users will have `null` PIN fields and will be prompted to set up a PIN on their next sign-in.

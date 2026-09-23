# database

Drizzle schema and PostgreSQL connection utilities for `tanstack-starter`.

Set `DATABASE_URL` in `packages/database/.env`. Apply committed migrations with:

```bash
pnpm --filter @repo/database migrate
```

To prototype schema changes against a disposable local database without creating
migration files, run:

```bash
pnpm --filter @repo/database push
```

Use `generate` followed by `migrate` for changes that will be deployed. Do not use
`push` against production databases.

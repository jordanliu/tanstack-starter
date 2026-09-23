# web

The TanStack Start app for `tanstack-starter`.

## Commands

```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web start
pnpm --filter web check-types
pnpm --filter web lint
```

## Local Environment

The app reads `apps/web/.env` when it runs under Vite. Configure `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and your email provider settings there.

## Routes

- `/` is the protected home page.
- `/login`, `/register`, and `/forgot-password` provide the starter auth screens.
- `/api/auth/*` is handled by Better Auth through a TanStack Start server route.

## Notes

- Routing lives in `src/app`.
- Shared UI components and global styles come from `@repo/ui`.
- Dark mode uses the shadcn/ui TanStack Start provider pattern.

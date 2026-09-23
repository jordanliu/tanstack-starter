# tanstack-starter

A TanStack Start starter with Better Auth, Drizzle, PostgreSQL, shadcn/ui, React Email, Vite, and Turborepo. It keeps the app and shared packages split cleanly so the web app can grow without flattening the monorepo.

## Project Structure

```text
tanstack-starter/
├── apps/
│   └── web/                 # TanStack Start application
├── packages/
│   ├── auth/                # Better Auth configuration and client helpers
│   ├── database/            # Drizzle schema and database utilities
│   ├── email/               # React Email templates and providers
│   ├── eslint-config/       # Shared ESLint configurations
│   ├── typescript-config/   # Shared TypeScript configurations
│   └── ui/                  # Shared shadcn/ui components and styles
└── turbo/                   # Turborepo generators
```

## Features

- Full-stack React with [TanStack Start](https://tanstack.com/start) and [Vite](https://vite.dev)
- Authentication with [Better Auth](https://www.better-auth.com/)
- Database access with [Drizzle ORM](https://orm.drizzle.team/) and [PostgreSQL](https://www.postgresql.org/)
- Shared UI built with [shadcn/ui](https://ui.shadcn.com) and [Tailwind CSS](https://tailwindcss.com)
- Email templates with [React Email](https://react.email)
- Password reset and verification email flows through Resend or SMTP
- Form handling with [react-hook-form](https://react-hook-form.com)
- Monorepo orchestration with [Turborepo](https://turbo.build/repo)

## Getting Started

### 1. Create a Project

Use this repository as a template or clone it directly:

```bash
git clone <repo-url> new-project
cd new-project
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

```bash
cp apps/web/.env.example apps/web/.env
cp packages/database/.env.example packages/database/.env
```

Edit the env files with your database, Better Auth, and email provider configuration.

### 4. Set Up the Database

```bash
pnpm --filter @repo/database generate
pnpm --filter @repo/database migrate
```

### 5. Start Development

```bash
pnpm dev
```

The web app runs at [http://localhost:3000](http://localhost:3000).

## Available Commands

```bash
pnpm dev          # Start development servers
pnpm build        # Build all packages and apps
pnpm start        # Start the production web server after building
pnpm lint         # Run ESLint across the workspace
pnpm test         # Run automated tests across the workspace
pnpm format       # Format TypeScript, TSX, and Markdown files
pnpm check-types  # Run TypeScript checks
```

## Database Commands

```bash
pnpm --filter @repo/database generate  # Generate migration files
pnpm --filter @repo/database migrate   # Apply committed migrations
pnpm --filter @repo/database push      # Sync a disposable local database only
pnpm --filter @repo/database studio    # Open Drizzle Studio
```

## Local Auth

Local email verification is disabled by default with `EMAIL_VERIFICATION_ENABLED=false`, so you can register and sign in without configuring email delivery. Password reset always requires either `EMAIL_API_KEY` for Resend or the `SMTP_*` settings. Set email verification to `true` once a provider is configured.

## Package-Specific Commands

```bash
pnpm --filter web dev           # Run only the TanStack Start app
pnpm --filter web build         # Build only the web app
pnpm --filter @repo/email dev   # Preview email templates
```

## Project Management

### Adding Packages

```bash
turbo gen
```

### Adding shadcn/ui Components

```bash
cd apps/web
pnpm dlx shadcn@latest add [component-name]
```

Components are added to the shared UI package and can be imported through `@repo/ui`.

### Managing Dependencies

```bash
pnpm --filter web add [package-name]
pnpm --filter @repo/ui add [package-name]
pnpm add -w [package-name]
```

## Deployment

The web app builds with Vite and emits a Nitro server bundle:

```bash
pnpm --filter web build
pnpm --filter web start
```

Set production environment variables before deploying:

```env
DATABASE_URL=your-production-database-url
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://your-domain.com
EMAIL_FROM=noreply@your-domain.com

# Configure Resend...
EMAIL_API_KEY=your-resend-api-key

# ...or configure SMTP instead.
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_SECURE=false

# Optional social providers
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

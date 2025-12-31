# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application built with the T3 Stack, featuring Better Auth for authentication and Drizzle ORM with Neon PostgreSQL for data persistence.

## Development Commands

### Local Development
```bash
pnpm dev                # Start dev server with Turbo
pnpm build              # Build for production
pnpm start              # Start production server
pnpm preview            # Build and start production server
```

### Database Management
```bash
pnpm db:generate        # Generate migration files from schema
pnpm db:migrate         # Run migrations
pnpm db:push            # Push schema changes directly to database
pnpm db:studio          # Open Drizzle Studio for database GUI
./start-database.sh     # Start local PostgreSQL container
```

### Code Quality
```bash
pnpm check              # Run Biome linter/formatter checks
pnpm check:write        # Auto-fix safe issues
pnpm check:unsafe       # Auto-fix including unsafe changes
pnpm typecheck          # Run TypeScript type checking
```

## Architecture

### Authentication Flow

The application uses Better Auth (NOT NextAuth - they are completely different packages):

- **Server configuration**: `src/server/better-auth/config.ts` exports the `auth` instance configured with:
  - Drizzle adapter for PostgreSQL persistence
  - Email/password authentication
  - GitHub OAuth provider
  - Environment-aware cookie settings (secure cookies in production, lax in development)

- **Client setup**: `src/server/better-auth/client.ts` exports `authClient` for React components

- **API handler**: `src/app/api/auth/[...all]/route.ts` handles all auth endpoints via Better Auth's Next.js handler

- **Database schema**: Better Auth tables (`user`, `session`, `account`, `verification`) are defined in `src/server/db/schema.ts`

### Database Architecture

- **ORM**: Drizzle ORM with Neon HTTP driver for serverless PostgreSQL
- **Connection**: Single `db` instance exported from `src/server/db/index.ts`
- **Schema location**: `src/server/db/schema.ts`
- **Table prefix**: All tables use `pg-drizzle_` prefix (configured in schema via `createTable`)
- **Drizzle filter**: `drizzle.config.ts` filters for `inedit_*` tables (note: this may not match the actual `pg-drizzle_` prefix used in schema)

### Environment Configuration

Environment variables are validated using `@t3-oss/env-nextjs` in `src/env.js`:

- **Required variables**: All vars in `.env.example` must be set
- **Validation**: Happens at build time unless `SKIP_ENV_VALIDATION=true`
- **Production requirement**: `BETTER_AUTH_SECRET` is mandatory in production
- **Access pattern**: Import from `@/env` (NOT `process.env`) to ensure type safety and validation

### Cookie Configuration

Better Auth uses environment-aware cookies (see `src/server/better-auth/config.ts`):
- **Development/localhost**: `sameSite: lax`, `secure: false`
- **Production/HTTPS**: `sameSite: none`, `secure: true`
- Configuration automatically switches based on `NODE_ENV` and `BETTER_AUTH_URL`

## Important Patterns

### Path Aliases
Use `@/*` to reference `src/*` directory (configured in `tsconfig.json`)

### TypeScript Configuration
- Strict mode enabled with `noUncheckedIndexedAccess`
- Uses ES2022 target with ESNext modules
- `checkJs` enabled for JavaScript files

### Code Formatting
- Biome handles linting and formatting (NOT Prettier/ESLint)
- Sorted imports and attributes enabled
- CSS modules and Tailwind directives supported
- Class sorting configured for `clsx`, `cva`, `cn` functions

## Database Schema Notes

The schema uses Drizzle's relation system:
- `userRelations`: User has many accounts and sessions
- `accountRelations`: Account belongs to user
- `sessionRelations`: Session belongs to user

When adding new tables, follow the `createTable` pattern for consistent prefixing.

## Environment Setup

1. Copy `.env.example` to `.env`
2. Set `BETTER_AUTH_SECRET` (required for production)
3. Configure GitHub OAuth credentials if using social login
4. Update `DATABASE_URL` to point to your Neon database
5. Use `./start-database.sh` for local PostgreSQL development

## Package Manager

This project uses **pnpm 10.27.0** as specified in `package.json`. Always use `pnpm` for dependency management.

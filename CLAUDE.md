# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application built with the T3 Stack, featuring:
- **Framework**: Next.js 15 with App Router and React 19
- **Authentication**: Better Auth (NOT NextAuth)
- **Database**: Neon PostgreSQL with Drizzle ORM
- **UI**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS 4.0
- **Type Safety**: TypeScript with strict mode
- **Code Quality**: Biome for linting and formatting

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

### UI Components Architecture

The project uses shadcn/ui for component primitives:

- **Component location**: `src/components/ui/`
- **Base components**: Built on Radix UI primitives for accessibility
- **Utility function**: `src/lib/utils.ts` exports `cn()` for className merging
- **Variants**: Uses `class-variance-authority` (cva) for component variants
- **Icons**: Lucide React for consistent iconography
- **Customization**: Components are copied into the project (not npm installed), allowing full customization

Example components installed:
- `button.tsx` - Button component with variants
- `card.tsx` - Card container component
- `input.tsx` - Form input component
- `label.tsx` - Form label component
- `separator.tsx` - Visual separator component

### Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/auth/[...all]/   # Better Auth API routes
│   ├── auth/signin/         # Authentication pages
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── auth/                # Auth-specific components
│   └── ui/                  # shadcn/ui components
├── lib/                     # Utility functions
│   └── utils.ts             # cn() utility for classNames
├── server/                  # Server-side code
│   ├── better-auth/         # Better Auth configuration
│   │   ├── client.ts        # Client-side auth instance
│   │   ├── config.ts        # Server auth instance
│   │   ├── index.ts         # Auth exports
│   │   └── server.ts        # Server-only auth utilities
│   └── db/                  # Database configuration
│       ├── index.ts         # Drizzle instance
│       └── schema.ts        # Database schema
├── styles/                  # Global styles
│   └── globals.css          # Tailwind + global CSS
└── env.js                   # Environment validation
```

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

## Best Practices

### Component Development

1. **Server Components by Default**: Use React Server Components unless client interactivity is needed
2. **"use client" Directive**: Only add when using hooks, event handlers, or browser APIs
3. **Component Composition**: Prefer composition over props drilling
4. **Accessibility**: Leverage Radix UI's built-in accessibility features

### Authentication

1. **Better Auth Usage**: Always reference Better Auth documentation (use MCP search)
2. **Never Confuse with NextAuth**: Better Auth has different APIs and patterns
3. **Client vs Server**: Use `authClient` in client components, `auth` in server components/routes
4. **Session Handling**: Sessions are automatically managed via cookies

### Database Operations

1. **Type Safety**: Let Drizzle infer types from schema, avoid manual type assertions
2. **Migrations**: Use `pnpm db:generate` + `pnpm db:migrate` for production
3. **Development**: Use `pnpm db:push` for rapid prototyping
4. **Relations**: Use Drizzle's relation system for joins and foreign keys
5. **Table Naming**: Always use the `createTable` helper to ensure consistent prefixing

### Code Quality

1. **Biome First**: Run `pnpm check` before commits
2. **Type Checking**: Run `pnpm typecheck` to catch type errors
3. **Import Order**: Biome automatically sorts imports
4. **No `any` Types**: Use proper TypeScript types or `unknown` with type guards
5. **Environment Variables**: Import from `@/env`, never `process.env` directly

### Styling

1. **Tailwind Classes**: Use the `cn()` utility for conditional classes
2. **Component Variants**: Use `cva` from `class-variance-authority`
3. **Responsive Design**: Mobile-first approach with Tailwind breakpoints
4. **Dark Mode**: (Not yet implemented - ready for configuration)

## Adding shadcn/ui Components

To add new shadcn/ui components:

```bash
npx shadcn@latest add <component-name>
```

Example:
```bash
npx shadcn@latest add dropdown-menu
npx shadcn@latest add dialog
npx shadcn@latest add toast
```

Components will be added to `src/components/ui/` and can be customized as needed.

## Troubleshooting

### Database Issues
- **Connection errors**: Check `DATABASE_URL` in `.env`
- **Migration conflicts**: Review `drizzle.config.ts` table filter
- **Schema changes not applied**: Run `pnpm db:generate` then `pnpm db:migrate`

### Authentication Issues
- **Cookie not set**: Check `BETTER_AUTH_URL` matches your development URL
- **Session expired**: Verify `BETTER_AUTH_SECRET` is set
- **OAuth not working**: Ensure GitHub credentials are correct in `.env`

### Build Errors
- **Type errors**: Run `pnpm typecheck` to see all errors at once
- **Environment validation failed**: Check all required vars in `.env.example` are set
- **Module not found**: Clear `.next` folder and rebuild: `rm -rf .next && pnpm build`

## MCP Servers Available

This project is configured with the following MCP servers for enhanced Claude Code assistance:

1. **Neon** - Database operations, migrations, query optimization
2. **Better Auth** - Authentication documentation and API reference
3. **Memory** - Knowledge graph for maintaining context
4. **Filesystem** - Advanced file operations
5. **Sequential Thinking** - Complex problem-solving assistance
6. **Everything** - General-purpose operations

See `.claude/commands/instructions.md` for MCP usage patterns.

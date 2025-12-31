# Inedit

A modern full-stack application built with Next.js, featuring secure authentication and a robust database layer.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) with React 19
- **Authentication**: [Better Auth](https://www.better-auth.com) - Modern auth framework with email/password and OAuth support
- **Database**: [Neon PostgreSQL](https://neon.tech) (serverless Postgres)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team) with type-safe queries
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Type Safety**: TypeScript with strict mode
- **Code Quality**: [Biome](https://biomejs.dev) for linting and formatting
- **Validation**: [Zod](https://zod.dev) with [@t3-oss/env-nextjs](https://env.t3.gg)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10.27.0+

### Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Configure your environment variables in `.env`:
   - `DATABASE_URL` - Your Neon PostgreSQL connection string
   - `BETTER_AUTH_SECRET` - Secret for session encryption (required in production)
   - `BETTER_AUTH_GITHUB_CLIENT_ID` - GitHub OAuth client ID (if using GitHub login)
   - `BETTER_AUTH_GITHUB_CLIENT_SECRET` - GitHub OAuth client secret

### Installation

```bash
pnpm install
```

### Database Setup

For local development with Docker/Podman:
```bash
./start-database.sh
```

Push schema to database:
```bash
pnpm db:push
```

Or use migrations:
```bash
pnpm db:generate  # Generate migration files
pnpm db:migrate   # Apply migrations
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with Turbo |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm preview` | Build and preview production |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm check` | Run Biome linter/formatter |
| `pnpm check:write` | Auto-fix linting issues |
| `pnpm db:studio` | Open Drizzle Studio (database GUI) |
| `pnpm db:push` | Push schema changes to database |

## Project Structure

```
src/
├── app/                      # Next.js app router
│   ├── api/auth/[...all]/   # Better Auth API routes
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── server/
│   ├── better-auth/         # Authentication configuration
│   │   ├── config.ts        # Server auth instance
│   │   └── client.ts        # Client auth instance
│   └── db/
│       ├── index.ts         # Database connection
│       └── schema.ts        # Drizzle schema definitions
├── env.js                   # Environment validation
└── styles/                  # Global styles
```

## Authentication

This project uses **Better Auth** (not NextAuth):

- **Email/Password**: Built-in support for credential-based authentication
- **GitHub OAuth**: Configured via environment variables
- **Session Management**: Secure cookie-based sessions with environment-aware configuration
- **Database Adapter**: Drizzle adapter for PostgreSQL persistence

Authentication endpoints are available at `/api/auth/*`.

## Database

Schema is defined in `src/server/db/schema.ts` using Drizzle ORM:

- **Users**: User accounts with email verification
- **Sessions**: Active user sessions
- **Accounts**: OAuth provider accounts linked to users
- **Verification**: Email verification tokens
- **Posts**: Example content table with user relations

Use `pnpm db:studio` to explore your database with a visual interface.

## Deployment

This app is optimized for deployment on [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure environment variables
4. Deploy

Make sure to set `BETTER_AUTH_SECRET` and update `BETTER_AUTH_URL` and `NEXT_PUBLIC_BASE_URL` to your production domain.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Neon Documentation](https://neon.tech/docs)
- [T3 Stack](https://create.t3.gg/) - Original project template

## License

MIT

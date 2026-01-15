# Quickstart Guide - Jearch Development

**Feature**: Jearch - Virtual Career Coach  
**Branch**: `001-jearch-career-coach`  
**Last Updated**: 2026-01-15

This guide will help you set up your local development environment and start building the Jearch platform.

---

## Prerequisites

Ensure you have the following installed:

- **Node.js**: v18.17+ or v20.x (LTS recommended)
- **npm**: v9+ or **pnpm** v8+ (recommended for faster installs)
- **Git**: v2.30+
- **Supabase CLI**: v1.120+ ([installation guide](https://supabase.com/docs/guides/cli))
- **Docker Desktop**: Required for Supabase local development

**Verify installations:**
```bash
node --version   # Should show v18.17+ or v20.x
npm --version    # Should show v9+
git --version    # Should show v2.30+
supabase --version  # Should show v1.120+
docker --version # Should show Docker engine running
```

---

## Initial Setup (First Time Only)

### 1. Clone the Repository

```bash
git clone <repository-url> jearch
cd jearch
git checkout 001-jearch-career-coach
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# OR using pnpm (faster)
pnpm install
```

### 3. Set Up Supabase Locally

```bash
# Initialize Supabase (creates supabase/ directory)
supabase init

# Start local Supabase instance (PostgreSQL + Studio)
supabase start
```

**Expected output:**
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
        JWT secret: <your-jwt-secret>
          anon key: <your-anon-key>
service_role key: <your-service-role-key>
```

**Save these values** - you'll need them for `.env.local`.

### 4. Configure Environment Variables

Create `.env.local` in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
# Supabase (from `supabase start` output)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key-from-supabase-start>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key-from-supabase-start>

# SMTP (for local testing, use Inbucket from Supabase)
SMTP_HOST=localhost
SMTP_PORT=54325
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_ADDRESS=noreply@jearch.local
SMTP_FROM_NAME=Jearch Local

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note**: Supabase local provides Inbucket (email testing) at `http://localhost:54324`. Emails won't actually send but will appear in Inbucket UI.

### 5. Run Database Migrations

```bash
# Apply migrations to local Supabase database
supabase db reset

# This will:
# - Drop existing database
# - Run all migrations in supabase/migrations/
# - Apply seed data (if any)
```

### 6. Verify Setup

```bash
# Start Next.js development server
npm run dev

# Open browser to http://localhost:3000
# You should see the Jearch homepage
```

**Check Supabase Studio:**
- Open `http://localhost:54323`
- Navigate to "Table Editor"
- Verify tables exist: `profiles`, `professional_experiences`, `extra_professional_experiences`, `education`, `app_config`, `email_queue`, `login_attempts`

---

## Daily Development Workflow

### Starting Development

```bash
# 1. Ensure Supabase is running
supabase status

# If not running, start it:
supabase start

# 2. Start Next.js dev server
npm run dev

# 3. Open browser to:
# - App: http://localhost:3000
# - Supabase Studio: http://localhost:54323
# - Email Inbox (Inbucket): http://localhost:54324
```

### Stopping Development

```bash
# Stop Next.js (Ctrl+C in terminal)

# Stop Supabase (keeps data)
supabase stop

# Or stop and erase all data
supabase stop --no-backup
```

---

## Common Development Tasks

### Creating a New Database Migration

```bash
# Create a new migration file
supabase migration new <migration_name>

# Example:
supabase migration new add_user_preferences

# Edit the generated file in supabase/migrations/
# Then apply it:
supabase db reset
```

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run E2E tests (requires app running)
npm run test:e2e

# Run tests in watch mode
npm run test:watch
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable lint errors
npm run lint:fix

# Format code with Prettier (if configured)
npm run format
```

### Checking TypeScript Types

```bash
# Type-check without building
npm run type-check
```

---

## Project Structure Quick Reference

```
jearch/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Auth pages (login, register, reset)
│   ├── (app)/                # Authenticated app pages
│   ├── api/                  # API routes
│   └── layout.tsx            # Root layout with Chakra UI
├── components/               # React components
│   ├── forms/                # Form components
│   ├── ui/                   # Chakra UI wrappers (French)
│   └── layout/               # Layout components
├── lib/                      # Utilities and services
│   ├── supabase/             # Supabase client & helpers
│   ├── validation/           # Zod schemas (French messages)
│   ├── email/                # SMTP and email queue
│   ├── export/               # Markdown generation
│   └── logger/               # Structured logging
├── supabase/                 # Supabase configuration
│   ├── config.toml           # Supabase local config
│   ├── migrations/           # SQL migrations
│   └── seed.sql              # Seed data
├── tests/                    # Test files
│   ├── e2e/                  # Playwright E2E tests
│   ├── integration/          # Integration tests
│   └── unit/                 # Jest unit tests
├── specs/                    # Feature specifications
│   └── 001-jearch-career-coach/
│       ├── spec.md           # Feature spec
│       ├── plan.md           # Implementation plan
│       ├── research.md       # Technology decisions
│       ├── data-model.md     # Data model
│       ├── quickstart.md     # This file
│       └── contracts/        # API contracts
└── .env.local                # Local environment variables (git-ignored)
```

---

## Useful Commands Reference

### Supabase

| Command | Description |
|---------|-------------|
| `supabase start` | Start local Supabase |
| `supabase stop` | Stop local Supabase |
| `supabase status` | Check Supabase status |
| `supabase db reset` | Reset database and apply migrations |
| `supabase db diff` | Generate migration from schema changes |
| `supabase gen types typescript --local` | Generate TypeScript types from DB |

### Next.js

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

### Testing

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:unit` | Run unit tests (Jest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run test:watch` | Run tests in watch mode |

---

## Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Next.js App** | http://localhost:3000 | Main application |
| **Supabase Studio** | http://localhost:54323 | Database GUI |
| **Supabase API** | http://localhost:54321 | REST & GraphQL API |
| **Inbucket (Email)** | http://localhost:54324 | Email inbox (local testing) |

---

## Environment-Specific Configuration

### Local Development
- Uses Supabase local instance (Docker)
- Emails appear in Inbucket (no real SMTP)
- Hot module reloading enabled
- Debug logs visible in console

### Staging/Production (Vercel)
- Uses Supabase cloud instance
- Real SMTP server required (configure in admin panel)
- Optimized production build
- Structured JSON logs sent to Vercel

---

## Troubleshooting

### Issue: Supabase won't start

```bash
# Check if Docker is running
docker ps

# If not, start Docker Desktop

# Check for port conflicts
lsof -i :54321
lsof -i :54322
lsof -i :54323

# Kill conflicting processes or change ports in supabase/config.toml
```

### Issue: Database migrations fail

```bash
# Reset database completely
supabase db reset

# If that fails, stop and restart Supabase
supabase stop --no-backup
supabase start
supabase db reset
```

### Issue: TypeScript errors about Supabase types

```bash
# Regenerate types from local database
supabase gen types typescript --local > lib/supabase/database.types.ts

# Restart TypeScript server in VSCode: Cmd+Shift+P > "TypeScript: Restart TS Server"
```

### Issue: Next.js can't connect to Supabase

1. Verify Supabase is running: `supabase status`
2. Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Restart Next.js dev server: Ctrl+C, then `npm run dev`

### Issue: Emails not appearing in Inbucket

1. Check Inbucket is running: `http://localhost:54324`
2. Verify `SMTP_HOST=localhost` and `SMTP_PORT=54325` in `.env.local`
3. Check email queue table in Supabase Studio for failed entries

---

## Next Steps

Now that your environment is set up:

1. **Review the spec**: Read `specs/001-jearch-career-coach/spec.md` to understand requirements
2. **Explore the data model**: See `specs/001-jearch-career-coach/data-model.md`
3. **Check API contracts**: Review `specs/001-jearch-career-coach/contracts/api.openapi.yaml`
4. **Run the task generator**: Execute `/speckit.tasks` to create implementation tasks
5. **Start coding**: Pick a task and start implementing!

---

## Getting Help

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Chakra UI Docs**: https://chakra-ui.com/docs
- **React Hook Form**: https://react-hook-form.com
- **Zod**: https://zod.dev

For project-specific questions, refer to:
- `CLAUDE.md` - Project guidelines
- `specs/001-jearch-career-coach/research.md` - Technology decisions and patterns
- `specs/001-jearch-career-coach/plan.md` - Implementation plan

---

**Happy coding! 🚀**

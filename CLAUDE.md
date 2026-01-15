# jearch Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-15

## Active Technologies

- Next.js 14+ (TypeScript full-stack framework) (001-jearch-career-coach)
- Supabase (Database, Auth, Row Level Security)
- Vercel (Hosting, Serverless Functions)
- Chakra UI v2+ (UI component library with French localization)
- React Hook Form (Form state management)
- Zod (Schema validation with French error messages)
- Nodemailer (SMTP email sending)
- Jest + React Testing Library (Unit tests)
- Playwright (E2E tests)

## Project Structure

```text
app/                         # Next.js App Router (French routes)
├── (auth)/                  # Auth pages (connexion, inscription, reinitialiser)
├── (app)/                   # Authenticated app (tableau-de-bord, experiences-pro, etc.)
└── api/                     # API routes (auth, experiences, education, export, config)
components/                  # Reusable UI components
├── forms/                   # Form components (Chakra UI + React Hook Form)
├── ui/                      # Chakra UI wrappers with French labels
└── layout/                  # Layout components (Header, Navigation, Footer)
lib/                         # Utilities and services
├── supabase/                # Supabase client & migrations
├── validation/              # Zod schemas with French messages
├── email/                   # SMTP & email queue
├── export/                  # Markdown generation
└── logger/                  # Structured JSON logging
supabase/                    # Supabase configuration
├── config.toml              # Local config
├── migrations/              # SQL migrations
└── seed.sql                 # Seed data
tests/                       # Tests
├── e2e/                     # Playwright E2E tests
├── integration/             # Integration tests (Supabase local)
└── unit/                    # Jest unit tests
```

## Commands

npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run test         # Run all tests
npm run test:unit    # Run Jest unit tests
npm run test:e2e     # Run Playwright E2E tests
npm run lint         # Run ESLint
supabase start       # Start local Supabase (Docker required)
supabase stop        # Stop local Supabase
supabase db reset    # Reset DB and apply migrations

## Code Style

TypeScript/Next.js: Follow Next.js conventions, use TypeScript strict mode
French UI: All routes, labels, messages, and validation text in French
Chakra UI: Use Chakra components with French localization theme
Forms: React Hook Form + Zod validation with auto-save (2s debounce)
Database: Use Supabase RLS policies for data isolation
Logging: Structured JSON logs to console (Vercel captures automatically)

## Recent Changes

- 001-jearch-career-coach: Full implementation plan completed with Chakra UI, French interface, and platform-native observability

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

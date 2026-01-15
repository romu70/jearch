# Implementation Plan: Jearch - Virtual Career Coach

**Branch**: `001-jearch-career-coach` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-jearch-career-coach/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a web application for job seekers to document and manage their career experiences using the STAR format (Situation, Task, Action, Result), track education history, and export career data to markdown. The platform provides secure authentication, auto-save functionality, and accessibility compliance (WCAG 2.1 AA). The interface will be in French using Chakra UI components.

**Technical Approach**: Next.js 14+ full-stack TypeScript application with Supabase for database/auth, Chakra UI for French UI components, deployed on Vercel with platform-native observability.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 14+ (App Router)  
**Primary Dependencies**: 
- Next.js 14+ (full-stack framework)
- Supabase (database, authentication, storage)
- Chakra UI v2+ (French UI component library)
- React 18+
- React Hook Form (form management with validation)
- Zod (schema validation)
- Nodemailer (SMTP email sending)

**Storage**: 
- Supabase PostgreSQL (user accounts, experiences, education, app config)
- Database-level encryption via Supabase built-in capabilities
- Row Level Security (RLS) policies for multi-tenant data isolation

**Testing**: 
- Jest + React Testing Library (unit tests)
- Playwright (E2E tests)
- Supabase local development environment for integration tests

**Target Platform**: 
- Web browsers (Chrome, Firefox, Safari, Edge)
- Responsive design (desktop, tablet, mobile)
- Deployed on Vercel (serverless Next.js)

**Project Type**: Web application (frontend + backend in Next.js App Router)

**Performance Goals**: 
- Page loads < 2 seconds (SC-003)
- Support 100 concurrent users without degradation (SC-006)
- Auto-save triggers 2 seconds after user stops typing (FR-051)
- Account registration < 2 minutes (SC-001)
- Add experience < 5 minutes (SC-002)

**Constraints**: 
- French language UI (all labels, messages, validation text)
- WCAG 2.1 AA accessibility compliance (FR-052)
- Self-hosted SMTP email server (configurable)
- HTTPS/TLS required for all communication (FR-056)
- Progressive rate limiting for auth (FR-009)
- 10,000 character limit per STAR field (FR-020)

**Scale/Scope**: 
- Individual job seekers (not enterprise/recruiters)
- Unlimited professional/extra-professional experiences per user
- Unlimited education entries per user
- Indefinite data retention until user deletion (FR-010)
- Email verification required before platform access (FR-003)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: Template constitution file contains no active principles. No gates to evaluate.

**Project-Specific Constraints**:
- French UI requirement: All Chakra UI components must use French labels, error messages, and accessibility text
- Supabase RLS policies: Mandatory for data isolation between users
- Vercel deployment: Must leverage platform-native logging (FR-060)
- No third-party error tracking: Use Vercel/Supabase built-in observability only (FR-062)

**Re-evaluation After Phase 1**: Will verify:
- French localization strategy is consistent across all components
- Data model supports WCAG 2.1 AA requirements
- API contracts enforce RLS and rate limiting
- SMTP configuration is externalized and encrypted

## Project Structure

### Documentation (this feature)

```text
specs/001-jearch-career-coach/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── api.openapi.yaml # REST API specification
│   └── types.ts         # Shared TypeScript types
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/                         # Next.js App Router
├── (auth)/                  # Auth routes (login, register, reset)
│   ├── connexion/           # Login page (French: "connexion")
│   ├── inscription/         # Registration page (French: "inscription")
│   └── reinitialiser/       # Password reset (French: "réinitialiser")
├── (app)/                   # Authenticated app routes
│   ├── tableau-de-bord/     # Dashboard (French: "tableau de bord")
│   ├── experiences-pro/     # Professional experiences
│   ├── experiences-extra/   # Extra-professional experiences
│   ├── formation/           # Education (French: "formation")
│   ├── exporter/            # Export page
│   └── parametres/          # Settings (French: "paramètres")
├── api/                     # API routes
│   ├── auth/                # Authentication endpoints
│   ├── experiences/         # Experience CRUD
│   ├── education/           # Education CRUD
│   ├── export/              # Markdown export
│   └── config/              # Admin config (SMTP)
└── layout.tsx               # Root layout with Chakra UI provider

components/                  # Reusable React components
├── forms/                   # Form components with Chakra UI
│   ├── ExperienceForm.tsx   # STAR format form
│   ├── EducationForm.tsx
│   └── AutoSaveIndicator.tsx
├── ui/                      # Chakra UI wrappers (French labels)
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   └── Modal.tsx
└── layout/                  # Layout components
    ├── Header.tsx
    ├── Navigation.tsx
    └── Footer.tsx

lib/                         # Shared utilities and services
├── supabase/
│   ├── client.ts            # Supabase client setup
│   ├── server.ts            # Server-side Supabase client
│   └── migrations/          # Database migrations
├── validation/
│   ├── schemas.ts           # Zod validation schemas
│   └── messages.fr.ts       # French error messages
├── email/
│   ├── smtp.ts              # SMTP configuration
│   ├── templates.ts         # Email templates (French)
│   └── queue.ts             # Email retry queue
├── export/
│   ├── markdown.ts          # Markdown generation
│   └── escape.ts            # Markdown character escaping
└── logger/
    └── structured.ts        # JSON structured logging

supabase/                    # Supabase configuration
├── config.toml              # Supabase local config
├── migrations/              # SQL migrations
│   ├── 001_create_users.sql
│   ├── 002_create_experiences.sql
│   ├── 003_create_education.sql
│   ├── 004_create_config.sql
│   └── 005_enable_rls.sql
└── seed.sql                 # Development seed data

tests/
├── e2e/                     # Playwright E2E tests
│   ├── auth.spec.ts
│   ├── experiences.spec.ts
│   └── export.spec.ts
├── integration/             # Integration tests
│   ├── api/
│   └── supabase/
└── unit/                    # Jest unit tests
    ├── components/
    ├── lib/
    └── validation/

public/                      # Static assets
├── locales/                 # i18n files (French)
│   └── fr.json
└── images/

.env.local                   # Local environment variables
.env.example                 # Environment template
next.config.js               # Next.js configuration
tsconfig.json                # TypeScript configuration
jest.config.js               # Jest configuration
playwright.config.ts         # Playwright configuration
```

**Structure Decision**: Web application structure using Next.js 14+ App Router with French route naming conventions. All routes use French terminology (e.g., `/connexion` instead of `/login`, `/formation` instead of `/education`). Supabase handles database and authentication, Chakra UI provides accessible French UI components, deployed on Vercel with serverless architecture.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations detected. Template constitution contains no active principles to evaluate against.

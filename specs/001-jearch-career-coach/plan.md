# Implementation Plan: Jearch - Virtual Career Coach

**Branch**: `001-jearch-career-coach` | **Date**: 2026-01-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-jearch-career-coach/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a web application for job seekers to document their career path using STAR format (Situation, Task, Action, Result) for professional and extra-professional experiences. Core features include authentication with email verification, CRUD operations for experiences and education entries, character-limited text fields with completion indicators, and markdown export functionality. The application requires configurable SMTP for email services and must be responsive across devices.

## Technical Context

**Language/Version**: Python 3.11+ (backend API), JavaScript/TypeScript (frontend)  
**Primary Dependencies**: 
- Backend: FastAPI (async support, auto-docs, Vercel-optimized)
- Database/Auth: Supabase (PostgreSQL, built-in auth, real-time subscriptions)
- Frontend: Next.js 14+ (App Router, React Server Components, Vercel-native)
- Email: Supabase Auth + Edge Functions + SMTP (Resend/SendGrid/SES)

**Storage**: Supabase (managed PostgreSQL) for all data (users, experiences, education, configuration)  
**Testing**: pytest (Python backend), Jest/Vitest (frontend), Playwright (E2E)  
**Target Platform**: Vercel (serverless functions + static hosting), responsive web UI for desktop/tablet/mobile browsers  
**Project Type**: Web application (Python serverless backend + modern frontend framework)  
**Performance Goals**: <2s page loads (FR-048), 100+ concurrent users (SC-006)  
**Constraints**: 
- Vercel hosting (serverless limitations, cold starts)
- Supabase free tier considerations (connection pooling, row limits)
- HTTPS required for authentication security
- SMTP configuration required (via Supabase or external service)
- WCAG 2.1 AA accessibility

**Scale/Scope**: Initial release targets individual job seekers, ~10-15 screens (auth flows, dashboard, experience/education CRUD, export), character limits per field (10,000 chars per STAR component)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: Constitution file is a template with no specific project principles defined yet. No gates to enforce at this time. Will need to establish project constitution if architectural constraints are required.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/          # User, ProfessionalExperience, ExtraProfessionalExperience, Education
│   ├── services/        # Auth, SMTP, Experience management, Export
│   ├── api/             # REST/GraphQL endpoints
│   ├── middleware/      # Authentication, validation
│   └── config/          # SMTP and application settings
└── tests/
    ├── contract/        # API contract tests
    ├── integration/     # Database + service integration
    └── unit/            # Model and service unit tests

frontend/
├── src/
│   ├── components/      # Reusable UI components (forms, cards, indicators)
│   ├── pages/           # Auth, Dashboard, Experience CRUD, Education, Export
│   ├── services/        # API client, auth state management
│   ├── hooks/           # React hooks for data fetching, form handling
│   └── styles/          # CSS/styling (responsive, accessible)
└── tests/
    ├── integration/     # E2E user flows
    └── unit/            # Component and hook tests
```

**Structure Decision**: Web application structure with separate backend and frontend. Backend handles authentication, data persistence, email services, and business logic. Frontend provides responsive UI for all user interactions. This separation allows independent scaling and development of each tier.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

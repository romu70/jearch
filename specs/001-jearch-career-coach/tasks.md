# Tasks: Jearch - Virtual Career Coach

**Feature**: 001-jearch-career-coach  
**Input**: Design documents from `/specs/001-jearch-career-coach/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml  
**Date**: 2026-01-14

**Tests**: Tests are NOT explicitly requested in the spec, so this task list focuses on implementation only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js Full-Stack**: All code in project root
- `app/` - Next.js App Router (pages + API routes)
- `components/` - Reusable UI components
- `lib/` - Utilities, Supabase clients, validations
- `supabase/` - Database migrations and Edge Functions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create Next.js 14+ project with TypeScript and App Router at project root
- [ ] T002 [P] Install core dependencies (next, react, @supabase/supabase-js, @supabase/auth-helpers-nextjs, @supabase/ssr)
- [ ] T003 [P] Install UI dependencies (tailwindcss, @radix-ui/react-*, react-hook-form, zod)
- [ ] T004 [P] Configure TypeScript in tsconfig.json with strict mode enabled
- [ ] T005 [P] Configure Tailwind CSS in tailwind.config.ts and globals.css
- [ ] T006 [P] Configure ESLint and Prettier for code quality
- [ ] T007 Create environment variable templates (.env.local.example) with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- [ ] T008 Create project structure: app/, components/ui/, components/features/, lib/supabase/, lib/validations/, lib/utils/
- [ ] T009 [P] Setup Next.js root layout in app/layout.tsx with metadata and global styles
- [ ] T010 [P] Create base page in app/page.tsx as landing page placeholder

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Supabase Setup

- [ ] T011 Create Supabase project and obtain credentials (URL, anon key, service role key)
- [ ] T012 Create Supabase database migration for profiles table in supabase/migrations/001_create_profiles.sql
- [ ] T013 Create Supabase database migration for professional_experiences table in supabase/migrations/002_create_professional_experiences.sql
- [ ] T014 Create Supabase database migration for extra_professional_experiences table in supabase/migrations/003_create_extra_professional_experiences.sql
- [ ] T015 Create Supabase database migration for education table in supabase/migrations/004_create_education.sql
- [ ] T016 Create Supabase database migration for email_queue table in supabase/migrations/005_create_email_queue.sql
- [ ] T017 Create Supabase database migration for email_failures table in supabase/migrations/006_create_email_failures.sql
- [ ] T018 Create Supabase database migration for smtp_config table in supabase/migrations/007_create_smtp_config.sql
- [ ] T019 Create Supabase database migration for indexes in supabase/migrations/008_create_indexes.sql
- [ ] T020 Create Supabase database migration for RLS policies in supabase/migrations/009_create_rls_policies.sql
- [ ] T021 Create Supabase database migration for triggers (update_updated_at, increment_version) in supabase/migrations/010_create_triggers.sql
- [ ] T022 Create Supabase database migration for completion_percentage function in supabase/migrations/011_create_functions.sql
- [ ] T023 Run all Supabase migrations using supabase db push

### Supabase Client Configuration

- [ ] T024 [P] Create browser Supabase client in lib/supabase/client.ts using createBrowserClient
- [ ] T025 [P] Create server Supabase client in lib/supabase/server.ts using createServerClient with cookies
- [ ] T026 [P] Create middleware Supabase client in lib/supabase/middleware.ts for auth protection
- [ ] T027 Create Next.js middleware in middleware.ts to protect authenticated routes

### Shared Utilities

- [ ] T028 [P] Create TypeScript types for User, ProfessionalExperience, ExtraProfessionalExperience, Education in lib/types/index.ts
- [ ] T029 [P] Create Zod validation schemas for authentication in lib/validations/auth.ts (signup, login, password reset)
- [ ] T030 [P] Create Zod validation schemas for experiences in lib/validations/experiences.ts (create, update with 10K char limits)
- [ ] T031 [P] Create Zod validation schemas for education in lib/validations/education.ts (create, update with GPA validation)
- [ ] T032 [P] Create utility functions for date formatting in lib/utils/dates.ts (format for display and export)
- [ ] T033 [P] Create utility function for STAR completion percentage calculation in lib/utils/completion.ts
- [ ] T034 [P] Create error handling utilities in lib/utils/errors.ts for consistent API error responses

### Base UI Components

- [ ] T035 [P] Create Button component in components/ui/button.tsx with variants (primary, secondary, danger)
- [ ] T036 [P] Create Input component in components/ui/input.tsx with error state support
- [ ] T037 [P] Create Textarea component in components/ui/textarea.tsx with character counter
- [ ] T038 [P] Create Card component in components/ui/card.tsx for content containers
- [ ] T039 [P] Create Alert component in components/ui/alert.tsx for success/error messages
- [ ] T040 [P] Create Loading spinner component in components/ui/loading.tsx
- [ ] T041 [P] Create Modal/Dialog component in components/ui/dialog.tsx using Radix UI
- [ ] T042 [P] Create Form components wrapper in components/ui/form.tsx with react-hook-form integration

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration and Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable job seekers to create secure accounts, log in, log out, and reset passwords with email verification

**Independent Test**: Create an account, receive verification email, verify email, log in successfully, log out, and reset password

### Authentication UI Pages

- [ ] T043 [P] [US1] Create signup page in app/(auth)/signup/page.tsx with email/password form and validation
- [ ] T044 [P] [US1] Create login page in app/(auth)/login/page.tsx with email/password form and "Keep me logged in" checkbox
- [ ] T045 [P] [US1] Create password reset request page in app/(auth)/reset-password/page.tsx
- [ ] T046 [P] [US1] Create password reset confirm page in app/(auth)/reset-password/confirm/page.tsx
- [ ] T047 [P] [US1] Create email verification success page in app/(auth)/verify/page.tsx
- [ ] T048 [US1] Create auth layout in app/(auth)/layout.tsx with centered card design

### Authentication API Routes

- [ ] T049 [P] [US1] Create signup API route in app/api/auth/signup/route.ts with Supabase Auth integration and email validation
- [ ] T050 [P] [US1] Create login API route in app/api/auth/login/route.ts with session persistence based on "Keep me logged in"
- [ ] T051 [P] [US1] Create logout API route in app/api/auth/logout/route.ts to invalidate session
- [ ] T052 [P] [US1] Create password reset request API route in app/api/auth/reset-password/route.ts
- [ ] T053 [US1] Configure Supabase Auth email templates in Supabase Dashboard for verification and password reset

### Authentication Components

- [ ] T054 [P] [US1] Create SignupForm component in components/features/auth/signup-form.tsx with react-hook-form and Zod validation
- [ ] T055 [P] [US1] Create LoginForm component in components/features/auth/login-form.tsx with "Keep me logged in" toggle
- [ ] T056 [P] [US1] Create PasswordResetForm component in components/features/auth/password-reset-form.tsx
- [ ] T057 [P] [US1] Create AuthGuard component in components/features/auth/auth-guard.tsx to protect authenticated pages
- [ ] T058 [US1] Configure Supabase Auth settings in Dashboard: min password length 12, enable email provider

### Email Queue Infrastructure (FR-017a)

- [ ] T059 [US1] Create Supabase Edge Function for email queue processing in supabase/functions/email-processor/index.ts
- [ ] T060 [US1] Implement exponential backoff retry logic (5, 10, 20 minutes) in email-processor Edge Function
- [ ] T061 [US1] Implement email failure logging to email_failures table in Edge Function
- [ ] T062 [US1] Configure Vercel cron job in vercel.json to call email-processor every 5 minutes
- [ ] T063 [US1] Configure SMTP settings in smtp_config table (choose Resend/SendGrid/AWS SES)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can signup, verify email, login, logout, and reset password

---

## Phase 4: User Story 2 - Managing Professional Experiences with STAR Format (Priority: P1) 🎯 MVP

**Goal**: Enable job seekers to create, edit, view, and delete professional work experiences using STAR format

**Independent Test**: After logging in, add a professional experience with company, role, dates, and all 4 STAR components; edit it; view the list sorted by date; see completion indicator; delete it

### Dashboard Layout

- [ ] T064 [US2] Create dashboard layout in app/dashboard/layout.tsx with navigation sidebar (Experiences, Education, Export)
- [ ] T065 [US2] Create dashboard home page in app/dashboard/page.tsx with overview of all data

### Professional Experience UI Pages

- [ ] T066 [P] [US2] Create professional experiences list page in app/dashboard/experiences/professional/page.tsx with reverse chronological sorting
- [ ] T067 [P] [US2] Create add professional experience page in app/dashboard/experiences/professional/new/page.tsx
- [ ] T068 [P] [US2] Create edit professional experience page in app/dashboard/experiences/professional/[id]/edit/page.tsx
- [ ] T069 [US2] Create view professional experience detail page in app/dashboard/experiences/professional/[id]/page.tsx

### Professional Experience API Routes

- [ ] T070 [P] [US2] Create GET /api/experiences/professional route in app/api/experiences/professional/route.ts to list experiences
- [ ] T071 [P] [US2] Create POST /api/experiences/professional route in app/api/experiences/professional/route.ts to create experience
- [ ] T072 [P] [US2] Create GET /api/experiences/professional/[id] route in app/api/experiences/professional/[id]/route.ts
- [ ] T073 [P] [US2] Create PUT /api/experiences/professional/[id] route in app/api/experiences/professional/[id]/route.ts with version conflict detection
- [ ] T074 [P] [US2] Create DELETE /api/experiences/professional/[id] route in app/api/experiences/professional/[id]/route.ts with confirmation
- [ ] T075 [US2] Implement RLS policy validation in all professional experience API routes

### Professional Experience Components

- [ ] T076 [US2] Create ProfessionalExperienceForm component in components/features/experiences/professional-experience-form.tsx with auto-save (2 second debounce)
- [ ] T077 [US2] Create STARFieldsGroup component in components/features/experiences/star-fields-group.tsx with 4 textareas and character counters (10K limit each)
- [ ] T078 [US2] Create CompletionIndicator component in components/features/experiences/completion-indicator.tsx showing filled STAR components (0%, 25%, 50%, 75%, 100%)
- [ ] T079 [US2] Create ExperienceCard component in components/features/experiences/experience-card.tsx for list view with company, role, dates, completion
- [ ] T080 [US2] Create ConfirmDeleteDialog component in components/features/experiences/confirm-delete-dialog.tsx
- [ ] T081 [US2] Create ConflictResolutionDialog component in components/features/experiences/conflict-resolution-dialog.tsx for concurrent edit handling (FR-053)
- [ ] T082 [US2] Implement auto-save functionality with visual indicator in ProfessionalExperienceForm using useEffect and debounce
- [ ] T083 [US2] Add informational message about maximizing value by completing all STAR components (FR-023)

**Checkpoint**: At this point, User Story 2 should be fully functional - users can manage professional experiences with STAR format, see completion indicators, and handle concurrent edits

---

## Phase 5: User Story 3 - Managing Extra-Professional Experiences with STAR Format (Priority: P2)

**Goal**: Enable job seekers to document volunteer work, personal projects, and other extra-professional activities using STAR format

**Independent Test**: Add an extra-professional experience (volunteer work) with activity name, organization, dates, and STAR components; verify it's clearly distinguished from professional experiences; edit and delete it

### Extra-Professional Experience UI Pages

- [ ] T084 [P] [US3] Create extra-professional experiences list page in app/dashboard/experiences/extra-professional/page.tsx
- [ ] T085 [P] [US3] Create add extra-professional experience page in app/dashboard/experiences/extra-professional/new/page.tsx
- [ ] T086 [P] [US3] Create edit extra-professional experience page in app/dashboard/experiences/extra-professional/[id]/edit/page.tsx
- [ ] T087 [US3] Create view extra-professional experience detail page in app/dashboard/experiences/extra-professional/[id]/page.tsx

### Extra-Professional Experience API Routes

- [ ] T088 [P] [US3] Create GET /api/experiences/extra-professional route in app/api/experiences/extra-professional/route.ts
- [ ] T089 [P] [US3] Create POST /api/experiences/extra-professional route in app/api/experiences/extra-professional/route.ts
- [ ] T090 [P] [US3] Create GET /api/experiences/extra-professional/[id] route in app/api/experiences/extra-professional/[id]/route.ts
- [ ] T091 [P] [US3] Create PUT /api/experiences/extra-professional/[id] route in app/api/experiences/extra-professional/[id]/route.ts with conflict detection
- [ ] T092 [P] [US3] Create DELETE /api/experiences/extra-professional/[id] route in app/api/experiences/extra-professional/[id]/route.ts
- [ ] T093 [US3] Implement RLS policy validation in all extra-professional experience API routes

### Extra-Professional Experience Components

- [ ] T094 [US3] Create ExtraProfessionalExperienceForm component in components/features/experiences/extra-professional-experience-form.tsx (reuse STARFieldsGroup)
- [ ] T095 [US3] Create ExtraProfessionalExperienceCard component in components/features/experiences/extra-professional-experience-card.tsx with visual distinction from professional
- [ ] T096 [US3] Implement auto-save for extra-professional experiences with 2-second debounce
- [ ] T097 [US3] Add "ongoing" toggle for extra-professional experiences instead of end date

**Checkpoint**: At this point, User Story 3 should be fully functional - users can manage extra-professional experiences separately from professional ones

---

## Phase 6: User Story 4 - Managing Education History (Priority: P2)

**Goal**: Enable job seekers to document their educational background with institution, degree, field of study, dates, and optional details (GPA, honors, coursework)

**Independent Test**: Add an education entry with institution, degree, field of study, dates, GPA, and honors; mark another as "in progress"; view the list sorted chronologically; edit and delete entries

### Education UI Pages

- [ ] T098 [P] [US4] Create education list page in app/dashboard/education/page.tsx with reverse chronological sorting
- [ ] T099 [P] [US4] Create add education page in app/dashboard/education/new/page.tsx
- [ ] T100 [P] [US4] Create edit education page in app/dashboard/education/[id]/edit/page.tsx
- [ ] T101 [US4] Create view education detail page in app/dashboard/education/[id]/page.tsx

### Education API Routes

- [ ] T102 [P] [US4] Create GET /api/education route in app/api/education/route.ts to list education entries
- [ ] T103 [P] [US4] Create POST /api/education route in app/api/education/route.ts to create education entry
- [ ] T104 [P] [US4] Create GET /api/education/[id] route in app/api/education/[id]/route.ts
- [ ] T105 [P] [US4] Create PUT /api/education/[id] route in app/api/education/[id]/route.ts with version conflict detection
- [ ] T106 [P] [US4] Create DELETE /api/education/[id] route in app/api/education/[id]/route.ts
- [ ] T107 [US4] Implement RLS policy validation in all education API routes

### Education Components

- [ ] T108 [US4] Create EducationForm component in components/features/education/education-form.tsx with required and optional fields
- [ ] T109 [US4] Create EducationCard component in components/features/education/education-card.tsx for list view
- [ ] T110 [US4] Implement "In Progress" toggle in EducationForm that disables end date field when checked
- [ ] T111 [US4] Add GPA input with validation (0.0 - 4.0 range) in EducationForm
- [ ] T112 [US4] Add optional fields for honors and relevant coursework in EducationForm

**Checkpoint**: At this point, User Story 4 should be fully functional - users can manage their complete education history with optional details

---

## Phase 7: User Story 5 - Exporting Complete Career Path (Priority: P2)

**Goal**: Enable job seekers to export their complete career path (all experiences and education) as a formatted markdown document

**Independent Test**: Click "Export Career Path" button and verify the downloaded markdown file contains all professional experiences, extra-professional experiences, and education in a well-formatted structure with STAR components clearly labeled

### Export UI

- [ ] T113 [US5] Create export page in app/dashboard/export/page.tsx with export button and preview
- [ ] T114 [US5] Add "Export to Markdown" button to dashboard navigation

### Export API Route

- [ ] T115 [US5] Create GET /api/export/markdown route in app/api/export/markdown/route.ts that fetches all user data
- [ ] T116 [US5] Implement markdown generation logic in lib/utils/markdown-generator.ts with sections for Professional, Extra-Professional, Education
- [ ] T117 [US5] Format STAR components in markdown with clear labels (Situation:, Task:, Action:, Result:)
- [ ] T118 [US5] Format dates consistently in markdown (e.g., "Jan 2020 - Present" or "Sep 2015 - Jun 2019")
- [ ] T119 [US5] Handle special characters and markdown syntax in user content (escape where needed)
- [ ] T120 [US5] Implement empty career path handling: generate markdown with section headers and placeholder text (FR-048a)

### Export Components

- [ ] T121 [US5] Create ExportPreview component in components/features/export/export-preview.tsx showing markdown preview
- [ ] T122 [US5] Create DownloadButton component in components/features/export/download-button.tsx to trigger markdown download
- [ ] T123 [US5] Add loading state during export generation

**Checkpoint**: At this point, User Story 5 should be fully functional - users can export their complete career path as formatted markdown

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and overall user experience

### Responsive Design & Accessibility

- [ ] T124 [P] Ensure all pages are responsive on mobile, tablet, and desktop (FR-048)
- [ ] T125 [P] Test keyboard navigation across all forms and interactive elements (FR-052)
- [ ] T126 [P] Add ARIA labels and semantic HTML for screen readers (FR-052 - WCAG 2.1 AA)
- [ ] T127 [P] Test color contrast ratios for accessibility compliance
- [ ] T128 [P] Add focus indicators for keyboard navigation

### User Experience Enhancements

- [ ] T129 [P] Add loading states to all API calls with skeleton loaders
- [ ] T130 [P] Add success/error toast notifications using Alert component
- [ ] T131 [P] Implement optimistic UI updates for better perceived performance
- [ ] T132 [P] Add confirmation dialogs for all destructive actions (delete)
- [ ] T133 Add breadcrumb navigation in dashboard pages
- [ ] T134 Create 404 and error pages (app/not-found.tsx, app/error.tsx)

### Performance Optimization

- [ ] T135 [P] Optimize images with Next.js Image component
- [ ] T136 [P] Enable Next.js caching for API routes where appropriate
- [ ] T137 [P] Lazy load components not needed on initial render
- [ ] T138 Test page load performance (target < 2 seconds per FR-003)

### Security & Rate Limiting

- [ ] T139 Verify all API routes validate user authentication
- [ ] T140 Verify RLS policies prevent unauthorized data access
- [ ] T141 Add Vercel Edge Middleware for additional rate limiting (supplement Supabase built-in)
- [ ] T142 Audit for common security vulnerabilities (XSS, CSRF, SQL injection via Supabase)

### Documentation & Deployment

- [ ] T143 [P] Create README.md at project root with setup instructions
- [ ] T144 [P] Update quickstart.md if implementation deviates from plan
- [ ] T145 [P] Document environment variables in .env.local.example
- [ ] T146 [P] Create DEPLOYMENT.md with Vercel deployment instructions
- [ ] T147 Configure Vercel project with environment variables
- [ ] T148 Deploy to Vercel production and verify all features work
- [ ] T149 Run full quickstart.md validation on deployed application

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) - MVP foundation
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) - MVP feature
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) - Can run parallel with US2/US4
- **User Story 4 (Phase 6)**: Depends on Foundational (Phase 2) - Can run parallel with US2/US3
- **User Story 5 (Phase 7)**: Depends on US2, US3, US4 completion (needs data to export)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Authentication**: Independent - MVP critical
- **User Story 2 (P1) - Professional Experiences**: Depends on US1 (needs auth) - MVP critical
- **User Story 3 (P2) - Extra-Professional Experiences**: Depends on US1 (needs auth) - Can run parallel with US2/US4
- **User Story 4 (P2) - Education**: Depends on US1 (needs auth) - Can run parallel with US2/US3
- **User Story 5 (P2) - Export**: Depends on US2, US3, US4 (needs data to export)

### Within Each User Story

- Database migrations (Phase 2) before any data operations
- API routes before UI pages (pages consume API)
- Base UI components (Phase 2) before feature components
- Auth guard (US1) before protected pages
- Zod schemas before forms using them
- Auto-save functionality after basic create/update works

### Parallel Opportunities

#### Phase 1 (Setup)
- All tasks T002-T010 marked [P] can run in parallel

#### Phase 2 (Foundational)
- Supabase migrations T012-T022 can run sequentially (database dependencies)
- T024-T027 (Supabase clients) can run in parallel
- T028-T034 (Utilities) can all run in parallel
- T035-T042 (Base UI components) can all run in parallel

#### Phase 3 (US1 - Authentication)
- T043-T047 (Auth pages) can run in parallel
- T049-T052 (Auth API routes) can run in parallel
- T054-T057 (Auth components) can run in parallel

#### Phase 4 (US2 - Professional Experiences)
- T066-T069 (Experience pages) can run in parallel
- T070-T074 (Experience API routes) can run in parallel

#### Phase 5-7 (US3, US4, US5)
- Once US1 is complete, US2, US3, and US4 can be developed in parallel by different developers
- US5 requires US2-US4 completion

#### Phase 8 (Polish)
- Most polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 2 (Professional Experiences)

```bash
# After authentication (US1) is complete, launch these in parallel:

# UI Pages (different files, no conflicts):
Task: "Create professional experiences list page in app/dashboard/experiences/professional/page.tsx"
Task: "Create add professional experience page in app/dashboard/experiences/professional/new/page.tsx"
Task: "Create edit professional experience page in app/dashboard/experiences/professional/[id]/edit/page.tsx"
Task: "Create view professional experience detail page in app/dashboard/experiences/professional/[id]/page.tsx"

# API Routes (different files, no conflicts):
Task: "Create GET /api/experiences/professional route"
Task: "Create POST /api/experiences/professional route"
Task: "Create GET /api/experiences/professional/[id] route"
Task: "Create PUT /api/experiences/professional/[id] route"
Task: "Create DELETE /api/experiences/professional/[id] route"
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only) - Recommended

1. Complete **Phase 1: Setup** (T001-T010)
2. Complete **Phase 2: Foundational** (T011-T042) - CRITICAL
3. Complete **Phase 3: User Story 1 - Authentication** (T043-T063)
4. Complete **Phase 4: User Story 2 - Professional Experiences** (T064-T083)
5. **STOP and VALIDATE**: Test that users can signup, login, and manage professional experiences
6. Deploy MVP to production

**MVP Scope**: Users can securely create accounts and manage professional work experiences with STAR format. This delivers core value proposition.

### Incremental Delivery (After MVP)

1. **Iteration 2**: Add US3 (Extra-Professional) + US4 (Education) → Deploy
2. **Iteration 3**: Add US5 (Export) → Deploy
3. **Iteration 4**: Phase 8 (Polish) → Final production release

### Parallel Team Strategy

With multiple developers (after Foundational phase complete):

1. **Developer A**: US1 (Authentication) - blocks others
2. Once US1 done:
   - **Developer A**: US2 (Professional Experiences)
   - **Developer B**: US3 (Extra-Professional Experiences)
   - **Developer C**: US4 (Education)
3. Once US2/US3/US4 done:
   - **Developer A**: US5 (Export)
   - **Developer B + C**: Phase 8 (Polish)

---

## Task Summary

- **Total Tasks**: 149
- **Setup**: 10 tasks
- **Foundational**: 32 tasks (BLOCKS all user stories)
- **User Story 1 (Auth)**: 21 tasks - MVP Critical
- **User Story 2 (Professional Exp)**: 20 tasks - MVP Critical
- **User Story 3 (Extra-Professional Exp)**: 14 tasks
- **User Story 4 (Education)**: 15 tasks
- **User Story 5 (Export)**: 11 tasks
- **Polish**: 26 tasks

**MVP Scope**: 10 (Setup) + 32 (Foundational) + 21 (US1) + 20 (US2) = **83 tasks**

**Parallel Opportunities Identified**: 60+ tasks marked [P] across all phases

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Each user story is independently completable and testable**
- **Tests not included**: Spec doesn't explicitly request tests, focus on implementation
- **Tech stack**: Next.js 14+ full-stack (TypeScript), Supabase (PostgreSQL + Auth), Vercel (hosting)
- **Commit strategy**: Commit after each task or logical group
- **Stop at any checkpoint**: Validate story independently before proceeding
- **Auto-save**: 2-second debounce after user stops typing (FR-051)
- **Character limits**: 10,000 chars per STAR field with visual counter (FR-020, FR-021)
- **Conflict detection**: Version field in database for concurrent edit handling (FR-053)
- **Accessibility**: WCAG 2.1 AA compliance required (FR-052)

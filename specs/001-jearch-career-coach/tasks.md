# Implementation Tasks: Jearch - Virtual Career Coach

**Feature Branch**: `001-jearch-career-coach`  
**Date**: 2026-01-15  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Overview

This document provides a complete, executable task list for implementing the Jearch Virtual Career Coach platform. Tasks are organized by user story to enable independent implementation and testing.

**Key Decisions**:
- **UI Library**: Chakra UI v2+ (NO Tailwind CSS)
- **Interface Language**: French (routes, labels, messages, validation text)
- **Code Language**: English (all code, comments, variable names remain in English)
- **Tech Stack**: Next.js 14+ App Router, Supabase, Vercel, TypeScript

**Task Format**: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- `[P]` = Parallelizable (can be done simultaneously with other [P] tasks)
- `[Story]` = User story label (US1, US2, etc.)

---

## Implementation Strategy

**MVP Scope**: User Story 1 (Authentication) only
- Deliverable: Working authentication system (register, login, logout, password reset)
- Timeline: Complete US1 before starting US2
- Testing: Manual testing of auth flows

**Incremental Delivery**:
1. **Phase 1-2**: Setup + Foundation → Deploy skeleton app
2. **Phase 3 (US1)**: Authentication → Deploy MVP (usable login/register)
3. **Phase 4 (US2)**: Professional Experiences → Deploy v0.2 (core value)
4. **Phase 5-7 (US3-US5)**: Additional features → Full v1.0

---

## Task Summary

| Phase | User Story | Priority | Task Count | Parallelizable |
|-------|------------|----------|------------|----------------|
| 1 | Setup | - | 12 | 8 |
| 2 | Foundation | - | 8 | 4 |
| 3 | US1: Authentication | P1 | 15 | 7 |
| 4 | US2: Professional Exp | P1 | 13 | 6 |
| 5 | US3: Extra-Pro Exp | P2 | 10 | 5 |
| 6 | US4: Education | P2 | 10 | 5 |
| 7 | US5: Export | P2 | 8 | 4 |
| 8 | Polish | - | 6 | 3 |
| **Total** | - | - | **82** | **42** |

---

## Dependencies & Execution Order

```
Phase 1 (Setup)
  ↓
Phase 2 (Foundation)
  ↓
Phase 3 (US1: Auth) ← BLOCKING for all user stories
  ↓
  ├─→ Phase 4 (US2: Professional Exp) ← MVP Core Value
  ├─→ Phase 5 (US3: Extra-Pro Exp)    ← Independent
  ├─→ Phase 6 (US4: Education)        ← Independent
  └─→ Phase 7 (US5: Export)           ← Depends on US2, US3, US4 data
       ↓
Phase 8 (Polish)
```

**Parallel Opportunities**:
- After US1 complete: US2, US3, US4 can be implemented in parallel
- US5 (Export) requires US2-US4 data structures but can start once schemas are defined

---

## Phase 1: Project Setup

**Goal**: Initialize Next.js project with Chakra UI, Supabase, and French routing structure.

### Tasks

- [ ] T001 Initialize Next.js 14+ project with TypeScript and App Router using `npx create-next-app@latest`
- [ ] T002 [P] Install Chakra UI v2+ dependencies: `@chakra-ui/react @chakra-ui/next-js @emotion/react @emotion/styled framer-motion`
- [ ] T003 [P] Install Supabase dependencies: `@supabase/supabase-js @supabase/ssr @supabase/auth-helpers-nextjs`
- [ ] T004 [P] Install form dependencies: `react-hook-form zod @hookform/resolvers`
- [ ] T005 [P] Install email dependencies: `nodemailer @types/nodemailer`
- [ ] T006 [P] Install testing dependencies: `jest @testing-library/react @testing-library/jest-dom playwright @playwright/test`
- [ ] T007 [P] Create project directory structure per plan.md (app/, components/, lib/, supabase/, tests/)
- [ ] T008 [P] Create French route structure: app/(auth)/connexion, app/(auth)/inscription, app/(auth)/reinitialiser
- [ ] T009 [P] Create authenticated route structure: app/(app)/tableau-de-bord, app/(app)/experiences-pro, app/(app)/experiences-extra, app/(app)/formation, app/(app)/exporter, app/(app)/parametres
- [ ] T010 Configure Chakra UI provider in app/layout.tsx with French locale theme
- [ ] T011 Create French theme configuration in lib/theme/french-theme.ts with localized component strings
- [ ] T012 [P] Initialize Supabase CLI and create supabase/config.toml for local development

**Completion Criteria**: `npm run dev` starts successfully, Chakra UI provider renders, French routes accessible (404 for now).

---

## Phase 2: Foundational Infrastructure

**Goal**: Set up database, authentication scaffolding, shared utilities, and Supabase RLS policies.

### Tasks

- [ ] T013 Create Supabase migration 001: profiles table with id, full_name, preferred_language, timestamps in supabase/migrations/001_create_profiles.sql
- [ ] T014 [P] Create Supabase migration 002: professional_experiences table per data-model.md in supabase/migrations/002_create_professional_experiences.sql
- [ ] T015 [P] Create Supabase migration 003: extra_professional_experiences table in supabase/migrations/003_create_extra_professional_experiences.sql
- [ ] T016 [P] Create Supabase migration 004: education table in supabase/migrations/004_create_education.sql
- [ ] T017 Create Supabase migration 005: app_config, email_queue, login_attempts tables in supabase/migrations/005_create_app_config_and_queues.sql
- [ ] T018 Create Supabase migration 006: Enable RLS policies on all tables per data-model.md in supabase/migrations/006_enable_rls.sql
- [ ] T019 Create Supabase client for server components in lib/supabase/server.ts
- [ ] T020 Create Supabase client for client components in lib/supabase/client.ts

**Completion Criteria**: `supabase db reset` succeeds, all tables exist with RLS policies, Supabase clients instantiate without errors.

---

## Phase 3: User Story 1 - Authentication (P1) 🔐

**Story Goal**: Job seekers can register, log in, log out, and reset passwords securely.

**Independent Test**: 
1. Register new account → Receive email verification (check Inbucket)
2. Verify email → Access granted
3. Login with correct credentials → Redirect to dashboard
4. Login with incorrect credentials (3 times) → Rate limiting enforced
5. Request password reset → Receive email (check Inbucket) → Reset password → Login works

**Acceptance Criteria**: All 5 acceptance scenarios from spec.md pass manual testing.

### Tasks

- [ ] T021 [P] [US1] Create Zod validation schemas for auth in lib/validation/schemas.ts (email, password with 12 char + letters/numbers)
- [ ] T022 [P] [US1] Create French validation error messages in lib/validation/messages.fr.ts
- [ ] T023 [P] [US1] Create structured logger utility in lib/logger/structured.ts (JSON format, console output)
- [ ] T024 [US1] Create authentication middleware in middleware.ts for rate limiting and route protection
- [ ] T025 [P] [US1] Create registration API route in app/api/auth/register/route.ts (Supabase Auth + email verification)
- [ ] T026 [P] [US1] Create login API route in app/api/auth/login/route.ts (Supabase Auth + rate limiting check)
- [ ] T027 [P] [US1] Create logout API route in app/api/auth/logout/route.ts
- [ ] T028 [P] [US1] Create password reset API route in app/api/auth/reset-password/route.ts
- [ ] T029 [P] [US1] Create SMTP configuration helper in lib/email/smtp.ts (load from app_config table)
- [ ] T030 [P] [US1] Create email queue service in lib/email/queue.ts (database-backed queue with exponential backoff)
- [ ] T031 [P] [US1] Create French email templates in lib/email/templates.ts (verification, password reset, unlock)
- [ ] T032 [US1] Create registration page UI (French) in app/(auth)/inscription/page.tsx using Chakra UI forms
- [ ] T033 [US1] Create login page UI (French) with "Rester connecté" checkbox in app/(auth)/connexion/page.tsx
- [ ] T034 [US1] Create password reset request page UI (French) in app/(auth)/reinitialiser/page.tsx
- [ ] T035 [US1] Create placeholder dashboard page in app/(app)/tableau-de-bord/page.tsx (auth-protected, shows "Bienvenue")

**Completion Criteria**: 
- User can register → email queued → verification required
- User can login → redirected to dashboard
- User can logout → session cleared
- User can request password reset → email queued
- Rate limiting works (3/5/10 attempts trigger delays)

---

## Phase 4: User Story 2 - Professional Experiences (P1) 💼

**Story Goal**: Authenticated users can create, view, edit, and delete professional experiences in STAR format.

**Independent Test**:
1. Navigate to /experiences-pro → See empty state or list
2. Click "Ajouter" → Fill form (company, role, dates, STAR fields) → Save
3. Experience appears in list (reverse chronological order)
4. Click "Modifier" → Edit STAR fields → Auto-save triggers → Success indicator shows
5. Open in two tabs → Edit in both → Conflict detection warns user
6. Click "Supprimer" → Confirm → Experience deleted

**Acceptance Criteria**: All 5 acceptance scenarios from spec.md pass manual testing.

### Tasks

- [ ] T036 [P] [US2] Create ProfessionalExperience TypeScript types in lib/types/experiences.ts (import from contracts/types.ts)
- [ ] T037 [P] [US2] Create Zod schema for professional experience validation in lib/validation/schemas.ts (10,000 char limit per STAR field)
- [ ] T038 [US2] Create professional experiences API routes (GET, POST, PUT, DELETE) in app/api/experiences/professional/route.ts and app/api/experiences/professional/[id]/route.ts
- [ ] T039 [P] [US2] Implement conflict detection logic (optimistic locking) in API PUT route using updated_at comparison
- [ ] T040 [P] [US2] Create auto-save hook in lib/hooks/useAutoSave.ts (2-second debounce, status indicator)
- [ ] T041 [P] [US2] Create STAR completion calculator utility in lib/utils/star-completion.ts
- [ ] T042 [P] [US2] Create ExperienceForm component in components/forms/ExperienceForm.tsx (Chakra UI + React Hook Form + French labels)
- [ ] T043 [P] [US2] Create character counter component in components/ui/CharacterCounter.tsx (French: "X/10000 caractères")
- [ ] T044 [P] [US2] Create auto-save indicator component in components/forms/AutoSaveIndicator.tsx (French: "Enregistrement...", "Enregistré")
- [ ] T045 [P] [US2] Create conflict resolution modal in components/modals/ConflictModal.tsx (side-by-side diff, French labels)
- [ ] T046 [US2] Create professional experiences list page in app/(app)/experiences-pro/page.tsx (French, reverse chrono sort)
- [ ] T047 [US2] Create add/edit professional experience page in app/(app)/experiences-pro/[id]/page.tsx (French form)
- [ ] T048 [US2] Add navigation link to experiences-pro in main navigation component components/layout/Navigation.tsx

**Completion Criteria**:
- CRUD operations work for professional experiences
- Auto-save triggers after 2 seconds
- Character counters show on all STAR fields
- Completion indicator shows (e.g., "3/4 complété")
- Conflict detection modal appears when concurrent edits detected

---

## Phase 5: User Story 3 - Extra-Professional Experiences (P2) 🌟

**Story Goal**: Authenticated users can document volunteer work, personal projects, and extra-professional activities in STAR format.

**Independent Test**:
1. Navigate to /experiences-extra → See empty state or list
2. Click "Ajouter" → Fill form (activity name, organization, dates, STAR) → Save
3. Experience appears in list (separate from professional)
4. Edit and delete work identically to professional experiences
5. STAR format identical to professional experiences

**Acceptance Criteria**: All 4 acceptance scenarios from spec.md pass manual testing.

### Tasks

- [ ] T049 [P] [US3] Create ExtraProfessionalExperience TypeScript types in lib/types/experiences.ts
- [ ] T050 [P] [US3] Create Zod schema for extra-professional experience validation in lib/validation/schemas.ts
- [ ] T051 [US3] Create extra-professional experiences API routes in app/api/experiences/extra-professional/route.ts and app/api/experiences/extra-professional/[id]/route.ts
- [ ] T052 [P] [US3] Create ExtraExperienceForm component in components/forms/ExtraExperienceForm.tsx (reuse ExperienceForm logic, different fields)
- [ ] T053 [P] [US3] Update conflict detection to support extra-professional experiences in existing ConflictModal
- [ ] T054 [US3] Create extra-professional experiences list page in app/(app)/experiences-extra/page.tsx (French)
- [ ] T055 [US3] Create add/edit extra-professional experience page in app/(app)/experiences-extra/[id]/page.tsx
- [ ] T056 [US3] Add navigation link to experiences-extra in components/layout/Navigation.tsx
- [ ] T057 [US3] Add visual distinction in UI between professional and extra-professional experiences (e.g., icon, color)
- [ ] T058 [US3] Ensure completion indicator and auto-save work for extra-professional experiences

**Completion Criteria**:
- Extra-professional experiences CRUD works
- Clearly distinguished from professional experiences in UI
- Same STAR format and auto-save behavior
- Conflict detection works

---

## Phase 6: User Story 4 - Education History (P2) 🎓

**Story Goal**: Authenticated users can document their educational background with institution, degree, field of study, dates, and optional details.

**Independent Test**:
1. Navigate to /formation → See empty state or list
2. Click "Ajouter" → Fill form (institution, degree, field, dates) → Save
3. Education entry appears in list (reverse chronological order)
4. Mark education as "en cours" (no end date) → Displays correctly
5. Add optional details (GPA, honors, coursework) → Saved and displayed
6. Edit and delete work as expected

**Acceptance Criteria**: All 4 acceptance scenarios from spec.md pass manual testing.

### Tasks

- [ ] T059 [P] [US4] Create Education TypeScript types in lib/types/education.ts
- [ ] T060 [P] [US4] Create Zod schema for education validation in lib/validation/schemas.ts (no date overlap validation per spec)
- [ ] T061 [US4] Create education API routes in app/api/education/route.ts and app/api/education/[id]/route.ts
- [ ] T062 [P] [US4] Create EducationForm component in components/forms/EducationForm.tsx (Chakra UI + French labels)
- [ ] T063 [P] [US4] Create "en cours" checkbox toggle logic in EducationForm (hides end date when checked)
- [ ] T064 [P] [US4] Create optional fields section (GPA, honors, coursework) in EducationForm
- [ ] T065 [US4] Create education list page in app/(app)/formation/page.tsx (French, reverse chrono sort)
- [ ] T066 [US4] Create add/edit education page in app/(app)/formation/[id]/page.tsx
- [ ] T067 [US4] Add navigation link to formation in components/layout/Navigation.tsx
- [ ] T068 [US4] Ensure auto-save works for education entries

**Completion Criteria**:
- Education CRUD operations work
- "En cours" checkbox properly hides end date
- Optional fields (GPA, honors, coursework) save and display
- Auto-save triggers after 2 seconds

---

## Phase 7: User Story 5 - Career Path Export (P2) 📄

**Story Goal**: Authenticated users can export their complete career path (professional experiences, extra-professional experiences, education) to markdown format.

**Independent Test**:
1. Add at least one entry in each category (professional, extra-professional, education)
2. Navigate to /exporter → Click "Exporter en Markdown"
3. Markdown file downloads with all data
4. Verify markdown formatting: section headers, STAR labels, date formatting
5. Test with empty career path → Receives placeholder markdown

**Acceptance Criteria**: All 3 acceptance scenarios from spec.md pass manual testing.

### Tasks

- [ ] T069 [P] [US5] Create markdown generation utility in lib/export/markdown.ts (server-side function)
- [ ] T070 [P] [US5] Create markdown character escaping utility in lib/export/escape.ts (escape *, #, [, ], (, ), `, \)
- [ ] T071 [P] [US5] Create French date formatting utility in lib/utils/date-format.ts (format: "Jan 2020 - Présent")
- [ ] T072 [US5] Create export API route in app/api/export/markdown/route.ts (fetch all user data, generate markdown, return as download)
- [ ] T073 [P] [US5] Implement empty career path handling in markdown.ts (section headers + placeholder text)
- [ ] T074 [US5] Create export page UI in app/(app)/exporter/page.tsx (preview section, export button)
- [ ] T075 [US5] Add navigation link to exporter in components/layout/Navigation.tsx
- [ ] T076 [US5] Test markdown output with special characters to ensure proper escaping

**Completion Criteria**:
- Export button generates markdown download
- All data (professional, extra-professional, education) included
- STAR components clearly labeled in French
- Dates formatted consistently ("Jan 2020 - Présent")
- Special characters escaped correctly
- Empty career path generates placeholder markdown

---

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Finalize accessibility, admin features, deployment configuration, and documentation.

### Tasks

- [ ] T077 [P] Implement SMTP configuration admin panel in app/(app)/parametres/page.tsx (admin-only, encrypts password)
- [ ] T078 [P] Create account deletion flow in app/(app)/parametres/page.tsx (export reminder, confirmation modal, French)
- [ ] T079 [P] Create email queue processor (cron job or Edge Function) for retry logic with exponential backoff
- [ ] T080 Run accessibility audit on all pages using axe DevTools, fix WCAG 2.1 AA violations
- [ ] T081 Create comprehensive README.md in project root with setup instructions (reference quickstart.md)
- [ ] T082 Configure Vercel deployment with environment variables (Supabase keys, SMTP config placeholders)

**Completion Criteria**:
- Admin can configure SMTP settings via UI
- Email queue processor runs and retries failed emails
- All pages pass WCAG 2.1 AA audit
- README provides clear setup instructions
- Vercel deployment succeeds

---

## Parallel Execution Examples

### Phase 1 (Setup) - Parallel Batch 1
Run simultaneously:
- T002 (Install Chakra UI)
- T003 (Install Supabase)
- T004 (Install form deps)
- T005 (Install email deps)
- T006 (Install testing deps)
- T007 (Create directories)
- T008 (Create auth routes)
- T009 (Create app routes)

### Phase 2 (Foundation) - Parallel Batch 1
Run simultaneously:
- T014 (professional_experiences migration)
- T015 (extra_professional_experiences migration)
- T016 (education migration)

### Phase 3 (US1) - Parallel Batch 1
Run simultaneously:
- T021 (Zod schemas)
- T022 (French messages)
- T023 (Logger utility)

### Phase 3 (US1) - Parallel Batch 2
After T024 (middleware), run simultaneously:
- T025 (Register API)
- T026 (Login API)
- T027 (Logout API)
- T028 (Reset password API)
- T029 (SMTP config)
- T030 (Email queue)
- T031 (Email templates)

### Phase 4 (US2) - Parallel Batch 1
After T038 (API routes), run simultaneously:
- T040 (Auto-save hook)
- T041 (STAR completion)
- T042 (ExperienceForm component)
- T043 (CharacterCounter component)
- T044 (AutoSaveIndicator)
- T045 (ConflictModal)

---

## Testing Strategy

**Manual Testing** (No automated tests in this iteration):
- Test each user story's acceptance scenarios after completing its phase
- Use Inbucket (http://localhost:54324) to verify emails
- Test on desktop, tablet, mobile viewports
- Test keyboard navigation (WCAG requirement)
- Test with screen reader (VoiceOver/NVDA in French mode)

**User Story Test Checklist**:
- [ ] US1: All 5 acceptance scenarios pass
- [ ] US2: All 5 acceptance scenarios pass
- [ ] US3: All 4 acceptance scenarios pass
- [ ] US4: All 4 acceptance scenarios pass
- [ ] US5: All 3 acceptance scenarios pass

---

## Definition of Done (Per Phase)

**Phase Complete When**:
1. All tasks in phase checked off
2. User story acceptance scenarios manually tested and pass
3. No console errors in browser or server
4. French UI verified (no English strings visible)
5. Supabase RLS policies verified (users can't access others' data)
6. Code committed to feature branch
7. Deployed to Vercel preview environment (if applicable)

---

## Notes

**French UI Implementation**:
- Routes: French paths (e.g., `/connexion`, not `/login`)
- Labels: All buttons, forms, headings in French
- Validation: All error messages in French (lib/validation/messages.fr.ts)
- Emails: All templates in French (lib/email/templates.ts)
- Code: All code, comments, variable names remain in English

**Chakra UI (No Tailwind)**:
- Use Chakra's `<Box>`, `<Button>`, `<Input>`, `<Textarea>`, etc.
- Style using Chakra's style props (not Tailwind classes)
- Theme customization in lib/theme/french-theme.ts
- Responsive: Use Chakra's responsive syntax (e.g., `{base: "100%", md: "50%"}`)

**Supabase RLS Critical**:
- All database access MUST respect RLS policies
- Use authenticated Supabase client (not anon key) for user-specific queries
- Test: User A cannot see User B's experiences/education

---

## Next Steps

1. **Start with Phase 1**: Complete all setup tasks (T001-T012)
2. **Verify Foundation**: Complete Phase 2, run `supabase db reset`, verify tables
3. **Build MVP**: Complete Phase 3 (US1), test all auth flows
4. **Deploy MVP**: Push to Vercel, verify production auth works
5. **Iterate**: Complete phases 4-7 in order, deploying after each user story
6. **Polish**: Complete Phase 8 before final v1.0 release

**Recommended First Task**: T001 (Initialize Next.js project)

**Questions?** Reference:
- [quickstart.md](./quickstart.md) for setup help
- [plan.md](./plan.md) for architectural decisions
- [data-model.md](./data-model.md) for database schema
- [contracts/api.openapi.yaml](./contracts/api.openapi.yaml) for API endpoints

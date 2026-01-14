# Technology Research: Jearch Implementation

**Date**: 2026-01-13  
**Feature**: 001-jearch-career-coach  
**Purpose**: Resolve technology stack decisions for Vercel + Supabase deployment

---

## 1. Full-Stack Framework

### Decision
**Next.js 14+ (Full-Stack TypeScript)**

### Rationale
Next.js 14+ serves as both frontend and backend for Jearch, eliminating the need for a separate Python API layer. This full-stack approach reduces complexity, improves performance (no extra API hop), and keeps the entire codebase in TypeScript. Next.js API Routes and Server Actions handle all backend logic (CRUD operations, auth validation, markdown export) while directly integrating with Supabase. The Vercel AI SDK is built specifically for Next.js, making future AI chatbot features seamless. Server Components enable efficient data fetching, and the App Router provides hybrid rendering (SSR for public pages, CSR for interactive dashboards). Single-language codebase simplifies development, enables type sharing between client/server, and reduces serverless function invocations (better performance and cost).

### Alternatives Considered
- **Separate Python Backend (FastAPI)**: Rejected because it adds unnecessary complexity (two deployments, two languages, extra API hop with cold starts), when Next.js can handle all backend requirements natively. Python would only be justified for ML workloads or Python-specific libraries, neither of which apply here.
- **SvelteKit**: Lighter bundle size but smaller ecosystem for AI integration (no Vercel AI SDK equivalent), fewer Supabase examples, and less mature accessibility component libraries. The future AI chatbot feature makes React's ecosystem more valuable.
- **Remix**: Good full-stack framework but Next.js has better Vercel integration (zero-config), more Supabase examples, and the Vercel AI SDK is Next.js-first.

### Implementation Notes
- API Routes in `app/api/` directory for RESTful endpoints
- Server Actions for form mutations (alternative to API routes)
- Direct Supabase client integration (no intermediate API layer)
- JWT validation using `@supabase/ssr` for server-side auth
- TypeScript types shared between client and server
- Zod for request/response validation

---

## 2. Frontend Architecture (Next.js App Router)

### Decision
**Next.js 14+ (App Router with React Server Components)**

### Rationale
Next.js is the optimal choice because it's built by Vercel specifically for their platform, offering zero-config deployment, automatic serverless function creation, and built-in optimizations. The App Router with React Server Components provides excellent performance through selective client-side hydration while maintaining rich interactivity for forms. Next.js has the most mature ecosystem for Jearch's requirements: React Hook Form or Formik for sophisticated form handling with auto-save/debounce, extensive accessibility tooling (automatic image optimization, built-in ESLint accessibility rules), seamless Supabase integration via `@supabase/auth-helpers-nextjs`, and excellent documentation for SSR/SPA hybrid approaches ideal for authenticated dashboards.

### Alternatives Considered
- **React (Vite + SPA)**: Pure SPA loses SEO benefits for public pages, requires manual Vercel configuration, lacks built-in API routes forcing all backend logic into separate Python functions, and provides no SSR benefits for initial page loads
- **SvelteKit**: Smaller ecosystem for critical requirements (fewer form libraries with mature auto-save patterns, less extensive accessibility libraries, fewer Supabase integration examples), smaller talent pool for maintenance
- **Vue.js (Nuxt 3)**: Smaller ecosystem for enterprise-grade form handling, less extensive Supabase documentation, fewer accessibility component libraries (Radix UI/Headless UI are React-first)

### Implementation Notes
- Use App Router with hybrid rendering:
  - Public pages (landing, login): Server-side rendered for SEO
  - Dashboard/Forms: Client-side rendered for rich interactivity
- Form handling: React Hook Form + Zod validation
- Auto-save implementation:
  ```javascript
  const { watch } = useForm();
  useEffect(() => {
    const subscription = watch(debounce((data) => autoSave(data), 2000));
    return () => subscription.unsubscribe();
  }, [watch]);
  ```
- Accessibility: Radix UI or Headless UI for WCAG 2.1 AA compliant components
- Auth middleware: `@supabase/auth-helpers-nextjs` for route protection

---

## 3. Email Service Strategy

### Decision
**Supabase Auth with Custom SMTP + Supabase Edge Functions for Email Queue Management**

### Rationale
Supabase Auth provides built-in email verification and password reset flows with customizable templates and supports custom SMTP configuration, satisfying core authentication email requirements. To meet additional requirements (retry queue, failed email monitoring, admin-configurable SMTP), complement this with a Supabase Edge Function that handles email queuing and retry logic. This approach leverages Supabase's native capabilities while adding production-grade robustness. The combination keeps infrastructure simple (no additional services beyond Supabase + Vercel), provides full control over email logic, and enables admin monitoring through Supabase database tables.

### Alternatives Considered
- **Supabase Auth with default email only**: Lacks retry queue functionality and admin-configurable SMTP settings (configured at project level, not runtime)
- **Vercel serverless + external email service (SendGrid/Resend)**: Bypasses Supabase Auth's built-in flows, requiring custom implementation of security-critical authentication flows
- **Pure Edge Functions replacing Supabase Auth**: Unnecessarily duplicates Supabase Auth's battle-tested email verification and password reset logic

### Implementation Architecture

```
User Action → Supabase Auth → Edge Function (Email Queue) → SMTP Service
                  ↓                     ↓                         
            Secure tokens        Queue + Retry Logic        Configurable
            Email triggers       Failure logging            (SendGrid/SES/Resend)
```

### Database Schema
- `email_queue`: Tracks pending, sent, failed, retrying emails with exponential backoff
- `email_failures`: Logs failed emails for admin monitoring
- `smtp_config`: Admin-configurable SMTP settings (host, port, credentials in Supabase Vault)

### Retry Logic
- Exponential backoff: 5, 10, 20 minutes between retries
- Max 3 attempts before marking as failed
- Cron job (Vercel or Supabase) processes queue every 5 minutes

### Recommended SMTP Providers
1. **Resend** - Modern API, 3,000 emails/month free, excellent deliverability
2. **AWS SES** - Cheapest at scale ($0.10/1000 emails)
3. **SendGrid** - Enterprise-grade, 100 emails/day free
4. **Postmark** - Best deliverability rates

---

## 4. Authentication Integration

### Decision
**Use Supabase Auth as primary system with JWT validation in Next.js API routes. Frontend handles all auth UI flows via Supabase client SDK; API routes validate sessions using Supabase SSR helpers.**

### Rationale
Supabase Auth is production-ready and handles all required flows (email verification, password reset, session management) out-of-the-box, eliminating custom auth logic. The architecture leverages Supabase's secure token generation while Next.js API routes validate sessions for API authorization. The `@supabase/ssr` package provides server-side helpers for Next.js that handle cookie-based sessions, automatic token refresh, and secure server-side auth validation. This minimizes security risks, reduces development time, and scales well with Vercel's serverless architecture.

### Implementation Notes

#### Email Verification
- Enable "Confirm email" in Supabase Dashboard → Authentication → Email Settings
- Users receive verification email after signup
- Auth flow blocks unverified users automatically
- Backend validates JWT `email_confirmed_at` claim

#### Password Reset
- Frontend calls `supabase.auth.resetPasswordForEmail()`
- User receives email with reset link to frontend route
- Frontend route calls `supabase.auth.updateUser({ password })`
- No backend code required

#### "Keep Me Logged In"
- Supabase sessions persist by default using refresh tokens (7 days default, configurable to 1 year)
- Frontend implementation:
  ```javascript
  // Persistent (localStorage - default):
  const supabase = createClient(url, key)
  
  // Non-persistent (sessionStorage):
  const supabase = createClient(url, key, {
    auth: { storage: window.sessionStorage }
  })
  ```
- Supabase auto-refreshes access tokens (1-hour expiry)

#### Password Policy (12 chars, letters + numbers)
- **Limitation**: Supabase only supports minimum length configuration, no complexity rules
- **Solution**: 
  - Frontend validation: Regex `^(?=.*[A-Za-z])(?=.*\d).{12,}$` before `signUp()`
  - Backend defense: Database trigger on `auth.users` to reject weak passwords
  - Set minimum length to 12 in Supabase Dashboard

#### Next.js API Routes JWT Validation
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Get authenticated user from session
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  if (!user.email_confirmed_at) {
    return NextResponse.json({ error: 'Email not verified' }, { status: 403 })
  }
  
  // User is authenticated and verified
  return NextResponse.json({ userId: user.id, email: user.email })
}
```

#### Session Security
- **Brute Force**: Supabase built-in rate limiting (6 requests/60s per IP); add Vercel middleware for additional protection
- **Session Hijacking Prevention**:
  - Short-lived JWTs (1 hour)
  - Single-use refresh tokens (rotated on refresh)
  - HTTPS only (Vercel enforced)
  - Backend validates signature, expiry, audience
- **CORS**: Configure allowed origins in Supabase Dashboard
- **RLS**: Enable Row-Level Security policies for user-level data isolation

### Environment Variables
**Next.js (Vercel)**:
- `NEXT_PUBLIC_SUPABASE_URL` (public - client-side)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public - client-side)
- `SUPABASE_SERVICE_ROLE_KEY` (private - server-side only, for admin operations)

### Alternatives Considered
- **Custom Backend Auth**: Building email verification, password reset, session management from scratch increases development time and security risk
- **Frontend-only with Direct DB Access**: Exposes database operations to client manipulation; backend validation essential
- **Firebase Auth**: Additional vendor; Supabase Auth maintains single-vendor integration
- **Auth0/Clerk**: Additional cost and complexity; Supabase Auth included with database tier

---

## 5. Project Structure Decision

### Structure
```
jearch/
├── app/                       # Next.js App Router (frontend + backend)
│   ├── (auth)/               # Auth routes (login, signup, reset)
│   ├── dashboard/            # Protected dashboard
│   ├── experiences/          # Experience management pages
│   ├── education/            # Education management pages
│   ├── export/               # Career path export pages
│   ├── api/                  # Next.js API Routes (backend)
│   │   ├── experiences/      # Experience CRUD endpoints
│   │   ├── education/        # Education CRUD endpoints
│   │   └── export/           # Markdown export endpoints
│   └── layout.tsx            # Root layout
│
├── components/               # Reusable UI components
│   ├── ui/                   # Base UI components (buttons, forms)
│   └── features/             # Feature-specific components
│
├── lib/                      # Utilities and shared code
│   ├── supabase/            # Supabase client setup
│   ├── validations/         # Zod schemas
│   └── utils/               # Helper functions
│
├── supabase/
│   ├── migrations/          # Database schema
│   └── functions/           # Edge Functions (email queue)
│
├── public/                  # Static assets
├── package.json
├── next.config.js
└── tsconfig.json
```

### Rationale
- Single Next.js application handles both frontend and backend (full-stack TypeScript)
- API Routes in `app/api/` provide RESTful endpoints without separate backend deployment
- Eliminates complexity of managing two separate applications and languages
- Type sharing between client and server code reduces bugs
- Single deployment target on Vercel with zero configuration
- All backend logic (CRUD, auth validation, export) runs as serverless functions automatically
- Supabase folder remains separate for database migrations and Edge Functions (email queue)

---

## 6. Testing Strategy

### API Routes Testing
- **Framework**: Jest + Next.js testing utilities
- **Unit Tests**: API route handlers, validation functions
- **Integration Tests**: Supabase client operations, auth flows
- **Mocking**: Mock Supabase client for isolated tests

### Frontend Testing
- **Framework**: Jest + React Testing Library
- **Unit Tests**: Component rendering, form validation
- **Integration Tests**: Supabase Auth flows, API route calls
- **E2E Tests**: Playwright for critical user journeys

### E2E Test Scenarios
1. User registration → email verification → login
2. Add professional experience → auto-save → edit → delete
3. Concurrent edit conflict detection
4. Export empty career path → export with data

---

## Summary of Key Decisions

| Decision Area | Choice | Primary Reason |
|--------------|--------|----------------|
| Full-Stack Framework | Next.js 14+ (TypeScript) | Single codebase, API Routes for backend, Vercel-native, hybrid rendering |
| Database/Auth | Supabase | All-in-one solution, built-in auth, PostgreSQL |
| Email Strategy | Supabase Auth + Edge Functions | Native flows + retry queue + monitoring |
| Hosting | Vercel | Serverless, zero-config, automatic scaling |
| Authentication | Supabase Auth + JWT validation | Production-ready, secure, minimal custom code |

---

## Next Steps for Implementation

1. ✅ Research complete
2. → Generate data-model.md (Phase 1)
3. → Generate API contracts (Phase 1)
4. → Generate quickstart.md (Phase 1)
5. → Update agent context (Phase 1)
6. → Generate tasks.md (Phase 2 - separate `/speckit.tasks` command)

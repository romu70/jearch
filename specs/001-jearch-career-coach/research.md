# Technology Research: Jearch Implementation

**Date**: 2026-01-13  
**Feature**: 001-jearch-career-coach  
**Purpose**: Resolve technology stack decisions for Vercel + Supabase deployment

---

## 1. Python Backend Framework

### Decision
**FastAPI**

### Rationale
FastAPI is optimal for Jearch on Vercel serverless functions due to its automatic OpenAPI documentation, native async/await support for concurrent operations (critical for auto-save debouncing and SMTP), built-in Pydantic validation for request/response models (essential for conflict detection with version tracking), and excellent TypeScript client generation. Performance characteristics align well with serverless constraints (~500-800ms cold starts), with strong community adoption for Vercel deployments. The framework's dependency injection system simplifies Supabase Auth integration through middleware, while its async nature efficiently handles the 2-second debounce auto-save pattern without blocking other requests.

### Alternatives Considered
- **Flask**: Synchronous-by-default nature makes implementing debounced auto-save and concurrent SMTP operations more complex, requiring additional libraries like Flask-Async or worker queues that add cold start overhead on Vercel (~400-600ms base but loses advantage with async additions)
- **Django**: Excessive framework overhead for serverless - ORM, admin panel, and middleware stack significantly increase cold starts (3-5s vs <1s for FastAPI) and memory footprint, making it unsuitable for Vercel's 50MB deployment limit

### Implementation Notes
- Deploy pattern: single `api/index.py` file or route-based `api/*.py` structure
- Use `mangum` adapter for ASGI on Vercel
- Integrate `supabase-py` client library for database operations
- JWT validation using `pyjwt` with Supabase JWT secret

---

## 2. Frontend Framework

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
**Use Supabase Auth as primary system with JWT validation in Python backend. Frontend handles all auth UI flows via Supabase client SDK; backend validates JWTs on protected endpoints.**

### Rationale
Supabase Auth is production-ready and handles all required flows (email verification, password reset, session management) out-of-the-box, eliminating custom auth logic. The architecture leverages Supabase's secure token generation while Python backend validates tokens for API authorization, providing defense-in-depth. This minimizes security risks, reduces development time, and scales well with Vercel's serverless architecture since authentication state is managed client-side with JWTs.

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

#### Python Backend JWT Validation
```python
import jwt
from supabase import create_client

def verify_jwt(token: str):
    payload = jwt.decode(
        token,
        os.getenv("SUPABASE_JWT_SECRET"),
        algorithms=["HS256"],
        audience="authenticated"
    )
    
    if not payload.get("email_confirmed_at"):
        raise Exception("Email not verified")
    
    return payload  # Contains user_id, email, role
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
**Backend (Vercel)**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (admin operations, never expose)
- `SUPABASE_JWT_SECRET` (JWT verification)

**Frontend**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

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
├── backend/
│   ├── api/                    # Vercel serverless functions
│   │   ├── index.py           # FastAPI app entry
│   │   ├── experiences.py     # Experience CRUD
│   │   ├── education.py       # Education CRUD
│   │   └── export.py          # Markdown export
│   ├── requirements.txt
│   └── vercel.json
│
├── frontend/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Auth routes (login, signup, reset)
│   │   ├── dashboard/        # Protected dashboard
│   │   ├── experiences/      # Experience management
│   │   ├── education/        # Education management
│   │   └── export/           # Career path export
│   ├── components/           # Reusable UI components
│   ├── lib/                  # Utilities (Supabase client)
│   ├── package.json
│   └── next.config.js
│
└── supabase/
    ├── migrations/           # Database schema
    └── functions/            # Edge Functions (email queue)
```

### Rationale
- Separate backend and frontend for independent deployment and scaling
- Backend contains Python serverless functions for Vercel
- Frontend is Next.js application with App Router
- Supabase folder contains database migrations and Edge Functions
- Mono-repo structure simplifies development while maintaining separation

---

## 6. Testing Strategy

### Backend Testing
- **Framework**: pytest
- **Contract Tests**: OpenAPI schema validation
- **Integration Tests**: Supabase client operations
- **Unit Tests**: Business logic, validation functions

### Frontend Testing
- **Framework**: Jest + React Testing Library
- **Unit Tests**: Component rendering, form validation
- **Integration Tests**: Supabase Auth flows, API calls
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
| Backend Framework | FastAPI | Async support, auto-docs, Vercel-optimized |
| Frontend Framework | Next.js 14+ | Vercel-native, mature ecosystem, hybrid rendering |
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

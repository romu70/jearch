# Quickstart Guide: Jearch Development

**Feature**: 001-jearch-career-coach  
**Date**: 2026-01-14  
**Target**: Developers setting up the Jearch project for the first time

---

## Prerequisites

- **Node.js**: 18.x or later
- **Git**: For version control
- **Supabase Account**: Create at [supabase.com](https://supabase.com)
- **Vercel Account**: Create at [vercel.com](https://vercel.com)
- **Code Editor**: VS Code recommended

---

## Project Architecture Overview

```
jearch/
├── app/               # Next.js App Router (frontend + backend)
├── components/        # Reusable UI components
├── lib/               # Utilities and shared code
├── supabase/          # Database migrations & Edge Functions
└── specs/             # Feature specifications & documentation
```

**Stack**:
- **Full-Stack Framework**: Next.js 14+ (TypeScript, React)
- **Backend**: Next.js API Routes (serverless functions)
- **Database/Auth**: Supabase (PostgreSQL + Auth)
- **Hosting**: Vercel
- **Email**: Supabase Auth + Edge Functions + SMTP (Resend/SendGrid/SES)
- **UI**: Tailwind CSS, Radix UI

---

## Step 1: Clone and Setup Repository

```bash
# Clone the repository
git clone https://github.com/your-org/jearch.git
cd jearch

# Checkout feature branch
git checkout 001-jearch-career-coach
```

---

## Step 2: Setup Supabase Project

### 2.1 Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Enter project details:
   - **Name**: `jearch-dev` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to you
4. Wait for project provisioning (~2 minutes)

### 2.2 Get Supabase Credentials

1. Navigate to **Settings** → **API**
2. Copy these values (you'll need them later):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon (public) key**: `eyJhbG...`
   - **Service role key**: `eyJhbG...` (keep this secret!)

### 2.3 Configure Supabase Auth

1. Navigate to **Authentication** → **Providers**
2. Enable **Email** provider
3. Navigate to **Authentication** → **Email Templates**
4. Configure templates:
   - **Confirm signup**: Customize the verification email
   - **Reset password**: Customize the password reset email
5. Navigate to **Authentication** → **Auth Settings** → **Password**
6. Set **Minimum password length**: 12

### 2.4 Run Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
cd supabase
supabase link --project-ref <your-project-ref>

# Run migrations (when available)
supabase db push
```

---

## Step 3: Setup Next.js Application

### 3.1 Install Dependencies

```bash
# From project root
npm install

# Key dependencies:
# - next (14+)
# - react, react-dom
# - @supabase/supabase-js
# - @supabase/auth-helpers-nextjs
# - @supabase/ssr
# - react-hook-form
# - zod (validation)
# - tailwindcss
# - @radix-ui/react-* (accessible components)
```

### 3.2 Configure Environment Variables

Create `.env.local` at project root:

```env
# Supabase Configuration (Public - used by client)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Configuration (Private - server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Environment
NEXT_PUBLIC_ENVIRONMENT=development
```

**Important**: Never commit `.env.local` to version control. Add it to `.gitignore`.

### 3.3 Run Development Server

```bash
# Start Next.js development server
npm run dev

# App will be available at http://localhost:3000
# API routes available at http://localhost:3000/api/*
```

---

## Step 4: Setup Supabase Edge Functions (Email Queue)

### 4.1 Create Edge Function

```bash
cd supabase/functions

# Create email-processor function
supabase functions new email-processor

# Edit email-processor/index.ts with the implementation from research.md
```

### 4.2 Deploy Edge Function

```bash
# Deploy to Supabase
supabase functions deploy email-processor

# Set environment variables for the function
supabase secrets set RESEND_API_KEY=your-resend-api-key
```

### 4.3 Setup Cron Job

**Option A: Supabase Cron** (if available in your plan)
1. Go to Database → Cron Jobs
2. Create new job running every 5 minutes
3. Call email-processor function

**Option B: Vercel Cron** (recommended for free tier)
- Configure in `vercel.json` (see deployment section)

---

## Step 5: Local Development Workflow

### 5.1 Start Development

```bash
# Start Next.js (includes both frontend and API routes)
npm run dev

# Optional: Start local Supabase for testing
cd supabase
supabase start
```

### 5.2 Access the Application

- **Frontend**: http://localhost:3000
- **API Routes**: http://localhost:3000/api/*
- **Supabase Dashboard**: https://app.supabase.co/project/<your-project-ref>
- **Local Supabase** (if running): http://localhost:54321

### 5.3 Test User Flow

1. **Register**: Go to http://localhost:3000/signup
   - Email: test@example.com
   - Password: SecurePass123 (min 12 chars, letters + numbers)
2. **Verify Email**: Check Supabase dashboard for verification link (in development, emails may not be sent)
3. **Login**: Go to http://localhost:3000/login
4. **Add Experience**: Navigate to dashboard and create a professional experience
5. **Test Auto-save**: Type in STAR fields and wait 2 seconds (should auto-save)
6. **Export**: Click "Export to Markdown" to download career path

---

## Step 6: Deploy to Vercel

### 6.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 6.2 Configure Vercel

Create `vercel.json` at project root:

```json
{
  "version": 2,
  "crons": [
    {
      "path": "/api/cron/process-emails",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Note**: Next.js deployment is automatically detected by Vercel. No build configuration needed.

### 6.3 Add Environment Variables to Vercel

```bash
# Login to Vercel
vercel login

# Link project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

Alternatively, add them via Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable for Production, Preview, and Development

### 6.4 Deploy

```bash
# Deploy to production
vercel --prod

# Your app will be live at https://jearch.vercel.app
```

---

## Step 7: Configure SMTP for Production Emails

### Option A: Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Get API key from dashboard
3. Add to Supabase secrets:
   ```bash
   supabase secrets set RESEND_API_KEY=re_xxx
   ```
4. Update email-processor Edge Function to use Resend

### Option B: AWS SES

1. Set up AWS SES and verify domain
2. Get SMTP credentials
3. Add to `smtp_config` table in Supabase
4. Configure in Edge Function

### Option C: SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get API key
3. Add to Supabase secrets
4. Configure in Edge Function

---

## Common Development Tasks

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run E2E tests with Playwright
npm run test:e2e

# Run specific test file
npm test -- path/to/test.test.ts
```

### Database Migrations

```bash
# Create new migration
cd supabase
supabase migration new <migration_name>

# Apply migrations
supabase db push

# Reset database (destructive!)
supabase db reset
```

### Build for Production

```bash
# Build Next.js application
npm run build

# Start production server locally
npm start

# Analyze bundle size
npm run build -- --analyze
```

### View Logs

```bash
# Development logs
# Check terminal running npm run dev

# Production logs
vercel logs

# Supabase Edge Function logs
supabase functions logs email-processor

# View specific deployment logs
vercel logs <deployment-url>
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Format with Prettier (if configured)
npm run format
```

### Debugging

**Frontend/API Routes**:
- Use Chrome DevTools or browser inspector
- Add `debugger` statements in code
- Check Network tab for API calls
- Use React DevTools extension

**Server Components**:
- Check terminal output (server-side logs)
- Use `console.log` in Server Components
- Logs appear in terminal, not browser console

**Database Queries**:
- Use Supabase SQL Editor in dashboard
- Enable query logging in Supabase settings
- Check Postgres logs in Supabase dashboard

---

## Troubleshooting

### Issue: "Email not verified" error on login

**Solution**: In development, manually verify users in Supabase dashboard:
1. Go to Authentication → Users
2. Find user
3. Click "..." → "Confirm email"

### Issue: CORS errors when calling API routes

**Solution**: Next.js API routes run on same origin, so CORS shouldn't be an issue. If you see CORS errors:
1. Verify you're calling `/api/*` routes, not external URLs
2. Check Supabase CORS settings in Dashboard → Settings → API
3. Ensure you're not mixing local and deployed URLs

### Issue: Environment variables not loading

**Solution**: 
1. Verify `.env.local` exists at project root
2. Restart dev server after adding new variables
3. Public variables must start with `NEXT_PUBLIC_`
4. Private variables (no prefix) are only available server-side
5. Don't use `.env` - use `.env.local` for local development

### Issue: Supabase client errors

**Solution**:
1. Verify credentials in `.env.local` are correct
2. Check Supabase project is running (not paused)
3. Verify API keys haven't been rotated
4. Check network connectivity to Supabase

### Issue: Vercel deployment fails

**Solution**: 
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set in Vercel
3. Run `npm run build` locally to test build process
4. Check for TypeScript errors: `npm run type-check`
5. Verify Node.js version in `package.json` engines field

### Issue: Auto-save not working

**Solution**:
1. Check browser console for errors
2. Verify debounce logic in React Hook Form
3. Check Network tab for API calls
4. Verify API route is accessible: `/api/experiences` or `/api/education`
5. Check Supabase Row Level Security policies allow updates

### Issue: TypeScript errors

**Solution**:
1. Run `npm run type-check` to see all errors
2. Ensure `@types/*` packages are installed
3. Check `tsconfig.json` is properly configured
4. Restart TypeScript server in VS Code: Cmd+Shift+P → "Restart TypeScript Server"

---

## Development Best Practices

### Project Structure

```
app/
├── (auth)/              # Auth-related routes (login, signup)
│   ├── login/
│   └── signup/
├── dashboard/           # Protected dashboard routes
├── api/                 # API Routes (backend)
│   ├── experiences/     # Experience CRUD
│   ├── education/       # Education CRUD
│   └── export/          # Export functionality
└── layout.tsx           # Root layout

components/
├── ui/                  # Base UI components
└── features/            # Feature-specific components

lib/
├── supabase/            # Supabase client configuration
├── validations/         # Zod schemas
└── utils/               # Helper functions
```

### Code Organization

- **Server Components**: Default in App Router, use for data fetching
- **Client Components**: Add `'use client'` for interactivity
- **API Routes**: Place in `app/api/` for backend logic
- **Shared Types**: Define in `lib/types/` for client/server sharing
- **Validation**: Use Zod schemas in `lib/validations/`

### Authentication

- Use `@supabase/ssr` helpers for server-side auth
- Client-side: `createClientComponentClient()`
- Server Components: `createServerComponentClient()`
- API Routes: `createRouteHandlerClient()`
- Middleware: `createMiddlewareClient()`

### Performance Tips

- Use Server Components by default for better performance
- Enable caching for API routes: `export const revalidate = 60`
- Use `loading.tsx` for skeleton loading states
- Optimize images with Next.js `<Image>` component
- Enable static generation where possible

---

## Next Steps

1. **Read the Full Spec**: Review `/specs/001-jearch-career-coach/spec.md`
2. **Review Data Model**: Study `/specs/001-jearch-career-coach/data-model.md`
3. **Explore API Contracts**: Check `/specs/001-jearch-career-coach/contracts/`
4. **Implement Features**: Follow tasks in `/specs/001-jearch-career-coach/tasks.md` (when generated)
5. **Write Tests**: See testing strategy in `research.md`

---

## Useful Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Next.js App Router**: https://nextjs.org/docs/app
- **Supabase Docs**: https://supabase.com/docs
- **Supabase Auth with Next.js**: https://supabase.com/docs/guides/auth/auth-helpers/nextjs
- **Vercel Docs**: https://vercel.com/docs
- **React Hook Form**: https://react-hook-form.com
- **Zod Validation**: https://zod.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com

---

## Support

For questions or issues:
1. Check this quickstart guide
2. Review feature specification in `/specs/001-jearch-career-coach/`
3. Check Supabase dashboard logs
4. Review Vercel deployment logs
5. Search Next.js and Supabase documentation
6. Consult team documentation

---

**Happy Coding!** 🚀

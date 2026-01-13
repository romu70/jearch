# Quickstart Guide: Jearch Development

**Feature**: 001-jearch-career-coach  
**Date**: 2026-01-13  
**Target**: Developers setting up the Jearch project for the first time

---

## Prerequisites

- **Node.js**: 18.x or later
- **Python**: 3.11 or later
- **Git**: For version control
- **Supabase Account**: Create at [supabase.com](https://supabase.com)
- **Vercel Account**: Create at [vercel.com](https://vercel.com)
- **Code Editor**: VS Code recommended

---

## Project Architecture Overview

```
jearch/
├── backend/           # Python FastAPI serverless functions
├── frontend/          # Next.js 14+ App Router application
├── supabase/          # Database migrations & Edge Functions
└── specs/             # Feature specifications & documentation
```

**Stack**:
- **Frontend**: Next.js 14+ (React), TypeScript, Tailwind CSS
- **Backend**: Python 3.11+, FastAPI, Supabase Python client
- **Database/Auth**: Supabase (PostgreSQL + Auth)
- **Hosting**: Vercel (frontend + backend serverless)
- **Email**: Supabase Auth + Edge Functions + SMTP (Resend/SendGrid/SES)

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
3. Navigate to **Settings** → **Auth** → **JWT Settings**
4. Copy **JWT Secret**: Used for token validation in Python backend

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

# Run migrations
supabase db push
```

---

## Step 3: Setup Backend (Python FastAPI)

### 3.1 Create Virtual Environment

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

### 3.2 Install Dependencies

```bash
# Install dependencies
pip install -r requirements.txt

# requirements.txt should include:
# fastapi==0.109.0
# supabase==2.3.0
# pyjwt==2.8.0
# python-dotenv==1.0.0
# uvicorn==0.27.0
```

### 3.3 Configure Environment Variables

Create `backend/.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Environment
ENVIRONMENT=development
```

### 3.4 Run Backend Locally

```bash
# Start FastAPI server
uvicorn api.index:app --reload --port 8000

# API will be available at http://localhost:8000
# OpenAPI docs at http://localhost:8000/docs
```

---

## Step 4: Setup Frontend (Next.js)

### 4.1 Install Dependencies

```bash
cd ../frontend

# Install dependencies
npm install

# Key dependencies:
# - next (14+)
# - react, react-dom
# - @supabase/supabase-js
# - @supabase/auth-helpers-nextjs
# - react-hook-form
# - zod (validation)
# - tailwindcss
# - @radix-ui/react-* (accessible components)
```

### 4.2 Configure Environment Variables

Create `frontend/.env.local`:

```env
# Supabase Configuration (Frontend)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Environment
NEXT_PUBLIC_ENVIRONMENT=development
```

### 4.3 Run Frontend Locally

```bash
# Start Next.js development server
npm run dev

# App will be available at http://localhost:3000
```

---

## Step 5: Setup Supabase Edge Functions (Email Queue)

### 5.1 Create Edge Function

```bash
cd ../supabase/functions

# Create email-processor function
supabase functions new email-processor

# Edit email-processor/index.ts with the implementation from research.md
```

### 5.2 Deploy Edge Function

```bash
# Deploy to Supabase
supabase functions deploy email-processor

# Set environment variables for the function
supabase secrets set RESEND_API_KEY=your-resend-api-key
```

### 5.3 Setup Cron Job

Option A: **Supabase Cron** (if available in your plan)
1. Go to Database → Cron Jobs
2. Create new job running every 5 minutes
3. Call email-processor function

Option B: **Vercel Cron** (recommended for free tier)
- Configure in `vercel.json` (see deployment section)

---

## Step 6: Local Development Workflow

### 6.1 Start All Services

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
uvicorn api.index:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Supabase (optional, for local DB)
cd supabase
supabase start
```

### 6.2 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Supabase Dashboard**: https://app.supabase.co/project/<your-project-ref>

### 6.3 Test User Flow

1. **Register**: Go to http://localhost:3000/signup
   - Email: test@example.com
   - Password: SecurePass123 (min 12 chars, letters + numbers)
2. **Verify Email**: Check Supabase dashboard for verification link (in development, emails aren't sent)
3. **Login**: Go to http://localhost:3000/login
4. **Add Experience**: Navigate to dashboard and create a professional experience
5. **Test Auto-save**: Type in STAR fields and wait 2 seconds (should auto-save)
6. **Export**: Click "Export to Markdown" to download career path

---

## Step 7: Deploy to Vercel

### 7.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 7.2 Configure Vercel

Create `vercel.json` at project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "backend/api/*.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/api/$1.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ],
  "crons": [
    {
      "path": "/api/cron/process-emails",
      "schedule": "*/5 * * * *"
    }
  ],
  "env": {
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key",
    "SUPABASE_JWT_SECRET": "@supabase-jwt-secret"
  }
}
```

### 7.3 Add Environment Variables to Vercel

```bash
# Login to Vercel
vercel login

# Link project
vercel link

# Add environment variables
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add SUPABASE_JWT_SECRET
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 7.4 Deploy

```bash
# Deploy to production
vercel --prod

# Your app will be live at https://jearch.vercel.app
```

---

## Step 8: Configure SMTP for Production Emails

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
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
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

### View Logs

```bash
# Backend logs (local)
# Check terminal running uvicorn

# Frontend logs (local)
# Check terminal running npm run dev

# Production logs
vercel logs

# Supabase logs
supabase functions logs email-processor
```

### Debugging

```bash
# Backend debugging
# Add breakpoints in VS Code and run in debug mode

# Frontend debugging
# Use React DevTools browser extension
# Check Network tab in browser DevTools

# Database queries
# Use Supabase SQL Editor in dashboard
```

---

## Troubleshooting

### Issue: "Email not verified" error on login

**Solution**: In development, manually verify users in Supabase dashboard:
1. Go to Authentication → Users
2. Find user
3. Click "..." → "Confirm email"

### Issue: CORS errors when calling API

**Solution**: Check CORS configuration in FastAPI:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://jearch.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: JWT validation fails

**Solution**: Verify JWT_SECRET matches between Supabase and backend `.env`:
```bash
# Get from Supabase dashboard: Settings → Auth → JWT Settings
```

### Issue: Vercel deployment fails

**Solution**: 
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Ensure `vercel.json` is correctly configured
4. Check Python version compatibility

### Issue: Auto-save not working

**Solution**:
1. Check browser console for errors
2. Verify debounce logic in React Hook Form
3. Check Network tab for API calls
4. Verify backend endpoint is accessible

---

## Next Steps

1. **Read the Full Spec**: Review `/specs/001-jearch-career-coach/spec.md`
2. **Review Data Model**: Study `/specs/001-jearch-career-coach/data-model.md`
3. **Explore API**: Check `/specs/001-jearch-career-coach/contracts/openapi.yaml`
4. **Implement Features**: Follow tasks in `/specs/001-jearch-career-coach/tasks.md` (generated separately)
5. **Write Tests**: See testing strategy in `research.md`

---

## Useful Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Vercel Docs**: https://vercel.com/docs
- **React Hook Form**: https://react-hook-form.com
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## Support

For questions or issues:
1. Check this quickstart guide
2. Review feature specification in `/specs/001-jearch-career-coach/`
3. Check Supabase dashboard logs
4. Review Vercel deployment logs
5. Consult team documentation

---

**Happy Coding!** 🚀

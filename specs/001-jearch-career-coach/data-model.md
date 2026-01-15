# Data Model

**Feature**: Jearch - Virtual Career Coach  
**Branch**: `001-jearch-career-coach`  
**Date**: 2026-01-15

This document defines the complete data model for the Jearch platform, including entities, relationships, validation rules, and database schema.

---

## Entity Relationship Diagram

```
┌─────────────────────┐
│       users         │
│ (Supabase Auth)     │
└──────────┬──────────┘
           │ 1
           │
           │ *
     ┌─────┴─────────────────────┬─────────────────────────┬────────────────────┐
     │                           │                         │                    │
     │ *                         │ *                       │ *                  │ *
┌────┴──────────────┐   ┌────────┴──────────────┐  ┌──────┴───────────┐  ┌────┴────────────┐
│ professional_exp  │   │ extra_professional_   │  │   education      │  │   config        │
│                   │   │      experiences      │  │                  │  │                 │
└───────────────────┘   └───────────────────────┘  └──────────────────┘  └─────────────────┘
```

**Relationships**:
- One User has many Professional Experiences (1:*)
- One User has many Extra-Professional Experiences (1:*)
- One User has many Education entries (1:*)
- Config table stores application-wide settings (e.g., SMTP)

---

## 1. Users (Supabase Auth)

**Managed by**: Supabase Authentication system

**Fields** (from Supabase Auth):
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, auto-generated | User unique identifier |
| email | string | unique, not null | User email (login credential) |
| encrypted_password | string | not null | Bcrypt hashed password (Supabase managed) |
| email_confirmed_at | timestamp | nullable | Email verification timestamp |
| created_at | timestamp | not null, default now() | Account creation timestamp |
| updated_at | timestamp | not null, default now() | Last update timestamp |

**Extended Profile** (custom `profiles` table):
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, FK → auth.users.id | References Supabase auth user |
| full_name | string | nullable | User's full name (optional) |
| preferred_language | string | not null, default 'fr' | UI language (French only in v1) |
| created_at | timestamp | not null, default now() | Profile creation timestamp |
| updated_at | timestamp | not null, default now() | Last update timestamp |

**Validation Rules**:
- Email format: RFC 5322 compliant (handled by Supabase)
- Password: Minimum 12 characters, must contain letters + numbers (FR-002)
- Email verification required before platform access (FR-003)

**State Transitions**:
1. **Registered** → User created, `email_confirmed_at` is NULL
2. **Verified** → User clicks email confirmation link, `email_confirmed_at` set
3. **Active** → User can access platform features
4. **Locked** → 10 failed login attempts, account temporarily locked (1 hour)
5. **Deleted** → User requests deletion, all data permanently removed (FR-014)

**Row Level Security (RLS)**:
```sql
-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

## 2. Professional Experiences

**Table**: `professional_experiences`

**Purpose**: Store user's professional work experiences in STAR format.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, auto-generated | Experience unique identifier |
| user_id | uuid | FK → auth.users.id, not null | Owner of the experience |
| company | string | not null, max 255 | Company name |
| role | string | not null, max 255 | Job title/role |
| start_date | date | not null | Employment start date |
| end_date | date | nullable | Employment end date (NULL if current) |
| is_current | boolean | not null, default false | Flag indicating current position |
| situation | text | nullable, max 10,000 chars | STAR: Situation description |
| task | text | nullable, max 10,000 chars | STAR: Task description |
| action | text | nullable, max 10,000 chars | STAR: Action description |
| result | text | nullable, max 10,000 chars | STAR: Result description |
| created_at | timestamp | not null, default now() | Record creation timestamp |
| updated_at | timestamp | not null, default now() | Last update timestamp (for conflict detection) |

**Validation Rules**:
- Company name required, 1-255 characters
- Role required, 1-255 characters
- Start date required, must be valid date
- End date optional, must be >= start_date (if provided)
- If `is_current = true`, `end_date` must be NULL
- STAR fields (situation, task, action, result) are all optional (FR-019)
- Each STAR field max 10,000 characters (FR-020)
- No validation for employment gaps (FR-028a)

**Indexes**:
```sql
CREATE INDEX idx_prof_exp_user_id ON professional_experiences(user_id);
CREATE INDEX idx_prof_exp_dates ON professional_experiences(user_id, start_date DESC);
```

**Computed Fields** (application-level):
- `completion_percentage`: Count of filled STAR fields / 4 * 100 (FR-022)
- `display_order`: Sort by `is_current DESC, start_date DESC` (FR-026)

**Row Level Security (RLS)**:
```sql
CREATE POLICY "Users can manage own professional experiences"
  ON professional_experiences
  FOR ALL
  USING (auth.uid() = user_id);
```

---

## 3. Extra-Professional Experiences

**Table**: `extra_professional_experiences`

**Purpose**: Store volunteer work, personal projects, and non-work experiences in STAR format.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, auto-generated | Experience unique identifier |
| user_id | uuid | FK → auth.users.id, not null | Owner of the experience |
| activity_name | string | not null, max 255 | Activity/project name |
| organization | string | nullable, max 255 | Organization/context (optional) |
| start_date | date | not null | Activity start date |
| end_date | date | nullable | Activity end date (NULL if ongoing) |
| is_ongoing | boolean | not null, default false | Flag indicating ongoing activity |
| situation | text | nullable, max 10,000 chars | STAR: Situation description |
| task | text | nullable, max 10,000 chars | STAR: Task description |
| action | text | nullable, max 10,000 chars | STAR: Action description |
| result | text | nullable, max 10,000 chars | STAR: Result description |
| created_at | timestamp | not null, default now() | Record creation timestamp |
| updated_at | timestamp | not null, default now() | Last update timestamp (for conflict detection) |

**Validation Rules**:
- Activity name required, 1-255 characters
- Organization optional, max 255 characters
- Start date required, must be valid date
- End date optional, must be >= start_date (if provided)
- If `is_ongoing = true`, `end_date` must be NULL
- STAR fields all optional (FR-030)
- Each STAR field max 10,000 characters (FR-031)

**Indexes**:
```sql
CREATE INDEX idx_extra_exp_user_id ON extra_professional_experiences(user_id);
CREATE INDEX idx_extra_exp_dates ON extra_professional_experiences(user_id, start_date DESC);
```

**Computed Fields**:
- `completion_percentage`: Count of filled STAR fields / 4 * 100 (FR-033)
- `display_order`: Sort by `is_ongoing DESC, start_date DESC` (FR-036)

**Row Level Security (RLS)**:
```sql
CREATE POLICY "Users can manage own extra-professional experiences"
  ON extra_professional_experiences
  FOR ALL
  USING (auth.uid() = user_id);
```

---

## 4. Education

**Table**: `education`

**Purpose**: Store user's academic qualifications and educational background.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, auto-generated | Education entry unique identifier |
| user_id | uuid | FK → auth.users.id, not null | Owner of the entry |
| institution | string | not null, max 255 | Institution/school name |
| degree_type | string | not null, max 100 | Type of degree (e.g., "Licence", "Master") |
| field_of_study | string | not null, max 255 | Field/major (e.g., "Informatique") |
| start_date | date | not null | Studies start date |
| end_date | date | nullable | Studies end date (NULL if in progress) |
| is_in_progress | boolean | not null, default false | Flag indicating ongoing studies |
| gpa | string | nullable, max 50 | GPA or grade (optional) |
| honors | string | nullable, max 255 | Honors or distinctions (optional) |
| relevant_coursework | text | nullable, max 1000 | Relevant courses (optional) |
| created_at | timestamp | not null, default now() | Record creation timestamp |
| updated_at | timestamp | not null, default now() | Last update timestamp |

**Validation Rules**:
- Institution required, 1-255 characters
- Degree type required, 1-100 characters
- Field of study required, 1-255 characters
- Start date required, must be valid date
- End date optional, must be >= start_date (if provided)
- If `is_in_progress = true`, `end_date` must be NULL
- Overlapping education dates allowed (FR-041a)
- GPA, honors, coursework all optional (FR-039)

**Indexes**:
```sql
CREATE INDEX idx_education_user_id ON education(user_id);
CREATE INDEX idx_education_dates ON education(user_id, start_date DESC);
```

**Computed Fields**:
- `display_order`: Sort by `is_in_progress DESC, end_date DESC NULLS FIRST` (FR-041)

**Row Level Security (RLS)**:
```sql
CREATE POLICY "Users can manage own education entries"
  ON education
  FOR ALL
  USING (auth.uid() = user_id);
```

---

## 5. Application Configuration

**Table**: `app_config`

**Purpose**: Store application-wide configuration (primarily SMTP settings).

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, auto-generated | Config entry unique identifier |
| key | string | unique, not null, max 100 | Configuration key (e.g., "smtp_host") |
| value | text | nullable | Configuration value (encrypted if sensitive) |
| is_encrypted | boolean | not null, default false | Flag indicating if value is encrypted |
| description | string | nullable, max 500 | Human-readable description |
| created_at | timestamp | not null, default now() | Record creation timestamp |
| updated_at | timestamp | not null, default now() | Last update timestamp |

**Configuration Keys**:
| Key | Type | Encrypted | Description |
|-----|------|-----------|-------------|
| smtp_host | string | No | SMTP server hostname |
| smtp_port | integer | No | SMTP server port (e.g., 587) |
| smtp_user | string | No | SMTP username/email |
| smtp_password | string | Yes | SMTP password (encrypted) |
| smtp_from_address | string | No | From email address |
| smtp_from_name | string | No | From display name (e.g., "Jearch") |

**Validation Rules**:
- Key required, unique, 1-100 characters
- Value required for most keys (nullable for future flexibility)
- Sensitive values (passwords) must have `is_encrypted = true`

**Encryption**:
- Use Supabase Vault for encrypting sensitive values (FR-016, FR-054)
- Decrypt only when needed for SMTP operations

**Row Level Security (RLS)**:
```sql
-- Only admins/service role can access config
CREATE POLICY "Service role only"
  ON app_config
  FOR ALL
  USING (auth.role() = 'service_role');
```

---

## 6. Email Queue

**Table**: `email_queue`

**Purpose**: Queue for outgoing emails with retry logic for SMTP failures.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, auto-generated | Queue entry unique identifier |
| to_email | string | not null, max 255 | Recipient email address |
| subject | string | not null, max 500 | Email subject (French) |
| body_text | text | not null | Email body plain text (French) |
| body_html | text | nullable | Email body HTML (optional) |
| template_type | string | not null | Template type: "verification", "password_reset", "unlock" |
| user_id | uuid | FK → auth.users.id, nullable | Associated user (if applicable) |
| attempts | integer | not null, default 0 | Number of send attempts |
| max_attempts | integer | not null, default 5 | Maximum retry attempts |
| next_retry_at | timestamp | nullable | Scheduled next retry timestamp |
| status | string | not null, default 'pending' | Status: "pending", "sent", "failed" |
| error_message | text | nullable | Last error message (if failed) |
| sent_at | timestamp | nullable | Successful send timestamp |
| created_at | timestamp | not null, default now() | Queue entry creation timestamp |
| updated_at | timestamp | not null, default now() | Last update timestamp |

**Validation Rules**:
- To email required, valid email format
- Subject and body_text required
- Template type must be one of: "verification", "password_reset", "unlock"
- Status must be one of: "pending", "sent", "failed"

**State Transitions**:
1. **Pending** → Email queued, `attempts = 0`
2. **Retrying** → Send failed, `attempts++`, `next_retry_at` set with exponential backoff
3. **Sent** → Email successfully sent, `sent_at` set, `status = 'sent'`
4. **Failed** → Max attempts reached, `status = 'failed'`

**Retry Schedule** (exponential backoff):
- Attempt 1: Immediate
- Attempt 2: 5 minutes later
- Attempt 3: 15 minutes later
- Attempt 4: 30 minutes later
- Attempt 5: 60 minutes later
- After 5 attempts: Permanently failed

**Indexes**:
```sql
CREATE INDEX idx_email_queue_status ON email_queue(status, next_retry_at);
CREATE INDEX idx_email_queue_user ON email_queue(user_id);
```

**Row Level Security (RLS)**:
```sql
-- Service role only (background job processes queue)
CREATE POLICY "Service role only"
  ON email_queue
  FOR ALL
  USING (auth.role() = 'service_role');
```

---

## 7. Login Attempts (Rate Limiting)

**Table**: `login_attempts`

**Purpose**: Track failed login attempts for rate limiting and account lockout.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, auto-generated | Attempt record unique identifier |
| email | string | not null, max 255 | Email used in login attempt |
| ip_address | string | nullable, max 45 | IP address of attempt (IPv6 compatible) |
| success | boolean | not null | True if login succeeded, false if failed |
| attempt_at | timestamp | not null, default now() | Attempt timestamp |

**Computed Aggregates** (queried, not stored):
- Count failed attempts in last 1 hour for email
- Determine lockout status based on count

**Rate Limiting Logic** (FR-009):
- 3 failed attempts within 1 hour → 5 minute delay
- 5 failed attempts within 1 hour → 15 minute delay
- 10 failed attempts within 1 hour → 1 hour lockout + unlock email sent

**Indexes**:
```sql
CREATE INDEX idx_login_attempts_email ON login_attempts(email, attempt_at DESC);
```

**Data Retention**:
- Clean up records older than 24 hours (scheduled job)

**Row Level Security (RLS)**:
```sql
-- Service role only (middleware checks this table)
CREATE POLICY "Service role only"
  ON login_attempts
  FOR ALL
  USING (auth.role() = 'service_role');
```

---

## Database Schema Summary

**Tables**: 7 total
1. `profiles` (extends Supabase auth.users)
2. `professional_experiences`
3. `extra_professional_experiences`
4. `education`
5. `app_config`
6. `email_queue`
7. `login_attempts`

**Foreign Keys**:
- All user-related tables → `auth.users.id` (Supabase managed)

**Triggers** (PostgreSQL):
```sql
-- Auto-update updated_at timestamp on UPDATE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prof_exp_updated_at BEFORE UPDATE ON professional_experiences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- (Repeat for other tables)
```

---

## TypeScript Type Definitions

**Location**: `specs/001-jearch-career-coach/contracts/types.ts`

```typescript
// Core domain types

export interface User {
  id: string;
  email: string;
  emailConfirmedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  fullName: string | null;
  preferredLanguage: 'fr';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfessionalExperience {
  id: string;
  userId: string;
  company: string;
  role: string;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  situation: string | null;
  task: string | null;
  action: string | null;
  result: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtraProfessionalExperience {
  id: string;
  userId: string;
  activityName: string;
  organization: string | null;
  startDate: Date;
  endDate: Date | null;
  isOngoing: boolean;
  situation: string | null;
  task: string | null;
  action: string | null;
  result: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Education {
  id: string;
  userId: string;
  institution: string;
  degreeType: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate: Date | null;
  isInProgress: boolean;
  gpa: string | null;
  honors: string | null;
  relevantCoursework: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppConfig {
  id: string;
  key: string;
  value: string;
  isEncrypted: boolean;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailQueue {
  id: string;
  toEmail: string;
  subject: string;
  bodyText: string;
  bodyHtml: string | null;
  templateType: 'verification' | 'password_reset' | 'unlock';
  userId: string | null;
  attempts: number;
  maxAttempts: number;
  nextRetryAt: Date | null;
  status: 'pending' | 'sent' | 'failed';
  errorMessage: string | null;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Computed types (not stored, calculated client-side or server-side)

export interface ExperienceWithCompletion extends ProfessionalExperience {
  completionPercentage: number; // 0-100
}

export interface ConflictData {
  hasConflict: boolean;
  localUpdatedAt: Date;
  serverUpdatedAt: Date;
  serverData: ProfessionalExperience | ExtraProfessionalExperience | Education;
}
```

---

**Next Steps**: Proceed to API contracts generation (OpenAPI spec).

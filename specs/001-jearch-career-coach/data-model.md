# Data Model: Jearch - Virtual Career Coach

**Feature**: 001-jearch-career-coach  
**Date**: 2026-01-13  
**Database**: Supabase (PostgreSQL)

---

## Entity Relationship Diagram

```
┌─────────────────────┐
│       User          │
│  (Supabase Auth)    │
└──────────┬──────────┘
           │ 1
           │
           │ *
      ┌────┴─────────────────────────────────────┐
      │                                           │
      │                                           │
┌─────▼────────────────┐  ┌──────────────────────▼────┐  ┌───────────────────▼─────┐
│ ProfessionalExperience│  │ ExtraProfessionalExperience│  │      Education          │
└──────────────────────┘  └───────────────────────────┘  └─────────────────────────┘
```

---

## 1. User

**Purpose**: Represents a job seeker with authentication and profile settings.

**Storage**: Managed by Supabase Auth (`auth.users` table). Extended profile data in `public.profiles`.

### Fields (auth.users - managed by Supabase)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, auto-generated | Unique user identifier |
| email | text | UNIQUE, NOT NULL | User email address |
| encrypted_password | text | NOT NULL | Bcrypt hashed password |
| email_confirmed_at | timestamptz | nullable | Email verification timestamp |
| created_at | timestamptz | NOT NULL, default NOW() | Account creation timestamp |
| updated_at | timestamptz | NOT NULL, default NOW() | Last update timestamp |

### Fields (public.profiles - custom extension)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, FK → auth.users.id | User identifier |
| full_name | text | nullable | User's full name (optional) |
| created_at | timestamptz | NOT NULL, default NOW() | Profile creation timestamp |
| updated_at | timestamptz | NOT NULL, default NOW() | Last update timestamp |

### Validation Rules
- **FR-002**: Email must match standard email format (`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
- **FR-002**: Password minimum 12 characters, must contain letters AND numbers
- **FR-003**: `email_confirmed_at` must be set before user can access platform features

### State Transitions
1. **Created** → User signs up, `email_confirmed_at` is NULL
2. **Verified** → User clicks verification link, `email_confirmed_at` is set
3. **Active** → Verified user can access all features
4. **Deleted** → User requests account deletion, all related data removed

### Security
- Passwords never stored in plain text (Supabase uses bcrypt)
- Row-Level Security (RLS) enforced:
  - Users can only read/update their own profile
  - Service role can read all profiles for admin operations

---

## 2. ProfessionalExperience

**Purpose**: Represents a work position documented using STAR format.

**Storage**: `public.professional_experiences` table

### Fields
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, auto-generated | Unique experience identifier |
| user_id | uuid | FK → auth.users.id, NOT NULL | Owner of this experience |
| company_name | text | NOT NULL | Company or organization name |
| role_title | text | NOT NULL | Job title or position |
| start_date | date | NOT NULL | Start date of position |
| end_date | date | nullable | End date (NULL if current position) |
| is_current | boolean | NOT NULL, default FALSE | Whether this is current position |
| situation | text | nullable, max 10,000 chars | STAR: Situation component |
| task | text | nullable, max 10,000 chars | STAR: Task component |
| action | text | nullable, max 10,000 chars | STAR: Action component |
| result | text | nullable, max 10,000 chars | STAR: Result component |
| version | integer | NOT NULL, default 1 | Version for conflict detection |
| created_at | timestamptz | NOT NULL, default NOW() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, default NOW() | Last update timestamp |

### Indexes
```sql
CREATE INDEX idx_prof_exp_user_id ON professional_experiences(user_id);
CREATE INDEX idx_prof_exp_start_date ON professional_experiences(start_date DESC);
CREATE INDEX idx_prof_exp_updated_at ON professional_experiences(updated_at);
```

### Validation Rules
- **FR-018**: `company_name`, `role_title`, `start_date` are required
- **FR-019**: All STAR fields (`situation`, `task`, `action`, `result`) are optional
- **FR-020**: Each STAR field max 10,000 characters
- **FR-028**: If `is_current` is TRUE, `end_date` must be NULL
- **FR-053**: `version` increments on each update for conflict detection
- Business rule: `end_date` must be >= `start_date` if both provided

### Computed Properties
- **completion_percentage** (FR-022): Count of non-empty STAR fields / 4 * 100
  ```sql
  (CASE WHEN situation IS NOT NULL AND situation != '' THEN 1 ELSE 0 END +
   CASE WHEN task IS NOT NULL AND task != '' THEN 1 ELSE 0 END +
   CASE WHEN action IS NOT NULL AND action != '' THEN 1 ELSE 0 END +
   CASE WHEN result IS NOT NULL AND result != '' THEN 1 ELSE 0 END) * 25 AS completion_percentage
  ```

### State Transitions
1. **Draft** → Created with minimal required fields, STAR components empty
2. **Partial** → Some STAR components filled (1-3 of 4)
3. **Complete** → All STAR components filled (4 of 4)
4. **Deleted** → Soft delete or hard delete on user request

### RLS Policies
```sql
-- Users can only access their own experiences
CREATE POLICY "Users manage own professional experiences"
ON professional_experiences
FOR ALL
USING (auth.uid() = user_id);
```

---

## 3. ExtraProfessionalExperience

**Purpose**: Represents volunteer work, personal projects, and other extra-professional activities using STAR format.

**Storage**: `public.extra_professional_experiences` table

### Fields
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, auto-generated | Unique experience identifier |
| user_id | uuid | FK → auth.users.id, NOT NULL | Owner of this experience |
| activity_name | text | NOT NULL | Name of activity or project |
| organization | text | nullable | Organization or context |
| start_date | date | NOT NULL | Start date of activity |
| end_date | date | nullable | End date (NULL if ongoing) |
| is_ongoing | boolean | NOT NULL, default FALSE | Whether activity is ongoing |
| situation | text | nullable, max 10,000 chars | STAR: Situation component |
| task | text | nullable, max 10,000 chars | STAR: Task component |
| action | text | nullable, max 10,000 chars | STAR: Action component |
| result | text | nullable, max 10,000 chars | STAR: Result component |
| version | integer | NOT NULL, default 1 | Version for conflict detection |
| created_at | timestamptz | NOT NULL, default NOW() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, default NOW() | Last update timestamp |

### Indexes
```sql
CREATE INDEX idx_extra_exp_user_id ON extra_professional_experiences(user_id);
CREATE INDEX idx_extra_exp_start_date ON extra_professional_experiences(start_date DESC);
CREATE INDEX idx_extra_exp_updated_at ON extra_professional_experiences(updated_at);
```

### Validation Rules
- **FR-029**: `activity_name`, `start_date` are required
- **FR-029**: All STAR fields are optional
- **FR-031**: Each STAR field max 10,000 characters
- **FR-029**: If `is_ongoing` is TRUE, `end_date` must be NULL
- **FR-053**: `version` increments on each update for conflict detection
- Business rule: `end_date` must be >= `start_date` if both provided

### Computed Properties
- **completion_percentage** (FR-033): Same formula as ProfessionalExperience

### State Transitions
Same as ProfessionalExperience (Draft → Partial → Complete → Deleted)

### RLS Policies
```sql
-- Users can only access their own experiences
CREATE POLICY "Users manage own extra professional experiences"
ON extra_professional_experiences
FOR ALL
USING (auth.uid() = user_id);
```

---

## 4. Education

**Purpose**: Represents an academic qualification or educational achievement.

**Storage**: `public.education` table

### Fields
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, auto-generated | Unique education identifier |
| user_id | uuid | FK → auth.users.id, NOT NULL | Owner of this education entry |
| institution_name | text | NOT NULL | Name of educational institution |
| degree_type | text | NOT NULL | Type of degree (e.g., Bachelor's, Master's, PhD, Certificate) |
| field_of_study | text | NOT NULL | Major or field of study |
| start_date | date | NOT NULL | Start date of study |
| end_date | date | nullable | End date (NULL if in progress) |
| is_in_progress | boolean | NOT NULL, default FALSE | Whether study is in progress |
| gpa | numeric(3,2) | nullable, CHECK (gpa >= 0 AND gpa <= 4.0) | Grade Point Average (optional) |
| honors | text | nullable | Honors or distinctions (optional) |
| relevant_coursework | text | nullable | Relevant coursework (optional) |
| version | integer | NOT NULL, default 1 | Version for conflict detection |
| created_at | timestamptz | NOT NULL, default NOW() | Creation timestamp |
| updated_at | timestamptz | NOT NULL, default NOW() | Last update timestamp |

### Indexes
```sql
CREATE INDEX idx_education_user_id ON education(user_id);
CREATE INDEX idx_education_start_date ON education(start_date DESC);
CREATE INDEX idx_education_updated_at ON education(updated_at);
```

### Validation Rules
- **FR-037**: `institution_name`, `degree_type`, `field_of_study`, `start_date` are required
- **FR-038**: If `is_in_progress` is TRUE, `end_date` must be NULL
- **FR-039**: `gpa`, `honors`, `relevant_coursework` are optional
- **FR-053**: `version` increments on each update for conflict detection
- Business rule: `end_date` must be >= `start_date` if both provided
- Business rule: GPA must be between 0.0 and 4.0 (if provided)

### State Transitions
1. **In Progress** → `is_in_progress` = TRUE, `end_date` = NULL
2. **Completed** → `is_in_progress` = FALSE, `end_date` set
3. **Deleted** → Soft delete or hard delete on user request

### RLS Policies
```sql
-- Users can only access their own education entries
CREATE POLICY "Users manage own education"
ON education
FOR ALL
USING (auth.uid() = user_id);
```

---

## 5. Supporting Tables

### 5.1 email_queue

**Purpose**: Queue emails for retry with exponential backoff (FR-017a).

**Storage**: `public.email_queue` table

### Fields
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, auto-generated | Unique queue item identifier |
| user_id | uuid | FK → auth.users.id, nullable | Related user (nullable for non-user emails) |
| email_type | text | NOT NULL | Email type: 'verification', 'password_reset' |
| recipient | text | NOT NULL | Email recipient address |
| subject | text | NOT NULL | Email subject line |
| body | text | NOT NULL | Email body (HTML or plain text) |
| template_data | jsonb | nullable | Template variables |
| status | text | NOT NULL, default 'pending' | Status: 'pending', 'sent', 'failed', 'retrying' |
| attempts | integer | NOT NULL, default 0 | Number of send attempts |
| max_attempts | integer | NOT NULL, default 3 | Maximum retry attempts |
| next_retry_at | timestamptz | nullable | Next retry timestamp |
| error_message | text | nullable | Last error message |
| created_at | timestamptz | NOT NULL, default NOW() | Queue creation timestamp |
| sent_at | timestamptz | nullable | Successful send timestamp |
| updated_at | timestamptz | NOT NULL, default NOW() | Last update timestamp |

### Indexes
```sql
CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_next_retry ON email_queue(next_retry_at) WHERE status = 'retrying';
CREATE INDEX idx_email_queue_user_id ON email_queue(user_id);
```

---

### 5.2 email_failures

**Purpose**: Log failed emails for admin monitoring (FR-017a).

**Storage**: `public.email_failures` table

### Fields
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, auto-generated | Unique failure identifier |
| email_queue_id | uuid | FK → email_queue.id, nullable | Reference to queued email |
| user_id | uuid | FK → auth.users.id, nullable | Related user |
| email_type | text | nullable | Email type for quick filtering |
| error_message | text | nullable | Error message |
| smtp_response | text | nullable | SMTP server response |
| failed_at | timestamptz | NOT NULL, default NOW() | Failure timestamp |
| resolved | boolean | NOT NULL, default FALSE | Whether issue is resolved |
| resolved_at | timestamptz | nullable | Resolution timestamp |
| resolved_by | uuid | FK → auth.users.id, nullable | Admin who resolved issue |

### Indexes
```sql
CREATE INDEX idx_email_failures_resolved ON email_failures(resolved, failed_at);
CREATE INDEX idx_email_failures_user_id ON email_failures(user_id);
```

---

### 5.3 smtp_config

**Purpose**: Admin-configurable SMTP settings (FR-015, FR-017).

**Storage**: `public.smtp_config` table

### Fields
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, auto-generated | Unique config identifier |
| host | text | NOT NULL | SMTP server hostname |
| port | integer | NOT NULL, CHECK (port > 0 AND port <= 65535) | SMTP port number |
| username | text | NOT NULL | SMTP username |
| password_vault_key | text | NOT NULL | Reference to Supabase Vault secret |
| from_email | text | NOT NULL | Sender email address |
| from_name | text | NOT NULL | Sender display name |
| use_tls | boolean | NOT NULL, default TRUE | Whether to use TLS |
| is_active | boolean | NOT NULL, default TRUE | Whether this config is active |
| created_at | timestamptz | NOT NULL, default NOW() | Config creation timestamp |
| updated_at | timestamptz | NOT NULL, default NOW() | Last update timestamp |

### RLS Policies
```sql
-- Only admins can manage SMTP config
CREATE POLICY "Admins only manage SMTP config"
ON smtp_config
FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');
```

---

## Database Triggers

### 1. Auto-update timestamp trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_professional_experiences_updated_at
    BEFORE UPDATE ON professional_experiences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_extra_professional_experiences_updated_at
    BEFORE UPDATE ON extra_professional_experiences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_updated_at
    BEFORE UPDATE ON education
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 2. Auto-increment version trigger (FR-053)

```sql
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to versioned tables
CREATE TRIGGER increment_professional_experiences_version
    BEFORE UPDATE ON professional_experiences
    FOR EACH ROW
    EXECUTE FUNCTION increment_version();

CREATE TRIGGER increment_extra_professional_experiences_version
    BEFORE UPDATE ON extra_professional_experiences
    FOR EACH ROW
    EXECUTE FUNCTION increment_version();

CREATE TRIGGER increment_education_version
    BEFORE UPDATE ON education
    FOR EACH ROW
    EXECUTE FUNCTION increment_version();
```

---

## Database Functions

### 1. Get completion percentage

```sql
CREATE OR REPLACE FUNCTION get_completion_percentage(
    p_situation text,
    p_task text,
    p_action text,
    p_result text
)
RETURNS integer AS $$
BEGIN
    RETURN (
        (CASE WHEN p_situation IS NOT NULL AND p_situation != '' THEN 1 ELSE 0 END) +
        (CASE WHEN p_task IS NOT NULL AND p_task != '' THEN 1 ELSE 0 END) +
        (CASE WHEN p_action IS NOT NULL AND p_action != '' THEN 1 ELSE 0 END) +
        (CASE WHEN p_result IS NOT NULL AND p_result != '' THEN 1 ELSE 0 END)
    ) * 25;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

---

## Data Retention Policy

- **FR-010**: User data retained indefinitely until explicit deletion request
- **FR-011**: No automatic deletion based on inactivity
- **FR-014**: Account deletion permanently removes all user data:
  - `auth.users` entry
  - `public.profiles` entry
  - All `professional_experiences` (CASCADE DELETE)
  - All `extra_professional_experiences` (CASCADE DELETE)
  - All `education` entries (CASCADE DELETE)
  - Related `email_queue` entries (anonymize or delete)
  - Related `email_failures` entries (anonymize or delete)

---

## Character Limits Summary

| Field | Limit | Requirement |
|-------|-------|-------------|
| STAR components (all 4) | 10,000 chars each | FR-020, FR-031 |
| Email | 255 chars | Standard email length |
| Text fields (names, titles) | 500 chars | Reasonable length for UI |

---

## Performance Considerations

- Indexes on `user_id` for all user-owned tables enable fast lookups
- Indexes on `start_date DESC` for chronological ordering (FR-026, FR-036, FR-041)
- Indexes on `updated_at` for auto-save and sync operations
- Indexes on `status` and `next_retry_at` for email queue processing
- Version field indexed for conflict detection queries (FR-053)

---

## Migration Strategy

1. Create base tables: `profiles`, `professional_experiences`, `extra_professional_experiences`, `education`
2. Create supporting tables: `email_queue`, `email_failures`, `smtp_config`
3. Create indexes for performance
4. Create triggers for auto-update and versioning
5. Create RLS policies for security
6. Create database functions for computed values
7. Seed initial SMTP configuration (if defaults provided)

---

## Next Steps

- → Generate API contracts (OpenAPI spec)
- → Design markdown export schema
- → Create Supabase migration files

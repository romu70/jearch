/**
 * Shared TypeScript type definitions for Jearch API
 * Auto-generated from data-model.md
 *
 * These types are used across frontend and backend (Next.js App Router)
 */

// ========== Core Domain Types ==========

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

export interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string | null;
  success: boolean;
  attemptAt: Date;
}

// ========== Input/Form Types (for API requests) ==========

export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ResetPasswordInput {
  email: string;
}

export interface ProfessionalExperienceInput {
  company: string;
  role: string;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  situation?: string | null;
  task?: string | null;
  action?: string | null;
  result?: string | null;
}

export interface ProfessionalExperienceUpdateInput extends ProfessionalExperienceInput {
  updatedAt: Date; // For conflict detection
}

export interface ExtraProfessionalExperienceInput {
  activityName: string;
  organization?: string | null;
  startDate: Date;
  endDate: Date | null;
  isOngoing: boolean;
  situation?: string | null;
  task?: string | null;
  action?: string | null;
  result?: string | null;
}

export interface ExtraProfessionalExperienceUpdateInput extends ExtraProfessionalExperienceInput {
  updatedAt: Date;
}

export interface EducationInput {
  institution: string;
  degreeType: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate: Date | null;
  isInProgress: boolean;
  gpa?: string | null;
  honors?: string | null;
  relevantCoursework?: string | null;
}

export interface EducationUpdateInput extends EducationInput {
  updatedAt: Date;
}

export interface SmtpConfigInput {
  host: string;
  port: number;
  user: string;
  password: string;
  fromAddress: string;
  fromName: string;
}

// ========== Computed/Extended Types ==========

/**
 * Professional Experience with calculated completion percentage
 */
export interface ProfessionalExperienceWithCompletion extends ProfessionalExperience {
  completionPercentage: number; // 0-100
}

/**
 * Extra-Professional Experience with calculated completion percentage
 */
export interface ExtraProfessionalExperienceWithCompletion extends ExtraProfessionalExperience {
  completionPercentage: number; // 0-100
}

/**
 * Conflict detection result when concurrent edits occur
 */
export interface ConflictData<T = ProfessionalExperience | ExtraProfessionalExperience | Education> {
  hasConflict: boolean;
  localUpdatedAt: Date;
  serverUpdatedAt: Date;
  serverData: T;
}

/**
 * Auto-save status for UI indicators
 */
export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Rate limiting info returned on login failure
 */
export interface RateLimitInfo {
  failedAttempts: number;
  retryAfter: number | null; // Seconds until next attempt allowed
  isLocked: boolean;
}

// ========== API Response Types ==========

export interface RegisterResponse {
  userId: string;
  message: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, any>;
}

export interface ConflictError<T = any> extends ApiError {
  conflict: true;
  serverData: T;
  serverUpdatedAt: Date;
}

// ========== Validation Constants ==========

export const VALIDATION_LIMITS = {
  PASSWORD_MIN_LENGTH: 12,
  STAR_FIELD_MAX_LENGTH: 10000,
  COMPANY_MAX_LENGTH: 255,
  ROLE_MAX_LENGTH: 255,
  ACTIVITY_NAME_MAX_LENGTH: 255,
  ORGANIZATION_MAX_LENGTH: 255,
  INSTITUTION_MAX_LENGTH: 255,
  DEGREE_TYPE_MAX_LENGTH: 100,
  FIELD_OF_STUDY_MAX_LENGTH: 255,
  GPA_MAX_LENGTH: 50,
  HONORS_MAX_LENGTH: 255,
  COURSEWORK_MAX_LENGTH: 1000,
} as const;

// ========== Helper Type Guards ==========

export function isProfessionalExperience(
  exp: ProfessionalExperience | ExtraProfessionalExperience
): exp is ProfessionalExperience {
  return 'company' in exp && 'role' in exp;
}

export function isExtraProfessionalExperience(
  exp: ProfessionalExperience | ExtraProfessionalExperience
): exp is ExtraProfessionalExperience {
  return 'activityName' in exp;
}

export function isConflictError(error: ApiError | ConflictError): error is ConflictError {
  return 'conflict' in error && error.conflict === true;
}

// ========== Utility Functions ==========

/**
 * Calculate STAR completion percentage
 * @param exp Experience with STAR fields
 * @returns Percentage (0-100)
 */
export function calculateStarCompletion(
  exp: Pick<ProfessionalExperience | ExtraProfessionalExperience, 'situation' | 'task' | 'action' | 'result'>
): number {
  const fields = [exp.situation, exp.task, exp.action, exp.result];
  const filledCount = fields.filter(field => field && field.trim().length > 0).length;
  return Math.round((filledCount / 4) * 100);
}

/**
 * Format date for display in French
 * @param date Date to format
 * @param current If true, returns "Présent" instead of date
 * @returns Formatted date string
 */
export function formatDateFr(date: Date | null, current: boolean = false): string {
  if (current) return 'Présent';
  if (!date) return '';

  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short'
  }).format(new Date(date));
}

/**
 * Get display name for experience (for UI lists)
 */
export function getExperienceDisplayName(
  exp: ProfessionalExperience | ExtraProfessionalExperience
): string {
  if (isProfessionalExperience(exp)) {
    return `${exp.role} - ${exp.company}`;
  }
  return exp.organization
    ? `${exp.activityName} - ${exp.organization}`
    : exp.activityName;
}

/**
 * Get date range display string (French)
 */
export function getDateRangeDisplay(
  startDate: Date,
  endDate: Date | null,
  isCurrent: boolean
): string {
  const start = formatDateFr(startDate);
  const end = isCurrent ? 'Présent' : formatDateFr(endDate);
  return `${start} - ${end}`;
}

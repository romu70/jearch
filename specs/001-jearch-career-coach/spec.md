# Feature Specification: Jearch - Virtual Career Coach

**Feature Branch**: `001-jearch-career-coach`  
**Created**: 2026-01-12  
**Status**: Draft  
**Input**: User description: "Build a web app to help people who search a job - Jearch as virtual career coach with authentication, STAR format experiences, education tracking, and career path export"

## Clarifications

### Session 2026-01-12

- Q: Should all STAR component fields (Situation, Task, Action, Result) be mandatory or optional when saving an experience? → A: All STAR fields are optional - users can save experiences with any combination of filled/empty fields. However, the system must provide a completion/quality indicator for each experience showing which fields are filled, and inform users that maximizing Jearch's value requires fully documenting all experiences.
- Q: What should the session duration and timeout behavior be? → A: Sessions persist until explicit logout by default. On the login screen, provide a "Keep me logged in" checkbox (or similar control) that allows users to choose persistent session behavior.
- Q: What is the data retention policy for user accounts and career data? → A: Retain user data indefinitely until the user explicitly deletes their account. No automatic deletion based on inactivity. Provide data export capability before account deletion.
- Q: What are the character/length limits for STAR component fields? → A: Set generous limits of 10,000 characters per STAR field (approximately 1,500 words). Display a character counter for each field to help users track their progress.
- Q: What type of email service should be used for account verification and password reset? → A: Use self-hosted email server (SMTP). The application must include configurable settings for SMTP information (host, port, credentials, etc.) to allow flexible deployment configuration.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration and Authentication (Priority: P1)

Job seekers need to create secure accounts to store their career information privately and access it from any device.

**Why this priority**: Foundation for all other features. Without authentication, users cannot safely store or manage their career data.

**Independent Test**: Can be fully tested by creating an account, logging in, logging out, and resetting a password. Delivers immediate value by allowing users to access the platform securely.

**Acceptance Scenarios**:

1. **Given** a new visitor on the homepage, **When** they click "Sign Up" and provide email, password, and confirmation, **Then** their account is created and they receive a confirmation email
2. **Given** an existing user with valid credentials, **When** they enter their email and password on the login page, **Then** they are authenticated and redirected to their dashboard
3. **Given** an authenticated user, **When** they click "Log Out", **Then** their session ends and they are redirected to the login page
4. **Given** a user who forgot their password, **When** they request a password reset via email, **Then** they receive a reset link and can set a new password
5. **Given** a user entering an incorrect password, **When** they attempt to log in, **Then** they see an error message without revealing whether the email exists

---

### User Story 2 - Managing Professional Experiences with STAR Format (Priority: P1)

Job seekers need to document their professional experiences using the STAR format (Situation, Task, Action, Result) to prepare compelling stories for interviews and applications.

**Why this priority**: Core value proposition of Jearch. This is what differentiates the platform from simple resume builders.

**Independent Test**: Can be fully tested by adding a professional experience with STAR components, editing it, viewing the list, and deleting it. Delivers immediate value by helping users structure their career stories.

**Acceptance Scenarios**:

1. **Given** an authenticated user on their dashboard, **When** they click "Add Professional Experience" and fill in company, role, dates, and STAR components, **Then** the experience is saved and appears in their experience list
2. **Given** a user viewing their professional experiences, **When** they click "Edit" on an experience, **Then** they can modify any field and save the changes
3. **Given** a user viewing an experience, **When** they click "Delete" and confirm, **Then** the experience is permanently removed from their profile
4. **Given** a user with multiple experiences, **When** they view their experiences list, **Then** experiences are displayed in reverse chronological order (most recent first)
5. **Given** a user entering a STAR experience, **When** they navigate between Situation, Task, Action, and Result fields, **Then** the system guides them with clear labels and optional tips for each component

---

### User Story 3 - Managing Extra-Professional Experiences with STAR Format (Priority: P2)

Job seekers need to document volunteer work, personal projects, and other extra-professional activities using STAR format to showcase transferable skills.

**Why this priority**: Important for career changers and early-career professionals who have valuable non-work experiences.

**Independent Test**: Can be fully tested by adding an extra-professional experience (e.g., volunteer work) with STAR components, viewing it alongside professional experiences, and managing it independently. Delivers value by capturing the full scope of a user's capabilities.

**Acceptance Scenarios**:

1. **Given** an authenticated user on their dashboard, **When** they click "Add Extra-Professional Experience" and fill in activity name, organization, dates, and STAR components, **Then** the experience is saved separately from professional experiences
2. **Given** a user viewing their profile, **When** they navigate to extra-professional experiences, **Then** they see these experiences clearly distinguished from professional ones
3. **Given** a user with both professional and extra-professional experiences, **When** they edit or delete an extra-professional experience, **Then** it does not affect their professional experiences
4. **Given** a user entering an extra-professional experience, **When** they fill in the STAR components, **Then** the same structured format as professional experiences is used

---

### User Story 4 - Managing Education History (Priority: P2)

Job seekers need to document their educational background with standard information to provide a complete career profile.

**Why this priority**: Essential for a complete career profile, though less unique than the STAR experience feature.

**Independent Test**: Can be fully tested by adding education entries (degree, institution, dates, field of study), editing them, and viewing the complete education history. Delivers value by maintaining a comprehensive career record.

**Acceptance Scenarios**:

1. **Given** an authenticated user on their dashboard, **When** they click "Add Education" and provide institution, degree, field of study, start date, and end date, **Then** the education entry is saved and appears in their education list
2. **Given** a user viewing their education history, **When** they click "Edit" on an entry, **Then** they can modify any field including marking the degree as "in progress" (no end date)
3. **Given** a user with multiple education entries, **When** they view their education list, **Then** entries are displayed in reverse chronological order
4. **Given** a user entering education details, **When** they save an entry, **Then** they can optionally include additional details like GPA, honors, or relevant coursework

---

### User Story 5 - Exporting Complete Career Path (Priority: P2)

Job seekers need to export their complete career path (all experiences and education) in markdown format to use in various contexts like personal websites, portfolios, or as a reference document.

**Why this priority**: Provides portability and reusability of the carefully structured data users have entered.

**Independent Test**: Can be fully tested by entering experiences and education, then clicking "Export Career Path" and verifying the markdown output includes all data in a readable format. Delivers value by making the data portable and reusable.

**Acceptance Scenarios**:

1. **Given** a user with professional experiences, extra-professional experiences, and education, **When** they click "Export Career Path to Markdown", **Then** they receive a formatted markdown document containing all their data
2. **Given** a user viewing the markdown export, **When** they review the content, **Then** professional experiences, extra-professional experiences, and education are clearly separated with appropriate headings
3. **Given** a user with STAR-formatted experiences, **When** they export to markdown, **Then** each STAR component (Situation, Task, Action, Result) is clearly labeled and formatted
4. **Given** a user who exports their career path, **When** the markdown is generated, **Then** dates, role titles, and organizations are formatted consistently and professionally

---

### Edge Cases

- What happens when a user tries to add an experience with incomplete STAR components? → System allows saving with any combination of filled/empty STAR fields; displays completion indicator to encourage full documentation
- How does the system handle concurrent edits if a user has multiple browser tabs open?
- What happens when a user tries to export an empty career path with no experiences or education?
- How does the system handle very long STAR descriptions (e.g., 5000+ words)? → System enforces 10,000 character limit per STAR field with character counter; prevents submission beyond limit
- What happens when education dates overlap or when professional experiences have gaps?
- How does the system handle special characters or markdown syntax in user-entered text during export?
- What happens if a user's session expires while they're filling in a long STAR experience? → With "Keep me logged in" enabled and auto-save, sessions persist and data is preserved; without it, session management follows standard web practice

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & Account Management
- **FR-001**: System MUST allow users to register with email and password
- **FR-002**: System MUST validate email format and require password strength criteria (minimum 8 characters, mix of letters and numbers)
- **FR-003**: System MUST send email confirmation upon registration and require users to verify their email address before they can access any platform features
- **FR-004**: System MUST allow users to log in with their registered credentials
- **FR-005**: System MUST provide a "Keep me logged in" option on the login screen that allows users to maintain persistent sessions
- **FR-006**: System MUST maintain user sessions until explicit logout when "Keep me logged in" is enabled
- **FR-007**: System MUST allow users to log out and end their session
- **FR-008**: System MUST provide password reset functionality via email link
- **FR-009**: System MUST protect against common authentication attacks (brute force, session hijacking)

#### Data Retention & Account Deletion
- **FR-010**: System MUST retain user data (account, experiences, education) indefinitely until the user explicitly requests account deletion
- **FR-011**: System MUST NOT automatically delete accounts or data based on inactivity periods
- **FR-012**: System MUST allow users to delete their account through account settings
- **FR-013**: System MUST provide the ability to export all user data before account deletion is finalized
- **FR-014**: System MUST permanently delete all user data (account, experiences, education) when account deletion is confirmed

#### Application Settings & Configuration
- **FR-015**: System MUST provide configurable settings for SMTP email server including host, port, authentication credentials, and sender address
- **FR-016**: System MUST store application configuration settings securely (SMTP credentials must not be stored in plain text)
- **FR-017**: System MUST allow administrators to update SMTP configuration without requiring code changes or redeployment

#### Professional Experience Management
- **FR-018**: System MUST allow users to create professional experiences with required fields: company name, role title, start date, end date (or "current"), and STAR components
- **FR-019**: System MUST provide four separate input fields for STAR format: Situation, Task, Action, Result (all fields are optional - users can save with any combination of filled/empty fields)
- **FR-020**: System MUST enforce a maximum length of 10,000 characters per STAR component field
- **FR-021**: System MUST display a character counter for each STAR component field showing current length and maximum allowed
- **FR-022**: System MUST display a completion/quality indicator for each experience showing which STAR components are filled (e.g., "3/4 complete" or visual progress indicator)
- **FR-023**: System MUST inform users that fully documenting all STAR components maximizes the value they get from Jearch
- **FR-024**: System MUST allow users to edit any field of existing professional experiences
- **FR-025**: System MUST allow users to delete professional experiences with confirmation prompt
- **FR-026**: System MUST display professional experiences in reverse chronological order (most recent first)
- **FR-027**: System MUST allow users to view all their professional experiences in a list view
- **FR-028**: System MUST allow users to mark a position as "current" (no end date)

#### Extra-Professional Experience Management
- **FR-029**: System MUST allow users to create extra-professional experiences with required fields: activity name, organization/context, start date, end date (or "ongoing"), and STAR components (all STAR fields are optional)
- **FR-030**: System MUST use the same STAR format structure for extra-professional experiences as professional ones
- **FR-031**: System MUST enforce a maximum length of 10,000 characters per STAR component field for extra-professional experiences
- **FR-032**: System MUST display a character counter for each STAR component field in extra-professional experiences
- **FR-033**: System MUST display a completion/quality indicator for each extra-professional experience showing which STAR components are filled
- **FR-034**: System MUST clearly distinguish extra-professional experiences from professional experiences in the interface
- **FR-035**: System MUST allow full CRUD operations (create, read, update, delete) on extra-professional experiences
- **FR-036**: System MUST display extra-professional experiences in reverse chronological order

#### Education Management
- **FR-037**: System MUST allow users to create education entries with fields: institution name, degree type, field of study, start date, end date
- **FR-038**: System MUST allow users to mark education as "in progress" (no end date)
- **FR-039**: System MUST allow users to add optional details: GPA, honors, relevant coursework
- **FR-040**: System MUST allow users to edit and delete education entries
- **FR-041**: System MUST display education entries in reverse chronological order

#### Career Path Export
- **FR-042**: System MUST provide a "Export to Markdown" function that generates a complete career path document
- **FR-043**: System MUST include all professional experiences, extra-professional experiences, and education in the export
- **FR-044**: System MUST format the markdown export with clear section headings and consistent structure
- **FR-045**: System MUST preserve STAR component labels in the markdown export
- **FR-046**: System MUST handle special characters and markdown syntax in user content appropriately during export
- **FR-047**: System MUST format dates consistently in the export (e.g., "Jan 2020 - Present")

#### User Experience & Accessibility
- **FR-048**: System MUST be responsive and function on desktop, tablet, and mobile devices
- **FR-049**: System MUST provide intuitive navigation between different sections (experiences, education, export)
- **FR-050**: System MUST provide clear feedback for user actions (save confirmation, error messages, loading states)
- **FR-051**: System MUST auto-save form data as users type (with debouncing to minimize server requests) to prevent data loss
- **FR-052**: System MUST be accessible to users with disabilities following WCAG 2.1 AA standards

### Key Entities

- **User**: Represents a job seeker; includes email, password, registration date, and profile settings
- **Professional Experience**: Represents a work position; includes company, role, dates, and four STAR components (Situation, Task, Action, Result); belongs to one User
- **Extra-Professional Experience**: Represents volunteer work, personal projects, etc.; includes activity name, organization, dates, and four STAR components; belongs to one User
- **Education**: Represents an academic qualification; includes institution, degree type, field of study, dates, and optional details (GPA, honors, coursework); belongs to one User

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete account registration in under 2 minutes
- **SC-002**: Users can add a complete professional experience with STAR format in under 5 minutes
- **SC-003**: System remains responsive (page loads under 2 seconds) on desktop, tablet, and mobile devices
- **SC-004**: 90% of users successfully add at least one experience on their first session
- **SC-005**: Users can export their complete career path with one click and receive properly formatted markdown
- **SC-006**: System handles at least 100 concurrent users without performance degradation
- **SC-007**: All forms and navigation are keyboard-accessible for users with disabilities
- **SC-008**: Users can access and edit their data from any device (responsive design works across screen sizes)

## Assumptions

- Users have basic internet access and can receive emails for account verification and password reset
- Users understand the STAR format or can learn it with minimal guidance (optional inline tips may be provided)
- Markdown is an acceptable export format for the target audience of job seekers
- Users primarily access the application through web browsers (Chrome, Firefox, Safari, Edge)
- Email is the primary method for authentication (no social login required initially)
- User data should be persistent and available across sessions
- The application is primarily for individual job seekers, not for recruiters or hiring managers
- Users are comfortable entering free-form text for STAR components (no character limits initially, though UI may provide guidance)

## Dependencies

- Self-hosted SMTP email server for account verification and password reset functionality (configurable via application settings)
- Secure hosting environment supporting HTTPS for authentication security
- Data storage solution for persisting user accounts, experiences, education entries, and application configuration
- Secure configuration management for storing sensitive settings (e.g., SMTP credentials) encrypted

## Out of Scope

The following are explicitly NOT included in this initial version:

- Resume generation in PDF or Word format (only markdown export)
- AI-powered suggestions or feedback on STAR stories
- Job search or job board integration
- Sharing profiles with recruiters or making profiles public
- Social features (commenting, endorsements, networking)
- Interview preparation features beyond storing STAR stories
- Multi-language support (English only initially)
- Mobile native applications (web-responsive only)
- Integration with LinkedIn or other professional networks
- Skills tagging or competency frameworks
- Cover letter generation
- Analytics or insights about career progression

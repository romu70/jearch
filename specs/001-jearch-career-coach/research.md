# Research & Technology Decisions

**Feature**: Jearch - Virtual Career Coach  
**Branch**: `001-jearch-career-coach`  
**Date**: 2026-01-15

This document captures key technology decisions, research findings, and architectural patterns for the Jearch platform.

---

## 1. UI Component Library: Chakra UI

### Decision
Use **Chakra UI v2+** for all UI components with French localization.

### Rationale
- **Accessibility-first**: Built-in WCAG 2.1 AA compliance (meets FR-052 requirement)
- **Composable components**: Flexible, well-documented components for forms, modals, navigation
- **TypeScript support**: Excellent type safety and autocomplete
- **Theme customization**: Easy to customize for branding while maintaining accessibility
- **Active community**: Well-maintained with regular updates
- **French localization support**: Can configure French labels, error messages, and ARIA labels
- **No Tailwind dependency**: Uses CSS-in-JS (Emotion), avoiding Tailwind requirement

### Alternatives Considered
- **shadcn/ui + Tailwind**: Rejected due to Tailwind requirement
- **Radix UI**: Rejected due to need for custom styling (slower initial development)
- **Material-UI (MUI)**: Rejected due to larger bundle size and Material Design opinions
- **Mantine**: Strong contender but Chakra has better accessibility documentation

### Implementation Notes
- Configure ChakraProvider with French locale in root layout
- Create custom theme with French error messages
- Wrap common components (Button, Input, Textarea, etc.) with French labels
- Use Chakra's built-in form validation with React Hook Form

---

## 2. French Localization Strategy

### Decision
Use a **two-tier approach**: Chakra UI theme configuration for component strings + route-based French naming.

### Rationale
- **User requirement**: Interface must be in French (specified in `/speckit.plan` input)
- **Out of scope**: Multi-language support explicitly excluded (spec: Out of Scope section)
- **Simplicity**: Hardcoded French strings are simpler than i18n library for single-language app
- **Performance**: No runtime translation overhead
- **SEO**: French route names improve discoverability for French users

### Alternatives Considered
- **next-intl / react-i18next**: Rejected as over-engineering for single-language app
- **English with translation layer**: Rejected to avoid unnecessary abstraction

### Implementation Notes
- Create `lib/validation/messages.fr.ts` for all validation error messages
- Use French route names: `/connexion`, `/inscription`, `/experiences-pro`, `/formation`
- All UI text, labels, buttons, tooltips in French
- Email templates in French
- Validation messages in French (Zod schemas)

### French Terminology
| English | French | Route/Usage |
|---------|--------|-------------|
| Login | Connexion | `/connexion` |
| Sign up / Register | Inscription | `/inscription` |
| Password reset | Réinitialiser le mot de passe | `/reinitialiser` |
| Dashboard | Tableau de bord | `/tableau-de-bord` |
| Professional experience | Expérience professionnelle | `/experiences-pro` |
| Extra-professional | Expérience extra-professionnelle | `/experiences-extra` |
| Education | Formation | `/formation` |
| Export | Exporter | `/exporter` |
| Settings | Paramètres | `/parametres` |
| Save | Enregistrer | Button label |
| Delete | Supprimer | Button label |
| Cancel | Annuler | Button label |

---

## 3. Form Management: React Hook Form + Zod

### Decision
Use **React Hook Form** for form state management with **Zod** for schema validation.

### Rationale
- **Performance**: Minimal re-renders, essential for large STAR forms (10,000 char fields)
- **Auto-save support**: Easy to debounce and trigger saves on field changes (FR-051)
- **Validation**: Zod integration provides type-safe validation with custom French messages
- **Accessibility**: Works seamlessly with Chakra UI's accessible form components
- **TypeScript**: Excellent type inference from Zod schemas

### Alternatives Considered
- **Formik**: Rejected due to more re-renders and less TypeScript support
- **Native React state**: Rejected due to complexity of auto-save and validation

### Implementation Notes
- Create Zod schemas in `lib/validation/schemas.ts`
- French error messages in `lib/validation/messages.fr.ts`
- Debounce auto-save to 2 seconds using `useDebounce` hook
- Show auto-save indicator component (FR-051)
- Validate character limits client-side before server submission

---

## 4. Authentication & Rate Limiting: Supabase Auth + Custom Middleware

### Decision
Use **Supabase Auth** for core authentication with **Next.js middleware** for rate limiting.

### Rationale
- **Built-in features**: Email verification, password reset, session management out-of-box
- **Security**: HttpOnly cookies, secure session tokens (FR-009a)
- **RLS integration**: Row Level Security policies tie directly to Supabase auth users
- **Rate limiting**: Custom middleware for progressive delays (3/5/10 attempts - FR-009)

### Alternatives Considered
- **NextAuth.js**: Rejected due to Supabase requirement for database/auth integration
- **Custom auth**: Rejected due to complexity and security risks

### Implementation Notes
- Configure Supabase Auth with custom email templates (French)
- Implement rate limiting in `middleware.ts`:
  - Track failed attempts in Supabase table
  - Apply progressive delays: 5 min, 15 min, 1 hour
  - Send unlock email on 1-hour lockout
- "Keep me logged in" checkbox controls session expiry settings
- Email verification required before dashboard access (FR-003)

---

## 5. Auto-Save Implementation: Debounced Hooks + Optimistic Updates

### Decision
Implement auto-save using **debounced React hooks** with **optimistic UI updates**.

### Rationale
- **UX requirement**: Save 2 seconds after typing stops (FR-051)
- **Visual feedback**: Show save indicator (saving/saved/error states)
- **Conflict detection**: Use `updated_at` timestamp for version tracking (FR-053)
- **Navigation safety**: Trigger save before route changes

### Implementation Pattern
```typescript
const useAutoSave = (formData, saveFunction, delay = 2000) => {
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error
  const debouncedSave = useDebouncedCallback(saveFunction, delay);
  
  useEffect(() => {
    if (formData) {
      setSaveStatus('saving');
      debouncedSave(formData);
    }
  }, [formData]);
  
  return { saveStatus };
};
```

### Alternatives Considered
- **Manual save only**: Rejected due to data loss risk
- **Real-time sync (WebSockets)**: Rejected as over-engineering for single-user forms

### Implementation Notes
- Debounce onChange events for text inputs
- Show spinner/indicator during save
- Display "Enregistré" (Saved) confirmation
- Handle save errors gracefully with retry option
- Save on blur and before navigation using Next.js router events

---

## 6. Concurrent Edit Detection: Optimistic Locking with Timestamps

### Decision
Implement **optimistic locking** using `updated_at` timestamps for conflict detection.

### Rationale
- **User requirement**: Detect conflicts, warn user, show merge interface (FR-053)
- **Simplicity**: Timestamp comparison is simpler than CRDTs or operational transforms
- **PostgreSQL support**: Supabase PostgreSQL has built-in timestamp tracking

### Implementation Pattern
```typescript
// On save, check if DB updated_at > local updated_at
const handleSave = async (data, localUpdatedAt) => {
  const { data: current } = await supabase
    .from('experiences')
    .select('updated_at')
    .eq('id', data.id)
    .single();
    
  if (new Date(current.updated_at) > new Date(localUpdatedAt)) {
    // Show conflict modal with merge interface
    return { conflict: true, serverData: current };
  }
  
  // Proceed with save
  return await supabase.from('experiences').update(data);
};
```

### Alternatives Considered
- **Last write wins**: Rejected due to data loss risk
- **Pessimistic locking**: Rejected due to poor UX (blocking other tabs)
- **CRDTs**: Rejected as over-engineering

### Implementation Notes
- Store `updated_at` in component state on load
- Check timestamp before every save
- Show modal with side-by-side diff on conflict
- Allow user to choose: keep theirs, keep server, or manual merge
- Refresh `updated_at` after successful save

---

## 7. SMTP Email Queue: Database-Backed Retry Queue

### Decision
Implement **database-backed email queue** with exponential backoff retry logic.

### Rationale
- **Failure handling**: SMTP failures should not block registration (FR-017a)
- **Reliability**: Queue ensures emails eventually sent even after SMTP downtime
- **Monitoring**: Admin can see failed emails in database
- **Configuration**: SMTP settings stored encrypted in database (FR-016)

### Implementation Pattern
```typescript
// Email queue table schema
interface EmailQueue {
  id: string;
  to: string;
  subject: string;
  body: string;
  template: 'verification' | 'password_reset' | 'unlock';
  attempts: number;
  next_retry: timestamp;
  status: 'pending' | 'sent' | 'failed';
  error: string | null;
}

// Retry with exponential backoff
const retryDelays = [5, 15, 30, 60, 120]; // minutes
```

### Alternatives Considered
- **In-memory queue**: Rejected due to loss on server restart
- **Third-party service (SendGrid, etc.)**: Rejected due to self-hosted SMTP requirement

### Implementation Notes
- Cron job (Supabase Edge Function or Vercel Cron) processes queue every 5 minutes
- Exponential backoff: 5, 15, 30, 60, 120 minutes
- After 5 failures, mark as permanently failed and alert admin
- Log all SMTP attempts for debugging (FR-058)
- Encrypt SMTP credentials in database using Supabase vault

---

## 8. Markdown Export: Server-Side Generation with Character Escaping

### Decision
Generate markdown **server-side** in Next.js API route with proper character escaping.

### Rationale
- **Data safety**: Escape markdown special characters to prevent formatting breaks (FR-046)
- **Consistency**: Server-side ensures consistent formatting
- **Performance**: Large exports (100+ experiences) don't block client
- **Testing**: Easier to unit test markdown generation

### Implementation Pattern
```typescript
const escapeMarkdown = (text: string): string => {
  const specialChars = ['\\', '*', '_', '#', '[', ']', '(', ')', '`', '~', '|'];
  return specialChars.reduce((str, char) => 
    str.replaceAll(char, `\\${char}`), text
  );
};

const generateMarkdown = (userData) => {
  return `
# ${escapeMarkdown(userData.name)} - Parcours Professionnel

## Expériences Professionnelles

${userData.professionalExperiences.map(exp => `
### ${escapeMarkdown(exp.role)} - ${escapeMarkdown(exp.company)}
*${formatDate(exp.startDate)} - ${exp.current ? 'Présent' : formatDate(exp.endDate)}*

**Situation**: ${escapeMarkdown(exp.situation)}
**Tâche**: ${escapeMarkdown(exp.task)}
**Action**: ${escapeMarkdown(exp.action)}
**Résultat**: ${escapeMarkdown(exp.result)}
`).join('\n')}
...
  `;
};
```

### Alternatives Considered
- **Client-side generation**: Rejected due to testing complexity
- **No escaping**: Rejected due to formatting corruption risk (FR-046)

### Implementation Notes
- API route `/api/export/markdown` generates markdown
- Escape all user-entered content
- Use French section headers ("Expériences Professionnelles", "Formation")
- Handle empty career paths with placeholder text (FR-048a)
- Set proper `Content-Disposition` header for download

---

## 9. Observability: Structured JSON Logging to Console

### Decision
Use **structured JSON logging** to console output, relying on Vercel/Supabase built-in log aggregation.

### Rationale
- **User requirement**: Platform-native observability only (FR-060, FR-061, FR-062)
- **Zero setup**: No third-party services to configure
- **Cost**: Free within Vercel/Supabase plans
- **Compliance**: Meets observability requirements without over-engineering

### Implementation Pattern
```typescript
const logger = {
  info: (message: string, metadata?: object) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...metadata
    }));
  },
  error: (message: string, error: Error, metadata?: object) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: error.message,
      stack: error.stack,
      ...metadata
    }));
  }
};

// Usage
logger.info('Experience created', { userId, experienceId });
logger.error('SMTP send failed', error, { emailType: 'verification' });
```

### Alternatives Considered
- **Sentry/Datadog**: Rejected due to platform-native requirement (FR-060)
- **Winston/Pino**: Rejected as unnecessary for console output

### Implementation Notes
- Log critical events: auth attempts, CRUD operations, SMTP failures, errors (FR-058)
- DO NOT log: STAR content, passwords, tokens, full emails (FR-059)
- Vercel automatically captures console output
- Supabase logs database queries and auth events
- Monitor via Vercel dashboard and Supabase dashboard (FR-062)

---

## 10. Accessibility: Chakra UI + Manual ARIA Labels (French)

### Decision
Leverage **Chakra UI's built-in accessibility** + custom French ARIA labels where needed.

### Rationale
- **WCAG 2.1 AA requirement**: Mandatory (FR-052)
- **Keyboard navigation**: Chakra provides out-of-box keyboard support (SC-007)
- **Screen reader support**: Proper ARIA labels in French enhance UX
- **Focus management**: Chakra handles focus trapping in modals

### Implementation Checklist
- [ ] All form inputs have French labels and error messages
- [ ] Buttons have descriptive text or `aria-label` in French
- [ ] Focus indicators visible on all interactive elements
- [ ] Modal dialogs trap focus and announce in French
- [ ] Auto-save status announced to screen readers (`aria-live="polite"`)
- [ ] Character counters have `aria-describedby` linking to limit
- [ ] Color contrast meets AA standards (4.5:1 for normal text)
- [ ] Forms navigable entirely by keyboard

### Implementation Notes
- Use Chakra's `FormControl`, `FormLabel`, `FormErrorMessage` components
- Add `aria-label` to icon buttons: "Supprimer l'expérience"
- Announce auto-save status changes: "Enregistrement en cours...", "Enregistré"
- Test with screen readers (NVDA, JAWS, VoiceOver in French mode)

---

## 11. Testing Strategy

### Decision
**Three-tier testing**: Unit (Jest), Integration (Supabase local), E2E (Playwright).

### Rationale
- **Spec requirements**: User stories define acceptance scenarios (testable with E2E)
- **CI/CD**: Automated testing prevents regressions
- **Confidence**: Integration tests verify Supabase RLS policies work correctly

### Test Coverage Targets
- **Unit tests**: Utilities (markdown export, validation, escaping) - 80%+ coverage
- **Integration tests**: API routes + Supabase queries - 70%+ coverage
- **E2E tests**: All user stories from spec - 100% of acceptance scenarios

### Implementation Notes
- **Unit**: Test `lib/` functions with Jest
  - `lib/export/markdown.ts` - markdown generation and escaping
  - `lib/validation/schemas.ts` - Zod schema validation
- **Integration**: Test API routes with Supabase local
  - `app/api/experiences/route.ts` - CRUD operations
  - Verify RLS policies block unauthorized access
- **E2E**: Test user flows with Playwright
  - User Story 1: Registration, login, logout, password reset
  - User Story 2: Add/edit/delete professional experience
  - User Story 3: Add extra-professional experience
  - User Story 4: Add education entry
  - User Story 5: Export markdown

### Tools
- **Jest** + **React Testing Library**: Component and utility tests
- **Playwright**: E2E tests in French (fill forms with French labels)
- **Supabase CLI**: Local database for integration tests

---

## 12. Deployment & Infrastructure

### Decision
Deploy on **Vercel** with **Supabase** cloud database.

### Rationale
- **Spec requirement**: Vercel hosting (CLAUDE.md: "Vercel (Hosting)")
- **Next.js optimization**: Vercel is built for Next.js (creators of Next.js)
- **Zero config**: Automatic HTTPS, CDN, serverless functions
- **Supabase integration**: Official Vercel + Supabase integration available

### Infrastructure Components
- **Vercel**: Hosts Next.js app, serverless API routes
- **Supabase**: PostgreSQL database, authentication, RLS policies
- **Vercel Cron** (or Supabase Edge Function): Email queue processing
- **Environment variables**: Managed via Vercel dashboard + .env.local

### Implementation Notes
- Configure Supabase project with production database
- Set environment variables in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- Enable Vercel Analytics for performance monitoring (optional)
- Configure custom domain with HTTPS

---

## Summary of Key Decisions

| Area | Technology | Rationale |
|------|------------|-----------|
| UI Framework | Chakra UI v2+ | Accessibility-first, no Tailwind, French localization |
| Localization | Hardcoded French | Single-language app, no i18n overhead |
| Form Management | React Hook Form + Zod | Performance, auto-save support, TypeScript |
| Authentication | Supabase Auth | Built-in email verification, session management |
| Rate Limiting | Custom Next.js middleware | Progressive delays (3/5/10 attempts) |
| Auto-Save | Debounced hooks (2s) | UX requirement, optimistic updates |
| Conflict Detection | Optimistic locking (timestamp) | Simple, effective, PostgreSQL-native |
| Email Queue | Database-backed queue | Reliability, exponential backoff |
| Markdown Export | Server-side generation | Character escaping, testability |
| Observability | Structured JSON logs | Platform-native (Vercel + Supabase) |
| Accessibility | Chakra UI + French ARIA | WCAG 2.1 AA compliance |
| Testing | Jest + Playwright + Supabase | Unit, integration, E2E coverage |
| Deployment | Vercel + Supabase cloud | Spec requirement, optimal for Next.js |

---

**Next Steps**: Proceed to Phase 1 (data-model.md, API contracts, quickstart.md)

# Career Club Connect — System Architecture

**Last updated:** 5 November 2026  
**Architecture status:** Implemented full-stack MVP, deployed for demonstration  
**Repository:** https://github.com/ghanshyam20/career-club-connect

## 1. Architecture overview

Career Club Connect uses a separated frontend–backend architecture.

The Next.js application provides the user interface, while Django REST Framework handles authentication, authorization, business logic, and database operations.

PostgreSQL provides relational data persistence.

The system supports local development and cloud deployment.

### Production architecture

```text
                     MEMBER / ADMIN
                           |
                       HTTPS
                           |
                           v
                  NEXT.JS FRONTEND
                       Vercel
                           |
                  API requests
                           |
                           v
                  DJANGO REST API
                       Render
                           |
           +---------------+---------------+
           |               |               |
           v               v               v
      PostgreSQL      Django Admin      Resend API
       Database        Moderation       Email Service
```

**Frontend:** https://career-club-connect.vercel.app  
**Backend:** https://career-club-connect.onrender.com  
**Django Admin:** https://career-club-connect.onrender.com/admin/

The frontend and backend are independently deployed and communicate through HTTP API requests.

The backend remains responsible for enforcing permissions regardless of frontend behavior.

## 2. Technology stack

| Component | Technology |
|---|---|
| Frontend framework | Next.js 16 |
| UI library | React 19 |
| Frontend language | TypeScript |
| Backend framework | Django 5.2 |
| API framework | Django REST Framework |
| Backend language | Python |
| Database | PostgreSQL |
| Database access | Django ORM and psycopg |
| Authentication | Django session authentication |
| Security | Django CSRF and security middleware |
| Email | Resend integration |
| Application server | Gunicorn |
| Static files | WhiteNoise |
| Local database | Docker Compose |
| Frontend hosting | Vercel |
| Backend hosting | Render |
| Version control | Git and GitHub |
| CI | GitHub Actions |

## 3. Repository organization

```text
career-club-connect/
|
+-- apps/
|   |
|   +-- web/
|   |   +-- src/
|   |   |   +-- app/
|   |   |   +-- components/
|   |   |   +-- lib/
|   |   +-- package.json
|   |
|   +-- api/
|       +-- accounts/
|       +-- profiles/
|       +-- experiences/
|       +-- forum/
|       +-- coffee_buddy/
|       +-- career_actions/
|       +-- notifications/
|       +-- search/
|       +-- moderation/
|       +-- health/
|       +-- config/
|       +-- manage.py
|       +-- requirements.txt
|
+-- docs/
|   +-- ARCHITECTURE.md
|   +-- CURRENT_STATE.md
|   +-- START_HERE.md
|   +-- DECISIONS.md
|   +-- source/
|
+-- .github/
|   +-- workflows/
|
+-- compose.yaml
+-- README.md
```

This is a monorepo: frontend, backend, documentation, and infrastructure configuration are maintained together.

## 4. Frontend architecture

**Location:** `apps/web`

The frontend is built with Next.js App Router, React, and TypeScript.

Its responsibilities include:

- Page routing and navigation.
- Rendering authenticated member interfaces.
- Form validation and feedback.
- Responsive desktop and mobile layouts.
- Sending API requests.
- Displaying backend responses.
- Managing user-facing loading, error, and empty states.

### Main application areas

- Authentication and onboarding.
- Dashboard.
- Experience Library.
- Community Forum.
- Coffee Buddy.
- My Career Actions.
- Member discovery and search.
- Notifications.
- Profile management.
- Moderation interfaces.

### Important architectural boundary

The frontend must not be treated as the authority for access control.

Hiding a button or page is a user-interface decision, not a security boundary.

All sensitive operations must be authorized by the backend.

The original `/api/health` Next.js route handler was designed as a health-check proxy only. It must not be assumed to be a complete authenticated API proxy.

## 5. Backend architecture

**Location:** `apps/api`

Django REST Framework exposes versioned API endpoints under `/api/v1/`.

The backend follows a feature-oriented modular design.

| Application | Main responsibility |
|---|---|
| `accounts` | Registration, authentication, approval, password reset, account deletion |
| `profiles` | Member profiles |
| `experiences` | Career experiences and submissions |
| `forum` | Community posts, comments, likes |
| `coffee_buddy` | Networking invitations and messages |
| `career_actions` | Personal career actions |
| `notifications` | Notification retrieval and read status |
| `search` | Cross-community search |
| `moderation` | Experience review and approval |
| `health` | Application health endpoints |
| `config` | Django settings and root URL routing |

### Backend request lifecycle

```text
Incoming HTTP request
         |
         v
Django middleware
         |
         v
URL routing
         |
         v
DRF view
         |
         v
Authentication / permissions
         |
         v
Validation and business logic
         |
         v
Django ORM
         |
         v
PostgreSQL
         |
         v
HTTP response
```

This is a conceptual lifecycle. Actual validation and permission ordering depends on the view implementation.

## 6. Database architecture

Career Club Connect uses PostgreSQL and Django's ORM.

### Custom user model

The application uses:

`AUTH_USER_MODEL = "accounts.User"`

The user model extends Django's `AbstractUser`.

It was introduced before the initial migrations to support future customization.

### Member profiles

`MemberProfile` has a one-to-one relationship with the custom user model.

Its fields include:

- Career Club round.
- Biography.
- Skills.
- Career interests.
- Creation timestamp.
- Update timestamp.

### Experiences

Each `Experience` belongs to a user.

The model includes:

- Title.
- Category.
- Content.
- Anonymous publishing flag.
- Moderation status.
- Creation and update timestamps.

Experience categories include job applications, interviews, internships, networking, and other experiences.

Moderation states are:

`pending`, `approved`, and `rejected`.

### Coffee Buddy

The networking feature uses two models:

**CoffeeInvitation**

Stores the creator, topic, description, meeting format, acceptance information, status, and timestamps.

Invitation states include:

`open`, `accepted`, and `cancelled`.

**CoffeeMessage**

Stores messages linked to a specific invitation, including sender, content, and creation timestamp.

A database constraint prevents a user from accepting their own invitation.

### Data integrity

Django models define relationships and database constraints.

Database migrations are used to manage schema changes.

The remaining models for Community Forum, Career Actions, and Notifications are maintained in their respective Django applications.

## 7. Authentication architecture

Career Club Connect uses Django's authentication system with session-based browser authentication.

The backend provides endpoints for:

- CSRF initialization.
- Registration.
- Login.
- Logout.
- Current authenticated user.
- Registration approval status.
- Password-reset requests.
- Password-reset confirmation.
- Account deletion.

### Authentication flow

```text
Member opens login page
          |
          v
Submits credentials
          |
          v
Django validates credentials
          |
          +-- Invalid --> Authentication error
          |
          +-- Valid
                 |
                 v
          Account eligibility
                 |
                 +-- Not active --> Access restricted
                 |
                 +-- Active
                        |
                        v
                 Session established
                        |
                        v
                 Member dashboard
```

The backend owns credential validation and account access decisions.

### CSRF protection

Django's CSRF middleware is enabled.

Production configuration includes trusted frontend origins and secure cookie settings.

CSRF protections must not be disabled to work around cross-origin request problems.

### Password reset

The password-reset API supports requesting a reset and confirming a new password.

Reset links use time-limited validation.

The configured timeout is 30 minutes.

The application should not disclose whether an arbitrary email address belongs to a registered member.

## 8. Member approval architecture

New registrations are subject to administrator approval.

The backend includes an approval-status endpoint, and Django Admin supports bulk activation of selected inactive members.

The approval action sends transactional email notifications.

```text
Registration
     |
     v
Inactive account
     |
     v
Administrator review
     |
     +-- Awaiting --> Pending status
     |
     +-- Approved
            |
            v
      Account activated
            |
            v
      Approval email attempted
            |
            v
      Member can log in
```

Approval and email delivery are separate operations.

A failed approval email must not be interpreted as proof that account activation failed.

Likewise, an HTTP success response from a password-reset request does not prove that an email was delivered.

**Known limitation:** Administrator approval does not independently verify that the registrant controls the email address they entered.

Email verification and common-domain typo suggestions remain future improvements.

## 9. Experience moderation architecture

Experience submissions use an approval-based publishing workflow.

```text
Member submits experience
            |
            v
        Pending review
            |
            v
      Moderator decision
            |
       +----+----+
       |         |
       v         v
    Approved   Rejected
       |
       v
Visible in approved
experience listings
```

Moderation is handled by the backend.

The public or member-facing interface must not be trusted to determine whether unapproved content can be accessed.

## 10. Community and networking architecture

### Community Forum

The forum API includes:

- Post listing and creation.
- Post comments.
- Post likes.

### Coffee Buddy

The Coffee Buddy API supports:

- Listing and creating invitations.
- Accepting invitations.
- Cancelling invitations.
- Accessing invitation conversations.

Conversation records are associated with invitations.

### My Career Actions

The Career Actions API provides list/create and detail endpoints.

This module stores personal career-development activities separately from public community discussions.

### Notifications

The notifications API supports listing notifications and marking individual records as read.

### Search

A dedicated search endpoint is exposed at:

`/api/v1/search/`

The backend owns search behavior and data-access rules.

## 11. API routing

The main API routes are:

```text
/api/v1/auth/
/api/v1/profiles/
/api/v1/experiences/
/api/v1/forum/
/api/v1/coffee-buddy/
/api/v1/career-actions/
/api/v1/notifications/
/api/v1/search/
/api/v1/moderation/
/api/v1/health/live
/api/v1/health/ready
```

Django Admin is served separately under:

`/admin/`

Not all endpoints have the same authentication requirements or HTTP methods.

Detailed behavior is defined in each application's URL configuration, views, and permission checks.

## 12. Transactional email architecture

The deployed application uses a Resend-based Django email backend.

Email configuration is supplied through environment variables.

Relevant configuration includes:

- `EMAIL_BACKEND`
- `DEFAULT_FROM_EMAIL`
- `RESEND_API_KEY`
- `FRONTEND_URL`

The email integration is used for application workflows such as member approval and password recovery.

API keys and other secrets must never be committed to Git.

Email acceptance, delivery, and user receipt are different events and should be monitored separately.

## 13. Local development architecture

```text
Developer browser
http://localhost:3000
        |
        v
Next.js development server
        |
        v
Django development server
http://127.0.0.1:8000
        |
        v
PostgreSQL
localhost:5432
Docker Compose
```

The local database is started using Docker Compose.

The backend runs in a Python virtual environment.

The frontend runs using Node.js and npm.

Development environment variables are configured separately from production.

Refer to `docs/SETUP_UBUNTU.md` for exact setup instructions.

## 14. Production deployment architecture

### Frontend — Vercel

Vercel hosts the Next.js application.

### Backend — Render

Render hosts Django and serves the REST API and Django Admin.

Gunicorn is included as the production application server.

WhiteNoise is configured to serve Django static assets.

### Database

The deployed backend connects to PostgreSQL through environment-based database configuration.

The Django settings support `DATABASE_URL` and `dj-database-url`.

### Production security settings

The current Django configuration includes:

- Production `DEBUG=False`.
- Required production secret key.
- Allowed-host configuration.
- HTTPS redirection.
- Secure session cookies.
- Secure CSRF cookies.
- HSTS configuration.
- Trusted CSRF origins.
- Proxy SSL header configuration.

These settings are implemented in configuration but should still be verified in the deployed environment.

## 15. Configuration management

Environment-specific configuration is managed through environment variables.

Development and production must use separate credentials and appropriate settings.

Examples of important variables:

```text
DJANGO_SECRET_KEY
DJANGO_ENV
DJANGO_DEBUG
DJANGO_ALLOWED_HOSTS
DJANGO_CSRF_TRUSTED_ORIGINS
DATABASE_URL
FRONTEND_URL
EMAIL_BACKEND
DEFAULT_FROM_EMAIL
RESEND_API_KEY
```

Never commit real values for passwords, secret keys, database credentials, or API tokens.

Commit example environment files only.

## 16. Testing and CI architecture

The project uses multiple verification layers.

### Backend tests

Django's test framework verifies application behavior and business rules.

### Frontend checks

The Next.js application provides:

```bash
npm run typecheck
npm run lint
npm run build
```

### Continuous integration

GitHub Actions configuration is stored in:

`.github/workflows/checks.yml`

### Manual testing

Manual testing remains necessary for:

- Login and registration.
- Account approval.
- Password recovery.
- Experience moderation.
- Community workflows.
- Networking conversations.
- Responsive navigation.
- Cross-origin authentication.
- Deployed frontend/backend integration.

A previously successful test run does not guarantee that later changes are regression-free.

## 17. Security boundaries

The architecture follows these rules:

1. Django is responsible for authentication and authorization.
2. Frontend route guards do not replace backend permissions.
3. Session cookies and CSRF protections must be preserved.
4. Passwords and secret credentials must never be stored in browser localStorage.
5. API keys and database credentials remain server-side.
6. User-generated content must be validated and appropriately moderated.
7. Users must not gain access to another member's private records through manipulated API requests.
8. Administrative operations require appropriate privileges.
9. Production errors must not expose sensitive internal details.
10. Security-sensitive changes require regression testing.

These are architectural requirements. Each must be verified against the relevant implementation before claiming complete security coverage.

## 18. Known limitations and future improvements

The current architecture supports a deployed demonstration MVP, but several areas still require work:

- Independent email ownership verification.
- Better email typo detection during registration.
- Improved password-reset and email-delivery diagnostics.
- More accessible Django Admin interfaces.
- Complete end-to-end authentication testing.
- Production monitoring and alerting.
- Backup and disaster recovery procedures.
- Data retention and privacy-policy review.
- GDPR-related operational procedures.
- Accessibility testing.
- Performance and load testing.
- Review of dependency security findings.
- Cross-browser and mobile testing.

These are improvements to the existing architecture rather than prerequisites for demonstrating the current MVP.

## 19. Architectural decisions

The project follows these design principles:

**Modular monolith backend:** Django applications separate business domains while sharing one backend deployment.

**Decoupled frontend:** Next.js is deployed separately from Django.

**REST API integration:** The frontend communicates with backend endpoints rather than accessing the database directly.

**Relational persistence:** PostgreSQL stores application data.

**Backend-enforced permissions:** Authorization remains the responsibility of Django.

**Controlled community onboarding:** New member accounts require administrative approval.

**Moderated experience publishing:** Submitted experiences are reviewed before appearing in approved listings.

**Incremental development:** Features are implemented and tested in stages.

**Independent project scope:** The platform is not represented as an official City of Espoo service.

## 20. Documentation maintenance

This document describes the system's technical structure and architectural boundaries.

Use the following documents for related information:

- `README.md` — project overview and features.
- `CURRENT_STATE.md` — latest development progress and known issues.
- `START_HERE.md` — project orientation and working instructions.
- `SETUP_UBUNTU.md` — local setup.
- `DECISIONS.md` — approved product decisions.
- `BACKLOG.md` — upcoming work.

Update this document whenever the system architecture changes significantly.
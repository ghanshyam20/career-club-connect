# Career Club Connect

**A career community should not end when the workshop does.**

Career Club Connect is a mobile-first, full-stack career community platform that helps Career Club participants and alumni stay connected, exchange practical experiences, build professional relationships, and turn career-development advice into action.

Rather than building another general-purpose professional social network, Career Club Connect focuses on four connected activities:

**Discover → Learn → Connect → Act**

The platform is an independently developed software project. It is **not officially affiliated with or endorsed by the City of Espoo**.

## Project status

**Current phase:** Deployed full-stack MVP / demonstration prototype  
**Last updated:** 5 November 2026  
**Development status:** Active development and testing  
**Target audience:** Career Club participants, alumni, and community moderators

The application has progressed from a locally running prototype into a deployed, integrated web application with member-facing features, backend APIs, database persistence, and administrative workflows.

### Live application

| Component | URL | Hosting |
|---|---|---|
| Frontend | https://career-club-connect.vercel.app | Vercel |
| Backend | https://career-club-connect.onrender.com | Render |
| Administration | https://career-club-connect.onrender.com/admin/ | Django Admin |
| Source code | https://github.com/ghanshyam20/career-club-connect | GitHub |

The backend is API-oriented. Its root URL is not intended to function as a public homepage.

**Important:** Public deployment does not mean the application has completed a full production security, accessibility, privacy, or operational audit.

## The problem

Career-development workshops provide valuable knowledge, encouragement, and networking opportunities. However, participants may lose contact after a workshop or Career Club round finishes.

Useful experiences remain scattered across conversations, people from different rounds may never meet, and career goals can become difficult to track without continued support.

Career Club Connect addresses these gaps by providing a shared digital space where members can:

- Find people with relevant backgrounds and interests.
- Learn from other members' career experiences.
- Participate in career-focused discussions.
- Arrange networking conversations.
- Track their own career-development activities.

## Core features

### 1. Authentication and member onboarding

The platform includes a Django-based authentication system with a custom user model.

Implemented capabilities include:

- Member registration.
- Login and logout.
- Session-based authentication.
- CSRF protection for authenticated requests.
- Current-user API endpoint.
- Password-reset request and confirmation endpoints.
- Registration approval status checking.
- Administrator-controlled member activation.
- Account deletion endpoint.

New member accounts follow an approval workflow rather than automatically receiving unrestricted access.

The administration interface includes a bulk member-approval action and email notifications for approved accounts.

### 2. Member dashboard

The dashboard serves as the main entry point after authentication.

It includes responsive navigation, access to the major platform modules, member information, and content highlights retrieved from the backend.

The dashboard is designed to make the member journey easy to understand and reduce unnecessary navigation.

### 3. Experience Library

The Experience Library allows members to contribute and discover practical career-related experiences.

Key capabilities:

- Submit career experiences.
- Browse approved experiences.
- Search experiences by title or content.
- Filter experiences by category.
- View individual experience details.
- Review personal submissions and their moderation status.
- Publish experiences with an anonymous-display option.
- Moderate submitted content before publication.

The moderation workflow separates member-generated submissions from content approved for wider visibility.

### 4. Community Forum

The Community Forum provides a space for career-related conversations.

The backend supports:

- Community post creation and retrieval.
- Comments and discussion replies.
- Post likes.
- Member-generated discussion content.

The forum is intended for questions, shared experiences, advice, and ongoing community participation.

### 5. Coffee Buddy

Coffee Buddy supports direct networking between community members.

The backend includes:

- Networking invitation creation and listing.
- Invitation acceptance.
- Invitation cancellation.
- Conversation messaging associated with invitations.

The goal is to help members move beyond browsing profiles and start meaningful professional conversations.

### 6. My Career Actions

My Career Actions provides a personal workspace for career-development activities.

The backend supports creating, retrieving, and updating individual career actions.

This module connects community learning with practical follow-through, helping members organize their next steps.

### 7. Search & Explore

Search & Explore helps members discover relevant information across the community.

A dedicated search API is implemented, with a corresponding member-facing application section.

The feature supports the platform's discoverability goal by reducing the need to navigate each module independently.

### 8. Member profiles and discovery

Member profiles provide context for networking and community participation.

Profile functionality includes member information, career interests, skills, and Career Club-related details.

A member discovery section is included in the frontend application.

### 9. Notifications

A notification backend is implemented with endpoints for:

- Retrieving notifications.
- Marking individual notifications as read.

The platform also includes a dedicated notifications interface.

### 10. Administration and moderation

Career Club Connect uses Django Admin and dedicated moderation APIs.

Administrative capabilities include:

- Viewing and managing registered users.
- Searching and filtering user accounts.
- Activating member accounts.
- Managing staff and superuser permissions.
- Approving member registrations.
- Moderating submitted experiences.
- Reviewing community-related records.

The administrative interface is currently based on Django Admin. A more accessible visual redesign for nontechnical administrators is planned.

## Technology stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 16 | React-based web application |
| UI | React 19 | Interactive user interfaces |
| Language | TypeScript | Typed frontend development |
| Backend | Python, Django 5.2 | Business logic and application framework |
| API | Django REST Framework | RESTful HTTP endpoints |
| Database | PostgreSQL | Relational data persistence |
| Local infrastructure | Docker Compose | Local database orchestration |
| Authentication | Django sessions and CSRF | Authenticated browser requests |
| Email | Resend integration | Transactional application emails |
| Frontend hosting | Vercel | Web application deployment |
| Backend hosting | Render | Django API hosting |
| Static assets | WhiteNoise | Django static-file serving |
| Application server | Gunicorn | Django production WSGI server |
| Version control | Git and GitHub | Source management |
| CI | GitHub Actions | Automated development checks |
| Development | Ubuntu and VS Code | Local development environment |

Dependencies are defined in the frontend `package.json` and backend `requirements.txt`.

## System architecture

Career Club Connect follows a separated frontend–backend architecture.

```text
                    USER / BROWSER
                          |
                          v
                Next.js Application
                       Vercel
                          |
                 HTTPS API requests
                          |
                          v
                 Django REST API
                       Render
                          |
             +------------+------------+
             |            |            |
             v            v            v
        PostgreSQL    Django Admin   Email Service
        Database      & Moderation      Resend
```

### Frontend responsibilities

The Next.js application handles:

- Page routing and navigation.
- User interfaces and forms.
- Responsive layouts.
- API communication.
- Authentication-related user experience.
- Displaying member, community, and career-development data.

### Backend responsibilities

Django and Django REST Framework handle:

- Authentication and authorization.
- Request validation.
- Business rules.
- Database operations.
- User approval.
- Content moderation.
- Notifications.
- Networking invitation workflows.
- REST API responses.

### Database responsibilities

PostgreSQL stores persistent application records, including users, profiles, experiences, discussion content, networking interactions, and career actions.

Django's ORM and migrations manage the application's relational data model.

## Backend application structure

The Django backend is organized into feature-focused applications.

| Django app | Responsibility |
|---|---|
| `accounts` | Registration, authentication, approval, password reset and account deletion |
| `profiles` | Member profile management |
| `experiences` | Experience Library and submissions |
| `forum` | Community posts, comments and likes |
| `coffee_buddy` | Networking invitations and conversations |
| `career_actions` | Personal career activities |
| `notifications` | Member notifications |
| `search` | Community search |
| `moderation` | Content review and approval |
| `health` | Application health endpoints |
| `config` | Django configuration and URL routing |

This modular structure separates responsibilities and allows individual features to evolve without placing all business logic in one application.

## API design

The backend exposes versioned API routes under `/api/v1/`.

Examples include:

| Endpoint | Purpose |
|---|---|
| `/api/v1/auth/register/` | Member registration |
| `/api/v1/auth/login/` | Member login |
| `/api/v1/auth/logout/` | Member logout |
| `/api/v1/auth/me/` | Current member |
| `/api/v1/auth/csrf/` | CSRF initialization |
| `/api/v1/auth/approval-status/` | Registration approval status |
| `/api/v1/auth/password-reset/` | Password-reset request |
| `/api/v1/auth/delete-account/` | Account deletion |
| `/api/v1/experiences/` | Experience Library |
| `/api/v1/experiences/mine/` | Member submissions |
| `/api/v1/forum/posts/` | Community posts |
| `/api/v1/coffee-buddy/` | Networking invitations |
| `/api/v1/career-actions/` | Career action records |
| `/api/v1/notifications/` | Notifications |
| `/api/v1/search/` | Search |
| `/api/v1/moderation/experiences/` | Experience moderation |

API access and available HTTP methods depend on the endpoint and the user's permissions.

## Authentication, security and privacy

The application incorporates several security-related controls:

- Django session authentication.
- CSRF middleware and trusted-origin configuration.
- Django password validation.
- Authentication and permission checks.
- HTTPS-oriented production settings.
- Secure session and CSRF cookies in production configuration.
- Environment-based secret management.
- Moderation and administrator permissions.
- Account deletion functionality.

Production configuration also includes SSL redirection and HTTP Strict Transport Security settings.

These controls provide a security foundation, but they do not constitute a completed security audit or a guarantee of GDPR compliance.

Before wider public use, the project still requires a review of data retention, consent and privacy information, access control, error handling, accessibility, operational monitoring, and data-subject rights.

## Email and approval workflow

Career Club Connect includes a transactional email integration using Resend.

The registration workflow is designed around administrator approval.

```text
Member registers
       |
       v
Account awaits approval
       |
       v
Administrator reviews account
       |
       v
Administrator approves member
       |
       v
Approval email is sent
       |
       v
Member can access the platform
```

The frontend includes an approval-status experience, while the backend provides the corresponding status API.

The approval workflow is intended to support controlled community onboarding.

## Repository structure

```text
career-club-connect/
├── apps/
│   ├── api/                 # Django backend
│   │   ├── accounts/
│   │   ├── profiles/
│   │   ├── experiences/
│   │   ├── forum/
│   │   ├── coffee_buddy/
│   │   ├── career_actions/
│   │   ├── notifications/
│   │   ├── search/
│   │   ├── moderation/
│   │   ├── health/
│   │   ├── config/
│   │   ├── manage.py
│   │   └── requirements.txt
│   └── web/                 # Next.js frontend
├── docs/                    # Project documentation
├── .github/
│   └── workflows/           # CI configuration
└── compose.yaml             # Local database services
```

The project follows a monorepo-style organization, keeping frontend, backend, infrastructure configuration, and documentation in one Git repository.

## Local development

### Prerequisites

- Python 3.12 or a compatible Python version.
- Node.js and npm compatible with the frontend dependencies.
- Docker Engine and Docker Compose.
- Git.
- PostgreSQL through the provided local Compose configuration.

### Setup

Clone the repository:

```bash
git clone https://github.com/ghanshyam20/career-club-connect.git
cd career-club-connect
```

Follow the maintained setup documentation:

1. `docs/START_HERE.md`
2. `docs/CURRENT_STATE.md`
3. `docs/SETUP_UBUNTU.md`
4. `docs/ARCHITECTURE.md`

Configure the required environment variables using the example environment files.

Start the local database, Django backend, and Next.js frontend according to the setup guide.

Local application addresses:

| Service | Address |
|---|---|
| Next.js frontend | http://localhost:3000 |
| Django backend | http://127.0.0.1:8000 |
| Django Admin | http://127.0.0.1:8000/admin/ |

Do not commit `.env` files, API keys, passwords, or other credentials.

## Testing and quality assurance

The project includes automated checks and has undergone iterative manual testing.

### Backend

Django tests are used to verify API and business-logic behavior, including authentication and feature workflows.

Typical local command:

```bash
cd apps/api
python manage.py test
```

### Frontend

The frontend provides scripts for:

```bash
cd apps/web
npm run typecheck
npm run lint
npm run build
```

### Continuous integration

GitHub Actions configuration is maintained in:

`.github/workflows/checks.yml`

The project has previously completed a backend test run containing 100 passing tests and a successful frontend production build.

**Current CI status should be checked in GitHub Actions.** Previous successful local checks do not guarantee that every latest workflow run passes.

### Manual verification

Manual testing has covered major user journeys, including:

- Registration and authentication.
- Member profile interactions.
- Experience submission and moderation.
- Dashboard navigation.
- Community-related interfaces.
- Networking workflows.
- Deployment and API integration.

Further end-to-end regression testing is needed before declaring the application production-ready.

## Deployment

The project uses separate hosting services for frontend and backend.

### Frontend — Vercel

Vercel hosts the Next.js application and serves the public web interface.

### Backend — Render

Render hosts the Django REST API and administration interface.

The backend uses environment-based configuration for production settings, database connectivity, allowed hosts, CSRF origins, and transactional email.

### Database

PostgreSQL is used in both local development and the deployed backend environment, with environment-specific connection settings.

### Deployment considerations

Production deployments require:

- Correct frontend and backend environment variables.
- A reachable PostgreSQL database.
- Database migrations.
- Secure application secrets.
- Correct CSRF and host configuration.
- Static-file collection.
- Working transactional email credentials.
- Successful application health checks.

Deployment credentials must remain outside the repository.

## Development progress

| Milestone | Status |
|---|---|
| Repository and local environment setup | Completed |
| PostgreSQL and Django foundation | Completed |
| Next.js frontend foundation | Completed |
| Registration and authentication | Implemented |
| Member profiles | Implemented |
| Experience Library | Implemented |
| Community Forum | Implemented |
| Coffee Buddy | Implemented |
| My Career Actions | Implemented |
| Search & Explore | Implemented |
| Notifications | Implemented |
| Content moderation | Implemented |
| Administrator approval workflow | Implemented |
| Transactional email integration | Implemented |
| Frontend deployment | Deployed |
| Backend deployment | Deployed |
| Automated testing foundation | Implemented |
| Complete production readiness review | Pending |
| Accessibility audit | Pending |
| Nontechnical admin UI redesign | Planned |

Here, **implemented** means the corresponding application code exists; it does not mean every workflow has completed full end-to-end or production acceptance testing.

## Current achievements

Career Club Connect demonstrates the development of an integrated web application across multiple technical areas:

**Full-stack development:** Connecting a Next.js frontend with a Django REST backend.

**Backend engineering:** Building feature-specific APIs, authentication, permissions, and moderation workflows.

**Database design:** Using relational models and Django migrations to persist application data.

**Frontend engineering:** Building responsive interfaces and multi-step user journeys with React and TypeScript.

**Application security:** Implementing session authentication, CSRF protection, environment-based secrets, and production-oriented Django settings.

**Cloud deployment:** Hosting the frontend and backend on separate cloud platforms.

**Email integration:** Supporting account approval and transactional notifications.

**Software quality:** Using backend tests, frontend checks, GitHub Actions, and manual verification.

**Project documentation:** Maintaining setup instructions, architectural notes, decisions, and development progress.

The outcome is a deployed, functional MVP foundation rather than a collection of disconnected mockups.

## Roadmap

The next phase focuses on quality, reliability, and usability rather than adding large numbers of new features.

### Short-term priorities

- Improve the Django Admin interface for nontechnical moderators.
- Complete cross-module end-to-end testing.
- Resolve remaining CI or lint issues.
- Review responsive behavior on smaller screens.
- Improve loading, empty, error, and success states.
- Review authorization and moderation edge cases.
- Update technical documentation to match deployed functionality.

### Before wider community use

- Complete privacy and data-protection documentation.
- Review account deletion and data-retention behavior.
- Complete an accessibility audit.
- Test email delivery and onboarding failure scenarios.
- Review database backup and recovery arrangements.
- Improve monitoring and operational procedures.
- Conduct security and deployment configuration reviews.

## Project documentation

Detailed documentation is maintained in the `docs/` directory.

Important references include:

- `START_HERE.md` — project orientation.
- `CURRENT_STATE.md` — latest verified development status.
- `SETUP_UBUNTU.md` — local development setup.
- `ARCHITECTURE.md` — technical architecture.
- `DECISIONS.md` — approved project decisions.
- `BACKLOG.md` — planned development work.
- `source/` — earlier planning and reference material.

Documentation should be updated as the implementation evolves.

## Demonstration data and project scope

The platform may contain fictional profiles, experiences, and demonstration records used for development and presentation.

Fictional examples should be identified as such and must not be represented as genuine testimonials or real community outcomes.

The platform is not an official City of Espoo service. The project does not claim official endorsement, operational adoption, or demonstrated employment outcomes.

## Repository

**GitHub:** https://github.com/ghanshyam20/career-club-connect

**Current objective:** Present a polished, deployed full-stack MVP that demonstrates how a career community can continue learning, networking, and taking action beyond individual workshops.
# CURRENT STATE — Career Club Connect

**Last updated:** 2026-10-15  
**Phase:** Full-stack prototype development — dashboard and Experience Library  
**Status:** Working locally; additional features under development  
**Repository:** `~/Desktop/career-club-connect`  
**GitHub:** https://github.com/ghanshyam20/career-club-connect  
**Branch:** `main`  
**Hosting:** Local development only; production deployment not completed.

## 1. Technology stack

- Frontend: Next.js 16, TypeScript
- Backend: Django 5.2, Django REST Framework
- Database: PostgreSQL 17 via Docker Compose
- Development: Ubuntu, Python virtual environment, Node.js, Git and VS Code

## 2. Features completed

### Authentication
- Member registration
- Login and logout
- Session authentication and CSRF protection
- Authenticated member API

### Member profiles
- Member profile API
- Profile editing
- Introduction, skills, career interests and Career Club round

### Experience Library
- Members can submit experiences
- New submissions require moderator approval
- Approved experiences are visible to authenticated members
- Members can view their own submissions and statuses
- Django admin supports experience moderation
- Anonymous publishing option

### Dashboard and navigation
- Responsive member dashboard
- Shared sidebar navigation
- Welcome message and member avatar
- Feature cards for the main modules
- Today's Highlight fetched from the Experience Library API
- Logout functionality

## 3. Features not yet completed

- Experience search and category filters
- Structured experience detail pages, helpful reactions and bookmarks
- Community Forum and comments
- Coffee Buddy member matching and requests
- My Career Actions and progress tracking
- Member discovery and optional profile photos
- Notifications and saved items
- Full privacy/GDPR workflows
- Complete PWA functionality
- Production deployment and security review

## 4. Testing and verification

Previously verified:

- PostgreSQL running locally through Docker
- Django API running on port 8000
- Next.js frontend running on port 3000
- Member registration and authentication working
- Profile editing working
- Experience submission and admin approval working
- Approved experience visible in Experience Library
- Dashboard highlight displaying an approved experience
- Frontend TypeScript and ESLint checks passed during development
- Backend authentication, profile and Experience Library tests passed during their respective milestones

**Before the next commit:** Rerun frontend checks and confirm the latest dashboard changes pass.

## 5. Current uncommitted work

- `README.md` — updated project description
- `apps/web/src/app/(member)/dashboard/page.tsx` — updated dashboard
- `apps/web/src/app/(member)/dashboard/dashboard.css` — dashboard styles
- `apps/web/src/components/DashboardFeatureCards.tsx` — feature cards
- `apps/web/src/components/DashboardHighlight.tsx` — API-powered highlight
- `apps/web/src/components/MemberAvatar.tsx` — member avatar
- `docs/CURRENT_STATE.md` — updated development record

## 6. Important project decisions

- This is an independent Career Club community prototype, not an officially endorsed City of Espoo service.
- Development examples must be clearly identified as fictional.
- The platform should eventually support real participants and alumni from multiple Career Club rounds.
- Keep the architecture suitable for future expansion.
- Preserve the owner approvals documented in `docs/DECISIONS.md`.
- Do not treat unapproved proposals in `docs/source/` as final decisions.

## 7. Next development steps

1. Commit and push the current dashboard and documentation improvements.
2. Add Experience Library search and category filtering.
3. Improve experience details and the member-facing UI.
4. Implement Community Forum.
5. Implement Coffee Buddy.
6. Implement My Career Actions.
7. Add member discovery, saved items and notifications.
8. Complete responsive UI, accessibility, security and deployment testing.

## 8. Local development

Project root:

`~/Desktop/career-club-connect`

Frontend: `http://localhost:3000`  
Backend: `http://127.0.0.1:8000`  
Django admin: `http://127.0.0.1:8000/admin/`

Refer to `docs/SETUP_UBUNTU.md` for installation and startup instructions.

## 9. Known issues and cautions

- Frontend npm audit previously reported dependency findings requiring review before deployment.
- The application has not undergone a production security review.
- Real-user onboarding, privacy controls and moderation procedures need further work.
- Local development servers must be running for the application to work.

## 10. Next action

Verify the latest frontend changes, commit the dashboard and documentation updates, and then continue with Experience Library search and filtering.

Update this file after the next completed development milestone.
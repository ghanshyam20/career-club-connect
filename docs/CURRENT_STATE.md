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

### Experience Library search and filtering
- Search approved experiences by title or content
- Filter approved experiences by category
- Combine search and category filters
- Show a message when no experiences match
- Keep My Submissions and Share Experience separate from the filters

### Dashboard and navigation
- Responsive member dashboard
- Shared sidebar navigation
- Welcome message and member avatar
- Feature cards for the main modules
- Today's Highlight fetched from the Experience Library API
- Logout functionality

## 3. Features not yet completed


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
- Experience Library search tested in browser
- Search no-results message verified
- Frontend TypeScript and ESLint checks passed after search/filter changes

## 10. Next action

Finish verifying the Experience Library improvements, update project documentation, and commit and push the changes to GitHub.

Next major feature: Community Forum.

Update this file after each completed development milestone.

## 5. Current uncommitted work

- `apps/web/src/app/(member)/experiences/page.tsx` — improved My Submissions and Share Experience presentation
- `apps/web/src/app/(member)/experiences/experiences.css` — responsive styling for Experience Library sections

The earlier dashboard and Experience Library search/filter improvements have already been committed and pushed to GitHub.

## 6. Important project decisions

- This is an independent Career Club community prototype, not an officially endorsed City of Espoo service.
- Development examples must be clearly identified as fictional.
- The platform should eventually support real participants and alumni from multiple Career Club rounds.
- Keep the architecture suitable for future expansion.
- Preserve the owner approvals documented in `docs/DECISIONS.md`.
- Do not treat unapproved proposals in `docs/source/` as final decisions.

## 7. Next development steps

1. Complete final Experience Library checks and commit the latest changes.
2. Implement the Community Forum with discussion posts and replies.
3. Implement Coffee Buddy member matching and requests.
4. Implement My Career Actions and progress tracking.
5. Add structured experience detail pages, helpful reactions and bookmarks.
6. Add member discovery, saved items and notifications.
7. Complete responsive UI, accessibility, privacy, security and deployment testing.


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

Finish verifying the Experience Library improvements, update project documentation, and commit and push the changes to GitHub.

Next major feature: Community Forum.

Update this file after each completed development milestone.
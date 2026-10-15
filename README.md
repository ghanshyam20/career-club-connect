# Career Club Connect

**Status:** Active development — working full-stack prototype.

Career Club Connect is a mobile-first career community platform designed to help Career Club participants and alumni share experiences, connect with others, and take practical steps toward their career goals.

This is an independent project and is not officially endorsed by the City of Espoo.

## Technology stack

- **Frontend:** Next.js, TypeScript
- **Backend:** Django REST Framework, Python
- **Database:** PostgreSQL using Docker Compose
- **Development environment:** Ubuntu, VS Code, Git and GitHub

## Features implemented

- Member registration, login and logout
- Session-based authentication and CSRF protection
- Member profile creation and editing
- Experience Library with submissions and approval-based moderation
- Experience Library search by title or content and category filtering
- My Submissions with moderation status and category badges
- Share Experience form with optional anonymous publishing
- Responsive Experience Library layout for desktop and mobile
- Member dashboard with navigation and feature cards
- Dashboard highlight displaying an approved experience from the API
- Responsive dashboard styling


## Features under development

- Community Forum with discussion posts and replies
- Coffee Buddy networking between Career Club rounds
- My Career Actions for goals and progress tracking
- Structured experience detail pages, reactions and bookmarks
- Member discovery, notifications and saved items
- Further mobile UI improvements and accessibility testing
- Privacy, security and production deployment

## Local setup

1. Read `docs/START_HERE.md` and `docs/CURRENT_STATE.md`.
2. Follow `docs/SETUP_UBUNTU.md` to install prerequisites and start the application.
3. Start the PostgreSQL database, Django backend and Next.js frontend according to the setup instructions.
4. Open `http://localhost:3000` in your browser.

## Development notes

- The project currently uses development and demonstration data.
- Fictional alumni examples must be clearly identified as fictional.
- Real participants will be able to register and contribute when the platform is ready for wider use.
- New features should be tested before committing.
- Keep `docs/CURRENT_STATE.md` updated after each development session.
- Earlier planning documents are stored in `docs/source/`.
- Approved project decisions are recorded in `docs/DECISIONS.md`.

## Repository

https://github.com/ghanshyam20/career-club-connect

**Current goal:** Build and demonstrate a functional, polished Career Club Connect prototype for the November 2026 project presentation.
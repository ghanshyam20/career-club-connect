# CURRENT STATE — update after every session

**Date:** 2026-10-15 (starter generated; replace with actual setup date)
**Phase:** Local foundation / technical spike
**Status:** Scaffold provided, NOT YET run on user's laptop.
**Repo path:** `~/Desktop/career-club-connect` (expected; verify)
**Git remote:** Not created / not verified
**Hosting:** Not purchased. Localhost first.

## What exists in the starter
- Next.js frontend skeleton with a home page and server-side API proxy for health only.
- Django REST API skeleton with health endpoints and PostgreSQL settings.
- Docker Compose for **local PostgreSQL only**.
- Docs, env examples, a CI starter, simple API tests.

## What is NOT built
Registration, login, secure session/CSRF flow, onboarding, experience library, forum, Coffee Buddy, career actions, moderation, GDPR workflows, PWA installability, production deployment.

## Commands to verify (mark results only after running)
- [ ] `docker compose config`
- [ ] `docker compose up -d db`
- [ ] `cd apps/api && source .venv/bin/activate && python manage.py check`
- [ ] `python manage.py migrate`
- [ ] `python manage.py test`
- [ ] `python manage.py runserver 127.0.0.1:8000`
- [ ] `cd apps/web && npm run dev` and open http://localhost:3000
- [ ] frontend `/api/health` returns backend health via server proxy
- [ ] first Git commit

## Last tested command and output
_Not run yet._

## Blockers / errors
_None recorded. Do not assume success._

## Next action
Follow `docs/SETUP_UBUNTU.md` from Step 1. Stop at any error, paste the complete terminal output, and fix before continuing.

# Testing rules

1. For each change: run the smallest relevant test, then the full test suite for that component.
2. Backend: `cd apps/api && source .venv/bin/activate && python manage.py check && python manage.py test`.
3. Frontend: `cd apps/web && npm run typecheck && npm run lint`.
4. Health endpoints are infrastructure checks, not evidence that product features work.
5. For auth and privacy later, test permissions with two different users, unauthenticated access, and CSRF failures.
6. For every module, test loading, empty, validation, forbidden, error and success states; keyboard and mobile layout.
7. Record commands and results in `CURRENT_STATE.md` before commits.

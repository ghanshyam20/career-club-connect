# Work backlog — do not jump ahead

## M1: Local foundation
- [ ] Confirm Python, Node, npm, Docker Compose, Git, VS Code versions
- [ ] Start PostgreSQL; create Python venv; install pinned-range dependencies
- [ ] Run migrations and Django tests
- [ ] Start Next.js; verify frontend -> backend health proxy
- [ ] Confirm `.env` and `.venv` ignored; commit foundation
- [ ] Record results in `CURRENT_STATE.md`

## M2: Authentication / CSRF technical spike
- [ ] Choose precise same-origin cookie/proxy design
- [ ] Implement signup/login/logout/session and CSRF correctly
- [ ] Add API/browser tests: session persistence, missing CSRF rejection, cross-account denial
- [ ] Document results and decision in `docs/SPIKE_RESULTS.md`

## M3 onward (after security checks)
- [ ] Profiles/onboarding and privacy
- [ ] Experience draft, submission, moderation, approved-only publication
- [ ] Bookmarks and private career actions
- [ ] Community and Coffee Buddy (if time)
- [ ] Privacy export/deletion policy and implementation
- [ ] Responsive accessibility and tests
- [ ] Deployment and live smoke tests near presentation

**GitHub issues:** convert these into individual issues after repository is created; don't claim issues exist yet.

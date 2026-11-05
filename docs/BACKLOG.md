# Career Club Connect — Development Backlog

**Last updated:** 5 November 2026  
**Project phase:** Deployed full-stack MVP — stabilization and improvement  
**Repository:** https://github.com/ghanshyam20/career-club-connect  
**Primary branch:** `main`

## Purpose

This backlog tracks completed milestones, remaining engineering tasks, defects, and improvements required before wider community use.

Career Club Connect has moved beyond its original local foundation. The main product modules are now implemented, and the frontend and backend have been deployed.

The immediate priority is **stabilization, testing, usability, and documentation**, not adding unnecessary new features.

### Task status definitions

- `[x]` — Implemented or completed with supporting project evidence.
- `[ ]` — Not completed, not fully verified, or requires further work.
- **P0 — Critical:** Security, broken core functionality, or deployment blockers.
- **P1 — High:** Essential usability, testing, and reliability improvements.
- **P2 — Medium:** Useful enhancements that can follow MVP stabilization.
- **P3 — Future:** Optional capabilities beyond the current MVP.

A feature can be implemented while still requiring testing, accessibility improvements, or operational review.

---

## M1 — Development environment and repository foundation

**Status: Completed**

- [x] Create GitHub repository.
- [x] Establish monorepo structure.
- [x] Configure Ubuntu development environment.
- [x] Set up Python virtual environment.
- [x] Install Django and backend dependencies.
- [x] Install Next.js and frontend dependencies.
- [x] Configure PostgreSQL through Docker Compose.
- [x] Create Django project and applications.
- [x] Create Next.js App Router application.
- [x] Configure environment variable examples.
- [x] Add Git ignore rules for local environments and secrets.
- [x] Configure Django migrations.
- [x] Implement initial backend health endpoints.
- [x] Connect frontend and backend during local development.
- [x] Establish Git commit and push workflow.
- [x] Add project documentation.

### Remaining maintenance

- [ ] **P2:** Review dependency versions and update outdated packages safely.
- [ ] **P2:** Verify setup instructions on a clean development machine.
- [ ] **P2:** Review `.gitignore` and environment example files.

## M2 — Authentication and account management

**Status: Implemented — security regression verification remains**

### Implemented

- [x] Create custom Django user model.
- [x] Implement member registration.
- [x] Implement login.
- [x] Implement logout.
- [x] Implement session-based authentication.
- [x] Enable Django CSRF middleware.
- [x] Implement CSRF initialization endpoint.
- [x] Implement authenticated current-user endpoint.
- [x] Implement account approval status endpoint.
- [x] Implement administrator-controlled account activation.
- [x] Implement password-reset request endpoint.
- [x] Implement password-reset confirmation endpoint.
- [x] Configure password-reset expiration.
- [x] Implement account deletion endpoint.
- [x] Integrate transactional email.
- [x] Implement member approval email action.

### Remaining work

- [ ] **P0:** Verify CSRF rejection for unsafe requests without valid tokens.
- [ ] **P0:** Test cross-account authorization on every private endpoint.
- [ ] **P0:** Verify session behavior across frontend and backend domains.
- [ ] **P0:** Test logout and session invalidation.
- [ ] **P1:** Test registration and approval end-to-end in the deployed environment.
- [ ] **P1:** Test expired and invalid password-reset tokens.
- [ ] **P1:** Test email delivery failures.
- [ ] **P1:** Add email ownership verification.
- [ ] **P2:** Add common email-domain typo suggestions.
- [ ] **P2:** Improve account approval and rejection messaging.
- [ ] **P2:** Review authentication-related error messages and rate limiting.

### Acceptance criteria

Authentication workflows must behave consistently in local and deployed environments.

Unauthorized users must not access protected resources, and one member must not access another member's private records.

## M3 — Member profiles and onboarding

**Status: Implemented — improvements pending**

### Implemented

- [x] Create member profile model.
- [x] Associate profile with custom user.
- [x] Store Career Club round.
- [x] Store biography.
- [x] Store skills.
- [x] Store career interests.
- [x] Implement profile API.
- [x] Implement profile editing interface.
- [x] Include member-facing profile pages.

### Remaining work

- [ ] **P1:** Verify profile ownership and update permissions.
- [ ] **P1:** Test profile validation and error states.
- [ ] **P1:** Review public versus private profile fields.
- [ ] **P2:** Improve incomplete-profile guidance.
- [ ] **P2:** Improve mobile profile presentation.
- [ ] **P2:** Consider optional profile images after privacy review.

## M4 — Experience Library

**Status: Core functionality implemented**

### Implemented

- [x] Create Experience model.
- [x] Define experience categories.
- [x] Implement experience submission.
- [x] Implement pending moderation status.
- [x] Implement approval and rejection workflow.
- [x] Display approved experiences.
- [x] Implement experience search.
- [x] Implement category filtering.
- [x] Implement My Submissions.
- [x] Display moderation statuses.
- [x] Implement anonymous-display option.
- [x] Implement experience detail API.
- [x] Create responsive Experience Library interface.
- [x] Connect dashboard highlight to experience data.

### Remaining work

- [ ] **P0:** Verify that pending and rejected experiences cannot be accessed by unauthorized members.
- [ ] **P1:** Test all moderation permission boundaries.
- [ ] **P1:** Verify anonymous publishing does not expose author identity unintentionally.
- [ ] **P1:** Test experience detail pages and invalid IDs.
- [ ] **P1:** Improve moderation feedback and error states.
- [ ] **P2:** Add helpful reactions if approved within product scope.
- [ ] **P2:** Add experience bookmarks if approved within product scope.
- [ ] **P2:** Improve long-content readability.

## M5 — Community Forum

**Status: Core API functionality implemented**

### Implemented

- [x] Create forum application.
- [x] Implement community post endpoints.
- [x] Implement comment endpoints.
- [x] Implement post likes.
- [x] Add frontend Community section.
- [x] Integrate forum functionality into the member platform.

### Remaining work

- [ ] **P0:** Verify authorization on post and comment operations.
- [ ] **P1:** Test complete post, comment, and like journeys.
- [ ] **P1:** Test invalid and empty submissions.
- [ ] **P1:** Review moderation requirements for forum content.
- [ ] **P1:** Improve mobile discussion layouts.
- [ ] **P2:** Add pagination or load-more behavior where needed.
- [ ] **P2:** Improve discussion discovery and sorting.

## M6 — Coffee Buddy

**Status: Core networking functionality implemented**

### Implemented

- [x] Create Coffee Buddy application.
- [x] Create networking invitation model.
- [x] Support online and in-person meeting formats.
- [x] Implement invitation listing and creation.
- [x] Implement invitation acceptance.
- [x] Implement invitation cancellation.
- [x] Create conversation message model.
- [x] Implement conversation API.
- [x] Add Coffee Buddy frontend section.
- [x] Add database constraint preventing self-acceptance.

### Remaining work

- [ ] **P0:** Verify that unauthorized members cannot read private conversations.
- [ ] **P0:** Verify that only eligible members can send messages to an invitation.
- [ ] **P1:** Test invitation acceptance and cancellation edge cases.
- [ ] **P1:** Test concurrent invitation acceptance.
- [ ] **P1:** Improve empty, loading, and failure states.
- [ ] **P1:** Test networking workflows on mobile devices.
- [ ] **P2:** Improve conversation usability and message feedback.

## M7 — My Career Actions

**Status: Core functionality implemented**

### Implemented

- [x] Create Career Actions backend application.
- [x] Implement career action list/create endpoint.
- [x] Implement career action detail endpoint.
- [x] Add My Career Actions frontend section.

### Remaining work

- [ ] **P0:** Verify member-specific record isolation.
- [ ] **P1:** Test creating, updating, and deleting career actions where supported.
- [ ] **P1:** Verify action status and validation behavior.
- [ ] **P1:** Improve empty states and progress presentation.
- [ ] **P2:** Consider optional due dates or reminders.
- [ ] **P2:** Consider progress summaries.

## M8 — Search, discovery, and notifications

**Status: Core modules implemented**

### Implemented

- [x] Create search backend application.
- [x] Implement dedicated search endpoint.
- [x] Add member discovery frontend section.
- [x] Create notifications backend application.
- [x] Implement notification listing.
- [x] Implement mark-as-read endpoint.
- [x] Add notifications frontend section.

### Remaining work

- [ ] **P0:** Verify search does not expose private or unapproved records.
- [ ] **P1:** Test search behavior across supported content types.
- [ ] **P1:** Verify notification ownership.
- [ ] **P1:** Test read/unread interactions.
- [ ] **P1:** Improve empty search results and notifications states.
- [ ] **P2:** Add search pagination if needed.
- [ ] **P2:** Improve discovery filters.

## M9 — Administration and moderation

**Status: Functional administration implemented — usability redesign pending**

### Implemented

- [x] Enable Django Admin.
- [x] Configure custom user administration.
- [x] Add user search and filtering.
- [x] Implement bulk member approval action.
- [x] Send approval emails.
- [x] Implement experience moderation API.
- [x] Implement approval and rejection endpoints.

### Remaining work

- [ ] **P1:** Improve Django Admin visual design.
- [ ] **P1:** Create a clearer administration dashboard.
- [ ] **P1:** Add readable member approval status indicators.
- [ ] **P1:** Improve navigation for nontechnical moderators.
- [ ] **P1:** Make pending member registrations easier to identify.
- [ ] **P1:** Make pending experience submissions easier to identify.
- [ ] **P1:** Improve admin mobile and tablet usability.
- [ ] **P1:** Test admin permissions and restricted staff roles.
- [ ] **P1:** Verify approval email formatting and delivery feedback.
- [ ] **P2:** Add useful moderation summary metrics.
- [ ] **P2:** Improve administrative auditability.

**Constraint:** Preserve existing approval, moderation, authentication, and email behavior during visual redesign.

## M10 — Cloud deployment

**Status: Frontend and backend deployed**

### Implemented

- [x] Deploy Next.js frontend to Vercel.
- [x] Deploy Django backend to Render.
- [x] Configure production environment settings.
- [x] Configure PostgreSQL connectivity.
- [x] Add Gunicorn dependency.
- [x] Configure WhiteNoise static-file handling.
- [x] Add HTTPS-oriented Django production settings.
- [x] Configure frontend/backend integration.
- [x] Configure production transactional email integration.
- [x] Expose Django Admin in deployed environment.

### Remaining work

- [ ] **P0:** Verify latest frontend and backend deployments after changes.
- [ ] **P0:** Run complete deployed authentication smoke tests.
- [ ] **P1:** Test database migrations during deployment.
- [ ] **P1:** Verify health and readiness endpoints.
- [ ] **P1:** Test backend recovery after restart.
- [ ] **P1:** Review Render and Vercel logs for recurring errors.
- [ ] **P1:** Verify static assets and admin styling in production.
- [ ] **P1:** Document deployment and rollback procedure.
- [ ] **P2:** Improve cold-start and loading experiences.
- [ ] **P2:** Evaluate monitoring and uptime alerts.

## M11 — Automated testing and continuous integration

**Status: Testing foundation implemented — full regression verification pending**

### Implemented

- [x] Configure backend Django test framework.
- [x] Add frontend TypeScript checking.
- [x] Add frontend ESLint script.
- [x] Add frontend production build script.
- [x] Configure GitHub Actions workflow.
- [x] Configure PostgreSQL service in CI.
- [x] Add backend Django system checks in CI.
- [x] Add migrations and tests to CI.
- [x] Add frontend typecheck, lint, and build steps to CI.

### Remaining work

- [ ] **P0:** Confirm latest GitHub Actions run is passing.
- [ ] **P0:** Run full backend test suite against current code.
- [ ] **P0:** Run current frontend typecheck, lint, and build.
- [ ] **P1:** Add cross-account authorization regression tests.
- [ ] **P1:** Add approval workflow regression tests.
- [ ] **P1:** Add Coffee Buddy messaging permission tests.
- [ ] **P1:** Add deployed end-to-end smoke tests.
- [ ] **P1:** Review dependency vulnerability findings.
- [ ] **P2:** Improve test coverage reporting.
- [ ] **P2:** Add automated browser testing for critical journeys.

## M12 — UI, responsive design, and accessibility

**Status: Responsive foundation implemented — audit pending**

### Implemented

- [x] Create responsive member dashboard.
- [x] Implement shared member navigation.
- [x] Create responsive Experience Library layouts.
- [x] Add frontend pages for the main product modules.
- [x] Connect member interfaces with backend APIs.

### Remaining work

- [ ] **P1:** Test all major screens on narrow mobile viewports.
- [ ] **P1:** Verify keyboard navigation.
- [ ] **P1:** Review focus states and focus visibility.
- [ ] **P1:** Check form labels and validation messages.
- [ ] **P1:** Review color contrast.
- [ ] **P1:** Test loading and error states.
- [ ] **P1:** Check navigation consistency across modules.
- [ ] **P1:** Review screen-reader accessibility.
- [ ] **P2:** Improve visual consistency between modules.
- [ ] **P2:** Optimize images and layout performance.
- [ ] **P2:** Add PWA enhancements if still in scope.

## M13 — Privacy, security, and production readiness

**Status: Security foundation implemented — broader review incomplete**

### Implemented

- [x] Use Django authentication and permission mechanisms.
- [x] Enable CSRF middleware.
- [x] Configure secure cookies for production.
- [x] Configure HTTPS redirection.
- [x] Configure trusted CSRF origins.
- [x] Use environment variables for sensitive configuration.
- [x] Implement account deletion endpoint.
- [x] Implement moderated experience publication.

### Remaining work

- [ ] **P0:** Review object-level authorization across all modules.
- [ ] **P0:** Test unauthorized API access.
- [ ] **P0:** Verify production secrets are not exposed.
- [ ] **P1:** Review personal-data collection and retention.
- [ ] **P1:** Document account deletion behavior and limitations.
- [ ] **P1:** Review GDPR-related user rights and procedures.
- [ ] **P1:** Establish privacy information appropriate for wider use.
- [ ] **P1:** Review email security and rate limiting.
- [ ] **P1:** Review database backup and recovery.
- [ ] **P1:** Review logging for sensitive data.
- [ ] **P1:** Conduct a production configuration review.
- [ ] **P2:** Consider a personal-data export feature.
- [ ] **P2:** Improve operational monitoring.

**Important:** Implementing a deletion endpoint or security settings does not automatically establish full GDPR compliance or production security readiness.

## M14 — Documentation and presentation

**Status: In progress**

### Completed

- [x] Create project README.
- [x] Create architecture documentation.
- [x] Document local setup.
- [x] Record product decisions.
- [x] Maintain historical planning material.
- [x] Update README for deployed MVP — 5 November 2026.
- [x] Update architecture document — 5 November 2026.

### Remaining work

- [ ] **P1:** Update `docs/CURRENT_STATE.md`.
- [ ] **P1:** Update `docs/START_HERE.md`.
- [ ] **P1:** Keep this backlog synchronized with actual progress.
- [ ] **P1:** Review setup documentation for outdated instructions.
- [ ] **P1:** Prepare an end-to-end demonstration scenario.
- [ ] **P1:** Prepare a short architecture explanation for the presentation.
- [ ] **P1:** Prepare demonstration accounts and fictional data.
- [ ] **P1:** Verify the live application before the presentation.
- [ ] **P2:** Add screenshots of major modules to the README.
- [ ] **P2:** Document lessons learned and known limitations.
- [ ] **P2:** Create a post-presentation development roadmap.

---

## Immediate execution plan

Work on these tasks in order rather than opening multiple unrelated development branches.

| Order | Priority | Task | Completion evidence |
|---|---|---|---|
| 1 | P1 | Update remaining project documentation | Committed docs |
| 2 | P0 | Verify CI and local test results | Passing checks or recorded failures |
| 3 | P0 | Test critical security boundaries | Passing regression tests |
| 4 | P0 | Verify deployed member journeys | Recorded smoke-test results |
| 5 | P1 | Improve Django Admin usability | Tested admin interface |
| 6 | P1 | Review mobile and accessibility issues | Issue list and fixes |
| 7 | P1 | Prepare and rehearse demonstration | Successful demo run |
| 8 | P2 | Plan post-MVP improvements | Prioritized future backlog |

## Definition of done

A development task is complete when:

1. The required behavior is implemented.
2. Relevant permissions and validation are checked.
3. Automated tests are added or updated where appropriate.
4. Manual testing is completed when required.
5. Existing functionality has not regressed.
6. Documentation is updated if behavior or architecture changed.
7. The change is committed to Git.
8. CI results are reviewed.
9. Production behavior is verified when the task affects deployment.

A deployed feature is not automatically considered production-ready.

## Git and GitHub workflow

Recommended branch workflow for feature development:

```text id="axm7p8"
main
  |
  +-- feature/<feature-name>
  |
  +-- fix/<issue-name>
  |
  +-- docs/<documentation-name>
```

For application changes:

- Keep commits focused.
- Avoid mixing unrelated features.
- Run appropriate checks before merging.
- Review CI before deployment.
- Keep secrets outside Git.
- Update `CURRENT_STATE.md` after significant milestones.

Documentation-only changes may be committed directly to `main` when appropriate.

## GitHub Issues

Use GitHub Issues for actionable defects and development tasks.

Each issue should describe:

- Problem or feature.
- Expected behavior.
- Acceptance criteria.
- Priority.
- Relevant module.
- Testing requirements.

This backlog does not claim that matching GitHub Issues already exist.

## Project scope

Career Club Connect is an independently developed demonstration application.

It is not officially affiliated with or endorsed by the City of Espoo.

Demonstration accounts and fictional community data must be identified appropriately.

The project should prioritize a reliable and understandable user experience over unnecessary feature expansion.

## Next milestone

**M15 — MVP stabilization and demonstration readiness**

Target outcome: A working, tested, presentable full-stack application with clearly documented limitations.

The next development session should begin by reviewing `docs/CURRENT_STATE.md`, checking Git status, and selecting one unfinished P0 or P1 task from this backlog.
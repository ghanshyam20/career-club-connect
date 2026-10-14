# Architecture — local foundation

```
Browser http://localhost:3000
   │
   └─ Next.js route handler /api/health (server-to-server)
          └─ Django http://127.0.0.1:8000/api/v1/health/live
                   └─ PostgreSQL localhost:5432 (Docker container)
```

- `apps/web`: Next.js App Router, React, TypeScript. The route handler is a **health-check proxy only**. It is NOT a complete authenticated proxy.
- `apps/api`: Django + DRF. Backend owns all permissions and business rules.
- `infra`: reserved for future deployment; no VPS configuration yet.
- `docs/source`: historical specs and decisions, preserved for continuity.
- `.env` files are local and ignored by Git; commit `.env.example` only.

**Authentication warning:** Never add credentials to browser localStorage, bypass CSRF, or implement an unreviewed open proxy. The login/session/CSRF proof of concept is the *next* technical milestone, and must be tested before product modules.

**Database:** Use a custom user model before first migrations. Current starter provides `accounts.User` derived from `AbstractUser` and intentionally contains no personal data beyond built-in fields. More models are planned, not implemented.

**Security:** local-only dev defaults are NOT production settings. `DEBUG=1`, development credentials and localhost CORS are unsuitable for live hosting. Production deployment requires a separate security review.

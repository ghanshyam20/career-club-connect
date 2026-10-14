# API contracts

Implemented in foundation:
- `GET /api/v1/health/live` → `{ "status": "ok" }`
- `GET /api/v1/health/ready` → `{ "status": "ok", "database": "ok" }` when database is reachable; 503 otherwise.
- Next.js `GET /api/health` → forwards live health result only; returns 502 if backend unavailable.

Planned but NOT implemented: auth, profiles, experiences, forum, Coffee Buddy, actions, moderation, exports/deletion. Consult `source/CAREER_CLUB_CONNECT_PRODUCT_SIGNOFF_ARCHITECTURE_LOCK.md` for proposed contracts.

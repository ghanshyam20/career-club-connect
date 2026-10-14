# Database status

Implemented: PostgreSQL container and Django's built-in auth/session/admin tables with a custom `accounts.User` model. Initial migration will be generated locally and committed after verification.

Not implemented: experience/revision, votes, forum, Coffee Buddy, goals, moderation, notifications, GDPR models. See architecture source document for proposed schema. Never invent a real member dataset; use clearly fictional synthetic records only after model approvals.

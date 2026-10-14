# Decisions — approved vs proposed

## Explicitly approved by product owner (15 October 2026)
- Notifications are conditional; they must not delay core features.
- Guests may read the visible public forum; signing in is required to participate.
- Open registration for the **fictional demo**, with safeguards; this does not verify Career Club membership.
- Editing an approved experience requires moderator review; the previous approved version stays public while revision is pending.
- Development is **localhost first** on Ubuntu; discuss and purchase hosting later.
- Budget for future hosting: €5–15/month.

## Proposed, not yet signed off
- Five mobile tabs; design token set; forum author attribution; experience anonymous-publication rules; default privacy choices; membership verification process; LinkedIn visibility; Coffee Buddy identity and contact sharing; export/deletion policy; avatars; exact deployment provider.
- Next.js + Django REST Framework + PostgreSQL is the **selected technical direction for a local spike**, not yet a validated production architecture.

## Scope order
P0: secure auth/profile; approved experiences and moderation; bookmarks; personal actions; audit/report intake; tests/demo.
P1: community and Coffee Buddy; PWA polish. Conditional: notifications.
Out of scope: chat, OAuth, AI matching, events, following, image uploads, push notifications.

## Change rule
When scope changes, write: date, decision, reason, effect on privacy/API/database/tests/deadline, owner approval. Do not silently add features from design images.

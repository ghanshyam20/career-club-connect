# Career Club Connect — Hosting Decision Record

**Status:** Proposed; not deployed  
**Date:** 2026-10-15  
**Budget:** €5–15/month, including VAT where applicable  
**Product:** One responsive PWA with Next.js frontend, Django REST API, PostgreSQL

## Decision

Recommend **Hetzner Cloud CX33 (x86, 4 shared vCPU, 8 GB RAM, 80 GB NVMe) in the EU** with one Docker Compose deployment, Caddy HTTPS reverse proxy, Next.js, Django/Gunicorn, and PostgreSQL on a private Docker network. The server should expose only HTTPS/HTTP (for redirect and certificate issuance) and restricted SSH. This is an infrastructure *proposal*, subject to account availability, actual VAT and deployment spike results.

## Verified October 2026 price references

- Hetzner June 2026 adjusted Germany/Finland CX33: **€8.49/month excluding VAT**, excluding IPv4. Source: https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/
- Primary IPv4: **€0.50/month excluding VAT**. Source: https://docs.hetzner.com/cloud/servers/primary-ips/overview/
- Hetzner optional server backup: **20% of server price**, seven backup slots. Source: https://docs.hetzner.com/cloud/billing/faq/
- Finnish standard VAT: **25.5%**. Actual invoice treatment may depend on account/tax status. Source: https://www.vero.fi/en/businesses-and-corporations/taxes-and-charges/vat/rates-of-vat/

Illustrative budget (assuming 25.5% VAT on the stated prices):

| Item | Ex VAT | Incl 25.5% VAT |
|---|---:|---:|
| CX33 server | €8.49 | €10.65 |
| IPv4 | €0.50 | €0.63 |
| Optional Hetzner backup (20% of server) | €1.70 | €2.13 |
| **Total with optional backup** | **€10.69** | **€13.41** |

Domain name, external off-server database backups, email delivery, monitoring, and additional storage are **not included**. A host-level backup is not a substitute for verified database-aware off-site backup and restore. The budget is tight for a real-data pilot and may need to increase.

## Alternative providers

| Option | Cost model | Suitability | Limitation |
|---|---|---|---|
| Hetzner CX33, all-in-one VPS | Fixed ~€13.41/mo with IPv4 + optional backup, illustrative Finnish VAT | Recommended for portfolio and synthetic demo | Operator maintains OS, security, database, backup, recovery; single point of failure |
| Railway Hobby | $5 minimum/month incl. $5 usage; usage-based above | Easiest developer experience | Next.js + Django + Postgres may exceed €15; bill varies; no fixed guarantee |
| Render | Static sites free; paid web service from $7/mo; small Postgres from ~$6/mo | Easier managed deploy if frontend can be static | Next.js SSR adds another service; costs likely exceed budget; free DB expires |
| Vercel Hobby + separate backend | Frontend free for personal/non-commercial use | Fast Next.js previews | Personal/noncommercial restriction; separate API/DB cost, cross-origin auth complexity |

Railway: https://docs.railway.com/pricing/plans/  
Render: https://render.com/pricing  
Vercel: https://vercel.com/docs/plans/hobby

## Proposed network and URL design

```text
User browser
  -> HTTPS https://connect.example.org
  -> Caddy reverse proxy on Hetzner VPS
      /api/*, /admin/* -> Django/Gunicorn container
      /*              -> Next.js Node server container
  -> Django -> PostgreSQL container (private Docker network)
```

Use **same-origin routing** to reduce cookie/CORS/CSRF complexity. If `/api/*` is forwarded unchanged, Django must be configured for that prefix; alternatively strip the prefix at the proxy consistently. The actual domain is a placeholder; no domain is purchased or assigned. Do not claim Espoo ownership or use official branding without permission.

## Security baseline

- Django session authentication with `Secure`, `HttpOnly`, `SameSite=Lax` cookies and CSRF token on unsafe requests; test CSRF through the proxy.
- Restrict `ALLOWED_HOSTS`, trusted origins, forwarded HTTPS headers; enforce HTTPS/HSTS after validation.
- Never expose PostgreSQL port 5432 publicly. Keep secrets out of Git and images.
- SSH keys, firewall, security updates, non-root service processes, minimal container privileges, pinned dependencies.
- Rate-limit sign-up/login, email verification before community posting, abuse controls, moderator permissions.
- Account for outbound email/password reset: SMTP provider or managed transactional email may incur extra cost; do not assume free unlimited email.
- GDPR: privacy notice, data controller, data minimization, deletion/export process, EU hosting and processor agreement review before real users.
- Synthetic demo accounts clearly marked; never mix synthetic and real participant data.

## Backups and recovery

- Enable provider backup if budget permits; additionally create daily `pg_dump` backups to encrypted **off-server** storage with retention policy and restore tests.
- Avoid storing user-uploaded photos in the MVP; use generated initials avatars to reduce storage and moderation burden.
- Document database migration/rollback, uptime check, service restart, and incident procedure.
- For a pilot with real users, budget separately for monitored off-site backups, email, domain, and operational support.

## Technical spike — no full product coding

1. Provision trial server only after explicit approval and review current pricing/availability.
2. Verify 8 GB memory is enough for Next.js, Django, PostgreSQL, and builds (build in CI if needed).
3. Run HTTPS reverse proxy, minimal Next.js page, Django `/api/health`, PostgreSQL connection.
4. Test sign-in, CSRF, session persistence, logout, role-denied API access.
5. Run migrations, restart containers, verify data survives.
6. Run DB backup and successful restore to a disposable database.
7. Check deployment from GitHub Actions, rollback, logs, resource usage, and costs.

**Pass/fail gate:** All critical tests pass, no public database exposure, stable HTTPS and sessions, successful restore, and observed cost consistent with €15 cap. If not, revise architecture or scope before product coding.

## Remaining decisions

1. Confirm domain strategy: existing domain/subdomain or new purchase; the budget does not include domain registration.
2. Confirm whether the €15 ceiling must include domain, email, and external backup costs; if yes, we may need a smaller instance or reduced features.
3. Confirm whether user will operate/patch a VPS; otherwise select managed hosting and revise budget/scope.
4. Decide email-verification and password-reset delivery provider before open registration.
5. Decide if future real pilot requires higher availability and an accountable operator; current one-VPS design is not highly available.

**No code, server, domain, or hosting account has been created by this document.**

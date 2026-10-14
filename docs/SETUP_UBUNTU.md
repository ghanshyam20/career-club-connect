# Ubuntu setup — follow in this exact order

The starter folder should be `~/Desktop/career-club-connect`. On some systems Desktop may be localized: check with `xdg-user-dir DESKTOP`.

## 1. Open VS Code

Extract the ZIP into your Desktop and rename the extracted folder to `career-club-connect`. In a terminal:

```bash
cd ~/Desktop/career-club-connect
pwd
ls -la
code .
```

If `~/Desktop` doesn't exist, use the directory printed by `xdg-user-dir DESKTOP`.

## 2. Check prerequisites (do not skip)

```bash
python3 --version
node --version
npm --version
git --version
docker --version
docker compose version
```

Use Python 3.11–3.13 and Node.js 22 LTS for this starter. If commands are missing or Docker permissions fail, **stop and resolve first**. Do not run unreviewed curl-to-shell installers. Docker Compose V2 required.

## 3. Set up local PostgreSQL

```bash
cd ~/Desktop/career-club-connect
cp .env.example .env
docker compose config
docker compose up -d db
docker compose ps
```

The `.env` is for local demo only. Do not commit it. If port 5432 is already in use, stop and ask before changing settings. The database volume persists after container restarts. `docker compose down -v` **deletes local database data**; do not use it casually.

## 4. Python backend and virtual environment

```bash
cd ~/Desktop/career-club-connect/apps/api
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
cp .env.example .env
python manage.py check
python manage.py migrate
python manage.py test
python manage.py runserver 127.0.0.1:8000
```

Keep that terminal open. If `venv` fails, install `python3-venv` through Ubuntu's package manager and retry. The virtual environment belongs **only in `apps/api/.venv`**. No need to create a venv for Next.js.

In a second terminal, verify `http://127.0.0.1:8000/api/v1/health/live` and `http://127.0.0.1:8000/api/v1/health/ready` in your browser.

## 5. Next.js frontend (new terminal)

```bash
cd ~/Desktop/career-club-connect/apps/web
npm install
cp .env.example .env.local
npm run typecheck
npm run dev
```

Open `http://localhost:3000`. Click **Check backend**. This calls Next.js `/api/health`, which forwards a server-side GET to Django. It does not send authentication cookies and is not a general API proxy.

## 6. Git, only after verifying

```bash
cd ~/Desktop/career-club-connect
git init
git status --short
```

Verify `.env`, `.env.local`, `.venv`, `node_modules` are **not** listed. Then:

```bash
git add .
git commit -m "chore: scaffold local Career Club Connect foundation"
```

If Git asks for identity, configure your own `git config --global user.name` and `user.email` values. Create a **private** GitHub repository initially if you want, but do not push until you have inspected `git status` and `git diff --cached --stat`.

## 7. Stop/restart later

- Stop Django and Next.js with Ctrl+C in their terminals.
- Stop DB: `docker compose stop db` (from repository root).
- Restart DB: `docker compose up -d db`.
- Restart Django: `cd apps/api && source .venv/bin/activate && python manage.py runserver`.
- Restart frontend: `cd apps/web && npm run dev`.

## Common errors

- `Cannot connect to Docker daemon`: Docker service/permissions not ready.
- `port is already allocated`: another program uses 5432/3000/8000; inspect first.
- `connection refused` on DB: wait for healthy container, check `docker compose ps`.
- `npm` engine error: Node version mismatch.
- `no module named django`: venv inactive or install incomplete.
- `CSRF` is not tested in M1; do not claim auth is complete.

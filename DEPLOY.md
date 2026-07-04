# Deploying JekJob to Production

This app has two parts, each with its own Docker image:

- **`b/`** — Django API (+ Celery worker/beat, PostgreSQL/pgvector, Redis)
- **`f/`** — Next.js frontend

A reverse proxy (nginx / Caddy / Traefik) sits in front, terminates HTTPS, and
routes two domains:

```
https://your-frontend-domain.com   ->  frontend container   (port 3000)
https://brain.your-domain.com       ->  backend container    (port 8001 -> 8000)
```

---

## 0. ⚠️ Do this FIRST — rotate leaked credentials

These were committed to git history and must be considered compromised. Rotate
them before (or immediately after) going live:

1. **Gmail app password** that was in `b/env.txt` — revoke it at
   https://myaccount.google.com/apppasswords and create a new one.
2. **`BUILD_TOKEN`** — pick a new random value.
3. Any **admin passwords** — the old `scripts/init_superusers.py` hardcoded
   `getajob@2025!;` for several accounts. Those are now removed from the code,
   but if that DB was ever deployed, change those users' passwords.

The current code no longer contains any of these; superuser bootstrap and all
secrets now come from environment variables only.

---

## 1. Prerequisites

- A Linux server (e.g. Hetzner/DigitalOcean) with **Docker** + **Docker Compose**.
- A **domain** with DNS A-records pointing at the server for both the frontend
  and the API (`brain.` subdomain).
- Ports 80/443 open; a reverse proxy installed (examples below use Caddy — it
  gets HTTPS certs automatically).

---

## 2. Backend

```bash
cd b
cp .env.production.example .env
nano .env            # fill in EVERY CHANGE_ME value (see notes in the file)

docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f web   # watch startup
```

On first boot the `web` container automatically runs `migrate`,
`collectstatic`, and creates the admin from `DJANGO_SUPERUSER_EMAIL/PASSWORD`.
The API is now on `127.0.0.1:8001` (localhost only — the proxy exposes it).

Key `.env` values: `DJANGO_DEBUG=0`, a strong `DJANGO_SECRET_KEY`,
`DJANGO_ALLOWED_HOSTS=brain.your-domain.com`, and
`DJANGO_CORS_ALLOWED_ORIGINS` / `DJANGO_CSRF_TRUSTED_ORIGINS` set to your
frontend's HTTPS URL.

## 3. Frontend

```bash
cd f
cp env.production.example.txt .env
nano .env            # NEXTAUTH_SECRET, NEXTAUTH_URL, NEXT_PUBLIC_API_URL=https://brain.your-domain.com

docker compose up -d --build
```

The frontend serves on `127.0.0.1:3000` (adjust `docker-compose.yml` ports to
`127.0.0.1:3000:3000` so only the proxy reaches it).

## 4. Reverse proxy + HTTPS (Caddy example)

`/etc/caddy/Caddyfile`:

```
your-frontend-domain.com {
    reverse_proxy 127.0.0.1:3000
}

brain.your-domain.com {
    reverse_proxy 127.0.0.1:8001
}
```

`sudo systemctl reload caddy` — Caddy fetches Let's Encrypt certs automatically.
Once HTTPS works, set `DJANGO_SECURE_SSL_REDIRECT=1` and
`DJANGO_HSTS_SECONDS=31536000` in `b/.env` and restart the backend.

## 5. Verify

```bash
curl -s https://brain.your-domain.com/api/v1/docs/ -o /dev/null -w "%{http_code}\n"   # 200
```

Then open `https://your-frontend-domain.com`, log in with your admin, and
confirm the dashboard loads.

---

## Notes

- **AI features**: set `OPENAI_API_KEY` (and optionally `OPENAI_BASE_URL` +
  model names for an OpenAI-compatible provider like Gemini). Left blank, the
  app runs fine — CV auto-parsing and semantic scoring are simply disabled.
- **Semantic matching** uses pgvector, which the production `db` image provides,
  so match scoring works in production (unlike the SQLite local dev setup). If
  you use **Gemini** for embeddings, its vectors are 768-dim — change the
  `dimensions=1536` on `Resume.embedding` / `Position.embedding` and migrate.
- **Backups**: the `pgdata` and `media` volumes hold all state — back them up.
- **GitLab CI**: `b/gitlab-ci.yml` already builds + SSH-deploys to a Hetzner
  host. To use it, set the CI variables (`CI_REGISTRY_*`, `DEPLOY_SSH_KEY`) and
  point the deploy target at your server; update it to run
  `docker compose -f docker-compose.prod.yml up -d`.

## Local development (no Docker)

See the SQLite-based setup: run the backend with
`python manage.py runserver --settings=main.settings_local` and the frontend
with `npm run dev`. That path needs no Postgres/Redis/Docker.

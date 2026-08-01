# Vercel deployment (marketing + `/app`)

This Next.js app ships **marketing (`/`)** and the **product (`/app`)** in one Vercel project.

**Canonical source for Vercel:** this folder (`web/`). Mobile (`apk_copy` / `ios_copy`) and monorepo `frontend/` do **not** auto-update the site. See [WEB_DEPLOY_SYNC.md](../docs/platform/WEB_DEPLOY_SYNC.md).

## Sync to production GitHub + Vercel

```powershell
# from monorepo root
.\scripts\sync-web-to-momentra-website.ps1
```

That mirrors `web/` → `_push_momentra_website` and pushes to [`monytix0-hue/momentra_website`](https://github.com/monytix0-hue/momentra_website). Vercel rebuilds from that repo (Root Directory = repo root, not `web`).

## Prerequisites

- Vercel account linked to the **momentra_website** Git repo (or this monorepo with Root Directory `web`)
- Env vars from [`.env.example`](.env.example) set in the Vercel project
- Public API host for `NEXT_PUBLIC_API_BASE_URL` (not a local ngrok tunnel)

## Project settings

### A. Dedicated repo `monytix0-hue/momentra_website` (preferred)

| Setting | Value |
|---|---|
| Root Directory | *(empty)* — app lives at repo root after sync |
| Framework | Next.js |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output | Default (do not set OpenNext / Workers) |

### B. Monorepo import with subdirectory

| Setting | Value |
|---|---|
| Root Directory | `web` |
| Framework | Next.js |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output | Default (do not set OpenNext / Workers) |

Prefer **A** so the sync script and Vercel stay aligned.

## Env vars

Set these in **Project → Settings → Environment Variables** for Production (and Preview if needed):

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID
NEXT_PUBLIC_API_BASE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Optional local-only:

```
ALLOWED_DEV_ORIGINS
```

## Custom domain

1. **Project → Settings → Domains** → add `momentra.tech` (or your domain).
2. Follow Vercel’s DNS instructions (A/CNAME at your DNS host, or move nameservers to Vercel).

After deploy:

- `https://your-domain/` — marketing
- `https://your-domain/app` — product app

## Resend DNS (email)

If the domain’s DNS is managed in Vercel, add Resend’s MX/TXT/DKIM records under **Domains → DNS**, or use Resend **Auto Configure**.  
If DNS still lives on Cloudflare (or another registrar), add Resend records there — not in the Next.js app.

## Local

```bash
npm install
npm run dev
npm run build && npm start   # production-like check
```

## Note on the marketing-only repo

[`monytix0-hue/momentra_website`](https://github.com/monytix0-hue/momentra_website) is the **production web Git remote** for Vercel (marketing + `/app` after sync). Point the production domain at the Vercel project connected to that repo.

Shipping Android/iOS does not update this site — run [`scripts/sync-web-to-momentra-website.ps1`](../scripts/sync-web-to-momentra-website.ps1) (details: [WEB_DEPLOY_SYNC.md](../docs/platform/WEB_DEPLOY_SYNC.md)).

# Momentra Website + App

Unified Next.js project for Momentra — marketing (`/`) and product (`/app`) on one deploy.

> Life Happens in Moments.

## Local development

```bash
npm install
cp .env.example .env.local   # fill Firebase, API, Supabase
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for marketing and [http://localhost:3000/app](http://localhost:3000/app) for the product.

## Deploy (Vercel)

This repo is a standard Next.js app (not Cloudflare OpenNext).

| Setting | Value |
|---------|--------|
| Root Directory | `.` (repo root) |
| Framework | Next.js |
| Install | `npm ci` |
| Build | `npm run build` |

Set env vars from `.env.example` in the Vercel project.

After deploy:

- `/` — marketing
- `/app` — product (login / app shell)
- **Start a Moment** / **Open the App** → `/app`

See [VERCEL.md](./VERCEL.md) for details.

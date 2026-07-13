# Momentra Website

Marketing site for Momentra — *Life Happens in Moments*.

## Local development

```bash
npm install
npm run dev
```

## Deploy (Cloudflare Workers)

This project uses [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare).

The Cloudflare Worker name is **`momentra`** (must match Workers Builds).

```bash
npm install
npm run deploy
```

Preview the Workers runtime locally:

```bash
npm run preview
```

### Cloudflare Workers Builds settings

| Setting | Value |
|---|---|
| Build command | leave empty, or `true` |
| Deploy command | `npx opennextjs-cloudflare build && npx opennextjs-cloudflare deploy` |
| Worker name | `momentra` |

### App CTAs (`Start a Moment` / `Open the App`)

This repo is **marketing only**. There is no `/app` product route here.

Set a Cloudflare build env var:

```
NEXT_PUBLIC_APP_URL=https://your-real-app-host
```

Until that is set, CTAs go to `/contact`.

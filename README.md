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
| Build command | `npm run build` (optional; OpenNext rebuilds) |
| Deploy command | `npx opennextjs-cloudflare build && npx opennextjs-cloudflare deploy` |
| Worker name | `momentra` |

# Momentra Website

Marketing site for Momentra — *Life Happens in Moments*.

## Local development

```bash
npm install
npm run dev
```

## Deploy (Cloudflare Workers)

This project uses [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare).

```bash
npm install
npm run deploy
```

Preview the Workers runtime locally:

```bash
npm run preview
```

Or connect this GitHub repo to **Cloudflare Workers Builds** and set the deploy command to:

```bash
npx opennextjs-cloudflare build && npx opennextjs-cloudflare deploy
```

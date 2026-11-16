# Cadran

A short cognitive session in French or English: four areas (language, shapes, memory, rhythm) in about 20 minutes. Everything stays in the browser's localStorage, and you can stop between blocks.

The items are original and the scores are not normed. It is a homemade estimate, not a clinical assessment.

Live at [cadran.accura.dev](https://cadran.accura.dev).

## Stack

TanStack Start, React 19, TypeScript, Vite, Tailwind CSS 4. Built with the Nitro `vercel` preset.

## Develop

```bash
npm ci
npm run dev        # http://localhost:8080
npm test           # vitest
npm run typecheck
npm run lint
npm run og         # public/og.png
npm run build
```

## Layout

- `src/lib/battery/` items, scoring, copy (FR and EN)
- `src/components/cadran/` screens and figure tiles
- `src/lib/seo.ts` per-locale metadata
- `scripts/og.mjs` language-neutral share image, rendered from SVG

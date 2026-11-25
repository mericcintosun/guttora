# CLAUDE.md: Guttora

Read `IDENTITY.md` (law for look, routes and motion), `HANDOFF.md` and `DEMO.md` before editing.

## Commands
- `npm install`
- `npm run dev`
- `npm run build` (must stay green after every change)
- `npm run seed` (writes `fixtures/seed-snapshot.json` from `lib/data/seed.ts`, deterministic)
- `npm run demo:reset` (runs `npm run seed`, then prints the seed version and the reset URL `/play?reset=1`; the server holds no state)
- `npm test` (node:test over `tests/detector.test.ts`: five seed bench clips, determinism, query schema)
- `npm run proof` (counts the six bench clips and runs the tests, then rewrites the PROOF blocks in README.md; always exits 0)

## Stack
- Next.js 15 App Router, TypeScript strict, Tailwind v4 with no tailwind.config (tokens in `app/globals.css`).
- GSAP via `@gsap/react` only (`useGSAP`), no second animation library.
- Seed data reaches pages through `lib/adapter.ts` (`ADAPTER_MODE` read in `lib/config.ts`, default fake). In real mode `getBenchReport` counts the bench clips on the server.
- zod 4 validates API input (`lib/schemas.ts`).

## Never touch
- `lib/drip-detector.ts`, `lib/synth.ts`, the audio path in `components/drip-listener.tsx`, the math in `lib/impact.ts`.
- `public/illustrations/`, `public/logo.svg`, `app/icon.svg`, `components/brand-mark.tsx`.
- `.farm-scaffold.json`, `package-lock.json`.
- No secrets, no pages outside `/`, `/play`, `/notes`, no theme toggle, no second brand mark.

## Pitfalls
- `@/lib/data` resolves to `lib/data.ts` (a re-export file) even though `lib/data/` exists.
- `scripts/` and `tests/` are excluded from tsconfig; they run under `node --experimental-strip-types` and import with explicit `.ts` paths.
- Files that Node loads directly keep zero or type-only imports: `lib/config.ts` (zero imports), `lib/bench-score.ts` (type-only), `lib/schemas.ts` (zod only), plus `lib/drip-detector.ts`, `lib/synth.ts` and `lib/data/seed.ts`. Never add a runtime `@/` import to them.
- `lib/adapter.ts` is the only file that imports `lib/adapter-real.ts` and the only place that branches on `ADAPTER_MODE`. No `"use client"` file imports `lib/config.ts` or `lib/adapter-real.ts`.
- `lib/store.ts` is the only file that touches `localStorage` (repair list, shape `{ v: 1, seedVersion, taps }`). `components/use-repair-list.ts` is the one hook over it; bump `SEED_VERSION` in `lib/data/seed.ts` when the seed taps change.
- API failures return `{ ok: false, source, error, hint }` with a code from `lib/errors.ts`.
- `app/opengraph-image.tsx` reads hexes from `lib/og-palette.ts` because Satori cannot read CSS variables.
- Every GSAP call goes inside `useGSAP` plus `gsap.matchMedia()` with a reduced-motion path, and nothing is server-rendered at opacity 0.

## Vercel guardrails
- No runtime filesystem writes in app code (build-time `next.config.ts` and `scripts/` may touch the filesystem).
- `useSearchParams` only under a `Suspense` boundary.
- No Node-only APIs on edge paths, no custom server, no `output: export`.
- Every `process.env.X` mirrored in `.env.example`.

## Copy rules
- No em dash, en dash or double hyphen as a dash.
- Banned words: seamless, seamlessly, leverage, empower, revolutionize, streamline, game-changer, cutting-edge, delve, robust, unlock, elevate, harness, effortless, "in today's world", "it's not just X, it's Y".
- Numbers go inside sentences. Colors only through tokens.

Note for context compaction: when compacting preserve the list of modified files and test commands.

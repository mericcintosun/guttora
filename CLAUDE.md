# CLAUDE.md: Guttora

Read `IDENTITY.md` (law for look, routes and motion), `HANDOFF.md` and `DEMO.md` before editing.

## Commands
- `npm install`
- `npm run dev`
- `npm run build` (must stay green after every change)
- `npm run seed` (writes `fixtures/seed-snapshot.json` from `lib/data/seed.ts`, deterministic)

## Stack
- Next.js 15 App Router, TypeScript strict, Tailwind v4 with no tailwind.config (tokens in `app/globals.css`).
- GSAP via `@gsap/react` only (`useGSAP`), no second animation library.
- Seed data reaches pages through `lib/adapter.ts` (`ADAPTER_MODE`, default fake).

## Never touch
- `lib/drip-detector.ts`, `lib/synth.ts`, the audio path in `components/drip-listener.tsx`, the math in `lib/impact.ts`.
- `public/illustrations/`, `public/logo.svg`, `app/icon.svg`, `components/brand-mark.tsx`.
- `.farm-scaffold.json`, `package-lock.json`.
- No secrets, no pages outside `/`, `/play`, `/notes`, no theme toggle, no second brand mark.

## Pitfalls
- `@/lib/data` resolves to `lib/data.ts` (a re-export file) even though `lib/data/` exists.
- `scripts/` is excluded from tsconfig; it runs under `node --experimental-strip-types`.
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

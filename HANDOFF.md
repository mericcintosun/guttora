# HANDOFF: Guttora

## Phase 1 result

**Goal:** add the seams every later phase depends on (demo contract, adapter, API stubs, shell) without changing how any screen looks.

**Status (per slice):**
- Slice 1, demo contract and agent rules: done. `DEMO.md` (7 steps, `Demo start route: /`) and `CLAUDE.md`.
- Slice 2, typed core, seed and adapter: done. `lib/types.ts`, `lib/data/seed.ts`, `lib/adapter.ts`, `scripts/seed.ts`, `npm run seed`, `scripts` excluded in tsconfig, `.env.example` lists `ADAPTER_MODE` and `NEXT_PUBLIC_BRAND_FILES`.
- Slice 3, API stubs: done. `GET /api/residence`, `/api/grid-factors`, `/api/bench-clips`.
- Slice 4, pages through the adapter: done. `/`, `/play`, `/notes` are async server components calling `getAdapter()`; story, workbench, repair list and accuracy bench take data as props; empty states for a missing story tap and for zero bench clips; three `loading.tsx` files.
- Slice 5, shell: done. Title template, per page titles, `components/site-nav.tsx` with `aria-current="page"` and an active `border-border bg-card` state, error and not-found pages name Guttora and link to `/`, OG hexes moved to `lib/og-palette.ts`.

**Decisions:**
- `lib/data.ts` is now a re-export of `lib/types.ts` and `lib/data/seed.ts`, so `lib/impact.ts` and `lib/synth.ts` (never-touch files) still import from `@/lib/data` unchanged.
- `realAdapter` delegates to `fakeAdapter` until Phase 2 puts a shared repair store behind it.
- `lib/og-palette.ts` is the one place outside `app/globals.css` that holds hexes, because Satori cannot read CSS variables.
- `defaultGridCode` is a constant, not residence data, so `app/play/page.tsx` imports it from `lib/data/seed.ts` and passes it as a prop. `lib/impact.ts` still reads grid factors from the seed for its own math (not touched, per the Never list).
- The story keeps its GSAP block verbatim inside a new inner `StoryScene`; `DripStory` only builds the data from props and renders the empty state when the story tap is missing.
- The accuracy bench title now says "Synthetic detector bench" so the demo step 7 label is on screen.

**Failed attempts:** none.

**Files changed:** `DEMO.md`, `CLAUDE.md`, `lib/types.ts`, `lib/data/seed.ts`, `lib/data.ts`, `lib/adapter.ts`, `lib/og-palette.ts`, `lib/repair-store.ts`, `scripts/seed.ts`, `package.json`, `tsconfig.json`, `.env.example`, `app/api/residence/route.ts`, `app/api/grid-factors/route.ts`, `app/api/bench-clips/route.ts`, `app/page.tsx`, `app/play/page.tsx`, `app/notes/page.tsx`, `app/loading.tsx`, `app/play/loading.tsx`, `app/notes/loading.tsx`, `app/layout.tsx`, `app/error.tsx`, `app/not-found.tsx`, `app/opengraph-image.tsx`, `components/drip-story.tsx`, `components/play-workbench.tsx`, `components/repair-list.tsx`, `components/accuracy-bench.tsx`, `components/site-header.tsx`, `components/site-nav.tsx`, `HANDOFF.md`, `.farm-commits.json`.

**Commands run:** none, agent has no shell. `npm run build`, `npm run seed` and the deploy are unverified.

**Open questions:**
- `npm run seed` uses `node --experimental-strip-types`, which needs Node 22.6 or newer. Is that the Node version on the runner?
- The API routes and pages have no dynamic APIs, so Next may prerender them at build time and read `ADAPTER_MODE` then. Fine while both modes serve the seed; Phase 2 may want `export const dynamic = "force-dynamic"` on them.

**Closing commit:** `faz-1: seams under the bench (demo contract, adapter, api stubs, shell)`

**Next best step:** Phase 2 field-tests the detector on a real tap and puts the shared repair store behind `realAdapter`.

---

You are picking up a working Next.js scaffold. Read this file, then `IDENTITY.md`, then start on the Mission list. Keep `npm run build` green after every change.

## 1. Context

**Product:** Guttora. Hold your phone next to a dripping tap: Guttora counts the drops by sound, measures drop size with a teaspoon, and shows how many litres of water and kg of CO2e that tap wastes in a year.

**Plain pitch:** If there is a dripping tap in your dorm or flat, you put your phone next to it and open the page. It listens for 30 seconds and counts every drop on screen. If you like, you hold a teaspoon under the tap, and the drops it takes to fill tell you this tap's real drop size. At the end you see how many litres the tap wastes a year, and for a hot tap how much energy and carbon, and you add it to a list of all your taps, sorted by which one to fix first.

**Hackathon:** Green Shift Hacks (Devpost, online, students only, teams of up to 4). https://green-shift-hacks.devpost.com/

**Deadline:** 10 December 2026, 17:00 EST (22:00 UTC). Winners announced 16 December 2026.

**Target track:** Green Shift Grand Prize, $125 cash, 1 winner. The only published judging criterion: "Environmental Impact: How clearly the project reduces waste, emissions, resource use, or environmental harm." Every hour should push that: measured litres, kWh and kg CO2e on screen, from live data.

**Verified submission requirements:**
- An original technology project with a clear sustainability goal (here: water, then energy) and a working prototype.
- A complete Devpost project page with the project story and every team member.
- A demo video or step-by-step walkthrough.
- Source code or clear setup instructions.
- A description of the problem, target users, approach, expected environmental benefit, tools used, and limitations (README already has all six sections; keep them true).
- Only data and samples you have permission to share. Every audio file must be recorded by the team.
- Code written during the event (after 18 October 2026); open source tools and datasets must be named (README "Open source used" and notes page "Tools and sources").

## 2. Current state

Identity: see IDENTITY.md (direction D10, structure S6, archetype L3, kit K2)

Butter ground, cream panels, 2px ink borders, hard 4px offset shadows, sharp corners, royal blue accent. Archivo Black for every h1 and h2, Archivo for body. Entrance motion is the `guttora-wipe` clip-path keyframe in `app/globals.css`.

**Routes (all linked from the header nav: Story, Bench, Notes):**
- `/` -> `app/page.tsx`: editorial single column, kicker, headline, standfirst, scene-1, then the five-chapter story (`components/drip-story.tsx`), mid-article CTA to `/play`, scene-2, scene-3, folded limitations.
- `/play` -> `app/play/page.tsx`: the free-form bench (`components/play-workbench.tsx`).
- `/notes` -> `app/notes/page.tsx`: method, formulas, grid factor table, live accuracy bench, limits, sources.

**File map:**
- `lib/types.ts`: `Tap`, `HeaterKind`, `TapStatus`, `GridFactor`, `BenchClip`, `ResidenceSnapshot`, `ApiResponse<T>`.
- `lib/data/seed.ts`: seed data: 10 taps in "Ayazağa Student Residence", 7 grid factors, 6 synthetic bench clip specs. Type-only imports so Node can run it.
- `lib/data.ts`: re-export of `lib/types.ts` and `lib/data/seed.ts` for older imports (`lib/impact.ts`, `lib/synth.ts`).
- `lib/adapter.ts`: `GuttoraAdapter`, `fakeAdapter` (seed), `realAdapter` (delegates to fake for now), `adapterMode()` from `ADAPTER_MODE`, `getAdapter()`. Pages and `app/api/*/route.ts` read data only through it.
- `lib/og-palette.ts`: the four OG card hexes, mirrored from IDENTITY.md for Satori.
- `scripts/seed.ts`: writes `fixtures/seed-snapshot.json` deterministically (`npm run seed`).
- `components/site-nav.tsx`: client nav with `aria-current="page"`.
- `lib/drip-detector.ts`: REAL. Radix-2 FFT, spectral flux on bins above 1 kHz, median + MAD threshold, 120 ms refractory, CV regularity, `detectInBuffer` for files.
- `lib/synth.ts`: REAL. Deterministic synthetic drip recordings for the bench.
- `lib/impact.ts`: REAL. USGS default drop, litres/year, kWh, kg CO2e, number formatting.
- `lib/repair-store.ts`: MOCK STORE. `loadRepairList(seed)`, `saveRepairList`, `resetRepairList(seed)` use localStorage (key `guttora.repair-list.v1`) seeded with the adapter's taps passed in by `components/play-workbench.tsx` (TODO in file: swap for a shared store). `rankOpenTaps` and `repairRequestText` are real.
- `components/drip-listener.tsx`: REAL microphone path (getUserMedia with echo cancellation, noise suppression and AGC off, BiquadFilterNode high-pass, ScriptProcessorNode 512-sample chunks) and REAL file path (decodeAudioData). TODO in file: move to an AudioWorklet.
- `components/play-workbench.tsx`: spoon calibration, impact converter, add-to-list.
- `components/repair-list.tsx`: ranked list, mark reported/fixed, copy repair request.
- `components/accuracy-bench.tsx`: runs the detector over the six synthetic clips on demand.
- `components/drip-story.tsx`: the home story and the kit signature (below).
- `components/site-header.tsx`: sticky header and footer.
- `components/ui/*`: shadcn primitives restyled for D10 (Badge also has `ok` and `warn` variants).
- `public/logo.svg`, `app/icon.svg`: the drop-with-waveform mark. `public/illustrations/scene-1..3.svg`: hand-drawn fallbacks for the three SceneSlots. `app/opengraph-image.tsx`: 1200x630 card.

**Nothing is faked on screen.** The home story is driven by seed numbers and says so through its narrative (Elif, room C-214); the bench and the notes page run the real detector.

**Interaction kit (K2 gsap):**
- SHIPPED, signature 1: pinned scroll scene. In `components/drip-story.tsx` the tap readout pins under the header while a scrubbed GSAP timeline (ScrollTrigger, `scrub: 0.4`) plays C-214 from one ignored drop to 26 counted drops, 0.25 to 0.31 mL, 6,833 to 8,541 L a year, 0 to 366 kWh and 161 kg CO2e, and finally its third place in the repair list. Chapter buttons (Drop, Listen, Spoon, Heat, Rank) jump to each chapter. Under reduced motion there is no pin and no scrub: the readout is CSS sticky and each chapter sets its finished state.
- TODO, signature 2: intro timeline on first paint on `/`. Split the h1 into word spans by hand, stagger them in, then bring in the scene-1 frame. Must start from a visible state in server HTML (animate `clip-path` or `y` from visible, never opacity 0 in SSR) and be skipped under reduced motion.
- TODO, signature 3: figure tween bound to a control on `/play`. When the spoon result arrives or the heater toggle changes, tween the litres/kWh numbers and a bar mark together (gsap tween on a proxy object inside `useGSAP`).

**One-mark proof (`components/site-header.tsx`):**

```tsx
<Link href="/" className="flex items-center gap-2 font-display text-xl">
  <BrandMark />
  Guttora
</Link>
```

## 3. Mission (in order)

1. **Detector field test, about 1.5 h.** Run `/play` on a phone next to a real dripping tap. Done = the counter ticks on every drop at 1 cm to 15 cm distance, the badge goes green within 10 drops, talking nearby does not add counts, and closing the tap gives "No regular drip. Yearly loss: 0 L" within about 5 s. Tune `DEFAULT_CONFIG` in `lib/drip-detector.ts` (`k`, `relative`, `minHz`) if needed and update the notes page text, which reads those values.
2. **Wow moment polish, about 1 h.** On `/play`, each counted drop should flash a mark and bump the counter visibly, and the yearly litre sentence should climb as the rate settles. This is the 15 to 45 second shot in the video. Ship kit signature 3 here (tween the litres figure and a bar together).
3. **AudioWorklet, about 1.5 h.** Move chunking from ScriptProcessorNode to an AudioWorklet (module loaded from a Blob URL or `public/`), keep the ScriptProcessor path as a fallback. Done = same counts on Chrome Android and iOS Safari.
4. **Spoon flow check, about 0.5 h.** Done = "Start spoon" then "Spoon is full" after a real teaspoon fills gives a sensible mL per drop (0.2 to 0.5) and the impact sentence switches from "USGS default" to the measured value.
5. **Field recordings and accuracy table, about 2 h.** Record six of your own taps (phone voice recorder, 30 s each, different rooms, one with a fan, one with talking, one closed tap). Hand-count each, run them through the file upload, and add the real table to the README "Limitations" area and the notes page next to the synthetic bench. Only team-recorded audio (rule).
6. **Kit signature 2, about 0.5 h.** Intro timeline on `/` as described above.
7. **Repair list check, about 0.5 h.** Add three taps from live measurements, confirm ranking, reload (localStorage), copy the request and paste it into a mail client.
8. **README and Devpost, about 1 h.** Re-check every number in README against the app. Fill in team members, the video link on Devpost. Note: the idea notes quoted "1.58 tonnes a year for one drip per second" from a WAGUSE study; the USGS arithmetic gives about 7,900 L, so do not use 1.58 t unless you verify the source and its drop size.
9. **Video, about 1 h.** 0 to 15 s: dripping tap and the sentence "one drip a second, about 7,900 litres a year (USGS)". 15 to 45 s: phone by the sink, counter ticking, rate settles, someone talks and it does not count. 45 to 75 s: spoon fills, drop size appears, hot water toggle shows kWh and kg CO2e, tap added and ranked against two others. 75 to 90 s: tap closed, "no regular drip, 0 L", then the bench table and the copied repair request.

## 4. Constraints

- Next.js 15 App Router, TypeScript strict, Tailwind CSS v4 (no tailwind.config), deploys to Vercel with no server state. Everything audio stays in the browser.
- IDENTITY.md is law for every color, font, route, layout and animation choice. Colors only through the tokens in `app/globals.css`. Sharp corners (`rounded-sm` = 0.125rem), 2px ink borders, hard offset shadows. One column at every breakpoint on `/`, no stat tiles, no two-column grid at lg there. Every GSAP call inside `useGSAP` with `gsap.matchMedia()` and a reduced-motion path; never server-render content at opacity 0.
- Use the primitives in `components/ui/` for every button, input, badge and panel.
- Copy: plain human English, no em dashes or en dashes, no words like seamless, leverage, empower, robust, unlock, harness, cutting-edge. Numbers go inside sentences.
- Keep every claim true: if a number on screen comes from seed data, the story must make that obvious; never present synthetic clips as field recordings.
- If something threatens the deadline, cut scope (AudioWorklet and signature 2 go first), not the field test or the video.
- Run `npm run build` after every change and keep it passing.

## 5. Definition of done

- Deployed on Vercel at https://guttora.vercel.app and the README demo link works.
- The 90 second flow above works end to end on a real phone, with the seed residence as the starting repair list.
- The wow moment is rehearsed: counter ticks on every drop with no button pressed after Start, litres climb, closing the tap shows "No regular drip".
- README has the real field accuracy table, the six required sections are true, team members and video are on Devpost before 10 December 2026, 17:00 EST.

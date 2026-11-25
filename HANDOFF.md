# HANDOFF: Guttora

## QA round 1

- Finding `data` on /play ("the live source fell back to bundled data"). Root cause: no upstream call failed. The repair list is seeded from `lib/data/seed.ts` by design (`lib/adapter-real.ts` returns the seed residence, there is no shared building register to read), and the page header put that sample sentence right beside the green "Live" badge, so the live microphone path and the sample list read as one source that had fallen back. Fix: the header now carries only the live microphone sentence (`app/play/page.tsx`); the sample note moved into the repair list card (`components/repair-list.tsx`) and follows the list's real state (`showsSample` from `components/play-workbench.tsx`): it says sample taps are shown and why while any seed tap remains, and says the list is the reader's own once they have replaced them. A fresh browser still sees the sample note, which is correct: the list is sample data until a tap is measured.
- Finding `proof` ("9 passed, 0 failed"): informational, nothing failed.
- Re-crawl note: the crawl's screenshot of /play shows the old header text ("The drip counter uses this phone's microphone, and the starting repair list is sample data for Ayazağa Student Residence."). That sentence is gone from `app/play/page.tsx` since commit 1a91263, so the crawl hit a deploy built before that commit. No new code change for this finding. The calm note in the repair list card ("the list opens with sample taps ... to show the ranking") stays on purpose: the starting list really is sample data, and removing the note while still showing it would be dishonest.

## Phase 5 result

**Goal:** stage DEMO step 1 in full: the headline words wipe in on first paint (kit signature 2), the scene-1 frame follows, an oversized litres figure counts up inside its sentence, then the pinned C-214 scene plays. Around it, trim `/` to one L3 column with one story CTA, fix the shell (footer links, 44px chapter buttons, folded notes table), place six scene slots, and write the submission package (README truth pass, LICENSE, SUBMISSION.md).

**Status (per slice):**
- A1, editorial front page: done. `components/story-intro.tsx` (new, `"use client"`) renders kicker, hand-split h1 (`guttora-word inline-block` spans), a one-sentence standfirst and the scene-1 figure as children. `app/page.tsx` has one primary CTA (`#story`) mid-flow, `/play` as an inline underlined link in the next sentence, one sentence per section, the accent band and the limitations `<details>`. One column at `max-w-prose`, no grid.
- A2, shell: done. Footer is one sentence plus three underlined links (`/notes`, repo, Devpost; both external with `target="_blank" rel="noopener noreferrer"`, all `min-h-11`). Chapter buttons are `h-11 px-3` inside the existing `flex flex-wrap` (`components/drip-story.tsx:154`; the `useGSAP` block is untouched). `/notes`: grid table and the seven detector steps fold behind one-line `<details>`; each section leads with one sentence; the accuracy bench stays open. `/play`: h1, one sentence and the Live badge sentence. Route states: the only raw control was the manual copy `<textarea>` in `components/repair-list.tsx`; it now uses the new `components/ui/textarea.tsx` primitive.
- B1, motion: done. Signature 2 in `StoryIntro` (one timeline: words, then frame). `components/inline-count.tsx` counts the litres figure from 0 once on scroll (ScrollTrigger `once: true`). `components/editorial-rule.tsx` wipes an `hr` in before the band, "Why the spoon matters" and "Who it is for". `app/globals.css` unchanged: one `@keyframes guttora-wipe` and its reduced-motion block.
- B2, scene family: done. Six `<SceneSlot n=` placements, `public/illustrations/scene-4.svg`, `scene-5.svg`, `scene-6.svg` written (token hexes only, no comments, no gradients).
- C1, submission package: done. README rewritten in the required order (prize table row and both PROOF blocks byte-identical), `LICENSE` (MIT, "Guttora contributors"), `SUBMISSION.md`. `docs/SCREENSHOTS.md` skipped (optional).
- C2, docs sync: done. Four `2026-11-25:` lines appended to IDENTITY.md Amendments, DEMO step 1 updated. DELIVERY.md unchanged (it keeps the video line for the human).

**Decisions:**
- No live deployment yet, so the diagnosis was made from the files only (SHOT names the source file, regions are line ranges). Publish first so the next diagnosis has pixels.
- M4 ease in GSAP code is `"power2.inOut"`: GSAP's power2 is the cubic curve, and `cubic-bezier(0.65, 0, 0.35, 1)` is the usual bezier fit of the cubic in-out, so no CustomEase plugin (a second dependency) is needed.
- The wipes use `fromTo` to `inset(0 0% 0 0)` with `clearProps: "clipPath"` instead of a bare `gsap.from`, so the final state has no clip at all and the hard shadow on the scene-1 frame is never cut.
- Server HTML renders every word, the frame, the rules and the final litres value at full visibility. On the client, with motion allowed, there is one brief frame where the words show before GSAP clips them for the wipe (hydration runs after first paint). This is the cost of never server-rendering hidden content.
- `InlineCount` writes "0" as soon as it mounts with motion allowed, then counts up when 85% of the viewport reaches it, so the reader never sees it jump back from the final value.
- `EditorialRule` is placed before the page-level h2s on `/`. The five chapter h2s inside `components/drip-story.tsx` have none, because that file was fenced to line 154.
- Slot map: 1 `/` intro 960x640; 2 `/` spoon 720x720; 3 `/` who it is for 960x640; 4 `/play` under the header 1200x400; 5 the empty repair list (`components/repair-list.tsx`, through a new optional `media` prop on `EmptyState`) 640x640; 6 `/notes` how a drop is heard 1200x480.
- `/play` no longer says which mode counts the notes bench (the "counted on the server / in your browser" sentence was in the cut paragraph). The notes page bench still names its own source.
- `scripts/proof.ts` already lists `SUBMISSION.md` in `TARGETS`, so no code change was needed. `SUBMISSION.md` carries the `detector-bench` block only; for `unit-tests` the script will print "markers missing in SUBMISSION.md, skipped", which is expected.
- SUBMISSION.md follows Devpost's standard project fields; the actual submission form was not seen.
- The README no longer lists lucide-react: it is in `package.json` but nothing in `app/`, `components/` or `lib/` imports it.

**Failed attempts:** none.

**Files changed:** `components/story-intro.tsx` (new), `components/inline-count.tsx` (new), `components/editorial-rule.tsx` (new), `components/ui/textarea.tsx` (new), `app/page.tsx`, `app/play/page.tsx`, `app/notes/page.tsx`, `components/site-header.tsx` (footer only), `components/drip-story.tsx` (line 154 only), `components/route-states.tsx`, `components/repair-list.tsx`, `public/illustrations/scene-4.svg` (new), `scene-5.svg` (new), `scene-6.svg` (new), `README.md`, `LICENSE` (new), `SUBMISSION.md` (new), `IDENTITY.md` (append only), `DEMO.md`, `HANDOFF.md`, `.farm-commits.json`, `.farm-delta.md` (not committed).

**Commands run:** none, the agent has no shell. `npm install`, `npm run build`, `npm test`, `npm run proof`, Lighthouse and every visual check at 360, 768 and 1280px are unverified.

**Gate notes (read from files):**
- Kit: signature 1 `components/drip-story.tsx`, signature 2 `components/story-intro.tsx`, signature 3 `components/impact-figure.tsx`. Each starts with `"use client"`, imports `gsap` and `useGSAP`, and uses `gsap.matchMedia()` with a reduced-motion branch. `inline-count.tsx` and `editorial-rule.tsx` follow the same rules.
- Tripwire counts are in `.farm-delta.md`: zero for every banned hex, keyframe and prop; raw hexes only in `app/globals.css` and `app/icon.svg`.
- `.gitignore` covers `.env*` with `!.env.example`; `.env.example` lists both `process.env` reads (`ADAPTER_MODE`, `NEXT_PUBLIC_BRAND_FILES`); `.farm-live.json` unchanged.
- Commit replay note: each file sits in one commit, so the first commit (`app/page.tsx`) imports files added by the third. Only the final tree is expected to build.

**Scene fallbacks:** scenes 1 to 6 all render the SVG fallbacks in `public/illustrations/` until `public/brand/scene-1.png` to `scene-6.png` are uploaded.

**Open questions:**
- The short visible-then-clipped flash on the headline at hydration: acceptable, or should the server render the words under a no-JS-safe class that a tiny inline script removes? That would add an inline script, so it is a question, not a change.
- The notes header standfirst still runs two sentences; trim it in Phase 6 if the judges read it as a wall.

**Manual submit checklist (human):**
- [ ] Team members added on Devpost.
- [ ] Student eligibility confirmed for every member.
- [ ] Video link pasted into the form by the builder.
- [ ] Field recordings table recorded, hand-counted and added (README and notes page).
- [ ] Submission form fields checked against `SUBMISSION.md` (the form itself was not seen).
- [ ] Submitted before 10 December 2026, 17:00 EST.

**Next best step:** Phase 6, the judge round fixes. Publish the redeploy first, take 360, 768 and 1280px shots of `/`, `/play` and `/notes`, and check the headline wipe, the count-up and the six scene frames on a phone.

**Closing commit:** `faz-5: editorial front page, scene family and submission package`

---

## Phase 4 result

**Goal:** the second wow on `/play` (kit signature 3: the litres figure and its bar tween together, and the drop mark flashes per counted drop), every route usable at 360px, OG and Twitter metadata, the prize track table and `DELIVERY.md`, landing links, then the security pass (microphone, web hygiene, `SECURITY.md`).

**Status (per slice):**
- A1, impact figure: done. `components/impact-figure.tsx` (new). It has two `useGSAP` hooks scoped to `rootRef`, each building a `gsap.matchMedia()` with a `(prefers-reduced-motion: no-preference)` branch (tween) and a `(prefers-reduced-motion: reduce)` branch (`gsap.set` to the final values, no flash). It has the loading, empty, error and zero microcopy. React renders the final `fmt(litres)` and the final `scaleX`, so server HTML is true. It is wired into the "Yearly impact" card in `components/play-workbench.tsx`; the bare "Start the counter..." line is gone. DEMO.md now runs steps 1 to 8.
- A2, responsive shell: done. `SiteNav` takes `layout?: "inline" | "bar"`. The header nav is `hidden md:flex`. A fixed bottom `nav aria-label="Main, mobile"` with `md:hidden` sits in `app/layout.tsx`, and `<body>` has `pb-16 md:pb-0`. Buttons `default`/`sm`/`icon` and `Input` are `h-11`. The listener file input is `h-11 py-1.5` and its name line is `min-w-0 truncate` with `title`. Repair rows use `break-words`, `title={r.tap.label}` and `flex shrink-0 flex-wrap gap-2`.
- A3, metadata: done (`app/layout.tsx`). `app/opengraph-image.tsx` and `app/icon.svg` are untouched and exist.
- A4, prize table and DELIVERY.md: done. README `## Prize track` and a `Source:` line under the live demo, so SECURITY.md URLs match README byte for byte.
- A5, landing: done. The standfirst names students, tenants and residence staff. The CTA row has `#story` and `/play` buttons; `id="story" className="scroll-mt-24"` is on the wrapper in `app/page.tsx`.
- B1, sec(web): done. The headers are in `next.config.ts` (brand file code unchanged), and the footer "Source code" link has `rel="noopener noreferrer"`.
- B2, SECURITY.md: done.

**Decisions:**
- **Second wow selection record:** all five idea features already ship in some form (drip counter, spoon calibration, impact converter, repair list, file mode with the synthetic bench). The real field table needs team recordings that only the human can make. So the most demo-visible unbuilt piece was Mission item 2, the wow polish with kit signature 3. It needs no new provider and no new seat.
- **No sponsor integration:** the only `targetTracks` entry is the Green Shift Grand Prize, `kind: "main-placement"`, `requiredTech: []`, `entryMode: "automatic"`. No env key was added; `.farm-live.json` and `.env.example` are unchanged.
- **Contract front skipped: no `contracts/` directory** (Glob `contracts/**` returns no files). **Wallet front: vacuous, no wallet code** (the wallet grep only hits Web Audio `connect(`/`disconnect(` in `components/drip-listener.tsx:57,99,100,101`).
- Each figure update reverts the previous run's `matchMedia` before it builds a new one, so media listeners do not pile up per drop. The on-screen value is snapshotted first, so the new tween continues from where the old one stopped.
- Branch order in the figure: error (`irregular` or a non-finite litres) beats loading (`warming`), which beats empty (`litres === null` or `idle`), which beats zero (`quiet` or `litres === 0`). So while the live counter warms up, a typed rate shows in the detail sentence below the figure, not in the figure.
- The landing CTA row carries no `guttora-wipe` class: the wipe keeps `clip-path: inset(0 0 0 0)` as its final state, which would cut off the buttons' hard shadows. The two buttons override `whitespace-nowrap` (`whitespace-normal h-auto min-h-12`) so the long label wraps at 360px.

**Responsive audit (before the fixes):**
- `app/notes/page.tsx`: the grid table already sits in `overflow-x-auto` (line 80). No fixed widths. Long strings: the source link texts wrap normally.
- `app/play/page.tsx` and the workbench: no fixed widths over 360px (`max-w-40` inputs only). Tap targets under 44px: every `size="sm"` button (spoon size, heater, grid, repair row actions, header nav) was 32px, default buttons and inputs 40px, and the file input 40px. Long strings: the repair tap label and place had no wrap, the row's button group could not wrap, and the uploaded file name could push the counter row. The accuracy bench table sits in `overflow-x-auto` (`components/accuracy-bench.tsx:156`).
- `app/page.tsx`: the h1 is `text-4xl` under sm (wraps). No fixed widths. Story chapter buttons are `h-7` (28px) by a className override at `components/drip-story.tsx:154`. **Left as is:** `drip-story.tsx` was not in this phase's file list, and the line sits next to the fenced GSAP block. Open question below.
- Error and not-found pages: `app/error.tsx`, `app/play/error.tsx`, `app/notes/error.tsx`, `app/not-found.tsx` render no `<html>` (the only `<html` is `app/layout.tsx:36`), so the header and the bottom bar stay.
- Grep `w-\[[4-9][0-9]{2}px\]|w-\[[0-9]{4}` over `app/` and `components/`: zero hits.

**Security pass (greps, read from files):**
- `getUserMedia`: the call is at `components/drip-listener.tsx:79` inside `start()` (defined at line 70, feature check at line 72). `start` is only referenced by the "Start listening" `onClick` (line 219). The only `useEffect` in the file (line 65) returns `teardown`; it calls neither `start` nor `getUserMedia`. The other hit is prose on `app/notes/page.tsx:127`.
- Secrets `sk-|PRIVATE_KEY|[0-9a-fA-F]{64}` over `app/`, `components/`, `lib/`: zero hits. `process.env` reads: `NEXT_PUBLIC_BRAND_FILES` (`lib/brand-files.ts:2`, public build-time list of image names) and `ADAPTER_MODE` (`lib/config.ts:11`, server only). Both are in `.env.example`.
- `http://` over `app/`, `components/`, `lib/`: one hit, the SVG `xmlns` namespace in `app/icon.svg:1`. It is an identifier, not a request (never-touch file).
- `target="_blank"`: one hit, the new footer link in `components/site-header.tsx`, with `rel="noopener noreferrer"`.
- `<form`: zero hits. Inputs feed local React state only; the clipboard write in `components/repair-list.tsx` runs only from the "Copy repair request" click.
- `console.log`: hits only in `lib/adapter.ts` and `lib/adapter-real.ts` (server side, `[core]` prefix, intentional). None in `components/`.
- Tripwires over `app/` and `components/`: banned hexes, `fade-up|float-y|glow-pulse|caret-blink|pulse-dot|--delay|--d:|backdrop-blur` and raw `#hex` in `.tsx` all give zero hits. The only `@keyframes` is `guttora-wipe`; the only `<BrandMark` is `components/site-header.tsx:11`. Em dash, en dash, ` -- ` and the banned words give zero hits in README, DEMO, DELIVERY, SECURITY and UI `.tsx`.

**Cuts:** none. Every Part A and Part B item shipped.

**Failed attempts:** none.

**Files changed:** `components/impact-figure.tsx` (new), `components/play-workbench.tsx`, `DEMO.md`, `components/site-nav.tsx`, `components/site-header.tsx`, `app/layout.tsx`, `components/ui/button.tsx`, `components/ui/input.tsx`, `components/repair-list.tsx`, `components/drip-listener.tsx` (two className edits only), `app/page.tsx`, `README.md`, `DELIVERY.md` (new), `next.config.ts`, `SECURITY.md` (new), `HANDOFF.md`, `.farm-commits.json`.

**Commands run:** none, the agent has no shell. `npm install`, `npm run build`, `npm test`, Lighthouse, the header check and every visual check at 360, 768 and 1280px are unverified.

**Open questions:**
- The story chapter buttons are `h-7` (`components/drip-story.tsx:154`), under 44px. Should Phase 5 lift them to `h-11`? That line is outside the GSAP block, but the readout gets taller in the pinned scene.
- The footer "Source code" link is external and appears on `/` too, while the landing rule says every href on `/` resolves to `/`, `/play`, `/notes` or `#story`. Slice B1 asked for the link, so it stays; the landing article itself has only internal hrefs.
- The `h-11` sm buttons make the `/play` grid factor row (7 countries) and the repair row actions taller. They wrap correctly; check that it still reads well at 360px.

**Manual checklist (human):**
- [ ] Field-test DEMO step 3 on a real tap: the mark flashes on every counted drop, and the litres figure and its bar climb together as the rate settles. With reduced motion on, the values appear without tweens.
- [ ] Record the six field recordings, hand-count them and add their table (README and notes page).
- [ ] Team names and the video on Devpost before 10 December 2026, 17:00 EST (see `DELIVERY.md`).
- [ ] Devtools at 360px, 768px and 1280px: no horizontal scroll, and the bottom bar works below 768px.
- [ ] View-source on `/`: absolute `og:image`, `twitter:card` is `summary_large_image`; the response headers include `Permissions-Policy` with `microphone=(self)`.

**Blockaid:** no wallet, so no warning is expected.

**Next best step:** Phase 5, the frontend pass with kit signature 2 (intro word timeline on `/`).

**Closing commit:** `faz-4: second wow on the bench, phone-ready shell, metadata and security notes`

---

## Phase 3 result

**Goal:** the whole demo path runs on the real flow and repeats cleanly. Every DEMO step has a real path and a fallback, the repair list has one versioned store with a double click guard, every route has loading, error and empty branches, and `npm run demo:reset` plus `/play?reset=1` put the demo back at its start state.

**Status (per slice):**
- Slice 1, adapter fallback: done. `withFallback(primary, fallback)` in `lib/adapter.ts` wraps all four methods; each logs `[core] <method> fell back to seed: <message>` (via `CORE_LOG_PREFIX`) and returns the fake adapter's result. `getAdapter()` returns `withFallback(realAdapter, fakeAdapter)` in real mode and `fakeAdapter` in fake mode. The step to path to fallback table is a comment block at the top of the file. `app/api/bench-report/route.ts` now labels a success body with `report.source`, so a fallback report is not called "real".
- Slice 2, store wrapper: done. `lib/store.ts` (new) exports `REPAIR_LIST_KEY`, `readRepairList`, `writeRepairList`, `clearRepairList`, `addTapOnce`, with module-level `memoryList` and `seenMeasurementKeys`. `storedTapSchema` and `storedRepairListSchema` in `lib/schemas.ts`, `SEED_VERSION = 1` in `lib/data/seed.ts`. `lib/repair-store.ts` keeps only `rankOpenTaps` and `repairRequestText`. `components/use-repair-list.ts` (new) is the single hook; `components/play-workbench.tsx` uses it.
- Slice 3, write guards: done. Workbench builds `measurementKey`, adds through `addTapOnce`, and disables "Add to repair list" with `addedKey === measurementKey` (label reads "Added to the list" until an input changes). The repair list binds `copyPending` to the clipboard promise in `try`/`finally` and shows a read-only textarea with "Copy this text by hand." when the browser refuses.
- Slice 4, state triad: done. `components/route-states.tsx` (new) has `RouteSkeleton`, `ErrorState`, `EmptyState`. Three `loading.tsx` render `RouteSkeleton`; `app/error.tsx`, `app/play/error.tsx` (new), `app/notes/error.tsx` (new) render `ErrorState` with `onRetry={reset}`. Empty branches: `components/drip-story.tsx` ("Count a tap on the bench" to `/play`), `components/repair-list.tsx` ("Restore the sample list" plus "Start listening" to `#listen`, with `id="listen"` on the wrapper around `DripListener` in the workbench), `components/accuracy-bench.tsx` ("Open the bench" to `/play`). `/play` shows `RouteSkeleton` in place of the list while `status === "loading"`.
- Slice 5, reset, images, docs: done. `playQuerySchema` in `lib/schemas.ts`; `app/play/page.tsx` awaits `searchParams`, runs `safeParse` (invalid means no reset) and passes `resetOnLoad` down; the hook clears the store and calls `window.history.replaceState(null, "", "/play")`. `scripts/demo-reset.ts` (new) and `npm run demo:reset`. `components/scene-slot.tsx` uses `next/image` with `unoptimized` and `priority` on scene 1. README "Demo reset" section, DEMO.md "Before each take" line, CLAUDE.md command and pitfall.

**Decisions:**
- **Store: the browser's localStorage**, wrapped in `lib/store.ts`, shape `{ v: 1, seedVersion, taps }`. It is the decision table row "one small mutable state": the repair list on one phone. Nothing is stored on the server, which fits Vercel serverless.
- **Rejected: KV (Upstash).** A list shared across residents is multi-user, which this phase fences out, and it needs a token that `.farm-live.json` does not hold, so the real path would never run on the deploy.
- **Rejected: Postgres and chain.** No step filters or joins, and no step needs a chain.
- `.farm-live.json` and `.env.example` are unchanged; no env key was added.
- **Reset:** the server part is `npm run demo:reset` (rewrites the seed snapshot and prints the reset URL; the server has no state to clear). The client part is `/play?reset=1`. **Chain reset: not applicable (no chain).** No migration: no database, versioned localStorage shape.
- `addTapOnce` refuses a repeat measurement key in the same page session and any id already in the list. `clearRepairList` also empties `seenMeasurementKeys`, so after a reset the same measurement can be added again.
- After an add, the tap name and place now stay in their fields (they used to clear), so the key stays the same and the button keeps reading "Added to the list" until the user changes something. While the live counter runs, `stats.count` is part of the key, so the button comes back on the next counted drop; a double click inside one drop gap adds one row.
- The stored `cv` of a new tap is clamped to a finite, non-negative number, so `storedTapSchema` never rejects it after a reload (a rejected row would send the whole list back to seed).
- **Brand mark exception:** `components/brand-mark.tsx` keeps its `<img>` because it is a never-touch file; only `components/scene-slot.tsx` moved to `next/image`.
- `components/route-states.tsx` has no hooks and no `"use client"`, so `loading.tsx` (server) and the client components share it.

**Failed attempts:** none.

**Files changed:** `lib/adapter.ts`, `app/api/bench-report/route.ts`, `lib/store.ts` (new), `lib/schemas.ts`, `lib/data/seed.ts`, `lib/repair-store.ts`, `components/use-repair-list.ts` (new), `components/play-workbench.tsx`, `components/repair-list.tsx`, `components/route-states.tsx` (new), `app/loading.tsx`, `app/play/loading.tsx`, `app/notes/loading.tsx`, `app/error.tsx`, `app/play/error.tsx` (new), `app/notes/error.tsx` (new), `components/drip-story.tsx` (empty branch and one import only), `components/accuracy-bench.tsx` (zero clips branch and imports only), `app/play/page.tsx`, `scripts/demo-reset.ts` (new), `package.json`, `components/scene-slot.tsx`, `README.md`, `DEMO.md`, `CLAUDE.md`, `HANDOFF.md`, `.farm-commits.json`.

**Commands run:** none, the agent has no shell. `npm install`, `npm run build`, `npm test`, `npm run demo:reset` and every manual demo pass are unverified.

**Gate notes (read from files, not run):**
- Grep `localStorage` over `app/`, `components/`, `lib/`: code hits only in `lib/store.ts`; the other hits are comments in `lib/adapter.ts` and `lib/schemas.ts`.
- Grep `writeFileSync|mkdirSync|fs\.`: no fs use, but `fs\.` matches `chapterRefs.` three times in `components/drip-story.tsx` (lines 261, 285, 300, the GSAP block). It is a false positive; the block was left untouched because the GSAP scene is off limits this phase.
- Raw hexes outside `app/globals.css`: only `app/icon.svg` (never-touch file, unchanged).

**Open questions:**
- Node 22.6 or newer for `--experimental-strip-types` (same as Phases 1 and 2), now also for `npm run demo:reset`.
- `app/play/page.tsx` now reads `searchParams`, so `/play` renders per request instead of being prerendered. That is cheap here (seed only), but say so if a static `/play` matters.
- Should "Remove" on a tap you just added also forget its measurement key? Today the same measurement cannot be re-added until a reset or a page reload.

**Manual checklist (human):**
- [ ] `npm run demo:reset`, open `/play?reset=1`, walk DEMO.md steps 1 to 7, three times in a row: the same 10 seed taps at the start each time, no step over 5 seconds.
- [ ] Double click "Add to repair list": one row. Reload: the row stays. Open `/play?reset=1`: the row is gone.
- [ ] Walk the path on https://guttora.vercel.app in a private window on a phone (private mode exercises the `memoryList` fallback on some browsers).
- [ ] Field-test the detector on a real tap (Phase 2 checklist below, still open).
- [ ] Record six team taps, hand-count them, add the real table.
- [ ] Confirm team member names and eligibility; record the video.

**Next best step:** Phase 4. The human runs the field test and the field recordings from section 3, then landing and OG polish.

**Closing commit:** `faz-3: demo path on the real flow with a versioned store, guards, route states and reset`

---

## Phase 2 result

**Goal:** prove the drip counter. The real adapter now does real work: `realAdapter.getBenchReport()` runs the spectral flux drip detector (`detectInBuffer` in `lib/drip-detector.ts`) over the six seed bench clips on the server, a `node:test` suite pins its behavior on 5 fixed clips, and `npm run proof` writes the measured table and the test result into README.

**Status (per slice):**
- Slice 1, config, errors, schemas, live contract: done. `lib/config.ts` (no imports, only env key `ADAPTER_MODE`), `lib/errors.ts` (six `CoreErrorCode`s, `HINTS`, `CoreFailure`), `lib/schemas.ts` (`benchReportQuerySchema`), `BenchRow` and `BenchReport` plus the `{ error, hint }` failure arm in `lib/types.ts`, `.farm-live.json`, `.env.example`, zod `^4.1.0` in `package.json`.
- Slice 2, real adapter: done. `lib/bench-score.ts` (`scoreRun`), `lib/adapter-fake.ts`, `lib/adapter-real.ts`, `lib/adapter.ts` as selector only, `GET /api/bench-report` (zod `safeParse` first, optional `?clip=` filter, 400 `invalid_input`, 500 `compute_failed`). The three older routes compile unchanged against the new `ApiResponse` (they only build the `ok: true` arm).
- Slice 3, UI names its source: done. `/notes` passes `report` and the tolerance to `AccuracyBench`, which starts from the server rows in real mode and says in one line who counted them. `/play` has a paragraph with a "Live" badge naming the live microphone, the sample residence and where the notes bench runs.
- Slice 4, test and proof: done (written, not run). `tests/detector.test.ts` has 5 detector cases, 1 determinism case and 3 schema cases. `scripts/proof.ts`, `npm test`, `npm run proof`, `tests` excluded in tsconfig, README "Detector proof" section with both marker pairs.
- Slice 5, contract docs: done. DEMO.md step 7, CLAUDE.md commands and pitfalls, this section.

**Mechanism that went real:** the server side detector bench via `realAdapter.getBenchReport`. The live counter on `/play` (microphone and file upload in `components/drip-listener.tsx`) was already real and stays real in both modes, with no branch on the mode.

**Methods still on seed, by design:** `getResidence` (Ayazağa Student Residence, 10 taps; the Definition of Done needs it as the starting repair list) and `getGridFactors` (live grid data is Phase 4). `getBenchClips` serves the six seed clip specs in both modes.

**Env names in `.farm-live.json`:** none in `requiredEnv` and none in `optionalEnv`, because the real path is server side compute over committed seed specs plus in-browser audio, so it needs no secret or key.

**Decisions:**
- `GuttoraAdapter` stays in `lib/adapter.ts`; `adapter-fake.ts` and `adapter-real.ts` import it as a type only, so there is no runtime import cycle.
- `scoreRun` returns `exact` equal to `pass`, since the bench now passes a clip within 1 drop and with the right state. The browser bench uses the same rule, so server and browser verdicts agree.
- The client bench never imports `lib/config.ts`; `/notes` passes `BENCH_TOLERANCE_DROPS` as a `tolerance` prop.
- The "counted on" date is formatted from UTC parts by hand, so server HTML and hydration never differ by locale.
- `/notes` has no dynamic API, so Next will likely prerender it and run the bench at build time. The source line says "when this page was built" for that reason. `/api/bench-report` reads `req.url`, so it runs per request.
- `CoreFailure` (an `Error` subclass carrying a `CoreErrorCode`) is how `lib/` rethrows a typed `compute_failed`; the route maps it to `{ ok: false, source, error, hint }`.
- `scripts/proof.ts` loads the detector, synth, seed and scoring files with dynamic `import()` inside a try, so a broken import writes "Not run in this build: ..." and still exits 0. It parses both the TAP (`# pass N`) and the spec (`ℹ pass N`) summary lines.

**Failed attempts:** none.

**Files changed:** `lib/config.ts` (new), `lib/errors.ts` (new), `lib/schemas.ts` (new), `lib/bench-score.ts` (new), `lib/adapter-fake.ts` (new), `lib/adapter-real.ts` (new), `lib/adapter.ts`, `lib/types.ts`, `app/api/bench-report/route.ts` (new), `app/notes/page.tsx`, `app/play/page.tsx`, `components/accuracy-bench.tsx`, `tests/detector.test.ts` (new), `scripts/proof.ts` (new), `package.json`, `tsconfig.json`, `.env.example`, `.farm-live.json` (new), `README.md`, `DEMO.md`, `CLAUDE.md`, `HANDOFF.md`, `.farm-commits.json`.

**Commands run:** none, agent has no shell. `npm install`, `npm run build`, `npm test` and `npm run proof` are all unverified. In particular, nobody has confirmed yet that the detector passes all five fixed clips within 1 drop; if a case fails, fix it by reasoning about the clip (never delete the case, never edit `lib/drip-detector.ts` without a field test).

**Manual checklist (human):**
- [ ] Field-test the detector on a real tap at 1 cm to 15 cm: every drop counts, the badge turns green within 10 drops, talking adds no counts, and closing the tap shows "No regular drip. Yearly loss: 0 L." within about 5 seconds.
- [ ] Tune `DEFAULT_CONFIG` in `lib/drip-detector.ts` (`k`, `relative`, `minHz`) only if the field test needs it, then rerun `npm test` and `npm run proof`.
- [ ] Record six team taps (30 seconds each: quiet room, fan, talking, closed tap and two more), hand-count them and add the real table next to the synthetic one.
- [ ] Confirm the team member names and that every member is an eligible student.

**Open questions:**
- Node on the runner must be 22.6 or newer for `--experimental-strip-types` (same question as Phase 1). On Node 23.6 or newer the flag is accepted and does nothing.
- Should `/notes` be `export const dynamic = "force-dynamic"` so the server counts per request rather than at build? The bench takes a few hundred ms per page view on the server; build time looks like the better trade, so it is left static.

**Next best step:** Phase 3. Run the field test from the manual checklist, then the wow polish on `/play` with kit signature 3 (litres figure and bar tween).

**Closing commit:** `faz-2: drip detector proven on the server bench, tests and proof script`

---

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
- `lib/adapter.ts`: `GuttoraAdapter`, `adapterMode()` (from `lib/config.ts`), `getAdapter()`. `lib/adapter-fake.ts` serves seed; `lib/adapter-real.ts` serves seed for the residence and grid factors and counts the bench clips on the server in `getBenchReport()`. Pages and `app/api/*/route.ts` read data only through `lib/adapter.ts`.
- `lib/og-palette.ts`: the four OG card hexes, mirrored from IDENTITY.md for Satori.
- `scripts/seed.ts`: writes `fixtures/seed-snapshot.json` deterministically (`npm run seed`).
- `components/site-nav.tsx`: client nav with `aria-current="page"`.
- `lib/drip-detector.ts`: REAL. Radix-2 FFT, spectral flux on bins above 1 kHz, median + MAD threshold, 120 ms refractory, CV regularity, `detectInBuffer` for files.
- `lib/synth.ts`: REAL. Deterministic synthetic drip recordings for the bench.
- `lib/impact.ts`: REAL. USGS default drop, litres/year, kWh, kg CO2e, number formatting.
- `lib/store.ts`: the repair list store (Phase 3). localStorage key `guttora.repair-list.v1`, versioned shape, in-memory fallback, `addTapOnce` guard. `components/use-repair-list.ts` is the hook over it.
- `lib/repair-store.ts`: `rankOpenTaps` and `repairRequestText` only.
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

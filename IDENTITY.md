# IDENTITY (contract; every later phase obeys this file)

DIRECTION: D10 butter
GROUND: #ffd63d solid-butter
SURFACE: #fff3c4
DEEP: #f5c518
LINE: #141414
INK: #141414
ACCENT: #1c4fd8 royal-blue
ON_ACCENT: #ffd63d
SECOND: none
OK: #1f7a3d
WARN: #8a5a00
BAD: #b3261e
FONT_DISPLAY: F6 Archivo Black (next/font/google: Archivo_Black, weight: ["400"] is required)
FONT_BODY: Archivo (next/font/google: Archivo)
FONT_MONO: none
STRUCTURE: S6 story-scroll
ARCHETYPE: L3 editorial
MOTION: M4 wipe, prefix guttora-
KIT: K2 gsap
RADIUS: sharp
HEADER: solid ground, border-b in LINE, sticky
LOGO_POLICY: brand-mark

## Why

The farm assigned this identity so that no two projects share a look, a route map or an interaction style. The most recent projects it differs from: SafeSpace Hacks - Judges Needed (D11, S1, L4, K1); SLAY HACKS (D18, S5, L2, K7); InnovArt 2027: Art and Technology Hack Day (D16, S2, L1, K3). It is not a suggestion. Tie the product's own nouns to it; do not swap any row for a familiar one.

## Direction: D10 butter

Neo-brutalist: one loud butter-yellow ground, hard black borders, offset shadows.

Surface treatment: 2px solid black borders on every panel and control, hard offset shadows (4px 4px 0 the ink color), zero blur, zero gradients, white panels on the yellow ground, controls shift 2px on press.

Every hex in app/globals.css comes from the key block above. RADIUS sharp means 0 to 0.125rem on every card, panel and control. ON_ACCENT is the text color on an ACCENT fill. The semantic colors (OK, WARN, BAD) mark state only, never brand.

## Structure: S6 story-scroll

One long scroll narrative on the home route with the live product embedded and driven by the chapters.

Route map (name the bracketed parts with the product's own words):
- `/` : 3 to 5 scroll chapters, each changing the state of the same live component with seed data
- `/play` : the free-form tool without the narrative
- `/notes` : method, numbers and sponsor tech as an appendix

Rules:
- the same live component stays on screen while the chapter text changes beside or over it
- a chapter indicator shows progress and lets the reader jump between chapters
- the last chapter hands control to the reader and links to `/play`

## Archetype: L3 editorial (the composition of the home route)

A single centered column at max-w-prose in magazine order: kicker, display headline, standfirst, inline figure, CTA mid-article; numbers appear inside sentences.

MUSTs: one column at every breakpoint; the display voice leads; the CTA appears mid-flow.
Bans: stat tiles; any two-column grid at lg.

## Motion: M4 wipe (the entrance signature)

clip-path inset reveal, cubic-bezier(0.65, 0, 0.35, 1), 600ms. One keyframe block implements it; every keyframe name starts with `guttora-`. A `prefers-reduced-motion: reduce` block disables it.

## Interaction kit: K2 gsap

GSAP with ScrollTrigger: timelines and pinned scroll scenes.

Packages for package.json dependencies: "gsap": "^3.15.1", "@gsap/react": "^2.1.2".

Typical import: `import gsap from "gsap"; import { ScrollTrigger } from "gsap/ScrollTrigger"; import { useGSAP } from "@gsap/react"; gsap.registerPlugin(useGSAP, ScrollTrigger);`

Signature interactions (the scaffold ships the first; all three exist by the end of the frontend phase):
1. a pinned scroll scene: one section pins while a scrubbed timeline plays the product's core transformation (before to after) with seed numbers
2. an intro timeline on first paint: the headline is split into word spans by hand and staggered in, followed by the product frame
3. a figure tween bound to a control: clicking it tweens the displayed seed value and its chart mark together

Rules:
- every GSAP call lives inside `useGSAP(() => { ... }, { scope: ref })` so cleanup is automatic
- wrap motion in `gsap.matchMedia()` and skip it under `(prefers-reduced-motion: reduce)`
- add the packages above to package.json `dependencies` (and `devDependencies` where listed) with exactly these ranges; the runner installs them
- every import of a kit package lives in a component that starts with `"use client"`
- server HTML must be readable with JavaScript off: never server-render content at opacity 0 or off screen; animate from the visible state or on interaction
- honor `prefers-reduced-motion: reduce`: the content and every control stay usable with motion off
- every interaction is driven by the real seed data; a decorative animation with no product meaning does not count as a signature

## Amendments (append-only; later phases add dated lines here, never edit anything above)

// Writes fixtures/seed-snapshot.json from lib/data/seed.ts.
// Deterministic: no clock, no randomness, fixed key order, so two runs write the same bytes.
// Run with: npm run seed (node --experimental-strip-types scripts/seed.ts)

import { mkdirSync, writeFileSync } from "node:fs";
import { benchClips, defaultGridCode, gridFactors, residenceName, storyTapId, taps } from "../lib/data/seed.ts";

const snapshot = {
  residenceName,
  storyTapId,
  defaultGridCode,
  taps: taps.map((t) => ({
    id: t.id,
    label: t.label,
    place: t.place,
    dripsPerMinute: t.dripsPerMinute,
    spoonDrops: t.spoonDrops,
    spoonMl: t.spoonMl,
    heater: t.heater,
    deltaT: t.deltaT,
    cv: t.cv,
    status: t.status,
    measuredAt: t.measuredAt,
    measuredBy: t.measuredBy,
  })),
  gridFactors: gridFactors.map((g) => ({ code: g.code, country: g.country, kgPerKwh: g.kgPerKwh })),
  benchClips: benchClips.map((c) => ({
    id: c.id,
    title: c.title,
    conditions: c.conditions,
    dropsPerMinute: c.dropsPerMinute,
    durationSec: c.durationSec,
    hiss: c.hiss,
    hum: c.hum,
    voice: c.voice,
    hasDrops: c.hasDrops,
  })),
};

const dir = new URL("../fixtures/", import.meta.url);
mkdirSync(dir, { recursive: true });
const file = new URL("seed-snapshot.json", dir);
writeFileSync(file, JSON.stringify(snapshot, null, 2) + "\n", "utf8");
console.log(`seed: wrote fixtures/seed-snapshot.json (${snapshot.taps.length} taps, ${snapshot.gridFactors.length} grid factors, ${snapshot.benchClips.length} bench clips)`);

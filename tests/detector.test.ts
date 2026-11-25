// Pins the drip detector's behavior on five seed bench clips.
// Run with: npm test (node --experimental-strip-types --test tests/detector.test.ts)
// Explicit .ts paths because Node cannot resolve the "@/" alias or bare extensions.

import { test } from "node:test";
import assert from "node:assert/strict";
import { detectInBuffer } from "../lib/drip-detector.ts";
import { synthesizeClip } from "../lib/synth.ts";
import { benchClips } from "../lib/data/seed.ts";
import { scoreRun } from "../lib/bench-score.ts";
import { benchReportQuerySchema } from "../lib/schemas.ts";

// Same value as BENCH_TOLERANCE_DROPS in lib/config.ts, written as a literal here.
const TOLERANCE = 1;

const FIXED_IDS = ["quiet-52", "slow-12", "fan-60", "voice-45", "no-drip"] as const;

function clipById(id: string) {
  const clip = benchClips.find((c) => c.id === id);
  assert.ok(clip, `seed clip ${id} is missing from lib/data/seed.ts`);
  return clip;
}

for (const id of FIXED_IDS) {
  test(`detector passes seed clip ${id} within ${TOLERANCE} drop`, () => {
    const clip = clipById(id);
    const synth = synthesizeClip(clip);
    const { stats } = detectInBuffer(synth.samples, synth.sampleRate);
    const score = scoreRun(
      { hasDrops: clip.hasDrops, trueDrops: synth.trueDrops, counted: stats.count, state: stats.state },
      TOLERANCE
    );
    assert.equal(
      score.pass,
      true,
      `${id}: counted ${stats.count} of ${synth.trueDrops} true drops, state ${stats.state}`
    );
  });
}

test("synthesizing quiet-52 twice gives the same truth and the same count", () => {
  const clip = clipById("quiet-52");
  const a = synthesizeClip(clip);
  const b = synthesizeClip(clip);
  assert.equal(a.trueDrops, b.trueDrops);
  assert.equal(detectInBuffer(a.samples, a.sampleRate).stats.count, detectInBuffer(b.samples, b.sampleRate).stats.count);
});

test("bench report query accepts a seed clip id", () => {
  assert.equal(benchReportQuerySchema.safeParse({ clip: "quiet-52" }).success, true);
});

test("bench report query rejects a path-like clip id", () => {
  assert.equal(benchReportQuerySchema.safeParse({ clip: "../etc" }).success, false);
});

test("bench report query accepts no clip at all", () => {
  assert.equal(benchReportQuerySchema.safeParse({}).success, true);
});

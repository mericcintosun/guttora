// Pure scoring for one bench run. Type-only imports so Node can load this file in
// tests/detector.test.ts and scripts/proof.ts without the "@/" alias.

import type { DripState } from "./drip-detector";

export interface ScoreInput {
  hasDrops: boolean;
  trueDrops: number;
  counted: number;
  state: DripState;
}

export interface ScoreResult {
  /** Same as pass; kept as its own field because the UI calls it "exact within tolerance". */
  exact: boolean;
  pass: boolean;
  errorDrops: number;
}

/**
 * A clip with drops passes when the count is within `tolerance` of the truth and the
 * detector calls it a regular drip. A closed tap passes when at most `tolerance`
 * drops are counted and the state is anything but "regular".
 */
export function scoreRun(input: ScoreInput, tolerance: number): ScoreResult {
  const errorDrops = Math.abs(input.counted - input.trueDrops);
  const pass = input.hasDrops
    ? errorDrops <= tolerance && input.state === "regular"
    : input.counted <= tolerance && input.state !== "regular";
  return { exact: pass, pass, errorDrops };
}

import { fakeAdapter } from "./adapter-fake";
import { realAdapter } from "./adapter-real";
import { ADAPTER_MODE } from "./config";
import type { BenchClip, BenchReport, GridFactor, ResidenceSnapshot } from "./types";

// The adapter seam and the only place that branches on ADAPTER_MODE.
// Pages and API routes read data only through getAdapter(). This is the only file
// that imports lib/adapter-real.ts.

export interface GuttoraAdapter {
  getResidence(): Promise<ResidenceSnapshot>;
  getGridFactors(): Promise<GridFactor[]>;
  getBenchClips(): Promise<BenchClip[]>;
  getBenchReport(): Promise<BenchReport>;
}

export function adapterMode(): "fake" | "real" {
  return ADAPTER_MODE;
}

export function getAdapter(): GuttoraAdapter {
  return ADAPTER_MODE === "real" ? realAdapter : fakeAdapter;
}

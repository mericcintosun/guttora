import { benchClips, gridFactors, residenceName, storyTapId, taps } from "./data/seed";
import type { BenchClip, GridFactor, ResidenceSnapshot } from "./types";

// The adapter seam. Pages and API routes read seed data only through getAdapter(),
// so a shared store can replace the seed without touching any screen.

export interface GuttoraAdapter {
  getResidence(): Promise<ResidenceSnapshot>;
  getGridFactors(): Promise<GridFactor[]>;
  getBenchClips(): Promise<BenchClip[]>;
}

export const fakeAdapter: GuttoraAdapter = {
  async getResidence() {
    return { residenceName, storyTapId, taps: taps.map((t) => ({ ...t })) };
  },
  async getGridFactors() {
    return gridFactors.map((g) => ({ ...g }));
  },
  async getBenchClips() {
    return benchClips.map((c) => ({ ...c }));
  },
};

// Phase 2: shared repair store replaces seed
export const realAdapter: GuttoraAdapter = {
  getResidence: () => fakeAdapter.getResidence(),
  getGridFactors: () => fakeAdapter.getGridFactors(),
  getBenchClips: () => fakeAdapter.getBenchClips(),
};

export function adapterMode(): "fake" | "real" {
  return process.env.ADAPTER_MODE === "real" ? "real" : "fake";
}

export function getAdapter(): GuttoraAdapter {
  return adapterMode() === "real" ? realAdapter : fakeAdapter;
}

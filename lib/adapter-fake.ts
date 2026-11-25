import type { GuttoraAdapter } from "./adapter";
import { benchClips, gridFactors, residenceName, storyTapId, taps } from "./data/seed";

// Seed adapter. Serves the fictional Ayazağa Student Residence, the grid factors and
// the six synthetic bench clip specs. The bench report has every measured field null:
// in this mode the clips are counted in the browser on request.

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
  async getBenchReport() {
    return {
      source: "fake" as const,
      ranAt: null,
      rows: benchClips.map((c) => ({
        id: c.id,
        title: c.title,
        conditions: c.conditions,
        trueDrops: null,
        counted: null,
        state: null,
        ms: null,
        exact: null,
      })),
    };
  },
};

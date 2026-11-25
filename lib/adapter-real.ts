import type { GuttoraAdapter } from "./adapter";
import { fakeAdapter } from "./adapter-fake";
import { scoreRun } from "./bench-score";
import { BENCH_TOLERANCE_DROPS, CORE_LOG_PREFIX } from "./config";
import { benchClips } from "./data/seed";
import { detectInBuffer } from "./drip-detector";
import { CoreFailure } from "./errors";
import { synthesizeClip } from "./synth";
import type { BenchRow } from "./types";

// Real adapter. Only lib/adapter.ts imports this file.
//
// The one mechanism that runs for real here is the drip detector: getBenchReport
// synthesizes each seed bench clip and counts it with the same detectInBuffer the
// browser uses. No network call, no filesystem write.

export const realAdapter: GuttoraAdapter = {
  // Seed by design: the Definition of Done uses the seed residence as the starting
  // repair list, and grid factors stay seed until Phase 4. See HANDOFF.md.
  getResidence: () => fakeAdapter.getResidence(),
  getGridFactors: () => fakeAdapter.getGridFactors(),
  getBenchClips: () => fakeAdapter.getBenchClips(),

  async getBenchReport() {
    try {
      const rows: BenchRow[] = [];
      let totalMs = 0;
      let totalTrue = 0;
      let totalErr = 0;
      for (const clip of benchClips) {
        const t0 = performance.now();
        const synth = synthesizeClip(clip);
        const { stats } = detectInBuffer(synth.samples, synth.sampleRate);
        const ms = Math.round(performance.now() - t0);
        const score = scoreRun(
          { hasDrops: clip.hasDrops, trueDrops: synth.trueDrops, counted: stats.count, state: stats.state },
          BENCH_TOLERANCE_DROPS
        );
        console.log(`${CORE_LOG_PREFIX} bench ${clip.id} counted ${stats.count}/${synth.trueDrops} in ${ms} ms`);
        totalMs += ms;
        totalTrue += synth.trueDrops;
        totalErr += score.errorDrops;
        rows.push({
          id: clip.id,
          title: clip.title,
          conditions: clip.conditions,
          trueDrops: synth.trueDrops,
          counted: stats.count,
          state: stats.state,
          ms,
          exact: score.exact,
        });
      }
      console.log(`${CORE_LOG_PREFIX} bench total ${rows.length} clips, ${totalErr} drops off across ${totalTrue}, ${totalMs} ms`);
      return { source: "real" as const, ranAt: new Date().toISOString(), rows };
    } catch {
      console.log(`${CORE_LOG_PREFIX} bench failed`);
      throw new CoreFailure("compute_failed");
    }
  },
};

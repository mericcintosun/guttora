import { fakeAdapter } from "./adapter-fake";
import { realAdapter } from "./adapter-real";
import { ADAPTER_MODE, CORE_LOG_PREFIX } from "./config";
import type { BenchClip, BenchReport, GridFactor, ResidenceSnapshot } from "./types";

// The adapter seam and the only place that branches on ADAPTER_MODE.
// Pages and API routes read data only through getAdapter(). This is the only file
// that imports lib/adapter-real.ts.
//
// DEMO.md steps, their real path and their fallback:
//
// | Step    | Real path                          | Fallback                                                   |
// | ------- | ---------------------------------- | ---------------------------------------------------------- |
// | 1       | getResidence                       | seed (withFallback below)                                  |
// | 2 and 6 | live microphone                    | file upload in components/drip-listener.tsx                |
// | 3       | spoon measurement                  | USGS 0.25 mL default in mlPerDropFromSpoon (lib/impact.ts) |
// | 4       | getGridFactors                     | seed (withFallback below)                                  |
// | 5       | lib/store.ts localStorage          | in-memory list (memoryList) in lib/store.ts                |
// | 7       | server getBenchReport              | fake seed report, plus the in-browser "Run the bench"      |

export interface GuttoraAdapter {
  getResidence(): Promise<ResidenceSnapshot>;
  getGridFactors(): Promise<GridFactor[]>;
  getBenchClips(): Promise<BenchClip[]>;
  getBenchReport(): Promise<BenchReport>;
}

export function adapterMode(): "fake" | "real" {
  return ADAPTER_MODE;
}

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/**
 * Wraps an adapter so each method falls back to another one when it throws.
 * A failure in one method never takes the others down with it.
 */
export function withFallback(primary: GuttoraAdapter, fallback: GuttoraAdapter): GuttoraAdapter {
  return {
    async getResidence() {
      try {
        return await primary.getResidence();
      } catch (err) {
        console.log(`${CORE_LOG_PREFIX} getResidence fell back to seed: ${messageOf(err)}`);
        return fallback.getResidence();
      }
    },
    async getGridFactors() {
      try {
        return await primary.getGridFactors();
      } catch (err) {
        console.log(`${CORE_LOG_PREFIX} getGridFactors fell back to seed: ${messageOf(err)}`);
        return fallback.getGridFactors();
      }
    },
    async getBenchClips() {
      try {
        return await primary.getBenchClips();
      } catch (err) {
        console.log(`${CORE_LOG_PREFIX} getBenchClips fell back to seed: ${messageOf(err)}`);
        return fallback.getBenchClips();
      }
    },
    async getBenchReport() {
      try {
        return await primary.getBenchReport();
      } catch (err) {
        console.log(`${CORE_LOG_PREFIX} getBenchReport fell back to seed: ${messageOf(err)}`);
        return fallback.getBenchReport();
      }
    },
  };
}

export function getAdapter(): GuttoraAdapter {
  return ADAPTER_MODE === "real" ? withFallback(realAdapter, fakeAdapter) : fakeAdapter;
}

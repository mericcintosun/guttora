// Re-export of the typed core and the seed. `@/lib/data` resolves to this file
// (not the lib/data/ directory), so existing imports keep working.
// New code reads seed values through lib/adapter.ts and types from lib/types.ts.

export type { HeaterKind, TapStatus, Tap, GridFactor, BenchClip, ResidenceSnapshot, ApiResponse } from "./types";
export { residenceName, taps, storyTapId, gridFactors, defaultGridCode, benchClips } from "./data/seed";

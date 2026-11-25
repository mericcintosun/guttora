// Shared types for Guttora. Seed values live in lib/data/seed.ts; pages read them
// through lib/adapter.ts.

export type HeaterKind = "none" | "electric" | "gas";
export type TapStatus = "dripping" | "reported" | "fixed";

export interface Tap {
  id: string;
  label: string;
  place: string;
  /** Drops per minute as counted by the detector. */
  dripsPerMinute: number;
  /** Drops needed to fill the spoon, or null when the USGS default drop size is used. */
  spoonDrops: number | null;
  /** Spoon volume in mL (5 = teaspoon, 15 = tablespoon). */
  spoonMl: number;
  heater: HeaterKind;
  /** Temperature rise of the hot water in kelvin (tap temperature minus inlet). */
  deltaT: number;
  /** Coefficient of variation of the drip intervals; under 0.35 counts as a regular drip. */
  cv: number;
  status: TapStatus;
  measuredAt: string;
  measuredBy: string;
}

export interface GridFactor {
  code: string;
  country: string;
  /** kg CO2e per kWh of electricity, approximate yearly average. */
  kgPerKwh: number;
}

/** Synthetic recordings for the accuracy bench on /notes. Generated in the browser, never downloaded. */
export interface BenchClip {
  id: string;
  title: string;
  conditions: string;
  dropsPerMinute: number;
  durationSec: number;
  /** Amplitude of broadband room noise. */
  hiss: number;
  /** Amplitude of a low fan hum (100 Hz and harmonics). */
  hum: number;
  /** Amplitude of a voice-like source under 1 kHz with slow syllable envelope. */
  voice: number;
  /** When false, the clip contains no drops at all. */
  hasDrops: boolean;
}

/** One residence and its taps, as served by the adapter. */
export interface ResidenceSnapshot {
  residenceName: string;
  storyTapId: string;
  taps: Tap[];
}

export type ApiResponse<T> =
  | { ok: true; source: "fake" | "real"; data: T }
  | { ok: false; source: "fake" | "real"; error: string };

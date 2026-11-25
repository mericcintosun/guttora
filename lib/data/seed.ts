// Seed data for Guttora. Every tap below is a plausible record from one student
// residence (fictional, written by us), measured with the bench on /play.
// Plain TypeScript with type-only imports so `node --experimental-strip-types` can run it.

import type { BenchClip, GridFactor, Tap } from "../types";

export const residenceName = "Ayazağa Student Residence";

export const taps: Tap[] = [
  { id: "c214-shower", label: "C-214 shower mixer", place: "Block C, floor 2", dripsPerMinute: 52, spoonDrops: 16, spoonMl: 5, heater: "electric", deltaT: 35, cv: 0.08, status: "dripping", measuredAt: "2026-11-18", measuredBy: "Elif Kaya" },
  { id: "laundry-utility", label: "Laundry room utility tap", place: "Basement", dripsPerMinute: 96, spoonDrops: 14, spoonMl: 5, heater: "none", deltaT: 0, cv: 0.15, status: "reported", measuredAt: "2026-11-19", measuredBy: "Mert Aydın" },
  { id: "a-kitchen", label: "Shared kitchen sink", place: "Block A, ground floor", dripsPerMinute: 74, spoonDrops: 15, spoonMl: 5, heater: "gas", deltaT: 30, cv: 0.12, status: "dripping", measuredAt: "2026-11-19", measuredBy: "Zeynep Arslan" },
  { id: "b107-basin", label: "B-107 bathroom basin", place: "Block B, floor 1", dripsPerMinute: 38, spoonDrops: 19, spoonMl: 5, heater: "none", deltaT: 0, cv: 0.1, status: "dripping", measuredAt: "2026-11-20", measuredBy: "Can Yıldız" },
  { id: "gym-basin-2", label: "Gym changing room basin 2", place: "Sports hall", dripsPerMinute: 61, spoonDrops: null, spoonMl: 5, heater: "electric", deltaT: 30, cv: 0.09, status: "reported", measuredAt: "2026-11-20", measuredBy: "Deniz Şahin" },
  { id: "c118-shower", label: "C-118 shower head", place: "Block C, floor 1", dripsPerMinute: 23, spoonDrops: 17, spoonMl: 5, heater: "electric", deltaT: 35, cv: 0.18, status: "dripping", measuredAt: "2026-11-21", measuredBy: "Elif Kaya" },
  { id: "a305-basin", label: "A-305 basin", place: "Block A, floor 3", dripsPerMinute: 12, spoonDrops: null, spoonMl: 5, heater: "none", deltaT: 0, cv: 0.21, status: "dripping", measuredAt: "2026-11-21", measuredBy: "Selin Çelik" },
  { id: "courtyard-garden", label: "Courtyard garden tap", place: "Courtyard", dripsPerMinute: 8, spoonDrops: 12, spoonMl: 5, heater: "none", deltaT: 0, cv: 0.27, status: "dripping", measuredAt: "2026-11-22", measuredBy: "Burak Öztürk" },
  { id: "d012-kitchenette", label: "D-012 kitchenette", place: "Block D, ground floor", dripsPerMinute: 44, spoonDrops: 16, spoonMl: 5, heater: "gas", deltaT: 30, cv: 0.11, status: "fixed", measuredAt: "2026-11-14", measuredBy: "Mert Aydın" },
  { id: "b220-basin", label: "B-220 basin", place: "Block B, floor 2", dripsPerMinute: 29, spoonDrops: 18, spoonMl: 5, heater: "electric", deltaT: 35, cv: 0.13, status: "reported", measuredAt: "2026-11-23", measuredBy: "Ayşe Demir" },
];

/** The tap the home story follows from first drop to repair ticket. */
export const storyTapId = "c214-shower";

// Approximate 2023 grid averages, rounded. Check against Ember's yearly
// electricity data (ember-energy.org) before quoting them in a submission.
export const gridFactors: GridFactor[] = [
  { code: "TR", country: "Türkiye", kgPerKwh: 0.44 },
  { code: "DE", country: "Germany", kgPerKwh: 0.38 },
  { code: "GB", country: "United Kingdom", kgPerKwh: 0.21 },
  { code: "US", country: "United States", kgPerKwh: 0.37 },
  { code: "IN", country: "India", kgPerKwh: 0.71 },
  { code: "FR", country: "France", kgPerKwh: 0.06 },
  { code: "PL", country: "Poland", kgPerKwh: 0.66 },
];

export const defaultGridCode = "TR";

export const benchClips: BenchClip[] = [
  { id: "quiet-52", title: "Quiet bathroom", conditions: "52 drops a minute, light hiss", dropsPerMinute: 52, durationSec: 30, hiss: 0.004, hum: 0, voice: 0, hasDrops: true },
  { id: "slow-12", title: "Slow basin", conditions: "12 drops a minute, light hiss", dropsPerMinute: 12, durationSec: 30, hiss: 0.004, hum: 0, voice: 0, hasDrops: true },
  { id: "fast-110", title: "Fast shower", conditions: "110 drops a minute", dropsPerMinute: 110, durationSec: 30, hiss: 0.004, hum: 0, voice: 0, hasDrops: true },
  { id: "fan-60", title: "Extractor fan on", conditions: "60 drops a minute under a 100 Hz hum", dropsPerMinute: 60, durationSec: 30, hiss: 0.006, hum: 0.12, voice: 0, hasDrops: true },
  { id: "voice-45", title: "Someone talking", conditions: "45 drops a minute under a voice", dropsPerMinute: 45, durationSec: 30, hiss: 0.004, hum: 0, voice: 0.15, hasDrops: true },
  { id: "no-drip", title: "Tap closed", conditions: "fan and voice, no drops", dropsPerMinute: 0, durationSec: 30, hiss: 0.006, hum: 0.12, voice: 0.15, hasDrops: false },
];

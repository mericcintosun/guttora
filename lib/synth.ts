import type { BenchClip } from "@/lib/data";

// Deterministic synthetic drip recordings for the accuracy bench. They let anyone
// re-run the detector in the browser with a known ground truth. They do not replace
// real recordings: see the field recording plan in HANDOFF.md.

export const BENCH_SAMPLE_RATE = 22050;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFrom(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}

export interface SynthClip {
  samples: Float32Array;
  sampleRate: number;
  trueDrops: number;
}

export function synthesizeClip(clip: BenchClip): SynthClip {
  const sr = BENCH_SAMPLE_RATE;
  const n = Math.floor(clip.durationSec * sr);
  const out = new Float32Array(n);
  const rand = mulberry32(seedFrom(clip.id));

  // Room hiss and fan hum.
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    let v = clip.hiss * (rand() * 2 - 1);
    if (clip.hum > 0) {
      v += clip.hum * (Math.sin(2 * Math.PI * 100 * t) + 0.5 * Math.sin(2 * Math.PI * 200 * t) + 0.25 * Math.sin(2 * Math.PI * 300 * t));
    }
    out[i] = v;
  }

  // Voice-like source: 140 Hz harmonics under 1 kHz, smooth syllable envelope.
  if (clip.voice > 0) {
    let t = 0.3;
    while (t < clip.durationSec - 0.4) {
      const len = 0.18 + rand() * 0.12;
      const f0 = 120 + rand() * 40;
      const start = Math.floor(t * sr);
      const end = Math.min(n, Math.floor((t + len) * sr));
      for (let i = start; i < end; i++) {
        const local = (i - start) / (end - start);
        const env = 0.5 - 0.5 * Math.cos(2 * Math.PI * local);
        const tt = i / sr;
        let s = 0;
        for (let h = 1; h <= 6; h++) s += Math.sin(2 * Math.PI * f0 * h * tt) / h;
        out[i] += clip.voice * env * s * 0.5;
      }
      t += len + 0.05 + rand() * 0.25;
    }
  }

  // Drops: a short broadband click plus a decaying ping between 1.8 and 3.2 kHz.
  let trueDrops = 0;
  if (clip.hasDrops && clip.dropsPerMinute > 0) {
    const interval = 60 / clip.dropsPerMinute;
    let t = 0.4;
    while (t < clip.durationSec - 0.1) {
      const start = Math.floor(t * sr);
      const f = 1800 + rand() * 1400;
      const len = Math.floor(0.06 * sr);
      for (let j = 0; j < len && start + j < n; j++) {
        const tt = j / sr;
        const click = 0.35 * Math.exp(-tt / 0.002) * (rand() * 2 - 1);
        const ping = 0.25 * Math.exp(-tt / 0.012) * Math.sin(2 * Math.PI * f * tt);
        out[start + j] += click + ping;
      }
      trueDrops++;
      t += interval * (1 + 0.08 * (rand() - 0.5));
    }
  }

  return { samples: out, sampleRate: sr, trueDrops };
}

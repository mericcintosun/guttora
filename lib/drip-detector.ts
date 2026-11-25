// Drip onset detector. Pure TypeScript, no dependencies, runs the same way on live
// microphone chunks and on a decoded audio file.
//
// Pipeline per frame: Hann window -> FFT -> log-compressed magnitude -> positive
// spectral flux over bins above minHz -> adaptive threshold (rolling median plus a
// multiple of the median absolute deviation) -> refractory gate. Regularity is the
// coefficient of variation of the recent inter-drop intervals.

export interface DetectorConfig {
  fftSize: number;
  hop: number;
  minHz: number;
  /** Threshold = median * (1 + relative) + k * MAD + floor. */
  relative: number;
  k: number;
  floor: number;
  medianWindow: number;
  refractoryMs: number;
  cvLimit: number;
}

export const DEFAULT_CONFIG: DetectorConfig = {
  fftSize: 1024,
  hop: 512,
  minHz: 1000,
  relative: 0.5,
  k: 4,
  floor: 1,
  medianWindow: 43,
  refractoryMs: 120,
  cvLimit: 0.35,
};

export type DripState = "idle" | "warming" | "regular" | "irregular" | "quiet";

export interface DripStats {
  count: number;
  elapsedSec: number;
  dripsPerMinute: number | null;
  cv: number | null;
  state: DripState;
}

/** In-place iterative radix-2 FFT. re and im must have a power-of-two length. */
export function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k;
        const b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci;
        const ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr;
        im[b] = im[a] - ti;
        re[a] += tr;
        im[a] += ti;
        const nr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = nr;
      }
    }
  }
}

function median(sorted: number[]): number {
  const m = sorted.length >> 1;
  return sorted.length % 2 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2;
}

export class DripDetector {
  readonly sampleRate: number;
  readonly config: DetectorConfig;
  private buf: Float32Array;
  private filled = 0;
  private frameStart = 0;
  private window: Float64Array;
  private re: Float64Array;
  private im: Float64Array;
  private prev: Float64Array;
  private kMin: number;
  private history: number[] = [];
  private lastOnset = -Infinity;
  private samplesSeen = 0;
  /** Onset times in seconds since the detector started. */
  readonly onsets: number[] = [];
  /** Latest flux divided by the current threshold (1 = on the line). */
  lastRatio = 0;

  constructor(sampleRate: number, config: Partial<DetectorConfig> = {}) {
    this.sampleRate = sampleRate;
    this.config = { ...DEFAULT_CONFIG, ...config };
    const n = this.config.fftSize;
    this.buf = new Float32Array(n);
    this.window = new Float64Array(n);
    for (let i = 0; i < n; i++) this.window[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
    this.re = new Float64Array(n);
    this.im = new Float64Array(n);
    this.prev = new Float64Array(n / 2);
    this.kMin = Math.max(1, Math.ceil((this.config.minHz * n) / sampleRate));
  }

  /** Feed raw samples. Returns the onset times (seconds) found in this chunk. */
  push(chunk: Float32Array): number[] {
    const found: number[] = [];
    const { fftSize, hop } = this.config;
    let i = 0;
    this.samplesSeen += chunk.length;
    while (i < chunk.length) {
      const n = Math.min(fftSize - this.filled, chunk.length - i);
      this.buf.set(chunk.subarray(i, i + n), this.filled);
      this.filled += n;
      i += n;
      if (this.filled === fftSize) {
        const t = this.frame();
        if (t !== null) found.push(t);
        this.buf.copyWithin(0, hop);
        this.filled = fftSize - hop;
        this.frameStart += hop;
      }
    }
    return found;
  }

  private frame(): number | null {
    const { fftSize, medianWindow, relative, k, floor, refractoryMs } = this.config;
    const half = fftSize / 2;
    for (let i = 0; i < fftSize; i++) {
      this.re[i] = this.buf[i] * this.window[i];
      this.im[i] = 0;
    }
    fft(this.re, this.im);
    let flux = 0;
    for (let b = this.kMin; b < half; b++) {
      const mag = Math.log1p(100 * Math.hypot(this.re[b], this.im[b]));
      const d = mag - this.prev[b];
      if (d > 0) flux += d;
      this.prev[b] = mag;
    }
    const t = (this.frameStart + fftSize / 2) / this.sampleRate;
    let onset: number | null = null;
    if (this.history.length >= 8) {
      const sorted = [...this.history].sort((a, b) => a - b);
      const med = median(sorted);
      const mad = median(sorted.map((v) => Math.abs(v - med)).sort((a, b) => a - b));
      const threshold = med * (1 + relative) + k * mad + floor;
      this.lastRatio = flux / threshold;
      if (flux > threshold && (t - this.lastOnset) * 1000 >= refractoryMs) {
        this.lastOnset = t;
        this.onsets.push(t);
        onset = t;
      }
    }
    this.history.push(flux);
    if (this.history.length > medianWindow) this.history.shift();
    return onset;
  }

  stats(nowSec: number = this.samplesSeen / this.sampleRate): DripStats {
    const count = this.onsets.length;
    if (nowSec < 0.2) return { count, elapsedSec: nowSec, dripsPerMinute: null, cv: null, state: "idle" };
    const recent = this.onsets.slice(-17);
    const intervals: number[] = [];
    for (let i = 1; i < recent.length; i++) intervals.push(recent[i] - recent[i - 1]);
    if (intervals.length < 4) {
      const quietFor = nowSec - (count ? this.onsets[count - 1] : 0);
      return { count, elapsedSec: nowSec, dripsPerMinute: null, cv: null, state: quietFor > 8 ? "quiet" : "warming" };
    }
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const sd = Math.sqrt(intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / intervals.length);
    const cv = sd / mean;
    const sinceLast = nowSec - this.onsets[count - 1];
    if (sinceLast > Math.max(4, 3 * mean)) {
      return { count, elapsedSec: nowSec, dripsPerMinute: 0, cv, state: "quiet" };
    }
    return {
      count,
      elapsedSec: nowSec,
      dripsPerMinute: 60 / mean,
      cv,
      state: cv < this.config.cvLimit ? "regular" : "irregular",
    };
  }
}

/** Run the detector over a whole decoded clip. */
export function detectInBuffer(samples: Float32Array, sampleRate: number): { stats: DripStats; onsets: number[] } {
  const det = new DripDetector(sampleRate);
  const step = 4096;
  for (let i = 0; i < samples.length; i += step) det.push(samples.subarray(i, Math.min(samples.length, i + step)));
  return { stats: det.stats(samples.length / sampleRate), onsets: [...det.onsets] };
}

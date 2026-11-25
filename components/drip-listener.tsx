"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DripDetector, detectInBuffer, type DripStats } from "@/lib/drip-detector";

const BARS = 160;

interface Bar {
  peak: number;
  mark: boolean;
}

type Mode = "idle" | "starting" | "live" | "file" | "decoding" | "error";

function stateBadge(stats: DripStats | null) {
  if (!stats || stats.state === "idle") return <Badge variant="outline">Mic off</Badge>;
  if (stats.state === "warming") return <Badge variant="secondary">Counting</Badge>;
  if (stats.state === "regular") return <Badge variant="ok">Regular drip</Badge>;
  if (stats.state === "irregular") return <Badge variant="warn">Noisy room</Badge>;
  return <Badge variant="outline">No regular drip</Badge>;
}

function stateSentence(stats: DripStats | null): string {
  if (!stats || stats.state === "idle") return "Press Start listening and set the phone within a hand's width of the drip.";
  if (stats.state === "warming") return "Counting. Five drops are enough to estimate a rate.";
  if (stats.state === "regular")
    return `${Math.round(stats.dripsPerMinute ?? 0)} drops a minute. The gaps vary by ${Math.round((stats.cv ?? 0) * 100)}%, steady enough to count as one dripping tap.`;
  if (stats.state === "irregular")
    return `The gaps vary by ${Math.round((stats.cv ?? 0) * 100)}%, over the 35% limit. Something else in the room is making sharp sounds. Move closer or turn off the fan.`;
  return "No regular drip. Yearly loss: 0 L. If the tap is closed tight, that is the right answer.";
}

export function DripListener({ onStats }: { onStats: (s: DripStats | null) => void }) {
  const [mode, setMode] = useState<Mode>("idle");
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DripStats | null>(null);
  const [bars, setBars] = useState<Bar[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const procRef = useRef<ScriptProcessorNode | null>(null);
  const detRef = useRef<DripDetector | null>(null);
  const envRef = useRef<Bar[]>([]);
  const timerRef = useRef<number | null>(null);
  const onStatsRef = useRef(onStats);
  onStatsRef.current = onStats;

  const teardown = () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    procRef.current?.disconnect();
    procRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void ctxRef.current?.close().catch(() => undefined);
    ctxRef.current = null;
  };

  useEffect(() => teardown, []);

  // Live path: microphone -> 1 kHz high-pass -> 512-sample chunks -> DripDetector.
  // TODO: move the chunking into an AudioWorklet; ScriptProcessorNode is deprecated
  // but is still the most widely supported option on phones today.
  const start = async () => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setMode("error");
      setError("This browser cannot open the microphone. Upload a recording below instead.");
      return;
    }
    setMode("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const ctx = new AudioContext();
      await ctx.resume();
      const src = ctx.createMediaStreamSource(stream);
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 1000;
      const proc = ctx.createScriptProcessor(512, 1, 1);
      const det = new DripDetector(ctx.sampleRate);
      envRef.current = [];
      proc.onaudioprocess = (e) => {
        const data = e.inputBuffer.getChannelData(0);
        let peak = 0;
        for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
        const found = det.push(data);
        envRef.current.push({ peak, mark: found.length > 0 });
        if (envRef.current.length > BARS) envRef.current.shift();
      };
      src.connect(hp);
      hp.connect(proc);
      proc.connect(ctx.destination);
      ctxRef.current = ctx;
      streamRef.current = stream;
      procRef.current = proc;
      detRef.current = det;
      setFileName(null);
      setMode("live");
      timerRef.current = window.setInterval(() => {
        const s = det.stats();
        setStats(s);
        setBars([...envRef.current]);
        onStatsRef.current(s);
      }, 80);
    } catch (err) {
      teardown();
      setMode("error");
      setError(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone permission was refused. Allow it in the address bar, or upload a recording below."
          : "The microphone could not start. Upload a recording below instead."
      );
    }
  };

  const stop = () => {
    teardown();
    setMode("idle");
  };

  // File path: decode a recording and run the same detector over every sample.
  const analyseFile = async (file: File) => {
    teardown();
    setError(null);
    setMode("decoding");
    setFileName(file.name);
    try {
      const ctx = new AudioContext();
      const audio = await ctx.decodeAudioData(await file.arrayBuffer());
      void ctx.close();
      const samples = audio.getChannelData(0);
      const { stats: s, onsets } = detectInBuffer(samples, audio.sampleRate);
      const per = Math.max(1, Math.floor(samples.length / BARS));
      const out: Bar[] = [];
      for (let b = 0; b < BARS; b++) {
        let peak = 0;
        for (let i = b * per; i < Math.min(samples.length, (b + 1) * per); i++) peak = Math.max(peak, Math.abs(samples[i]));
        out.push({ peak, mark: false });
      }
      onsets.forEach((t) => {
        const idx = Math.min(BARS - 1, Math.floor((t / audio.duration) * BARS));
        out[idx].mark = true;
      });
      setBars(out);
      setStats(s);
      onStats(s);
      setMode("file");
    } catch {
      setMode("error");
      setError("That file could not be decoded. Try a WAV, MP3 or M4A recording.");
    }
  };

  const maxPeak = Math.max(0.02, ...bars.map((b) => b.peak));
  const elapsed = stats ? Math.floor(stats.elapsedSec) : 0;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle>Drip counter</CardTitle>
        {stateBadge(stats)}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <p className="font-display text-6xl leading-none tabular-nums" aria-live="polite">
            {stats?.count ?? 0}
            <span className="ml-2 font-sans text-base font-bold">drops</span>
          </p>
          <p className="min-w-0 truncate text-sm tabular-nums" title={fileName ?? undefined}>
            {mode === "live" ? `listening ${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}` : fileName ? fileName : ""}
          </p>
        </div>

        <div className="rounded-sm border-2 border-border bg-background p-2">
          <svg viewBox={`0 0 ${BARS * 2} 60`} className="block h-20 w-full" role="img" aria-label="Recent sound level with a blue mark on every counted drop">
            {bars.length === 0 ? (
              <rect x={0} y={29} width={BARS * 2} height={2} className="fill-foreground/40" />
            ) : (
              bars.map((b, i) => {
                const h = Math.max(1, (b.peak / maxPeak) * 50);
                return (
                  <rect
                    key={i}
                    x={i * 2}
                    y={b.mark ? 0 : 30 - h / 2}
                    width={b.mark ? 2 : 1.2}
                    height={b.mark ? 60 : h}
                    className={b.mark ? "fill-primary" : "fill-foreground/50"}
                  />
                );
              })
            )}
          </svg>
        </div>

        <p className={cn("leading-relaxed", stats?.state === "irregular" && "font-bold text-warn")}>{stateSentence(stats)}</p>

        {error ? (
          <p role="alert" className="rounded-sm border-2 border-border bg-bad px-3 py-2 text-sm font-bold text-card">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          {mode === "live" ? (
            <Button onClick={stop} variant="outline">
              Stop
            </Button>
          ) : (
            <Button onClick={start} disabled={mode === "starting" || mode === "decoding"}>
              {mode === "starting" ? "Opening microphone" : "Start listening"}
            </Button>
          )}
          <label className="flex min-w-0 flex-1 items-center gap-2 text-sm font-bold">
            <span className="shrink-0">Or a recording</span>
            <Input
              type="file"
              accept="audio/*"
              className="h-11 py-1.5"
              disabled={mode === "decoding"}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void analyseFile(f);
              }}
            />
          </label>
        </div>
        {mode === "decoding" ? <p className="text-sm font-bold">Decoding and counting the recording.</p> : null}
      </CardContent>
    </Card>
  );
}

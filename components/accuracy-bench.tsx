"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { detectInBuffer, type DripState } from "@/lib/drip-detector";
import { synthesizeClip } from "@/lib/synth";
import type { BenchClip } from "@/lib/types";

interface Row {
  trueDrops: number;
  counted: number;
  state: DripState;
  ms: number;
}

const STATE_LABEL: Record<DripState, string> = {
  idle: "idle",
  warming: "too few drops",
  regular: "regular drip",
  irregular: "noisy room",
  quiet: "no regular drip",
};

export function AccuracyBench({ clips }: { clips: BenchClip[] }) {
  const benchClips = clips;
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [running, setRunning] = useState(false);

  if (benchClips.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="font-bold">No bench clips loaded.</p>
        </CardContent>
      </Card>
    );
  }

  // Clips are synthesized and analysed one per animation frame so the page stays responsive.
  const run = () => {
    setRunning(true);
    setRows({});
    let i = 0;
    const next = () => {
      const clip = benchClips[i];
      if (!clip) {
        setRunning(false);
        return;
      }
      const t0 = performance.now();
      const synth = synthesizeClip(clip);
      const { stats } = detectInBuffer(synth.samples, synth.sampleRate);
      const ms = performance.now() - t0;
      setRows((r) => ({ ...r, [clip.id]: { trueDrops: synth.trueDrops, counted: stats.count, state: stats.state, ms } }));
      i++;
      window.requestAnimationFrame(next);
    };
    window.requestAnimationFrame(next);
  };

  const done = Object.values(rows);
  const totalTrue = done.reduce((a, r) => a + r.trueDrops, 0);
  const totalErr = done.reduce((a, r) => a + Math.abs(r.counted - r.trueDrops), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Synthetic detector bench, re-run it yourself</CardTitle>
        <p className="text-sm leading-relaxed">
          Six 30 second clips are generated in your browser with a known number of drops, plus hiss, a 100 Hz fan hum or a
          voice-like sound under 1 kHz. The same detector used on the bench counts them.
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b-2 border-border bg-secondary">
            <tr>
              <th className="px-4 py-2">Clip</th>
              <th className="px-4 py-2">True drops</th>
              <th className="px-4 py-2">Counted</th>
              <th className="px-4 py-2">Verdict</th>
            </tr>
          </thead>
          <tbody>
            {benchClips.map((c) => {
              const r = rows[c.id];
              const exact = r && r.counted === r.trueDrops;
              return (
                <tr key={c.id} className="border-b border-border/30 last:border-b-0">
                  <td className="px-4 py-2">
                    <span className="font-bold">{c.title}</span>
                    <br />
                    <span className="text-xs">{c.conditions}</span>
                  </td>
                  <td className="px-4 py-2 tabular-nums">{r ? r.trueDrops : "not run"}</td>
                  <td className="px-4 py-2 tabular-nums">{r ? r.counted : running ? "counting" : "not run"}</td>
                  <td className="px-4 py-2">
                    {r ? <Badge variant={exact ? "ok" : "warn"}>{STATE_LABEL[r.state]}</Badge> : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
      <CardFooter className="flex-wrap justify-between">
        <Button onClick={run} disabled={running}>
          {running ? "Running" : done.length ? "Run again" : "Run the bench"}
        </Button>
        {done.length === benchClips.length ? (
          <p className="text-sm">
            {totalErr === 0
              ? `All ${totalTrue} synthetic drops counted exactly, and the closed tap reads as no regular drip.`
              : `${totalErr} counting errors across ${totalTrue} synthetic drops.`}
          </p>
        ) : null}
      </CardFooter>
    </Card>
  );
}

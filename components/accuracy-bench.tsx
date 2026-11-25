"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { scoreRun } from "@/lib/bench-score";
import { detectInBuffer, type DripState } from "@/lib/drip-detector";
import { synthesizeClip } from "@/lib/synth";
import type { BenchClip, BenchReport } from "@/lib/types";

interface Row {
  trueDrops: number;
  counted: number;
  state: DripState;
  ms: number;
  exact: boolean;
}

type CountedBy = "server" | "browser" | "none";

const STATE_LABEL: Record<DripState, string> = {
  idle: "idle",
  warming: "too few drops",
  regular: "regular drip",
  irregular: "noisy room",
  quiet: "no regular drip",
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Same text on server and client, so hydration never differs by locale or time zone. */
function formatRanAt(iso: string | null): string {
  if (!iso) return "at build time";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "at build time";
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function rowsFromReport(report: BenchReport): Record<string, Row> {
  const out: Record<string, Row> = {};
  if (report.source !== "real") return out;
  for (const r of report.rows) {
    if (r.trueDrops === null || r.counted === null || r.state === null || r.ms === null || r.exact === null) continue;
    out[r.id] = { trueDrops: r.trueDrops, counted: r.counted, state: r.state, ms: r.ms, exact: r.exact };
  }
  return out;
}

export function AccuracyBench({
  clips,
  report,
  tolerance,
}: {
  clips: BenchClip[];
  report: BenchReport;
  /** BENCH_TOLERANCE_DROPS, passed in by the server page so this client file never reads config. */
  tolerance: number;
}) {
  const benchClips = clips;
  const [rows, setRows] = useState<Record<string, Row>>(() => rowsFromReport(report));
  const [countedBy, setCountedBy] = useState<CountedBy>(() =>
    Object.keys(rowsFromReport(report)).length > 0 ? "server" : "none"
  );
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
        setCountedBy("browser");
        return;
      }
      const t0 = performance.now();
      const synth = synthesizeClip(clip);
      const { stats } = detectInBuffer(synth.samples, synth.sampleRate);
      const ms = performance.now() - t0;
      const { exact } = scoreRun(
        { hasDrops: clip.hasDrops, trueDrops: synth.trueDrops, counted: stats.count, state: stats.state },
        tolerance
      );
      setRows((r) => ({
        ...r,
        [clip.id]: { trueDrops: synth.trueDrops, counted: stats.count, state: stats.state, ms, exact },
      }));
      i++;
      window.requestAnimationFrame(next);
    };
    window.requestAnimationFrame(next);
  };

  const done = Object.values(rows);
  const totalTrue = done.reduce((a, r) => a + r.trueDrops, 0);
  const totalErr = done.reduce((a, r) => a + Math.abs(r.counted - r.trueDrops), 0);
  const passed = done.filter((r) => r.exact).length;

  let sourceLine: string;
  if (running) {
    sourceLine = "Counting in your browser now.";
  } else if (countedBy === "browser") {
    sourceLine = "Counted in your browser just now.";
  } else if (report.source === "real" && countedBy === "server") {
    sourceLine = `Counted on the server by the same detector when this page was built, ${formatRanAt(report.ranAt)}. Press Run again to count in your browser.`;
  } else {
    sourceLine =
      "Sample mode: these synthetic clips have not been counted yet. Press Run the bench to count them in your browser.";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Synthetic detector bench, re-run it yourself</CardTitle>
        <p className="text-sm leading-relaxed">
          Six 30 second clips are generated with a known number of drops, plus hiss, a 100 Hz fan hum or a voice-like sound
          under 1 kHz. The same detector used on the bench counts them. A clip passes when the count is within {tolerance} drop
          of the truth and the verdict is right.
        </p>
        <p className="text-sm font-bold leading-relaxed" aria-live="polite">
          {sourceLine}
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
                    {r ? <Badge variant={r.exact ? "ok" : "warn"}>{STATE_LABEL[r.state]}</Badge> : null}
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
            {totalErr === 0 && passed === done.length
              ? `All ${totalTrue} synthetic drops counted exactly, and the closed tap reads as no regular drip.`
              : `${passed} of ${done.length} clips passed, with ${totalErr} counting errors across ${totalTrue} synthetic drops.`}
          </p>
        ) : null}
      </CardFooter>
    </Card>
  );
}

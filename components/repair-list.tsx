"use client";

import { useState } from "react";
import { EmptyState } from "@/components/route-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { fmt, tapImpact } from "@/lib/impact";
import { rankOpenTaps, repairRequestText } from "@/lib/repair-store";
import type { Tap } from "@/lib/types";

interface RepairListProps {
  list: Tap[];
  gridCode: string;
  residenceName: string;
  onChange: (next: Tap[]) => void;
  onReset: () => void;
  highlightId?: string | null;
}

export function RepairList({ list, gridCode, residenceName, onChange, onReset, highlightId }: RepairListProps) {
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const [copyPending, setCopyPending] = useState(false);
  const [manualText, setManualText] = useState<string | null>(null);
  const ranked = rankOpenTaps(list, gridCode);
  const fixed = list.filter((t) => t.status === "fixed").map((tap) => ({ tap, ...tapImpact(tap, gridCode) }));
  const openLitres = ranked.reduce((a, r) => a + r.litres, 0);
  const openCo2 = ranked.reduce((a, r) => a + r.kgCo2e, 0);
  const savedLitres = fixed.reduce((a, r) => a + r.litres, 0);

  const update = (id: string, patch: Partial<Tap> | null) =>
    onChange(patch === null ? list.filter((t) => t.id !== id) : list.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  // copyPending follows the clipboard promise itself, so a second click while the
  // browser is still writing does nothing.
  const copy = async () => {
    if (copyPending) return;
    const text = repairRequestText(list, gridCode, residenceName);
    setCopyPending(true);
    try {
      await navigator.clipboard.writeText(text);
      setCopied("done");
      setManualText(null);
    } catch {
      setCopied("failed");
      setManualText(text);
    } finally {
      setCopyPending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repair list, {residenceName}</CardTitle>
        <p className="text-sm leading-relaxed">
          {ranked.length} open taps lose about {fmt(openLitres)} litres a year
          {openCo2 > 0 ? ` and ${fmt(openCo2)} kg CO2e of water heating` : ""}. Fixed so far: {fixed.length}, saving{" "}
          {fmt(savedLitres)} litres a year.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {ranked.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No open taps on the list."
              body="Measure a tap with the counter above and add it here, or bring back the ten sample taps."
              action={
                <>
                  <Button onClick={onReset}>Restore the sample list</Button>
                  <Button asChild variant="outline">
                    <a href="#listen">Start listening</a>
                  </Button>
                </>
              }
            />
          </div>
        ) : (
          <ol>
            {ranked.map((r, i) => (
              <li
                key={r.tap.id}
                className={`flex flex-col gap-2 border-b-2 border-border px-5 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between ${
                  r.tap.id === highlightId ? "bg-secondary" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="break-words font-bold" title={r.tap.label}>
                    {i + 1}. {r.tap.label}{" "}
                    <Badge variant={r.tap.status === "reported" ? "secondary" : "outline"} className="ml-1 align-middle">
                      {r.tap.status}
                    </Badge>
                  </p>
                  <p className="break-words text-sm">
                    {r.tap.place}. {r.tap.dripsPerMinute} drops a minute, {fmt(r.litres)} L a year
                    {r.kwh > 0 ? `, ${fmt(r.kwh)} kWh, ${fmt(r.kgCo2e)} kg CO2e` : ""}.{" "}
                    {r.tap.spoonDrops ? `Drop measured with a spoon.` : "Default drop size."}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {r.tap.status === "dripping" ? (
                    <Button size="sm" variant="outline" onClick={() => update(r.tap.id, { status: "reported" })}>
                      Mark reported
                    </Button>
                  ) : null}
                  <Button size="sm" variant="secondary" onClick={() => update(r.tap.id, { status: "fixed" })}>
                    Fixed
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => update(r.tap.id, null)} aria-label={`Remove ${r.tap.label}`}>
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        )}
        {fixed.length > 0 ? (
          <div className="border-t-2 border-border bg-background px-5 py-3 text-sm">
            <p className="font-bold">Fixed</p>
            <ul className="mt-1 space-y-1">
              {fixed.map((f) => (
                <li key={f.tap.id}>
                  {f.tap.label}: {fmt(f.litres)} L a year no longer wasted.
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex-wrap">
        <Button onClick={copy} disabled={ranked.length === 0 || copyPending}>
          {copyPending
            ? "Copying"
            : copied === "done"
              ? "Copied to clipboard"
              : copied === "failed"
                ? "Copy blocked by the browser"
                : "Copy repair request"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setCopied("idle");
            setManualText(null);
            onReset();
          }}
        >
          Reset to sample residence
        </Button>
        {manualText !== null ? (
          <label className="block w-full text-sm font-bold">
            Copy this text by hand.
            <textarea
              readOnly
              value={manualText}
              rows={8}
              onFocus={(e) => e.currentTarget.select()}
              className="mt-1 block w-full rounded-sm border-2 border-input bg-card px-3 py-2 text-sm font-normal text-foreground shadow-hard-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        ) : null}
      </CardFooter>
    </Card>
  );
}

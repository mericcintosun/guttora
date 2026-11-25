"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { residenceName, type Tap } from "@/lib/data";
import { fmt, tapImpact } from "@/lib/impact";
import { rankOpenTaps, repairRequestText } from "@/lib/repair-store";

interface RepairListProps {
  list: Tap[];
  gridCode: string;
  onChange: (next: Tap[]) => void;
  onReset: () => void;
  highlightId?: string | null;
}

export function RepairList({ list, gridCode, onChange, onReset, highlightId }: RepairListProps) {
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const ranked = rankOpenTaps(list, gridCode);
  const fixed = list.filter((t) => t.status === "fixed").map((tap) => ({ tap, ...tapImpact(tap, gridCode) }));
  const openLitres = ranked.reduce((a, r) => a + r.litres, 0);
  const openCo2 = ranked.reduce((a, r) => a + r.kgCo2e, 0);
  const savedLitres = fixed.reduce((a, r) => a + r.litres, 0);

  const update = (id: string, patch: Partial<Tap> | null) =>
    onChange(patch === null ? list.filter((t) => t.id !== id) : list.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(repairRequestText(list, gridCode, residenceName));
      setCopied("done");
    } catch {
      setCopied("failed");
    }
    window.setTimeout(() => setCopied("idle"), 2500);
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
          <p className="p-5 text-sm">No open taps. Measure one with the counter above and add it here.</p>
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
                  <p className="font-bold">
                    {i + 1}. {r.tap.label}{" "}
                    <Badge variant={r.tap.status === "reported" ? "secondary" : "outline"} className="ml-1 align-middle">
                      {r.tap.status}
                    </Badge>
                  </p>
                  <p className="text-sm">
                    {r.tap.place}. {r.tap.dripsPerMinute} drops a minute, {fmt(r.litres)} L a year
                    {r.kwh > 0 ? `, ${fmt(r.kwh)} kWh, ${fmt(r.kgCo2e)} kg CO2e` : ""}.{" "}
                    {r.tap.spoonDrops ? `Drop measured with a spoon.` : "Default drop size."}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
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
        <Button onClick={copy} disabled={ranked.length === 0}>
          {copied === "done" ? "Copied to clipboard" : copied === "failed" ? "Copy blocked by the browser" : "Copy repair request"}
        </Button>
        <Button variant="ghost" onClick={onReset}>
          Reset to sample residence
        </Button>
      </CardFooter>
    </Card>
  );
}

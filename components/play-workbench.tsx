"use client";

import { useState } from "react";
import { DripListener } from "@/components/drip-listener";
import { ImpactFigure, type ImpactFigureState } from "@/components/impact-figure";
import { RepairList } from "@/components/repair-list";
import { RouteSkeleton } from "@/components/route-states";
import { useRepairList } from "@/components/use-repair-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { DripStats } from "@/lib/drip-detector";
import type { GridFactor, HeaterKind, ResidenceSnapshot, Tap } from "@/lib/types";
import { computeImpact, DEFAULT_ML_PER_DROP, fmt, gridKgPerKwh, heaters, mlPerDropFromSpoon } from "@/lib/impact";

const HEATER_OPTIONS: Array<{ value: HeaterKind; label: string }> = [
  { value: "none", label: "Cold" },
  { value: "electric", label: "Hot, electric" },
  { value: "gas", label: "Hot, gas" },
];

export interface PlayWorkbenchProps {
  /** The seed residence, served by lib/adapter.ts through app/play/page.tsx. */
  residence: ResidenceSnapshot;
  gridFactors: GridFactor[];
  defaultGridCode: string;
  /** True when /play was opened with ?reset=1 (validated by playQuerySchema in the page). */
  resetOnLoad: boolean;
}

export function PlayWorkbench({ residence, gridFactors, defaultGridCode, resetOnLoad }: PlayWorkbenchProps) {
  const taps = residence.taps;
  const [stats, setStats] = useState<DripStats | null>(null);
  const [manualRate, setManualRate] = useState("");
  const [spoonMl, setSpoonMl] = useState(5);
  const [spoonStart, setSpoonStart] = useState<number | null>(null);
  const [spoonDrops, setSpoonDrops] = useState<number | null>(null);
  const [heater, setHeater] = useState<HeaterKind>("none");
  const [deltaT, setDeltaT] = useState("35");
  const [gridCode, setGridCode] = useState(defaultGridCode);
  const [label, setLabel] = useState("");
  const [place, setPlace] = useState("");
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [addedKey, setAddedKey] = useState<string | null>(null);
  const repair = useRepairList(taps, { resetOnLoad });
  // The list is the worked example while any seed tap is still on it; once the reader
  // has replaced them all, it is their own list and the sample note goes away.
  const seedIds = new Set(taps.map((t) => t.id));
  const showsSample = repair.list.some((t) => seedIds.has(t.id));

  // Which rate feeds the impact: the live detector when it has a verdict, else the typed rate.
  const typed = Number(manualRate.replace(",", "."));
  const liveRate =
    stats?.state === "regular" ? stats.dripsPerMinute ?? 0 : stats?.state === "quiet" ? 0 : null;
  const rate = liveRate ?? (typed > 0 ? typed : null);
  const rateSource = liveRate !== null ? "counted by ear" : typed > 0 ? "typed in" : null;

  // DEMO step 3: the spoon measurement is the real path; with no spoon, mlPerDropFromSpoon
  // falls back to the USGS 0.25 mL default.
  const mlPerDrop = mlPerDropFromSpoon(spoonMl, spoonDrops);
  const dT = Math.max(0, Number(deltaT) || 0);
  const impact =
    rate !== null
      ? computeImpact({ dripsPerMinute: rate, mlPerDrop, measuredDrop: spoonDrops !== null, heater, deltaT: dT, gridCode })
      : null;
  const count = stats?.count ?? 0;
  const figureState: ImpactFigureState = stats?.state ?? (typed > 0 ? "typed" : "idle");

  // One measurement, one row: the same inputs and the same drop count give the same key,
  // so a double click or a repeat press adds nothing (addTapOnce in lib/store.ts).
  const measurementKey = [
    label.trim(),
    place.trim(),
    rate === null ? "none" : (Math.round(rate * 10) / 10).toFixed(1),
    mlPerDrop.toFixed(3),
    heater,
    heater === "none" ? 0 : dT,
    stats?.count ?? "typed",
  ].join("|");
  const justAdded = addedKey === measurementKey;

  const add = () => {
    if (rate === null || rate <= 0 || justAdded) return;
    const id = `tap-${Date.now()}`;
    const entry: Tap = {
      id,
      label: label.trim() || "Unnamed tap",
      place: place.trim() || "Not given",
      dripsPerMinute: Math.round(rate),
      spoonDrops,
      spoonMl,
      heater,
      deltaT: heater === "none" ? 0 : dT,
      // Finite and non-negative, so storedTapSchema accepts the row after a reload.
      cv: typeof stats?.cv === "number" && Number.isFinite(stats.cv) ? Math.max(0, stats.cv) : 0,
      status: "dripping",
      measuredAt: new Date().toISOString().slice(0, 10),
      measuredBy: "You",
    };
    const added = repair.add(entry, measurementKey);
    // Mark the key either way: a refused add means this measurement is already listed.
    setAddedKey(measurementKey);
    if (added) setLastAdded(id);
  };

  return (
    <div className="space-y-8">
      <div id="listen" className="scroll-mt-24">
        <DripListener onStats={setStats} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spoon calibration</CardTitle>
          <p className="text-sm">
            Hold a spoon under the tap while the counter runs. Press start, then press full when it brims.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[5, 15].map((ml) => (
              <Button key={ml} size="sm" variant={spoonMl === ml ? "default" : "outline"} aria-pressed={spoonMl === ml} onClick={() => setSpoonMl(ml)}>
                {ml === 5 ? "Teaspoon, 5 mL" : "Tablespoon, 15 mL"}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" disabled={!stats || stats.state === "idle"} onClick={() => { setSpoonStart(count); setSpoonDrops(null); }}>
              {spoonStart !== null && spoonDrops === null ? `Spoon started at drop ${spoonStart}` : "Start spoon"}
            </Button>
            <Button
              disabled={spoonStart === null || count - spoonStart < 3}
              onClick={() => {
                if (spoonStart === null) return;
                setSpoonDrops(count - spoonStart);
                setSpoonStart(null);
              }}
            >
              Spoon is full
            </Button>
          </div>
          <label className="block text-sm font-bold">
            Or type how many drops filled it
            <Input
              inputMode="numeric"
              className="mt-1 max-w-40"
              value={spoonDrops ?? ""}
              placeholder="16"
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                setSpoonDrops(Number.isFinite(n) && n > 0 ? n : null);
              }}
            />
          </label>
          <p className="leading-relaxed">
            {spoonDrops
              ? `${spoonDrops} drops filled ${spoonMl} mL, so this tap's drop is ${fmt(mlPerDrop, 2)} mL (the USGS default is ${fmt(DEFAULT_ML_PER_DROP, 2)} mL).`
              : `No spoon yet, so Guttora uses the USGS default of ${fmt(DEFAULT_ML_PER_DROP, 2)} mL a drop.`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Yearly impact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* DEMO step 3: kit signature 3, the litres figure and its bar tween together. */}
          <ImpactFigure
            count={count}
            state={figureState}
            litres={impact?.litres ?? null}
            kwh={heater !== "none" && impact ? impact.kwh : null}
            kgCo2e={heater !== "none" && impact ? impact.kgCo2e : null}
            mlPerDrop={mlPerDrop}
          />

          {liveRate === null ? (
            <label className="block text-sm font-bold">
              No live count yet. Type a rate in drops a minute
              <Input inputMode="decimal" className="mt-1 max-w-40" value={manualRate} placeholder="52" onChange={(e) => setManualRate(e.target.value)} />
            </label>
          ) : null}

          <div className="flex flex-wrap gap-2" aria-label="Water temperature">
            {HEATER_OPTIONS.map((o) => (
              <Button key={o.value} size="sm" variant={heater === o.value ? "default" : "outline"} aria-pressed={heater === o.value} onClick={() => setHeater(o.value)}>
                {o.label}
              </Button>
            ))}
          </div>

          {heater !== "none" ? (
            <div className="space-y-3">
              <label className="block text-sm font-bold">
                Temperature rise in &deg;C (hot tap minus cold inlet)
                <Input inputMode="numeric" className="mt-1 max-w-40" value={deltaT} onChange={(e) => setDeltaT(e.target.value)} />
              </label>
              {heater === "electric" ? (
                <div className="flex flex-wrap gap-1.5" aria-label="Electricity grid">
                  {gridFactors.map((g) => (
                    <Button key={g.code} size="sm" variant={gridCode === g.code ? "default" : "outline"} aria-pressed={gridCode === g.code} onClick={() => setGridCode(g.code)}>
                      {g.country}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {impact && rate !== null ? (
            <div className="rounded-sm border-2 border-border bg-background p-4 leading-relaxed">
              {rate === 0 ? (
                <p className="font-bold">No regular drip, so the yearly loss is 0 L.</p>
              ) : (
                <>
                  <p>
                    At <strong>{fmt(rate)}</strong> drops a minute ({rateSource}) and <strong>{fmt(mlPerDrop, 2)} mL</strong> a drop,
                    this tap loses <strong className="text-primary">{fmt(impact.litres)} litres</strong> a year, about{" "}
                    {fmt(impact.litres / 365)} litres a day.
                  </p>
                  {heater !== "none" ? (
                    <p className="mt-2">
                      Heating that water by {dT} &deg;C in a {Math.round(heaters[heater].efficiency * 100)}% efficient{" "}
                      {heaters[heater].label.toLowerCase()} takes <strong>{fmt(impact.kwh)} kWh</strong> a year, roughly{" "}
                      <strong>{fmt(impact.kgCo2e)} kg CO2e</strong>
                      {heater === "electric" ? ` at ${gridKgPerKwh(gridCode)} kg per kWh` : " from burning gas"}.
                    </p>
                  ) : null}
                </>
              )}
            </div>
          ) : null}

          <p className="text-xs leading-relaxed">
            Sources: USGS drip calculator (15,140 drops a gallon), specific heat of water 4.186 kJ/kg K, UK DESNZ 2023 gas
            factor, approximate national grid averages. Details on the notes page.
          </p>

          <div className="grid gap-2 border-t-2 border-border pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="text-sm font-bold">
              Tap name
              <Input className="mt-1" value={label} placeholder="C-214 shower mixer" onChange={(e) => setLabel(e.target.value)} />
            </label>
            <label className="text-sm font-bold">
              Where
              <Input className="mt-1" value={place} placeholder="Block C, floor 2" onChange={(e) => setPlace(e.target.value)} />
            </label>
            <Button onClick={add} disabled={rate === null || rate <= 0 || addedKey === measurementKey}>
              {justAdded ? "Added to the list" : "Add to repair list"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {repair.status === "loading" ? (
        <RouteSkeleton label="Loading your repair list." />
      ) : (
        <RepairList
          list={repair.list}
          gridCode={gridCode}
          onChange={repair.setList}
          onReset={() => {
            repair.reset();
            setAddedKey(null);
            setLastAdded(null);
          }}
          residenceName={residence.residenceName}
          showsSample={showsSample}
          highlightId={lastAdded}
        />
      )}
    </div>
  );
}

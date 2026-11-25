import { taps, type Tap } from "@/lib/data";
import { fmt, tapImpact } from "@/lib/impact";

const KEY = "guttora.repair-list.v1";

// Repair list persistence adapter. Today it is the browser's localStorage, seeded
// with the residence's taps on first load.
// TODO: swap localStorage for a shared store (for example a Supabase table keyed by
// residence) so every resident of a block edits the same list.
export function loadRepairList(): Tap[] {
  if (typeof window === "undefined") return taps;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return taps;
    const parsed = JSON.parse(raw) as Tap[];
    return Array.isArray(parsed) ? parsed : taps;
  } catch {
    return taps;
  }
}

export function saveRepairList(list: Tap[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Private mode or full storage: the list still works for this session.
  }
}

export function resetRepairList(): Tap[] {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  return taps;
}

/** Open taps ranked by yearly water loss, worst first. */
export function rankOpenTaps(list: Tap[], gridCode: string): Array<{ tap: Tap; litres: number; kwh: number; kgCo2e: number }> {
  return list
    .filter((t) => t.status !== "fixed")
    .map((tap) => ({ tap, ...tapImpact(tap, gridCode) }))
    .sort((a, b) => b.litres - a.litres);
}

/** Plain text a resident can paste into a maintenance ticket. */
export function repairRequestText(list: Tap[], gridCode: string, residence: string): string {
  const ranked = rankOpenTaps(list, gridCode);
  const total = ranked.reduce((a, r) => a + r.litres, 0);
  const lines = ranked.map(
    (r, i) =>
      `${i + 1}. ${r.tap.label} (${r.tap.place}): ${Math.round(r.tap.dripsPerMinute)} drops/min, about ${fmt(r.litres)} L a year` +
      (r.kwh > 0 ? `, ${fmt(r.kwh)} kWh and ${fmt(r.kgCo2e)} kg CO2e for hot water` : "") +
      `. Measured ${r.tap.measuredAt}.`
  );
  return [
    `Repair request: dripping taps at ${residence}`,
    "",
    `${ranked.length} taps are dripping. Together they waste about ${fmt(total)} litres of water a year.`,
    "Ranked by yearly loss, please fix in this order:",
    ...lines,
    "",
    "Counts measured by ear with Guttora (guttora.vercel.app). Drop size from a 5 mL spoon where noted, otherwise the USGS 0.25 mL default.",
  ].join("\n");
}

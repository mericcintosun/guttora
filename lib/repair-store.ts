import { fmt, tapImpact } from "@/lib/impact";
import type { Tap } from "@/lib/types";

// Ranking and ticket text for the repair list. Persistence lives in lib/store.ts.

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

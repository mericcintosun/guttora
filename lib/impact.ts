import { gridFactors, defaultGridCode, type HeaterKind, type Tap } from "@/lib/data";

// USGS drip calculator assumption: 15,140 drops per US gallon (about 0.25 mL a drop).
export const USGS_DROPS_PER_GALLON = 15140;
export const LITRES_PER_GALLON = 3.78541;
export const DEFAULT_ML_PER_DROP = (LITRES_PER_GALLON * 1000) / USGS_DROPS_PER_GALLON;
export const MINUTES_PER_YEAR = 525600;
/** Specific heat of water, kJ per kg per kelvin. */
export const WATER_KJ_PER_KG_K = 4.186;

export const heaters: Record<Exclude<HeaterKind, "none">, { label: string; efficiency: number; fuelKgPerKwh: number | null }> = {
  // Electric storage heater: emissions follow the chosen country grid.
  electric: { label: "Electric boiler", efficiency: 0.95, fuelKgPerKwh: null },
  // Natural gas boiler: about 0.183 kg CO2e per kWh of gas burned (UK DESNZ 2023 factor, gross CV).
  gas: { label: "Gas boiler", efficiency: 0.85, fuelKgPerKwh: 0.183 },
};

export function mlPerDropFromSpoon(spoonMl: number, drops: number | null): number {
  if (!drops || drops <= 0) return DEFAULT_ML_PER_DROP;
  return spoonMl / drops;
}

export function annualLitres(dripsPerMinute: number, mlPerDrop: number): number {
  return (dripsPerMinute * MINUTES_PER_YEAR * mlPerDrop) / 1000;
}

/** Energy needed to heat the lost water, at the heater (kWh). */
export function heatingKwh(litres: number, deltaT: number, efficiency: number): number {
  const kJ = litres * WATER_KJ_PER_KG_K * deltaT; // 1 L of water is about 1 kg
  return kJ / 3600 / efficiency;
}

export function gridKgPerKwh(code: string): number {
  return (gridFactors.find((g) => g.code === code) ?? gridFactors.find((g) => g.code === defaultGridCode)!).kgPerKwh;
}

export interface Impact {
  mlPerDrop: number;
  measuredDrop: boolean;
  litres: number;
  kwh: number;
  kgCo2e: number;
}

export interface ImpactInput {
  dripsPerMinute: number;
  mlPerDrop: number;
  measuredDrop: boolean;
  heater: HeaterKind;
  deltaT: number;
  gridCode: string;
}

export function computeImpact(input: ImpactInput): Impact {
  const litres = annualLitres(input.dripsPerMinute, input.mlPerDrop);
  if (input.heater === "none") {
    return { mlPerDrop: input.mlPerDrop, measuredDrop: input.measuredDrop, litres, kwh: 0, kgCo2e: 0 };
  }
  const h = heaters[input.heater];
  const kwh = heatingKwh(litres, input.deltaT, h.efficiency);
  const factor = h.fuelKgPerKwh ?? gridKgPerKwh(input.gridCode);
  return { mlPerDrop: input.mlPerDrop, measuredDrop: input.measuredDrop, litres, kwh, kgCo2e: kwh * factor };
}

export function tapImpact(tap: Tap, gridCode: string = defaultGridCode): Impact {
  return computeImpact({
    dripsPerMinute: tap.dripsPerMinute,
    mlPerDrop: mlPerDropFromSpoon(tap.spoonMl, tap.spoonDrops),
    measuredDrop: tap.spoonDrops !== null,
    heater: tap.heater,
    deltaT: tap.deltaT,
    gridCode,
  });
}

const fmt0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const fmt2 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function fmt(n: number, digits: 0 | 2 = 0): string {
  return digits === 2 ? fmt2.format(n) : fmt0.format(n);
}

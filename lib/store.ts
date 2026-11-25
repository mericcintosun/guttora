import { SEED_VERSION } from "@/lib/data/seed";
import { storedRepairListSchema, type StoredRepairList } from "@/lib/schemas";
import type { Tap } from "@/lib/types";

// The one store wrapper for the repair list (DEMO step 5), and the only file that
// touches window.localStorage. The list lives on this phone only: nothing is stored on
// the server, which suits Vercel serverless. See HANDOFF.md "Phase 3 result".
//
// Shape on disk: { v: 1, seedVersion, taps }. A missing key, broken JSON, a failed
// parse or a seed version mismatch all fall back to the seed list. There is no
// migration because there is no database; bumping SEED_VERSION retires old lists.
//
// Fallback: when localStorage throws (private mode, full quota, blocked storage) the
// list lives in memoryList for the rest of this page session.

export const REPAIR_LIST_KEY = "guttora.repair-list.v1";

let memoryList: Tap[] | null = null;

/** Measurement keys already added in this page session (double click guard). */
const seenMeasurementKeys = new Set<string>();

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  // Reading window.localStorage itself can throw when storage is blocked.
  return window.localStorage;
}

export function readRepairList(seed: Tap[]): Tap[] {
  let raw: string | null;
  try {
    const s = storage();
    if (!s) return seed;
    raw = s.getItem(REPAIR_LIST_KEY);
  } catch {
    return memoryList ?? seed;
  }
  if (!raw) return seed;
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return seed;
  }
  const parsed = storedRepairListSchema.safeParse(json);
  if (!parsed.success) return seed;
  if (parsed.data.seedVersion !== SEED_VERSION) return seed;
  return parsed.data.taps;
}

export function writeRepairList(taps: Tap[]): void {
  const payload: StoredRepairList = { v: 1, seedVersion: SEED_VERSION, taps };
  try {
    const s = storage();
    if (!s) return;
    s.setItem(REPAIR_LIST_KEY, JSON.stringify(payload));
  } catch {
    memoryList = taps;
  }
}

export function clearRepairList(): void {
  memoryList = null;
  seenMeasurementKeys.clear();
  try {
    storage()?.removeItem(REPAIR_LIST_KEY);
  } catch {
    // Storage is blocked; memoryList is already cleared.
  }
}

/**
 * Adds a tap at the top of the list once. A second add with the same measurement key,
 * or with an id already in the list, is refused and the list comes back unchanged.
 */
export function addTapOnce(list: Tap[], tap: Tap, measurementKey: string): { list: Tap[]; added: boolean } {
  if (seenMeasurementKeys.has(measurementKey)) return { list, added: false };
  if (list.some((t) => t.id === tap.id)) return { list, added: false };
  seenMeasurementKeys.add(measurementKey);
  return { list: [tap, ...list], added: true };
}

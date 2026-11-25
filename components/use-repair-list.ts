"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { addTapOnce, clearRepairList, readRepairList, writeRepairList } from "@/lib/store";
import type { Tap } from "@/lib/types";

export type RepairListStatus = "loading" | "ready";

/**
 * The one repair list hook for /play. One effect reads the store once after mount
 * (clearing it first when the page was opened with ?reset=1). No fetch, no chained effects.
 */
export function useRepairList(seed: Tap[], opts: { resetOnLoad: boolean }) {
  const [list, setListState] = useState<Tap[]>(seed);
  const [status, setStatus] = useState<RepairListStatus>("loading");
  const listRef = useRef<Tap[]>(seed);
  const loadedRef = useRef(false);
  const { resetOnLoad } = opts;

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    if (resetOnLoad) {
      clearRepairList();
      window.history.replaceState(null, "", "/play");
    }
    const stored = readRepairList(seed);
    listRef.current = stored;
    setListState(stored);
    setStatus("ready");
  }, [seed, resetOnLoad]);

  const setList = useCallback((next: Tap[]) => {
    listRef.current = next;
    setListState(next);
    writeRepairList(next);
  }, []);

  /** Adds the tap once per measurement key. Returns false when the add was refused. */
  const add = useCallback(
    (tap: Tap, measurementKey: string): boolean => {
      const result = addTapOnce(listRef.current, tap, measurementKey);
      if (result.added) setList(result.list);
      return result.added;
    },
    [setList]
  );

  const reset = useCallback(() => {
    clearRepairList();
    listRef.current = seed;
    setListState(seed);
  }, [seed]);

  return { list, status, setList, add, reset };
}

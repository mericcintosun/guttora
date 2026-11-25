"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { annualLitres, DEFAULT_ML_PER_DROP, fmt } from "@/lib/impact";

gsap.registerPlugin(useGSAP);

export type ImpactFigureState = "idle" | "warming" | "regular" | "irregular" | "quiet" | "typed";

export interface ImpactFigureProps {
  count: number;
  state: ImpactFigureState;
  litres: number | null;
  kwh: number | null;
  kgCo2e: number | null;
  mlPerDrop: number;
}

/** The full bar: one drip a second at the USGS drop size. */
const FULL_BAR_LITRES = annualLitres(60, DEFAULT_ML_PER_DROP);

const MOTION = "(prefers-reduced-motion: no-preference)";
const REDUCE = "(prefers-reduced-motion: reduce)";

type Branch = "error" | "loading" | "empty" | "zero" | "figure";

function branchOf(state: ImpactFigureState, litres: number | null): Branch {
  if (state === "irregular" || (litres !== null && !Number.isFinite(litres))) return "error";
  if (state === "warming") return "loading";
  if (litres === null || state === "idle") return "empty";
  if (state === "quiet" || litres === 0) return "zero";
  return "figure";
}

interface Shown {
  litres: number;
  ratio: number;
  kwh: number;
  co2: number;
}

type MM = ReturnType<typeof gsap.matchMedia>;

// Kit signature 3 (K2 gsap): the yearly litres figure and its bar tween together from
// the previous value whenever the rate or the drop size changes, and the drop mark
// flashes on every counted drop. React always renders the final numbers, so server
// HTML and a JavaScript-off page show the true value; GSAP only animates toward it.
export function ImpactFigure({ count, state, litres, kwh, kgCo2e, mlPerDrop }: ImpactFigureProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const litresRef = useRef<HTMLSpanElement>(null);
  const kwhRef = useRef<HTMLElement>(null);
  const co2Ref = useRef<HTMLElement>(null);
  const shownRef = useRef<Shown>({ litres: 0, ratio: 0, kwh: 0, co2: 0 });
  const prevCountRef = useRef<number>(count);
  const figureMmRef = useRef<MM | null>(null);
  const markMmRef = useRef<MM | null>(null);

  const branch = branchOf(state, litres);
  const showFigure = branch === "figure" && litres !== null;
  const showEnergy = showFigure && kwh !== null && kgCo2e !== null;
  const target: Shown = {
    litres: showFigure ? litres : 0,
    ratio: showFigure ? Math.min(1, Math.max(0, litres / FULL_BAR_LITRES)) : 0,
    kwh: showEnergy ? kwh : 0,
    co2: showEnergy ? kgCo2e : 0,
  };

  // Figure and bar: one timeline from the last shown value to the new one.
  useGSAP(
    () => {
      // Snapshot what is on screen first, then drop the previous run (its listeners and
      // its tween). The new timeline starts from that snapshot, so the climb never jumps back.
      const from: Shown = { ...shownRef.current };
      const to: Shown = { ...target };
      figureMmRef.current?.revert();
      const mm = gsap.matchMedia();
      figureMmRef.current = mm;

      const write = (v: Shown) => {
        if (litresRef.current) litresRef.current.textContent = fmt(v.litres);
        if (kwhRef.current) kwhRef.current.textContent = fmt(v.kwh);
        if (co2Ref.current) co2Ref.current.textContent = fmt(v.co2);
        shownRef.current = { ...v };
      };

      mm.add(MOTION, () => {
        const proxy: Shown = { ...from };
        write(proxy);
        const tl = gsap.timeline({ defaults: { duration: 0.9, ease: "power2.out" } });
        if (barRef.current) tl.fromTo(barRef.current, { scaleX: from.ratio }, { scaleX: to.ratio }, 0);
        tl.to(proxy, { ...to, onUpdate: () => write(proxy) }, 0);
      });

      // Reduced motion: the final values, set at once, no tween.
      mm.add(REDUCE, () => {
        const proxy: Shown = { ...from };
        gsap.set(proxy, { ...to });
        if (barRef.current) gsap.set(barRef.current, { scaleX: to.ratio });
        write(proxy);
      });
    },
    { scope: rootRef, dependencies: [target.litres, target.ratio, target.kwh, target.co2, branch] }
  );

  // Drop mark: a short scale flash on every new counted drop.
  useGSAP(
    () => {
      const prev = prevCountRef.current;
      prevCountRef.current = count;
      if (count <= prev || !markRef.current) return;
      markMmRef.current?.revert();
      const mm = gsap.matchMedia();
      markMmRef.current = mm;
      const mark = markRef.current;
      mm.add(MOTION, () => {
        gsap.fromTo(mark, { scale: 1.4 }, { scale: 1, duration: 0.25, ease: "power2.out" });
      });
      // Reduced motion: no flash, the mark stays at its resting size.
      mm.add(REDUCE, () => {
        gsap.set(mark, { scale: 1 });
      });
    },
    { scope: rootRef, dependencies: [count] }
  );

  return (
    <div ref={rootRef} className="space-y-4 rounded-sm border-2 border-border bg-background p-4 shadow-hard-sm">
      <div className="flex items-center gap-3">
        <span ref={markRef} aria-hidden="true" className="inline-block h-5 w-5 shrink-0 rounded-sm border-2 border-border bg-primary" />
        <p className="text-sm font-bold">
          {count === 1 ? "1 drop counted so far." : `${count} drops counted so far.`} The blue mark flashes on every one.
        </p>
      </div>

      {showFigure ? (
        <div className="space-y-2 leading-relaxed">
          <p className="font-display text-2xl leading-tight sm:text-3xl">
            This tap loses{" "}
            <span ref={litresRef} className="tabular-nums text-primary">
              {fmt(target.litres)}
            </span>{" "}
            litres a year.
          </p>
          <p className="text-sm">Counted at {fmt(mlPerDrop, 2)} mL a drop.</p>
          {showEnergy ? (
            <p>
              Heating that water takes{" "}
              <strong ref={kwhRef} className="tabular-nums">
                {fmt(target.kwh)}
              </strong>{" "}
              kWh a year, about{" "}
              <strong ref={co2Ref} className="tabular-nums">
                {fmt(target.co2)}
              </strong>{" "}
              kg CO2e.
            </p>
          ) : null}
        </div>
      ) : branch === "error" ? (
        <p className="font-bold text-warn leading-relaxed">
          The room is too noisy for a steady rate, so there is no yearly figure. Move closer or turn off the fan.
        </p>
      ) : branch === "loading" ? (
        <p className="leading-relaxed">Counting. The yearly figure appears after five drops.</p>
      ) : branch === "zero" ? (
        <p className="font-bold leading-relaxed">No regular drip. Yearly loss: 0 L.</p>
      ) : (
        <p className="leading-relaxed">
          No rate yet. Start listening, upload a recording or type a rate, and the litres figure and its bar fill here.
        </p>
      )}

      <div>
        <div
          className="h-6 w-full overflow-hidden border-2 border-border bg-card"
          role="img"
          aria-label={`Yearly loss bar, ${Math.round(target.ratio * 100)}% of one drip a second`}
        >
          <div ref={barRef} className="h-full origin-left bg-primary" style={{ transform: `scaleX(${target.ratio})` }} />
        </div>
        <p className="mt-2 text-xs leading-relaxed">
          The full bar is one drip a second at the USGS drop size, about {fmt(FULL_BAR_LITRES)} litres a year.
        </p>
      </div>
    </div>
  );
}

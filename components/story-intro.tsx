"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// The headline, split into words by hand so each one can wipe in on its own.
const HEADLINE = ["A", "dripping", "tap", "tells", "you", "how", "much", "it", "wastes.", "You", "just", "have", "to", "listen."];

const MOTION = "(prefers-reduced-motion: no-preference)";
const REDUCE = "(prefers-reduced-motion: reduce)";

// M4 wipe curve. GSAP's power2.inOut is the cubic in-out polynomial, which
// cubic-bezier(0.65, 0, 0.35, 1) approximates, so no extra ease plugin is needed.
const WIPE_EASE = "power2.inOut";

export interface StoryIntroProps {
  kicker: string;
  standfirst: string;
  /** The scene-1 figure; it wipes in after the headline words. */
  children: ReactNode;
}

// Kit signature 2 (K2 gsap): on first paint the headline words wipe in one after
// another, then the product frame below them. Server HTML shows every word and the
// frame at full visibility; GSAP only animates from a clipped state on the client,
// and under reduced motion nothing tweens at all.
export function StoryIntro({ kicker, standfirst, children }: StoryIntroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION, () => {
        const tl = gsap.timeline({ defaults: { duration: 0.6, ease: WIPE_EASE } });
        tl.fromTo(".guttora-word", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", stagger: 0.06, clearProps: "clipPath" });
        if (frameRef.current) {
          tl.fromTo(frameRef.current, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", clearProps: "clipPath" }, "-=0.2");
        }
      });

      // Reduced motion: no tween. Clear any clip a previous run may have left.
      mm.add(REDUCE, () => {
        gsap.set(".guttora-word", { clearProps: "clipPath" });
        if (frameRef.current) gsap.set(frameRef.current, { clearProps: "clipPath" });
      });

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <header ref={rootRef} className="space-y-5">
      <p className="text-xs font-bold uppercase tracking-[0.2em]">{kicker}</p>
      <h1 className="font-display text-4xl sm:text-6xl">
        {HEADLINE.map((word, i) => (
          <span key={`${word}-${i}`}>
            <span className="guttora-word inline-block">{word}</span>
            {i < HEADLINE.length - 1 ? " " : null}
          </span>
        ))}
      </h1>
      <p className="text-lg leading-relaxed sm:text-xl">{standfirst}</p>
      <div ref={frameRef}>{children}</div>
    </header>
  );
}

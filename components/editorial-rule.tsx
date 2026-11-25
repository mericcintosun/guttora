"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const MOTION = "(prefers-reduced-motion: no-preference)";
const REDUCE = "(prefers-reduced-motion: reduce)";

// A ruled line before a section head. It wipes in left to right (M4 axis) when it
// scrolls into view; server HTML, JavaScript off and reduced motion show it whole.
export function EditorialRule({ className }: { className?: string }) {
  const ref = useRef<HTMLHRElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION, () => {
        gsap.fromTo(
          el,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 0.6,
            ease: "power2.inOut",
            clearProps: "clipPath",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          }
        );
      });

      mm.add(REDUCE, () => {
        gsap.set(el, { clearProps: "clipPath" });
      });

      return () => mm.revert();
    },
    { scope: ref }
  );

  return <hr ref={ref} className={cn("my-12 border-t-2 border-border", className)} />;
}

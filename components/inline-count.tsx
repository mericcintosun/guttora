"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { fmt } from "@/lib/impact";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const MOTION = "(prefers-reduced-motion: no-preference)";
const REDUCE = "(prefers-reduced-motion: reduce)";

// An oversized number that sits inside a sentence. Server HTML holds the final value;
// with motion allowed it counts up from 0 once, when it scrolls into view.
export function InlineCount({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const write = (v: number) => {
        el.textContent = fmt(v);
      };
      const mm = gsap.matchMedia();

      mm.add(MOTION, () => {
        const proxy = { v: 0 };
        write(0);
        gsap.fromTo(
          proxy,
          { v: 0 },
          {
            v: value,
            duration: 1.4,
            ease: "power2.out",
            immediateRender: false,
            onUpdate: () => write(proxy.v),
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          }
        );
        // Leaving this branch (or unmounting) puts the true value back.
        return () => write(value);
      });

      // Reduced motion: the value as rendered, no count.
      mm.add(REDUCE, () => {
        write(value);
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [value] }
  );

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {fmt(value)}
    </span>
  );
}

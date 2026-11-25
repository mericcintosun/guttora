"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { residenceName, storyTapId, taps } from "@/lib/data";
import { annualLitres, DEFAULT_ML_PER_DROP, fmt, tapImpact } from "@/lib/impact";
import { rankOpenTaps } from "@/lib/repair-store";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const tap = taps.find((t) => t.id === storyTapId)!;
const impact = tapImpact(tap);
const defaultLitres = annualLitres(tap.dripsPerMinute, DEFAULT_ML_PER_DROP);
const ranked = rankOpenTaps(taps, "TR");
const storyRank = ranked.findIndex((r) => r.tap.id === tap.id) + 1;
const openTotal = ranked.reduce((a, r) => a + r.litres, 0);
const heardIn30s = Math.round(tap.dripsPerMinute / 2);
const ordinals = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];

const CHAPTERS = [
  {
    word: "Drop",
    title: "One drop, ignored since September",
    body: (
      <>
        Room C-214, Block C, {residenceName}. The shower mixer has dripped since the start of term. Elif reported it twice.
        Both tickets said &ldquo;tap dripping&rdquo; and nothing else, so both sank to the bottom of the maintenance queue. A
        single drop looks like nothing, and nobody fixes nothing.
      </>
    ),
  },
  {
    word: "Listen",
    title: "The phone hears every drop",
    body: (
      <>
        She props her phone on the soap shelf and taps Start. Guttora listens above 1 kHz, where the plink of a drop lives and
        most voices do not, and marks every sudden jump in spectral energy. After 30 seconds it has heard {heardIn30s} drops:{" "}
        {tap.dripsPerMinute} a minute, spaced so evenly (the intervals vary by {Math.round(tap.cv * 100)}%) that it calls this a
        regular drip. At the textbook drop size that is already {fmt(defaultLitres)} litres a year.
      </>
    ),
  },
  {
    word: "Spoon",
    title: "A teaspoon replaces the guess",
    body: (
      <>
        Drop size is the number every other leak calculator guesses. Elif holds a {tap.spoonMl} mL teaspoon under the mixer and
        presses &ldquo;Spoon is full&rdquo; when it brims: {tap.spoonDrops} drops, so this tap&rsquo;s drop is{" "}
        {fmt(impact.mlPerDrop, 2)} mL, not the 0.25 mL USGS default. The yearly loss moves to {fmt(impact.litres)} litres.
      </>
    ),
  },
  {
    word: "Heat",
    title: "It is the hot side",
    body: (
      <>
        Heating {fmt(impact.litres)} litres by {tap.deltaT} &deg;C in a 95% efficient electric boiler takes about{" "}
        {fmt(impact.kwh)} kWh. On the Turkish grid, at roughly 0.44 kg CO2e per kWh, that is about {fmt(impact.kgCo2e)} kg of
        CO2e a year from one shower mixer nobody thought was worth a ticket.
      </>
    ),
  },
  {
    word: "Rank",
    title: "Now it has a place in the queue",
    body: (
      <>
        Elif adds the tap to the residence repair list. Ranked by yearly loss, the {ranked[0].tap.label.toLowerCase()} goes
        first at {fmt(ranked[0].litres)} litres and C-214 lands {ordinals[storyRank - 1]}. The {ranked.length} open taps lose{" "}
        {fmt(openTotal)} litres a year between them, and the list copies straight into a maintenance ticket with every number
        attached. Your turn:{" "}
        <Link href="/play" className="font-bold text-primary underline decoration-2 underline-offset-4">
          open the bench and point it at your own tap
        </Link>
        .
      </>
    ),
  },
];

const seg = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

// Fixed pseudo-random noise floor so server and client render the same bars.
const NOISE = Array.from({ length: 60 }, (_, i) => 4 + 2 * ((i * 7 + (i % 5) * 3) % 5));

function Readout({ p, onJump }: { p: number; onJump: (i: number) => void }) {
  const active = Math.min(CHAPTERS.length - 1, Math.floor(p * CHAPTERS.length));
  const drops = p < 0.08 ? 0 : p < 0.2 ? 1 : 1 + Math.round((heardIn30s - 1) * seg(p, 0.2, 0.36));
  const listening = p >= 0.2;
  const rateKnown = drops >= 6;
  const spoonP = seg(p, 0.46, 0.56);
  const ml = DEFAULT_ML_PER_DROP + (impact.mlPerDrop - DEFAULT_ML_PER_DROP) * spoonP;
  const litres = annualLitres(tap.dripsPerMinute, ml) * seg(p, 0.24, 0.4);
  const heatP = seg(p, 0.62, 0.74);
  const showRank = p >= 0.8;

  const rows: Array<[string, string]> = [
    ["Drops heard", listening ? `${drops} in ${Math.max(1, Math.round(drops / (tap.dripsPerMinute / 60)))} s` : drops ? "1, by eye" : "none yet"],
    ["Rate", rateKnown ? `${tap.dripsPerMinute} a minute, regular` : listening ? "listening" : "unknown"],
    ["Drop size", spoonP > 0 ? `${fmt(ml, 2)} mL, ${spoonP >= 1 ? `measured (${tap.spoonDrops} drops / ${tap.spoonMl} mL)` : "measuring"}` : "0.25 mL, USGS default"],
    ["Water lost a year", litres > 0 ? `${fmt(litres)} L` : "unknown"],
    ["Hot water cost a year", heatP > 0 ? `${fmt(impact.kwh * heatP)} kWh, ${fmt(impact.kgCo2e * heatP)} kg CO2e` : "not counted yet"],
  ];

  return (
    <div className="rounded-sm border-2 border-border bg-card shadow-hard">
      <div className="flex items-center justify-between gap-3 border-b-2 border-border px-4 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{tap.label}</p>
          <p className="truncate text-xs">{tap.place}</p>
        </div>
        {rateKnown ? <Badge variant="ok">Regular drip</Badge> : listening ? <Badge variant="secondary">Listening</Badge> : <Badge variant="outline">Mic off</Badge>}
      </div>

      <nav aria-label="Story chapters" className="border-b-2 border-border px-2 py-2">
        <div className="flex flex-wrap gap-1.5">
          {CHAPTERS.map((c, i) => (
            <Button
              key={c.word}
              size="sm"
              variant={i === active ? "default" : "outline"}
              aria-current={i === active ? "step" : undefined}
              onClick={() => onJump(i)}
              className="h-7 px-2 shadow-hard-sm"
            >
              {c.word}
            </Button>
          ))}
        </div>
        <div className="mt-2 h-1.5 border-2 border-border bg-background" aria-hidden>
          <div className="h-full bg-primary" style={{ width: `${Math.round(p * 100)}%` }} />
        </div>
      </nav>

      {showRank ? (
        <ol className="space-y-1 px-4 py-2 text-sm" aria-label="Repair list ranked by yearly loss">
          {ranked.slice(0, 3).map((r, i) => (
            <li key={r.tap.id} className={cn("flex justify-between gap-3", r.tap.id === tap.id && "font-bold text-primary")}>
              <span className="truncate">
                {i + 1}. {r.tap.label}
              </span>
              <span className="tabular-nums">{fmt(r.litres)} L</span>
            </li>
          ))}
        </ol>
      ) : (
        <svg viewBox="0 0 240 40" className="block h-14 w-full px-2" role="img" aria-label={`Waveform with ${drops} drop marks`}>
          {NOISE.map((h, i) => (
            <rect key={i} x={i * 4} y={20 - h / 2} width={2} height={h} className="fill-foreground/25" />
          ))}
          {Array.from({ length: heardIn30s }, (_, i) => (
            <rect key={`d${i}`} x={4 + i * (230 / heardIn30s)} y={2} width={3} height={36} className={i < drops ? "fill-primary" : "fill-transparent"} />
          ))}
        </svg>
      )}

      <dl className="border-t-2 border-border px-4 py-1 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 border-b border-border/20 py-1 last:border-b-0">
            <dt>{k}</dt>
            <dd className="text-right font-bold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function DripStory() {
  const rootRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<Array<HTMLElement | null>>([]);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [p, setP] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Signature 1: the readout pins while a scrubbed timeline plays one tap from
      // a single ignored drop to a ranked repair ticket.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const proxy = { p: 0 };
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top+=72",
            end: "bottom bottom",
            pin: figureRef.current,
            pinSpacing: false,
            scrub: 0.4,
          },
        });
        tl.to(proxy, { p: 1, ease: "none", duration: 1, onUpdate: () => setP(proxy.p) });
        triggerRef.current = tl.scrollTrigger ?? null;
        return () => {
          triggerRef.current = null;
        };
      });

      // Reduced motion: no pin, no scrub. The readout is CSS sticky and jumps
      // straight to each chapter's finished state.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        chapterRefs.current.forEach((el, i) => {
          if (!el) return;
          ScrollTrigger.create({
            trigger: el,
            start: "top center",
            end: "bottom center",
            onToggle: (self) => {
              if (self.isActive) setP((i + 0.99) / CHAPTERS.length);
            },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  const jump = (i: number) => {
    const st = triggerRef.current;
    if (st) {
      const top = st.start + ((i + 0.55) / CHAPTERS.length) * (st.end - st.start);
      window.scrollTo({ top, behavior: "smooth" });
    } else {
      chapterRefs.current[i]?.scrollIntoView({ block: "end" });
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <div ref={figureRef} className="relative z-10 bg-background pb-3 motion-reduce:sticky motion-reduce:top-[72px]">
        <Readout p={p} onJump={jump} />
      </div>
      <div>
        {CHAPTERS.map((c, i) => (
          <section
            key={c.word}
            id={`chapter-${c.word.toLowerCase()}`}
            ref={(el) => {
              chapterRefs.current[i] = el;
            }}
            className="flex min-h-[85vh] flex-col justify-end pb-[8vh]"
          >
            <h2 className="text-2xl sm:text-3xl">{c.title}</h2>
            <p className="mt-3 text-base leading-relaxed sm:text-lg">{c.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

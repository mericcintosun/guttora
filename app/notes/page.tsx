import type { Metadata } from "next";
import Link from "next/link";
import { AccuracyBench } from "@/components/accuracy-bench";
import { Card, CardContent } from "@/components/ui/card";
import { gridFactors } from "@/lib/data";
import { DEFAULT_CONFIG } from "@/lib/drip-detector";
import { annualLitres, DEFAULT_ML_PER_DROP, fmt, heaters, USGS_DROPS_PER_GALLON } from "@/lib/impact";

export const metadata: Metadata = {
  title: "Notes: method, numbers and sources | Guttora",
  description: "How Guttora hears a drop, turns it into litres, kWh and CO2e, and where every constant comes from.",
};

const hopMs = Math.round((DEFAULT_CONFIG.hop / 44100) * 1000 * 10) / 10;

export default function NotesPage() {
  return (
    <article className="mx-auto max-w-prose space-y-12 leading-relaxed">
      <header className="guttora-wipe-group space-y-3">
        <p className="guttora-wipe text-xs font-bold uppercase tracking-[0.2em]">Appendix</p>
        <h1 className="guttora-wipe text-4xl sm:text-5xl">Method, numbers and sources</h1>
        <p className="guttora-wipe text-lg">
          Everything Guttora shows can be traced to a formula on this page. If a number looks wrong, this is where to check it.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-3xl">How a drop is heard</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            The microphone opens with echo cancellation, noise suppression and automatic gain turned off. Those filters are
            built for voices and treat a drip as noise to remove.
          </li>
          <li>A Web Audio BiquadFilterNode high-passes the signal at {DEFAULT_CONFIG.minHz} Hz. Fan hum and most of a voice sit below that line; the sharp start of a drop does not.</li>
          <li>
            Samples are cut into {DEFAULT_CONFIG.fftSize}-sample Hann windows every {DEFAULT_CONFIG.hop} samples (about {hopMs} ms at
            44.1 kHz) and run through a radix-2 FFT we wrote for this project.
          </li>
          <li>
            For every window, Guttora adds up how much each frequency bin above 1 kHz got louder since the last window (positive
            spectral flux on log magnitudes). A drop makes this number jump.
          </li>
          <li>
            A jump counts when it clears the rolling median of the last {DEFAULT_CONFIG.medianWindow} windows (about half a second)
            times {1 + DEFAULT_CONFIG.relative}, plus {DEFAULT_CONFIG.k} times the median absolute deviation. The threshold follows
            the room instead of using one fixed level.
          </li>
          <li>After a count, the detector ignores the next {DEFAULT_CONFIG.refractoryMs} ms so a splash and its echo are one drop, not two.</li>
          <li>
            The last 16 gaps between drops give a coefficient of variation. Under {DEFAULT_CONFIG.cvLimit} it is a regular drip and
            the rate is shown. Over that, the screen says the room is too noisy. If no drop arrives for 4 seconds (or three
            typical gaps), the answer is &ldquo;no regular drip, 0 L&rdquo;.
          </li>
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl">From drops to litres, kWh and CO2e</h2>
        <Card>
          <CardContent className="space-y-2 text-sm">
            <p>litres a year = drops per minute &times; 525,600 minutes &times; mL per drop / 1000</p>
            <p>mL per drop = spoon volume / drops to fill it, or {fmt(DEFAULT_ML_PER_DROP, 2)} mL without a spoon</p>
            <p>kWh = litres &times; 4.186 kJ/kg K &times; temperature rise / 3600 / heater efficiency</p>
            <p>kg CO2e = kWh &times; grid factor (electric) or &times; {heaters.gas.fuelKgPerKwh} (natural gas)</p>
          </CardContent>
        </Card>
        <p>
          The default drop comes from the USGS drip calculator: {fmt(USGS_DROPS_PER_GALLON)} drops to a US gallon. At that size, one
          drip a minute is {fmt(annualLitres(1, DEFAULT_ML_PER_DROP))} litres a year and one drip a second is{" "}
          {fmt(annualLitres(60, DEFAULT_ML_PER_DROP))} litres. Electric heaters are taken as {heaters.electric.efficiency * 100}%
          efficient and gas boilers as {heaters.gas.efficiency * 100}%.
        </p>
        <div className="overflow-x-auto rounded-sm border-2 border-border bg-card shadow-hard">
          <table className="w-full text-left text-sm">
            <caption className="border-b-2 border-border bg-secondary px-4 py-2 text-left font-bold">
              Grid factors used for electric water heating (approximate 2023 averages)
            </caption>
            <thead className="border-b-2 border-border">
              <tr>
                <th className="px-4 py-2">Country</th>
                <th className="px-4 py-2">kg CO2e per kWh</th>
              </tr>
            </thead>
            <tbody>
              {gridFactors.map((g) => (
                <tr key={g.code} className="border-b border-border/30 last:border-b-0">
                  <td className="px-4 py-2">{g.country}</td>
                  <td className="px-4 py-2 tabular-nums">{g.kgPerKwh.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl">Does the counter count right?</h2>
        <p>
          Press the button below and the bench builds six recordings from scratch, with a drop count we know, and runs the
          detector on them. Synthetic clips test the logic, not a real bathroom; counts from our own recorded taps are listed in
          the README as we collect them.
        </p>
        <AccuracyBench />
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl">Limits we know about</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Two taps dripping in the same room merge into one irregular source.</li>
          <li>Drops falling into a full basin are quieter than drops on ceramic; hold the phone closer.</li>
          <li>Grid factors are national yearly averages, not the hour you measured.</li>
          <li>The estimate ignores the energy used to pump and treat the water itself, so the true footprint is a little higher.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl">Tools and sources</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Next.js, React, TypeScript and Tailwind CSS for the app; GSAP with ScrollTrigger for the story page.</li>
          <li>Web Audio API (getUserMedia, BiquadFilterNode, decodeAudioData) for capture and decoding. No audio leaves the browser.</li>
          <li>
            <a className="font-bold text-primary underline decoration-2 underline-offset-4" href="https://water.usgs.gov/edu/activity-drip.html">
              USGS, &ldquo;The drip, drip, drip of a leaky faucet&rdquo;
            </a>{" "}
            and the{" "}
            <a className="font-bold text-primary underline decoration-2 underline-offset-4" href="https://nm.water.usgs.gov/drought/dripcalculator.html">
              USGS drip calculator
            </a>
            .
          </li>
          <li>
            <a className="font-bold text-primary underline decoration-2 underline-offset-4" href="https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting">
              UK DESNZ greenhouse gas conversion factors
            </a>{" "}
            for natural gas.
          </li>
          <li>
            <a className="font-bold text-primary underline decoration-2 underline-offset-4" href="https://ember-energy.org/data/">
              Ember electricity data
            </a>{" "}
            for grid carbon intensity.
          </li>
        </ul>
        <p>
          Ready to try it?{" "}
          <Link href="/play" className="font-bold text-primary underline decoration-2 underline-offset-4">
            Open the bench
          </Link>
          .
        </p>
      </section>
    </article>
  );
}

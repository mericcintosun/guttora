import type { Metadata } from "next";
import Link from "next/link";
import { DripStory } from "@/components/drip-story";
import { SceneSlot } from "@/components/scene-slot";
import { Button } from "@/components/ui/button";
import { getAdapter } from "@/lib/adapter";
import { annualLitres, DEFAULT_ML_PER_DROP, fmt } from "@/lib/impact";

export const metadata: Metadata = {
  title: "Story: one dripping tap, one year",
};

const oneDropASecond = annualLitres(60, DEFAULT_ML_PER_DROP);

// L3 editorial: one centered column at max-w-prose, magazine order, numbers inside sentences.
export default async function Home() {
  const { taps, residenceName, storyTapId } = await getAdapter().getResidence();
  return (
    <article className="mx-auto max-w-prose">
      <header className="guttora-wipe-group space-y-5">
        <p className="guttora-wipe text-xs font-bold uppercase tracking-[0.2em]">Field notes on water, Green Shift Hacks 2026</p>
        <h1 className="guttora-wipe text-4xl sm:text-6xl">A dripping tap tells you how much it wastes. You just have to listen.</h1>
        <p className="guttora-wipe text-lg leading-relaxed sm:text-xl">
          Guttora is a browser tab that counts drips by ear. Put your phone next to the tap, let it listen for 30 seconds,
          catch a few drops in a teaspoon, and it tells you how many litres, kilowatt-hours and kilograms of CO2e that one tap
          throws away in a year. It is built for students, tenants and residence staff who need a number before anyone fixes
          a tap.
        </p>
        {/* Mid-flow CTA row. No wipe class here: the wipe's final clip-path would cut off the hard shadows. */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Button asChild size="lg" className="h-auto min-h-12 whitespace-normal py-3 text-center">
            <a href="#story">Follow one tap from first drop to repair ticket</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-auto min-h-12 whitespace-normal py-3 text-center">
            <Link href="/play">Or open the bench on your phone</Link>
          </Button>
        </div>
      </header>

      <figure className="guttora-wipe my-10">
        <div className="rounded-sm border-2 border-border bg-card shadow-hard">
          <SceneSlot n={1} alt="A phone propped on the edge of a white basin beside a dripping chrome tap, its screen showing a drop counter and a row of blue drop marks" width={960} height={640} />
        </div>
        <figcaption className="mt-3 text-sm">No app to install, no account, no extra hardware. The audio never leaves the phone.</figcaption>
      </figure>

      <div className="space-y-5 text-base leading-relaxed sm:text-lg">
        <p>
          Leaking taps stay leaking because a single drop looks like nothing. At the USGS drop size of 0.25 mL, a tap that
          drips once a second still loses about {fmt(oneDropASecond)} litres a year. The resident who files the repair request
          has no number to put in it, so the request waits.
        </p>
        <p>
          The leak calculators that exist ask you to type the drip rate or tap along to it, then assume every drop is the same
          size. Guttora measures both. Scroll on and follow one shower mixer from the first drop to a ranked repair ticket.
        </p>
      </div>

      <div id="story" className="mt-12 scroll-mt-24">
        <DripStory taps={taps} residenceName={residenceName} storyTapId={storyTapId} />
      </div>

      <section className="my-16 rounded-sm border-2 border-border bg-primary p-6 text-primary-foreground shadow-hard">
        <h2 className="text-3xl">Try it on your own tap</h2>
        <p className="mt-3 leading-relaxed">
          Open the bench on your phone, tap once to allow the microphone, and set it down next to the drip. Thirty seconds is
          enough for a rate. No tap nearby? Upload a recording instead.
        </p>
        <Button asChild size="lg" variant="secondary" className="mt-5">
          <Link href="/play">Start listening</Link>
        </Button>
      </section>

      <div className="space-y-5 text-base leading-relaxed sm:text-lg">
        <h2 className="text-3xl">Why the spoon matters</h2>
        <p>
          Drop size is the number every estimate hides. The USGS calculator assumes 15,140 drops to the gallon, about 0.25 mL
          each. Other references use 0.33 mL. Real taps range wider than both, so a fixed guess can be off by a third before
          anyone counts a single drop.
        </p>
        <figure className="my-8">
          <div className="rounded-sm border-2 border-border bg-card shadow-hard">
            <SceneSlot n={2} alt="A teaspoon held under a dripping tap, half full, with a counter beside it reading 16 drops" width={960} height={640} />
          </div>
          <figcaption className="mt-3 text-sm">Sixteen drops filled this 5 mL teaspoon, so each drop is 0.31 mL.</figcaption>
        </figure>
        <p>
          A teaspoon holds 5 mL. Hold it under the tap while Guttora is listening, press the button when it is full, and the
          drop count gives you this tap&rsquo;s real drop size. It takes under a minute on a fast drip.
        </p>

        <h2 className="pt-6 text-3xl">Who it is for</h2>
        <p>
          Students in shared residences, tenants, and the floor representatives who collect repair requests. One person
          measures a few taps on a Sunday afternoon, and the residence office receives a list sorted by litres lost, not by who
          complained loudest.
        </p>
        <figure className="my-8">
          <div className="rounded-sm border-2 border-border bg-card shadow-hard">
            <SceneSlot n={3} alt="A clipboard repair list pinned to a residence notice board, three taps ranked with blue bars for litres lost per year" width={960} height={640} />
          </div>
          <figcaption className="mt-3 text-sm">The repair list ranks every open tap by yearly loss and copies into a ticket.</figcaption>
        </figure>

        <details className="rounded-sm border-2 border-border bg-card p-4 shadow-hard-sm">
          <summary className="cursor-pointer font-bold">What it cannot do yet, in one line: loud rooms and unusual taps.</summary>
          <div className="mt-3 space-y-3 text-base">
            <p>
              Bathroom echo, extractor fans and running water elsewhere can trigger false counts. Guttora only reports a rate
              when the intervals between drops are regular (variation under 35%), and says &ldquo;no regular drip&rdquo;
              otherwise, but it cannot tell two taps dripping in the same room apart.
            </p>
            <p>
              Without the spoon, the result rests on the 0.25 mL default. Hot water energy assumes a temperature rise you set and
              a fixed boiler efficiency. Grid factors are yearly national averages. The numbers are estimates to rank repairs, not
              a water bill.
            </p>
          </div>
        </details>

        <p>
          The full method, every constant and its source, and a detector accuracy bench you can re-run live are in the{" "}
          <Link href="/notes" className="font-bold text-primary underline decoration-2 underline-offset-4">
            notes
          </Link>
          .
        </p>
      </div>
    </article>
  );
}

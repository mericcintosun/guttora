import type { Metadata } from "next";
import Link from "next/link";
import { DripStory } from "@/components/drip-story";
import { EditorialRule } from "@/components/editorial-rule";
import { InlineCount } from "@/components/inline-count";
import { SceneSlot } from "@/components/scene-slot";
import { StoryIntro } from "@/components/story-intro";
import { Button } from "@/components/ui/button";
import { getAdapter } from "@/lib/adapter";
import { annualLitres, DEFAULT_ML_PER_DROP } from "@/lib/impact";

export const metadata: Metadata = {
  title: "Story: one dripping tap, one year",
};

const oneDropASecond = annualLitres(60, DEFAULT_ML_PER_DROP);

const linkClass = "font-bold text-primary underline decoration-2 underline-offset-4";

// L3 editorial: one centered column at max-w-prose in magazine order (kicker, display
// headline, standfirst, inline figure, CTA mid-flow). Numbers sit inside sentences.
export default async function Home() {
  const { taps, residenceName, storyTapId } = await getAdapter().getResidence();
  return (
    <article className="mx-auto max-w-prose">
      <StoryIntro
        kicker="Field notes on water, Green Shift Hacks 2026"
        standfirst="Guttora listens to a dripping tap through your phone and works out what it wastes in a year, so students, tenants and residence staff can put a number on the repair request."
      >
        <figure className="my-10">
          <div className="rounded-sm border-2 border-border bg-card shadow-hard">
            <SceneSlot n={1} alt="A phone propped on the edge of a white basin beside a dripping chrome tap, its screen showing a drop counter and a row of blue drop marks" width={960} height={640} />
          </div>
          <figcaption className="mt-3 text-sm">No app to install, no account, and the audio never leaves the phone.</figcaption>
        </figure>
      </StoryIntro>

      <figure className="my-12">
        <p className="text-lg leading-snug sm:text-xl">
          One drip a second, at the USGS drop size of 0.25 mL, is about{" "}
          <InlineCount value={oneDropASecond} className="font-display text-5xl leading-none text-primary sm:text-7xl" /> litres a
          year down the drain.
        </p>
        <figcaption className="mt-4 text-base leading-relaxed sm:text-lg">
          Yet the ticket only says &ldquo;tap dripping&rdquo;, so the request sinks to the bottom of the queue.
        </figcaption>
      </figure>

      <div className="space-y-4 text-base leading-relaxed sm:text-lg">
        <Button asChild size="lg" className="h-auto min-h-12 whitespace-normal py-3 text-center">
          <a href="#story">Follow one tap from first drop to repair ticket</a>
        </Button>
        <p>
          Standing next to a drip right now? You can{" "}
          <Link href="/play" className={linkClass}>
            go straight to the bench
          </Link>{" "}
          and come back for the story later.
        </p>
      </div>

      <div id="story" className="mt-12 scroll-mt-24">
        <DripStory taps={taps} residenceName={residenceName} storyTapId={storyTapId} />
      </div>

      <EditorialRule />
      <section className="rounded-sm border-2 border-border bg-primary p-6 text-primary-foreground shadow-hard">
        <h2 className="text-3xl">Try it on your own tap</h2>
        <p className="mt-3 leading-relaxed">
          Open the bench, allow the microphone once and set the phone by the drip; 30 seconds is enough for a rate.
        </p>
        <Button asChild size="lg" variant="secondary" className="mt-5">
          <Link href="/play">Start listening</Link>
        </Button>
      </section>

      <div className="text-base leading-relaxed sm:text-lg">
        <EditorialRule />
        <h2 className="text-3xl">Why the spoon matters</h2>
        <p className="mt-4">
          A 5 mL teaspoon held under the tap gives its real drop size, because drop size is the number every other estimate guesses.
        </p>
        <figure className="mx-auto my-8 max-w-md">
          <div className="rounded-sm border-2 border-border bg-card shadow-hard">
            <SceneSlot n={2} alt="A teaspoon held under a dripping tap, half full, with a counter beside it reading 16 drops" width={720} height={720} />
          </div>
          <figcaption className="mt-3 text-sm">Sixteen drops filled this 5 mL teaspoon, so each drop is 0.31 mL.</figcaption>
        </figure>

        <EditorialRule />
        <h2 className="text-3xl">Who it is for</h2>
        <p className="mt-4">
          Students, tenants and floor representatives measure a few taps in an afternoon and hand the office a list sorted by litres lost.
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

        <p className="mt-8">
          Every constant, its source and a detector bench you can re-run live are in the{" "}
          <Link href="/notes" className={linkClass}>
            notes
          </Link>
          .
        </p>
      </div>
    </article>
  );
}

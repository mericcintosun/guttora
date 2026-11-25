import type { Metadata } from "next";
import { PlayWorkbench } from "@/components/play-workbench";
import { SceneSlot } from "@/components/scene-slot";
import { Badge } from "@/components/ui/badge";
import { getAdapter } from "@/lib/adapter";
import { defaultGridCode } from "@/lib/data/seed";
import { playQuerySchema } from "@/lib/schemas";

export const metadata: Metadata = {
  title: "Bench: count your tap",
  description: "Count drips by ear, calibrate drop size with a spoon, and rank every leaking tap by yearly water and CO2e loss.",
};

export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // ?reset=1 clears this phone's repair list before the demo. Any other value, or a
  // repeated param, is treated as no reset instead of an error.
  const query = playQuerySchema.safeParse(await searchParams);
  const resetOnLoad = query.success && query.data.reset === "1";
  const adapter = getAdapter();
  const [residence, gridFactors] = await Promise.all([adapter.getResidence(), adapter.getGridFactors()]);
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6 space-y-3">
        <h1 className="guttora-wipe text-4xl sm:text-5xl">The bench</h1>
        <p className="max-w-prose text-lg leading-relaxed">
          Set the phone within a hand&rsquo;s width of the drip, press Start listening and keep the room quiet for 30 seconds.
        </p>
        <p className="max-w-prose text-sm leading-relaxed">
          <Badge variant="ok" className="mr-2 align-middle">
            Live
          </Badge>
          The drip counter listens through this phone&rsquo;s microphone, and the audio never leaves the device.
        </p>
      </header>
      <figure className="mb-8">
        <div className="rounded-sm border-2 border-border bg-card shadow-hard">
          <SceneSlot n={4} alt="A phone lying flat on the rim of a sink beside a dripping tap, a row of blue drop marks on its screen" width={1200} height={400} />
        </div>
      </figure>
      <PlayWorkbench residence={residence} gridFactors={gridFactors} defaultGridCode={defaultGridCode} resetOnLoad={resetOnLoad} />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { PlayWorkbench } from "@/components/play-workbench";
import { Badge } from "@/components/ui/badge";
import { adapterMode, getAdapter } from "@/lib/adapter";
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
  const mode = adapterMode();
  const [residence, gridFactors] = await Promise.all([adapter.getResidence(), adapter.getGridFactors()]);
  return (
    <div className="mx-auto max-w-3xl">
      <header className="guttora-wipe-group mb-8 space-y-3">
        <h1 className="guttora-wipe text-4xl sm:text-5xl">The bench</h1>
        <p className="guttora-wipe max-w-prose text-lg leading-relaxed">
          Set the phone next to the drip, within a hand&rsquo;s width, and press Start listening. Keep the room quiet for 30
          seconds. Everything runs in this tab; nothing is uploaded. The story behind each step is on the{" "}
          <Link href="/" className="font-bold text-primary underline decoration-2 underline-offset-4">
            home page
          </Link>
          .
        </p>
        <p className="max-w-prose text-sm leading-relaxed">
          <Badge variant="ok" className="mr-2 align-middle">
            Live
          </Badge>
          The drip counter uses this phone&rsquo;s microphone inside this tab. The starting repair list is sample data for{" "}
          {residence.residenceName}.{" "}
          {mode === "real"
            ? "The notes page bench is counted on the server."
            : "The notes page bench runs in your browser on request."}
        </p>
      </header>
      <PlayWorkbench residence={residence} gridFactors={gridFactors} defaultGridCode={defaultGridCode} resetOnLoad={resetOnLoad} />
    </div>
  );
}

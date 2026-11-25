import type { Metadata } from "next";
import Link from "next/link";
import { PlayWorkbench } from "@/components/play-workbench";

export const metadata: Metadata = {
  title: "Bench: count your tap | Guttora",
  description: "Count drips by ear, calibrate drop size with a spoon, and rank every leaking tap by yearly water and CO2e loss.",
};

export default function PlayPage() {
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
      </header>
      <PlayWorkbench />
    </div>
  );
}

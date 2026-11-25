"use client";

import Link from "next/link";
import { ErrorState } from "@/components/route-states";
import { Button } from "@/components/ui/button";

// Shows no error message or stack on purpose; the details stay in the server logs.
export default function PlayError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl py-16">
      <ErrorState
        title="The bench could not load"
        body="The sample residence or the grid factors did not arrive. Your saved repair list is still on this phone. Try again."
        onRetry={reset}
      >
        <Button asChild variant="outline">
          <Link href="/">Back to the story</Link>
        </Button>
      </ErrorState>
    </div>
  );
}

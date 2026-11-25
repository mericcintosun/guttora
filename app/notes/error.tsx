"use client";

import Link from "next/link";
import { ErrorState } from "@/components/route-states";
import { Button } from "@/components/ui/button";

// Shows no error message or stack on purpose; the details stay in the server logs.
export default function NotesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-prose py-16">
      <ErrorState
        title="The notes could not load"
        body="The grid factors or the bench clips did not arrive. Try again, or count a tap on the bench meanwhile."
        onRetry={reset}
      >
        <Button asChild variant="outline">
          <Link href="/play">Open the bench</Link>
        </Button>
      </ErrorState>
    </div>
  );
}

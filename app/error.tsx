"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

// Shows no error message or stack on purpose; the details stay in the server logs.
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-prose space-y-4 py-24 text-center">
      <p className="font-display text-2xl">Guttora</p>
      <h1 className="text-3xl">Something went wrong</h1>
      <p>The page could not load. Try again, or go back to the story.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Back to the story</Link>
        </Button>
      </div>
    </div>
  );
}

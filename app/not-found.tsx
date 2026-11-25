import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-prose space-y-4 py-24 text-center">
      <p className="font-display text-2xl">Guttora</p>
      <h1 className="text-3xl">Page not found</h1>
      <p>There is no tap at this address.</p>
      <Button asChild variant="outline">
        <Link href="/">Back to the story</Link>
      </Button>
    </div>
  );
}

import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { SiteNav } from "@/components/site-nav";

// HEADER row of IDENTITY.md: solid ground, border-b in LINE, sticky.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-display text-xl">
          <BrandMark />
          Guttora
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-2 md:flex">
          <SiteNav />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t-2 border-border bg-secondary">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          Guttora counts drips by ear, in your browser. Audio never leaves the device.
        </p>
        <p>
          Built for Green Shift Hacks 2026.{" "}
          <Link href="/notes" className="font-bold underline decoration-2 underline-offset-4">
            Method and sources
          </Link>
          {" · "}
          <a
            href="https://github.com/mericcintosun/guttora"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline decoration-2 underline-offset-4"
          >
            Source code
          </a>
        </p>
      </div>
    </footer>
  );
}

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

// Underlined text links, at least 44px tall for touch.
const footerLink = "inline-flex min-h-11 items-center font-bold underline decoration-2 underline-offset-4";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t-2 border-border bg-secondary">
      <div className="mx-auto max-w-5xl space-y-3 px-4 py-8 text-sm">
        <p>Guttora counts drips by ear in your browser, and the audio never leaves the device.</p>
        <ul className="flex flex-wrap gap-x-6">
          <li>
            <Link href="/notes" className={footerLink}>
              Method and sources
            </Link>
          </li>
          <li>
            <a href="https://github.com/mericcintosun/guttora" target="_blank" rel="noopener noreferrer" className={footerLink}>
              Source code
            </a>
          </li>
          <li>
            <a href="https://green-shift-hacks.devpost.com/" target="_blank" rel="noopener noreferrer" className={footerLink}>
              Green Shift Hacks
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Story" },
  { href: "/play", label: "Bench" },
  { href: "/notes", label: "Notes" },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * "inline": the header row from md up. "bar": the fixed bottom bar under md, one
 * full-height cell per route so every target is at least 56px tall. Neither carries a mark.
 */
export function SiteNav({ layout = "inline" }: { layout?: "inline" | "bar" }) {
  const pathname = usePathname() ?? "";
  return (
    <>
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        if (layout === "bar") {
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-1 items-center justify-center text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                active && "border-x-2 border-border bg-card"
              )}
            >
              {item.label}
            </Link>
          );
        }
        return (
          <Button key={item.href} asChild variant="ghost" size="sm" className={cn(active && "border-border bg-card")}>
            <Link href={item.href} aria-current={active ? "page" : undefined}>
              {item.label}
            </Link>
          </Button>
        );
      })}
    </>
  );
}

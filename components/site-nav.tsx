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

export function SiteNav() {
  const pathname = usePathname() ?? "";
  return (
    <>
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
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

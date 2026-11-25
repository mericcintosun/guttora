import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Loading, error and empty states shared by /, /play and /notes. No hooks and no
// "use client", so server pages, loading.tsx and client components can all use them.
// Nothing here renders at opacity 0: the skeleton is visible text plus DEEP blocks.

export function RouteSkeleton({ label, className }: { label: string; className?: string }) {
  return (
    <div className={className} role="status" aria-live="polite">
      <Card>
        <CardHeader>
          <p className="font-bold">{label}</p>
        </CardHeader>
        <CardContent className="space-y-3" aria-hidden>
          <div className="h-5 w-3/4 rounded-sm border-2 border-border bg-secondary" />
          <div className="h-5 w-full rounded-sm border-2 border-border bg-secondary" />
          <div className="h-5 w-2/3 rounded-sm border-2 border-border bg-secondary" />
        </CardContent>
      </Card>
    </div>
  );
}

export function ErrorState({
  title,
  body,
  onRetry,
  children,
}: {
  title: string;
  body: string;
  onRetry: () => void;
  /** Extra actions next to "Try again", such as a link back to the story. */
  children?: ReactNode;
}) {
  return (
    <Card role="alert">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="leading-relaxed">{body}</p>
      </CardContent>
      <CardFooter className="flex-wrap">
        <Button onClick={() => onRetry()}>Try again</Button>
        {children}
      </CardFooter>
    </Card>
  );
}

export function EmptyState({
  title,
  body,
  action,
  media,
}: {
  title: string;
  body: string;
  action: ReactNode;
  /** Optional picture shown above the actions, such as a scene slot. */
  media?: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <p className="font-bold">{title}</p>
        <p className="text-sm leading-relaxed">{body}</p>
        {media}
        <div className="flex flex-wrap gap-2">{action}</div>
      </CardContent>
    </Card>
  );
}

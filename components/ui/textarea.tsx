import * as React from "react";
import { cn } from "@/lib/utils";

// D10 butter: 2px ink border, hard small shadow, sharp corners, same focus ring as Input.
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "block w-full rounded-sm border-2 border-input bg-card px-3 py-2 text-sm text-foreground shadow-hard-sm placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };

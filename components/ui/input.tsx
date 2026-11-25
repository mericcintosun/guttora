import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-sm border-2 border-input bg-card px-3 py-1 text-sm text-foreground shadow-hard-sm transition-colors placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 file:mr-3 file:rounded-sm file:border-2 file:border-border file:bg-secondary file:px-2 file:text-xs file:font-bold file:text-foreground",
        className
      )}
      {...props}
    />
  );
}

export { Input };

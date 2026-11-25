import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Square, solid-fill state labels with an ink border. Semantic variants mark state only.
const badgeVariants = cva(
  "inline-flex items-center rounded-sm border-2 border-border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "bg-card text-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        ok: "bg-ok text-card",
        warn: "bg-warn text-card",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

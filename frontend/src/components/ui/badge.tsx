import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border",
        success: "border-transparent bg-[hsl(142_76%_36%/0.1)] text-[hsl(142_76%_36%)] border-[hsl(142_76%_36%/0.3)]",
        warning: "border-transparent bg-[hsl(38_92%_50%/0.1)] text-[hsl(38_92%_50%)] border-[hsl(38_92%_50%/0.3)]",
        danger: "border-transparent bg-[hsl(0_84%_60%/0.1)] text-[hsl(0_84%_60%)] border-[hsl(0_84%_60%/0.3)]",
        "risk-high": "bg-[hsl(0_84%_60%/0.1)] text-[hsl(0_84%_60%)] border-[hsl(0_84%_60%/0.3)]",
        "risk-moderate": "bg-[hsl(38_92%_50%/0.1)] text-[hsl(38_92%_50%)] border-[hsl(38_92%_50%/0.3)]",
        "risk-low": "bg-[hsl(142_76%_36%/0.1)] text-[hsl(142_76%_36%)] border-[hsl(142_76%_36%/0.3)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

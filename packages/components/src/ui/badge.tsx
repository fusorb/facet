import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils.js";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow",
        outline: "text-foreground",
        success: "border-transparent bg-success text-success-foreground shadow",
        warning: "border-transparent bg-warning text-warning-foreground shadow",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Optional leading icon element (e.g. lucide <Sparkles />) */
  icon?: React.ReactNode;
  /** Render an icon-only square badge. Default: false */
  iconOnly?: boolean;
}

function Badge({
  className,
  variant,
  icon,
  iconOnly,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant }),
        "gap-1",
        iconOnly && "size-6 justify-center p-0",
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0 leading-none">{icon}</span>}
      {!iconOnly && children}
    </div>
  );
}

export { Badge, badgeVariants };

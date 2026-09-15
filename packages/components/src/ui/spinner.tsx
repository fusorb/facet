import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils.js";

const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-2 border-current border-t-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
  {
    variants: {
      size: {
        sm: "size-4",
        default: "size-6",
        lg: "size-8",
      },
      variant: {
        default: "text-foreground",
        primary: "text-primary",
        muted: "text-muted-foreground",
        white: "text-primary-foreground",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  },
);

export interface SpinnerProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-label="Loading"
      className={cn(spinnerVariants({ size, variant }), className)}
      {...props}
    />
  ),
);
Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants };

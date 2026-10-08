import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils.js";

export const skeletonVariants = cva("", {
  variants: {
    variant: {
      default: "animate-pulse rounded-md bg-primary/10",
      /** Header + body lines, for card/list placeholders. */
      layout: "flex flex-col gap-2",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof skeletonVariants> & {
    /** Number of placeholder body lines for `variant="layout"`. Default: 3. */
    lines?: number;
    /** Class applied to each body line in `variant="layout"`. */
    lineClassName?: string;
  };

function Skeleton({
  className,
  variant = "default",
  lines = 3,
  lineClassName,
  ...props
}: SkeletonProps) {
  if (variant === "layout") {
    const count = Math.max(0, lines);
    return (
      <div
        className={cn(skeletonVariants({ variant }), className)}
        {...props}
      >
        <div className="h-4 w-5/6 animate-pulse rounded-md bg-primary/10" />
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={`s-${i}`}
            className={cn(
              "h-3 w-full animate-pulse rounded-md bg-primary/10 last:w-4/5",
              lineClassName,
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(skeletonVariants({ variant }), className)} {...props} />
  );
}

Skeleton.displayName = "Skeleton";

export { Skeleton };

/**
 * @category data-display
 * @summary Button Group
 */
import * as React from "react";
import { cn } from "../utils.js";

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Renders the group as a single joined segmented control. */
  joined?: boolean;
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, joined = false, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      className={cn(
        "inline-flex items-center",
        joined && "rounded-md border border-border bg-background p-1 shadow-sm",
        !joined && "flex-wrap gap-2",
        className,
      )}
      {...props}
    />
  ),
);
ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup };

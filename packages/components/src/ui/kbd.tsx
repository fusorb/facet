/**
 * @category data-display
 * @summary Kbd
 */
import * as React from "react";
import { cn, getModSymbol } from "../utils.js";

export interface KbdProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Render the platform modifier key (⌘ on macOS, Ctrl elsewhere)
   * instead of passing children.
   */
  mod?: boolean;
}

const Kbd = React.forwardRef<HTMLSpanElement, KbdProps>(
  ({ className, mod, ...props }, ref) => (
    <kbd
      ref={ref}
      className={cn(
        "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[11px] font-medium text-muted-foreground",
        className,
      )}
      {...props}
    >
      {mod ? getModSymbol() : props.children}
    </kbd>
  ),
);
Kbd.displayName = "Kbd";
export { Kbd };

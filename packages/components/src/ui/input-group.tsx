import * as React from "react";
import { cn } from "../utils.js";

/**
 * InputGroup
 *
 * A composable wrapper that lets you prepend or append elements (icons,
 * labels, buttons) to an {@link Input} via flexible slot props. Everything
 * collapses to a single rounded control when slots are provided, mirroring
 * how users expect a "search" or "prefixed" input to behave.
 *
 * @example
 * <InputGroup>
 *   <InputGroupAddon><SearchIcon /></InputGroupAddon>
 *   <Input placeholder="Search…" />
 *   <InputGroupAddon side="append"><kbd>⌘K</kbd></InputGroupAddon>
 * </InputGroup>
 */
export type InputGroupProps = React.HTMLAttributes<HTMLDivElement>;
export type InputGroupAddonProps = React.HTMLAttributes<HTMLDivElement> & {
  side?: "prepend" | "append";
};

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex items-center gap-1 rounded-md border border-input bg-background",
        "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
InputGroup.displayName = "InputGroup";

/**
 * InputGroupAddon renders a prefix or suffix element inside the group. It
 * automatically adjusts border-radius so the composite looks like a single
 * control.
 */
const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ className, side = "prepend", ...props }, ref) => {
    const isPrepend = side === "prepend";
    return (
      <div
        ref={ref}
        data-side={side}
        className={cn(
          "flex items-center px-2.5 text-sm text-muted-foreground",
          isPrepend && "rounded-r-none border-r",
          !isPrepend && "rounded-l-none border-l",
          className,
        )}
        {...props}
      />
    );
  },
);
InputGroupAddon.displayName = "InputGroupAddon";

export { InputGroup, InputGroupAddon };

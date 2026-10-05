import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Motion } from "@fusorb/facet-motion";
import { cn } from "../utils.js";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    /** Color style. "brand" uses primary color; "neutral" uses popover surface. Default: "brand". */
    variant?: "brand" | "neutral";
  }
>(({ className, sideOffset = 4, variant = "brand", ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <Motion asChild effect="zoom" direction="up">
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-[70] overflow-hidden rounded-md px-3 py-1.5 text-xs data-[state=closed]:animate-facet-zoom-out",
          variant === "brand"
            ? "bg-primary text-primary-foreground"
            : "bg-popover text-popover-foreground",
          className,
        )}
        {...props}
      />
    </Motion>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

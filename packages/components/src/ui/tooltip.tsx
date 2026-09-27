import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Motion, Presence } from "@fusorb/facet-motion";
import { OverlayContext, useOverlayOpen } from "./motion-usage.js";
import { cn } from "../utils.js";

const TooltipProvider = TooltipPrimitive.Provider;

function Tooltip({
  open: openProp,
  onOpenChange,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>) {
  const [open, setOpen] = React.useState(false);
  const resolvedOpen = openProp ?? open;
  return (
    <OverlayContext.Provider value={{ open: resolvedOpen }}>
      <TooltipPrimitive.Root
        open={resolvedOpen}
        onOpenChange={(next: boolean) => {
          if (openProp === undefined) setOpen(next);
          onOpenChange?.(next);
        }}
        {...props}
      />
    </OverlayContext.Provider>
  );
}
Tooltip.displayName = TooltipPrimitive.Root.displayName;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    variant?: "brand" | "neutral";
  }
>(({ className, sideOffset = 4, variant = "brand", ...props }, ref) => {
  const open = useOverlayOpen();
  return (
    <TooltipPrimitive.Portal forceMount>
      <Presence present={open}>
        <Motion asChild effect="zoom" direction="up" exit>
          <TooltipPrimitive.Content
            ref={ref}
            sideOffset={sideOffset}
            className={cn(
              "z-[70] overflow-hidden rounded-md px-3 py-1.5 text-xs",
              variant === "brand"
                ? "bg-primary text-primary-foreground"
                : "bg-popover text-popover-foreground",
              className,
            )}
            {...props}
          />
        </Motion>
      </Presence>
    </TooltipPrimitive.Portal>
  );
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

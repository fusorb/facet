import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Motion, Presence } from "@fusorb/facet-motion";
import { OverlayContext, useOverlayOpen } from "./motion-usage.js";
import { cn } from "../utils.js";

export type PopoverProps = React.ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Root
>;
export type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Trigger
>;
export type PopoverAnchorProps = React.ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Anchor
>;
export type PopoverContentProps = React.ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Content
>;

function Popover({
  open: openProp,
  onOpenChange,
  ...props
}: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>) {
  const [open, setOpen] = React.useState(false);
  const resolvedOpen = openProp ?? open;
  return (
    <OverlayContext.Provider value={{ open: resolvedOpen }}>
      <PopoverPrimitive.Root
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
Popover.displayName = PopoverPrimitive.Root.displayName;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => {
  const open = useOverlayOpen();
  return (
    <PopoverPrimitive.Portal forceMount>
      <Presence present={open}>
        <Motion asChild effect="zoom" direction="up" exit>
          <PopoverPrimitive.Content
            ref={ref}
            align={align}
            sideOffset={sideOffset}
            className={cn(
              "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
              className,
            )}
            {...props}
          />
        </Motion>
      </Presence>
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };

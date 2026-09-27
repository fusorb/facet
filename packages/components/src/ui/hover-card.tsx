import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { Motion, Presence } from "@fusorb/facet-motion";
import { OverlayContext, useOverlayOpen } from "./motion-usage.js";
import { cn } from "../utils.js";

export type HoverCardProps = React.ComponentPropsWithoutRef<
  typeof HoverCardPrimitive.Root
>;
export type HoverCardTriggerProps = React.ComponentPropsWithoutRef<
  typeof HoverCardPrimitive.Trigger
>;
export type HoverCardContentProps = React.ComponentPropsWithoutRef<
  typeof HoverCardPrimitive.Content
>;

function HoverCard({
  open: openProp,
  onOpenChange,
  ...props
}: HoverCardProps) {
  const [open, setOpen] = React.useState(false);
  const resolvedOpen = openProp ?? open;
  return (
    <OverlayContext.Provider value={{ open: resolvedOpen }}>
      <HoverCardPrimitive.Root
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
HoverCard.displayName = HoverCardPrimitive.Root.displayName;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef<
  React.ComponentRef<typeof HoverCardPrimitive.Content>,
  HoverCardContentProps
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => {
  const open = useOverlayOpen();
  return (
    <Presence present={open}>
      <Motion asChild effect="zoom" direction="up" exit>
        <HoverCardPrimitive.Content
          ref={ref}
          align={align}
          sideOffset={sideOffset}
          forceMount
          className={cn(
            "z-[70] w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
            className,
          )}
          {...props}
        />
      </Motion>
    </Presence>
  );
});
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };

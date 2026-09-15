/**
 * Drawer: vaul-based bottom sheet, ideal for mobile-first detail panels
 * that slide in from any edge.
 */
import * as React from "react";
import { cn } from "../utils.js";
/**
 * Drawer
 *
 * A touch-friendly, bottom-sheet / side-sheet panel built on Vaul. Use it for
 * mobile menus, quick-action panels, or any surface that slides in from the
 * edge of the screen.
 *
 * Drawer is distinct from {@link Sheet}: Sheet is a centered or side
 * floating panel (Radix dialog), while Drawer is touch-first, edge-anchored,
 * and supports drag-to-dismiss. Control the anchor edge with the `direction`
 * prop on the root.
 *
 * @example
 * <Drawer direction="bottom">
 *   <DrawerTrigger>Open</DrawerTrigger>
 *   <DrawerContent>
 *     <DrawerHeader>
 *       <DrawerTitle>Confirm</DrawerTitle>
 *       <DrawerDescription>Are you sure?</DrawerDescription>
 *     </DrawerHeader>
 *     <DrawerFooter>
 *       <Button>Confirm</Button>
 *     </DrawerFooter>
 *   </DrawerContent>
 * </Drawer>
 */

import { Drawer as DrawerPrimitive } from "vaul";

export type DrawerProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Root
>;
export type DrawerTriggerProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Trigger
>;
export type DrawerOverlayProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Overlay
>;
export type DrawerContentProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Content
>;
export type DrawerHeaderProps = React.HTMLAttributes<HTMLDivElement>;
export type DrawerFooterProps = React.HTMLAttributes<HTMLDivElement>;
export type DrawerCloseProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Close
>;
export type DrawerTitleProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Title
>;
export type DrawerDescriptionProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Description
>;

const Drawer = DrawerPrimitive.Root;
const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerOverlay = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Overlay>,
  DrawerOverlayProps
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm",
      className,
    )}
    {...props}
  />
));
DrawerOverlay.displayName = "DrawerOverlay";

const DrawerContent = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Content>,
  DrawerContentProps
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Portal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-[70] flex h-auto flex-col gap-2 border bg-background p-4 shadow-xl",
        "data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:mx-auto data-[side=bottom]:w-full data-[side=bottom]:max-w-lg data-[side=bottom]:rounded-t-2xl",
        "data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:mx-auto data-[side=top]:w-full data-[side=top]:max-w-lg data-[side=top]:rounded-b-2xl",
        "data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:max-w-sm data-[side=left]:rounded-r-2xl",
        "data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:max-w-sm data-[side=right]:rounded-l-2xl",
        className,
      )}
      {...props}
    />
  </DrawerPrimitive.Portal>
));
DrawerContent.displayName = "Drawer.Content";

const DrawerHeader = React.forwardRef<HTMLDivElement, DrawerHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  ),
);
DrawerHeader.displayName = "Drawer.Header";

const DrawerFooter = React.forwardRef<HTMLDivElement, DrawerFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mt-auto flex flex-col gap-2 sm:flex-row sm:justify-end sm:space-x-2",
        className,
      )}
      {...props}
    />
  ),
);
DrawerFooter.displayName = "Drawer.Footer";

const DrawerClose = DrawerPrimitive.Close;
const DrawerTitle = DrawerPrimitive.Title;
const DrawerDescription = DrawerPrimitive.Description;

export {
  Drawer,
  DrawerTrigger,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerClose,
  DrawerTitle,
  DrawerDescription,
};

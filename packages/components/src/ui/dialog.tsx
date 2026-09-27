import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Motion, Presence } from "@fusorb/facet-motion";
import { OverlayContext, useOverlayOpen } from "./motion-usage.js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils.js";
import { Icon } from "../icon/index.js";

/** Semi-controlled Root: tracks open state internally and publishes it via
 *  <OverlayContext> so Content-side <Presence> + <Motion exit> can fire. */
function Dialog({
  open: openProp,
  onOpenChange,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
  const [open, setOpen] = React.useState(false);
  const resolvedOpen = openProp ?? open;
  return (
    <OverlayContext.Provider value={{ open: resolvedOpen }}>
      <DialogPrimitive.Root
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
Dialog.displayName = DialogPrimitive.Root.displayName;

const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const dialogOverlayVariants = cva("fixed inset-0 z-[70]", {
  variants: {
    variant: {
      dim: "bg-black/80",
      blur: "bg-background/70 backdrop-blur-sm",
    },
  },
  defaultVariants: {
    variant: "dim",
  },
});

interface DialogOverlayProps
  extends
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>,
    VariantProps<typeof dialogOverlayVariants> {}

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  DialogOverlayProps
>(({ className, variant, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      dialogOverlayVariants({ variant }),
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const dialogContentVariants = cva(
  "fixed left-[50%] top-[50%] z-[70] grid w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 p-6 text-foreground sm:w-full sm:rounded-lg",
  {
    variants: {
      variant: {
        default: "frost",
        compact: "frost max-w-md",
        blurred: "bg-card/90 backdrop-blur-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface DialogContentProps
  extends
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {}

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, variant, children, ...props }, ref) => {
  const open = useOverlayOpen();
  return (
    <DialogPrimitive.Portal forceMount>
      <Presence present={open}>
        <Motion asChild effect="fade" exit>
          <DialogOverlay />
        </Motion>
        <Motion asChild effect="zoom" direction="up" exit>
          <DialogPrimitive.Content
            ref={ref}
            className={cn(
              dialogContentVariants({ variant }),
              className,
            )}
            {...props}
          >
            {children}
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <Icon name="close" className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </Motion>
      </Presence>
    </DialogPrimitive.Portal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:space-x-3",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  dialogOverlayVariants,
  dialogContentVariants,
};
export type { DialogOverlayProps, DialogContentProps };

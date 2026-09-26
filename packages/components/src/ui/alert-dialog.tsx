import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { Motion } from "@fusorb/facet-motion";
import { cn } from "../utils.js";
import { buttonVariants } from "./button.js";
import { Icon } from "../icon/index.js";
import { Input } from "./input.js";
import { Label } from "./label.js";

const AlertDialogPrimitiveRoot = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;

/**
 * Tracks the Root's onOpenChange so AlertDialogContent can close the
 * dialog when the overlay (outside) is clicked: Radix's AlertDialog
 * intentionally does not dismiss on outside interaction.
 */
const AlertDialogCloseContext = React.createContext<
  ((open: boolean) => void) | undefined
>(undefined);

export interface AlertDialogProps extends React.ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Root
> {}

function AlertDialog({ onOpenChange, ...props }: AlertDialogProps) {
  return (
    <AlertDialogCloseContext.Provider value={onOpenChange}>
      <AlertDialogPrimitiveRoot onOpenChange={onOpenChange} {...props} />
    </AlertDialogCloseContext.Provider>
  );
}
AlertDialog.displayName = AlertDialogPrimitive.Root.displayName;

const AlertDialogOverlay = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[70] bg-black/80 data-[state=open]:animate-facet-fade-in data-[state=closed]:animate-facet-fade-out",
      className,
    )}
    {...props}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

export interface AlertDialogContentProps extends React.ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Content
> {
  /** Visual emphasis. Default: "default". */
  variant?: "default" | "destructive";
}

const AlertDialogContent = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Content>,
  AlertDialogContentProps
>(({ className, variant = "default", ...props }, ref) => {
  const close = React.useContext(AlertDialogCloseContext);
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay
        onClick={() => {
          // Clicking the overlay = outside click: close the dialog.
          close?.(false);
        }}
      />
      <Motion asChild effect="zoom" direction="up">
        <AlertDialogPrimitive.Content
          ref={ref}
          className={cn(
            "frost fixed left-[50%] top-[50%] z-[70] grid w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 p-6 text-foreground data-[state=closed]:animate-facet-zoom-out sm:w-full sm:rounded-lg",
            variant === "destructive" && "border-destructive/50 bg-destructive/5",
            className,
          )}
          {...props}
        />
      </Motion>
    </AlertDialogPortal>
  );
});
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName;

export interface AlertDialogActionProps extends React.ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Action
> {
  /** Button style. Default: "default". */
  variant?: "default" | "destructive";
}

const AlertDialogAction = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Action>,
  AlertDialogActionProps
>(({ className, variant = "default", ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(
      buttonVariants({
        variant: variant === "destructive" ? "destructive" : "default",
      }),
      className,
    )}
    {...props}
  />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), className)}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

/** Renders a warning icon sized for an alert dialog. */
export function AlertDialogIcon({ className }: { className?: string }) {
  return (
    <Icon
      name="triangle-alert"
      className={cn("size-5 text-destructive", className)}
    />
  );
}

/**
 * ConfirmAlertDialog: destructive-action confirmation with typed
 * verification, like GitHub's "type the repo name to delete" flow.
 *
 * Two inputs must be filled exactly before the confirm action enables:
 *   1. The name of the entity being deleted/deactivated.
 *   2. A confirmation phrase (e.g. "confirm delete").
 *
 * Usage:
 *   <ConfirmAlertDialog
 *     entityName="My Project"
 *     entityLabel="project"
 *     confirmPhrase="confirm delete"
 *     actionLabel="Delete project"
 *     trigger={<Button variant="destructive">Delete</Button>}
 *     onConfirm={() => ...}
 *   />
 *
 * The dialog handles its own open state, but accepts controlled `open` /
 * `onOpenChange`. Pass `actionVariant="destructive"` to style the confirm
 * button as destructive.
 */
export interface ConfirmAlertDialogProps {
  /** The name the user must type to unlock confirmation. */
  entityName: string;
  /** Human label for the entity, e.g. "project" (used in helper text). */
  entityLabel?: string;
  /** The phrase the user must type to confirm the action. Default: "confirm delete". */
  confirmPhrase?: string;
  /** Label for the destructive confirm button. */
  actionLabel?: string;
  /** Trigger element (typically a Button). Rendered via asChild. */
  trigger: React.ReactNode;
  /** Called when both inputs match and the confirm button is clicked. */
  onConfirm?: () => void;
  /** Called when the dialog closes (cancel or confirm). */
  onOpenChange?: (open: boolean) => void;
  /** Controlled open state. Defaults to internal state. */
  open?: boolean;
  /** Style the confirm button as destructive. Default: true. */
  destructive?: boolean;
  /** Accessible description shown under the title. */
  description?: React.ReactNode;
  /** Extra content rendered above the footer. */
  children?: React.ReactNode;
}

export function ConfirmAlertDialog({
  entityName,
  entityLabel = "name",
  confirmPhrase = "confirm delete",
  actionLabel = "Delete",
  trigger,
  onConfirm,
  onOpenChange,
  open: openProp,
  destructive = true,
  description,
  children,
}: ConfirmAlertDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp !== undefined) {
        onOpenChange?.(next);
      } else {
        setInternalOpen(next);
      }
    },
    [openProp, onOpenChange],
  );
  const [nameInput, setNameInput] = React.useState("");
  const [phraseInput, setPhraseInput] = React.useState("");

  // Reset inputs whenever the dialog (re)opens.
  React.useEffect(() => {
    if (open) {
      setNameInput("");
      setPhraseInput("");
    }
  }, [open]);

  const nameMatch =
    nameInput.trim().toLowerCase() === entityName.trim().toLowerCase();
  const phraseMatch =
    phraseInput.trim().toLowerCase() === confirmPhrase.trim().toLowerCase();
  const confirmed = nameMatch && phraseMatch;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent variant={destructive ? "destructive" : "default"}>
        <AlertDialogHeader>
          <div className="flex items-start gap-3 sm:items-center">
            {destructive && (
              <AlertDialogIcon className="mt-0.5 shrink-0 sm:mt-0" />
            )}
            <div className="flex flex-col gap-1.5">
              <AlertDialogTitle>
                {actionLabel} this {entityLabel}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {description ?? (
                  <>
                    This action cannot be undone. Type{" "}
                    <strong>{entityName}</strong> and{" "}
                    <strong>{confirmPhrase}</strong> to continue.
                  </>
                )}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        {children}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="confirm-entity-name">
              To confirm, type "{entityName}"
            </Label>
            <Input
              id="confirm-entity-name"
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              placeholder={entityName}
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-phrase">
              To confirm, type "{confirmPhrase}"
            </Label>
            <Input
              id="confirm-phrase"
              value={phraseInput}
              onChange={(event) => setPhraseInput(event.target.value)}
              placeholder={confirmPhrase}
              autoComplete="off"
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={!confirmed}
            onClick={() => onConfirm?.()}
            variant={destructive ? "destructive" : "default"}
          >
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
ConfirmAlertDialog.displayName = "ConfirmAlertDialog";

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};

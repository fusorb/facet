/**
 * @category layout
 * @summary Collapsible
 */
/**
 * Collapsible: expand/collapse section built on Radix Collapsible primitive.
 *
 * Usage:
 *   <Collapsible>
 *     <CollapsibleTrigger>Toggle</CollapsibleTrigger>
 *     <CollapsibleContent>Hidden content</CollapsibleContent>
 *   </Collapsible>
 */

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { cn } from "../utils.js";

export type CollapsibleProps = React.ComponentPropsWithoutRef<
  typeof CollapsiblePrimitive.Root
>;
export type CollapsibleTriggerProps = React.ComponentPropsWithoutRef<
  typeof CollapsiblePrimitive.CollapsibleTrigger
>;
export type CollapsibleContentProps = React.ComponentPropsWithoutRef<
  typeof CollapsiblePrimitive.CollapsibleContent
>;

const Collapsible = ({ className, ...props }: CollapsibleProps) => (
  <CollapsiblePrimitive.Root
    className={cn("group/collapsible", className)}
    {...props}
  />
);

const CollapsibleTrigger = ({
  className,
  ...props
}: CollapsibleTriggerProps) => (
  <CollapsiblePrimitive.CollapsibleTrigger
    className={cn(
      "cursor-pointer transition-colors focus-visible:outline-none",
      className,
    )}
    {...props}
  />
);

const CollapsibleContent = React.forwardRef<
  React.ComponentRef<typeof CollapsiblePrimitive.CollapsibleContent>,
  CollapsibleContentProps
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleContent
    ref={ref}
    className={cn(
      "overflow-hidden [--radix-accordion-content-height:var(--radix-collapsible-content-height)] data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up",
      className,
    )}
    {...props}
  />
));
CollapsibleContent.displayName = CollapsiblePrimitive.CollapsibleContent.displayName;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

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

const CollapsibleContent = ({
  className,
  ...props
}: CollapsibleContentProps) => (
  <CollapsiblePrimitive.CollapsibleContent
    className={cn("overflow-hidden", className)}
    {...props}
  />
);

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

/**
 * Toaster: styled sonner toast provider.
 *
 * Usage in an app root layout:
 *   import { Toaster } from "@fusorb/facet-components";
 *
 *   <Toaster />
 *
 * Then in any component:
 *   import { toast } from "sonner";
 *   toast.success("Saved!");
 */

import * as React from "react";
import { Toaster as Sonner } from "sonner";
import type { ToasterProps as SonnerToasterProps } from "sonner";
import { cn } from "../utils.js";

export type ToasterProps = SonnerToasterProps;

const Toaster = ({ className, ...props }: ToasterProps) => {
  return (
    <Sonner
      className={cn("toaster group", className)}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-md)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

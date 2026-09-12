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

import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
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

import { cn } from "@fusorb/facet-components";
import { site } from "../site.config.js";

/**
 * Minimal monogram mark (a single letter) used until a final logo is
 * chosen. The letter comes from site.brand.monogram, so a real logo can
 * replace this component later without touching any other file.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-md bg-gradient-to-br from-primary to-alpha-electric-cyan font-heading font-bold text-primary-foreground",
        className,
      )}
      aria-hidden="true"
    >
      {site.brand.monogram}
    </span>
  );
}

/** Wordmark: monogram + product name (both from site config). */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark className="h-6 w-6 text-sm" />
      <span className="font-heading text-lg font-bold text-foreground">
        {site.brand.name}
      </span>
    </span>
  );
}

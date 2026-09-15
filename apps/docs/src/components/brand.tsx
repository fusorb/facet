import { cn } from "@fusorb/facet-components";

/**
 * Minimal monogram mark (letter "f") used until a final logo is chosen.
 * Single source of truth for the brand glyph in this app.
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
      f
    </span>
  );
}

/**
 * @fusorb/facet-components: ShineBorderCard
 *
 * A card with an animated shine that travels around the border. A
 * distinct surface from `BorderBeamCard` (which uses a conic beam)
 * and `GlowBorderCard` (which pulses a glow). Hosts pass children +
 * optional color / duration.
 */

import * as React from "react";
import { cn } from "../utils.js";

/* ── Types ─────────────────────────────────────────────────── */

export interface ShineBorderCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Shine color (CSS). Default: theme primary. */
  color?: string;
  /** Border radius (CSS). Default: 1rem. */
  borderRadius?: string;
  /** Border thickness in px. Default: 2. */
  borderWidth?: number;
  /** Shine duration in seconds. Default: 3. */
  duration?: number;
  /** Optional container className. */
  containerClassName?: string;
}

/* ── Helpers ───────────────────────────────────────────────── */

const DEFAULT_COLOR = "var(--primary)";

/* ── Component ─────────────────────────────────────────────── */

/**
 * A card with an animated shine that travels around the border.
 */
export function ShineBorderCard({
  children,
  color = DEFAULT_COLOR,
  borderRadius = "1rem",
  borderWidth = 2,
  duration = 3,
  className,
  containerClassName,
  ...rest
}: ShineBorderCardProps) {
  return (
    <div
      className={cn("relative isolate overflow-hidden", containerClassName)}
      style={{
        padding: borderWidth,
        borderRadius,
        background: `linear-gradient(90deg, transparent 0%, transparent 40%, ${color} 50%, transparent 60%, transparent 100%)`,
        backgroundSize: "200% 100%",
        animation: `facet-shine ${duration}s linear infinite`,
      }}
    >
      <div
        {...rest}
        className={cn(
          "relative h-full w-full rounded-[calc(theme(borderRadius)-2px)] border border-border bg-card text-card-foreground",
          className,
        )}
        style={{ borderRadius: `calc(${borderRadius} - ${borderWidth}px)` }}
      >
        {children}
      </div>
      <style>{`
        @keyframes facet-shine {
          0% { background-position: 100% 50%; }
          100% { background-position: -100% 50%; }
        }
      `}</style>
    </div>
  );
}

ShineBorderCard.displayName = "ShineBorderCard";

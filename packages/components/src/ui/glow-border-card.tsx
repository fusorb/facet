/**
 * @fusorb/facet-components: GlowBorderCard
 *
 * A card with a pulsing glow around the border. Distinct from
 * `GlowCard` (which has an inner glow) and `ShineBorderCard`
 * (which travels a highlight along the border).
 */

import * as React from "react";
import { cn } from "../utils.js";

/* ── Types ─────────────────────────────────────────────────── */

export interface GlowBorderCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Glow color (CSS). Default: theme primary. */
  color?: string;
  /** Border radius. Default: 1rem. */
  borderRadius?: string;
  /** Pulse duration in seconds. Default: 2.4. */
  duration?: number;
  /** Initial glow intensity (box-shadow alpha). Default: 0.5. */
  intensity?: number;
  /** Optional container className. */
  containerClassName?: string;
}

/* ── Helpers ───────────────────────────────────────────────── */

const DEFAULT_COLOR = "var(--primary)";

/* ── Component ─────────────────────────────────────────────── */

/**
 * A card with a pulsing glow around its border.
 */
export function GlowBorderCard({
  children,
  color = DEFAULT_COLOR,
  borderRadius = "1rem",
  duration = 2.4,
  intensity = 0.5,
  className,
  containerClassName,
  style,
  ...rest
}: GlowBorderCardProps) {
  return (
    <div
      className={cn("relative isolate overflow-hidden", containerClassName)}
      style={{
        borderRadius,
        opacity: 0.7 + intensity * 0.3,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[inherit]"
        style={{
          boxShadow: `0 0 0 1px ${color}, 0 0 24px ${color}`,
          animation: `facet-glow-pulse ${duration}s ease-in-out infinite`,
        }}
      />
      <div
        {...rest}
        className={cn(
          "relative h-full w-full rounded-[inherit] border border-border bg-card text-card-foreground",
          className,
        )}
        style={style}
      >
        {children}
      </div>
      <style>{`
        @keyframes facet-glow-pulse {
          0%, 100% { opacity: ${0.5 + intensity * 0.3}; }
          50% { opacity: ${Math.min(1, 1 + intensity * 0.5)}; }
        }
      `}</style>
    </div>
  );
}

GlowBorderCard.displayName = "GlowBorderCard";
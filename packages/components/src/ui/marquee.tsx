/**
 * Marquee: auto-scrolling horizontal ticker with pause-on-hover support.
 * Supports a "strip" variant for a continuous-motion strip (no pause-on-hover
 * by default, composable via className).
 */
import * as React from "react";
import { cn } from "../utils.js";

export type MarqueeVariant = "loop" | "strip";

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Items rendered repeatedly across the track. */
  items: React.ReactNode[];
  /** Animation duration in seconds. Default: 20 */
  duration?: number;
  /** Reverse the scroll direction. Default: false */
  reverse?: boolean;
  /** Pause scrolling while the pointer is over the track. Default: true
   *  (false for the "strip" variant). */
  pauseOnHover?: boolean;
  /**
   * Gap between items. Accepts a number (px, clamped to 4-32) or any CSS
   * length string ("0.5rem", "20px", ...). Default: 16 (px).
   */
  gap?: number | string;
  /**
   * Visual variant. "loop" (default) duplicates items for a seamless
   * looping ticker with pause-on-hover. "strip" is a continuous-motion
   * strip: no pause-on-hover, and a `facet-marquee--strip` class for
   * consumer overrides (e.g. edge fade gradients or solid backgrounds).
   * All other props (duration, reverse, gap, className) still apply.
   */
  variant?: MarqueeVariant;
}

/**
 * A CSS-only marquee. Children are duplicated to form a seamless loop, and
 * the track animates with a transform translateX keyframe. Accessibility
 * focus and hover pauses are handled without JavaScript animation state.
 * The `facet-marquee` keyframe is defined in `@fusorb/facet-tokens`
 * (tokens.css / tailwind.css).
 *
 * The "strip" variant shares the same engine (item duplication +
 * translateX) but defaults `pauseOnHover` to false and applies a
 * variant class so consumers can target it in CSS -- e.g. to add a
 * fade-to-background gradient at the edges or a distinct background.
 */
const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(
  (
    {
      items,
      duration = 20,
      reverse = false,
      pauseOnHover,
      gap = 16,
      variant = "loop",
      className,
      ...props
    },
    ref,
  ) => {
    const track = React.useMemo(() => [...items, ...items], [items]);
    const [paused, setPaused] = React.useState(false);

    // Strip variant: continuous motion by default (no hover pause).
    const hover = pauseOnHover ?? variant === "loop";

    // Normalize gap: numeric px (clamped to a safe 4-32px band so spacing
    // never collapses or explodes), or a passthrough CSS length string.
    const gapCss = typeof gap === "number" ? `${Math.min(32, Math.max(4, gap))}px` : gap;

    return (
      <div
        ref={ref}
        role="marquee"
        aria-label="Scrolling content"
        className={cn(
          "group flex w-full overflow-hidden",
          variant === "strip" && "facet-marquee--strip",
          className,
        )}
        onMouseEnter={hover ? () => setPaused(true) : undefined}
        onMouseLeave={hover ? () => setPaused(false) : undefined}
        {...props}
      >
        <div
          className="flex shrink-0 items-center"
          style={{
            gap: gapCss,
            animation: `facet-marquee ${duration}s linear infinite`,
            animationDirection: reverse ? "reverse" : "normal",
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {track.map((item, i) => (
            <React.Fragment key={i}>
              {item}
              <span aria-hidden="true" style={{ width: gapCss }} />
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  },
);
Marquee.displayName = "Marquee";

export { Marquee };

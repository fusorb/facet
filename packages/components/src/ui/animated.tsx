/**
 * @fusorb/facet-components: Animated backgrounds & micro-interactions
 *
 * Ready-to-use decorative layers for hero sections and CTAs:
 *   - Spotlight: a radial glow that follows the cursor.
 *   - Aurora: slow-moving conic gradient blobs (pure CSS animation).
 *   - Beams: diagonal light beams sweeping across a container.
 *   - GridPattern: subtle grid + radial mask background.
 *   - SparkleButton: primary CTA that bursts sparkles on click.
 *
 * All are zero-dependency (pure CSS keyframes + a couple of pointer
 * handlers). Compose them under your own hero content.
 */

import * as React from "react";
import { cn } from "../utils.js";

/* ── Spotlight ─────────────────────────────────────────────── */

export interface SpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accent color of the glow. Default: var(--primary) with alpha. */
  color?: string;
  /** Blur radius in px. Default: 80. */
  blur?: number;
}

/** A radial glow that follows the cursor inside its container. */
export const Spotlight = React.forwardRef<HTMLDivElement, SpotlightProps>(
  ({ className, color = "var(--primary)", blur = 80, ...props }, ref) => {
    const [pos, setPos] = React.useState<{ x: number; y: number }>({
      x: 0,
      y: 0,
    });
    const [visible, setVisible] = React.useState(false);

    const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      setVisible(true);
    };

    return (
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => setVisible(false)}
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: visible ? 1 : 0,
            background: `radial-gradient(${blur}px circle at ${pos.x}px ${pos.y}px, ${color}, transparent 70%)`,
          }}
        />
        {props.children}
      </div>
    );
  },
);
Spotlight.displayName = "Spotlight";

/* ── Aurora ────────────────────────────────────────────────── */

export interface AuroraProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Gradient stops. Default: var(--primary), fuchsia, var(--alpha-electric-cyan). */
  colors?: string[];
  /** Opacity of the aurora layer. Default: 0.5. */
  opacity?: number;
}

/** Slow-moving conic gradient blobs (pure CSS animation). */
export const Aurora = React.forwardRef<HTMLDivElement, AuroraProps>(
  (
    {
      className,
      colors = ["var(--primary)", "#d946ef", "var(--alpha-electric-cyan)"],
      opacity = 0.5,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      aria-hidden="true"
      {...props}
    >
      <div
        className="absolute -inset-1/2 animate-[facet-aurora_18s_ease-in-out_infinite_alternate]"
        style={{
          background: `conic-gradient(from 180deg at 50% 50%, ${colors.join(", ")})`,
          filter: "blur(60px)",
          opacity,
        }}
      />
      {props.children}
    </div>
  ),
);
Aurora.displayName = "Aurora";

/* ── Beams ─────────────────────────────────────────────────── */

export interface BeamsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of beams. Default: 3. */
  count?: number;
  /** Beam color. Default: var(--primary) at low opacity. */
  color?: string;
}

/** Diagonal light beams sweeping across a container. */
export const Beams = React.forwardRef<HTMLDivElement, BeamsProps>(
  ({ className, count = 3, color = "var(--primary)", ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      aria-hidden="true"
      {...props}
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="absolute inset-y-0 w-40 -skew-x-12 animate-[facet-beam_7s_ease-in-out_infinite]"
          style={{
            left: `${(i + 1) * 25}%`,
            background: `linear-gradient(to right, transparent, ${color}, transparent)`,
            animationDelay: `${i * 2}s`,
          }}
        />
      ))}
      {props.children}
    </div>
  ),
);
Beams.displayName = "Beams";

/* ── GridPattern ───────────────────────────────────────────── */

export interface GridPatternProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Grid line color. Default: currentColor at low opacity. */
  color?: string;
  /** Cell size in px. Default: 40. */
  size?: number;
}

/** A subtle grid with a radial mask (fades out toward the edges). */
export const GridPattern = React.forwardRef<HTMLDivElement, GridPatternProps>(
  ({ className, color = "currentColor", size = 40, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        opacity: 0.15,
      }}
      {...props}
    />
  ),
);
GridPattern.displayName = "GridPattern";

/* ── SparkleButton ─────────────────────────────────────────── */

export interface SparkleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Label. Default: "Get started". */
  label?: string;
}

/** A primary CTA that bursts sparkles from the click point. */
export const SparkleButton = React.forwardRef<
  HTMLButtonElement,
  SparkleButtonProps
>(({ className, label = "Get started", children, ...props }, ref) => {
  const hostRef = React.useRef<HTMLButtonElement | null>(null);

  const burst = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = hostRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    for (let i = 0; i < 10; i++) {
      const span = document.createElement("span");
      span.className =
        "pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-white animate-[facet-sparkle_0.7s_ease-out]";
      const angle = (Math.PI * 2 * i) / 10;
      const dist = 40 + Math.random() * 30;
      span.style.left = `${x}px`;
      span.style.top = `${y}px`;
      span.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      span.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
      el.appendChild(span);
      setTimeout(() => span.remove(), 750);
    }
  };

  return (
    <button
      ref={(node) => {
        hostRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      onClick={burst}
      className={cn(
        "relative inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90",
        className,
      )}
      {...props}
    >
      {children ?? label}
    </button>
  );
});
SparkleButton.displayName = "SparkleButton";

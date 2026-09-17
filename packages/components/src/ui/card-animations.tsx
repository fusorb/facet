/**
 * @fusorb/facet-components: card animations
 *
 * A family of animated card surfaces: 3D flip, cursor spotlight,
 * animated border beams, shine sweeps, gradient borders, scroll reveal,
 * hover lift, and magnetic pull. All SSR-safe (initial render is static;
 * effects run after mount / on interaction).
 *
 * Each component renders a full-width, responsive surface that composes
 * the Card primitive and the semantic Icon registry, so card content
 * stays consistent with the rest of the library.
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Card } from "./card.js";
import { Icon, type IconName } from "../icon/index.js";
import {
  resolveMotion,
  preferReducedMotion,
  resolveEasing,
} from "@fusorb/facet-motion";

/* ── FlipCard ─────────────────────────────────────────────── */

export interface FlipCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Front face content. */
  front: React.ReactNode;
  /** Back face content. */
  back: React.ReactNode;
  /** Flip direction. Default: "horizontal". */
  direction?: "horizontal" | "vertical";
  /** Flip duration, in ms. Default: 600. */
  duration?: number;
  /** Flip on hover instead of click. Default: false. */
  hover?: boolean;
  /** Aspect ratio of the card. Default: "aspect-[4/3]". */
  aspect?: string;
  /** Semantic icon on the front face (overlaid center). */
  icon?: IconName;
  /** Icon label for a11y. */
  iconLabel?: string;
  /** Front face label (e.g. "Read more"). */
  frontLabel?: string;
  /** Back face label (e.g. "Tap to flip back"). */
  backLabel?: string;
}

/**
 * A card that flips to reveal a back face on click (or hover). The front
 * and back faces are absolutely stacked; the parent sizes them with
 * `aspect` so the flip keeps a fixed footprint on every breakpoint.
 */
export function FlipCard({
  front,
  back,
  direction = "horizontal",
  duration = 600,
  hover = false,
  aspect = "aspect-[4/3]",
  icon,
  iconLabel,
  frontLabel,
  backLabel,
  className,
  style,
  ...props
}: FlipCardProps) {
  const [flipped, setFlipped] = React.useState(false);
  const rotate =
    direction === "vertical" ? "rotateX(180deg)" : "rotateY(180deg)";

  return (
    <div
      className={cn("[perspective:1200px]", className)}
      style={{ ...style, aspectRatio: undefined }}
      onClick={hover ? undefined : () => setFlipped((f) => !f)}
      onMouseEnter={hover ? () => setFlipped(true) : undefined}
      onMouseLeave={hover ? () => setFlipped(false) : undefined}
      role={hover ? undefined : "button"}
      tabIndex={hover ? undefined : 0}
      aria-label={hover ? undefined : (frontLabel ?? "Flip card")}
      onKeyDown={
        hover
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setFlipped((f) => !f);
              }
            }
      }
      {...props}
    >
      <div className={cn("relative h-full w-full", aspect)}>
        <div
          className="absolute inset-0 transition-transform"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? rotate : "none",
            transitionDuration: `${duration}ms`,
          }}
        >
          {/* Front face: renders the `front` content prop (or fallback label). */}
          <div
            className="absolute inset-0 [backface-visibility:hidden]"
            style={{ WebkitBackfaceVisibility: "hidden" }}
          >
            <Card className="flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden border-border bg-background p-6 text-center">
              {front ??
                (icon && (
                  <Icon
                    name={icon}
                    className="size-10 text-primary"
                    aria-label={iconLabel}
                  />
                ))}
              {front == null && frontLabel && (
                <p className="text-sm font-medium text-muted-foreground">
                  {frontLabel}
                </p>
              )}
            </Card>
          </div>
          {/* Back face: renders the `back` content prop (or fallback label). */}
          <div
            className="absolute inset-0 [backface-visibility:hidden]"
            style={{ WebkitBackfaceVisibility: "hidden", transform: rotate }}
          >
            <Card className="flex h-full w-full items-center justify-center overflow-hidden border-border bg-muted/30 p-6 text-center">
              {back ??
                (backLabel && (
                  <p className="text-sm font-medium text-muted-foreground">
                    {backLabel}
                  </p>
                ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

FlipCard.displayName = "FlipCard";

/* ── ShineCard ────────────────────────────────────────────── */

export interface ShineCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Highlight color. Default: white at 60% (visible on both light and dark surfaces). */
  shineColor?: string;
  /** Sweep duration, in ms. Default: 700. */
  duration?: number;
  /** Trigger on hover only (default) or loop continuously. */
  loop?: boolean;
}

/**
 * A card with a light sheen that sweeps across the surface on hover
 * (or continuously when `loop` is set). Mirrors ShineButton: a
 * `group`-driven gradient sweep that translates across the card.
 */
export function ShineCard({
  shineColor = "rgba(255,255,255,0.6)",
  duration = 700,
  loop = false,
  className,
  children,
  style,
  ...props
}: ShineCardProps) {
  // Mirrors the ShineButton sheen: a full-width highlight that sweeps across
  // the surface on hover (or loops continuously). The gradient is applied
  // inline so the `shineColor` prop is always respected over any Tailwind
  // gradient class, and the sweep is wide enough to read as a shine on both
  // light and dark surfaces.
  const gradient = `linear-gradient(90deg, transparent, ${shineColor}, transparent)`;
  return (
    <Card
      className={cn("group relative w-full overflow-hidden", className)}
      style={style}
      {...props}
    >
      {loop ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: gradient,
            backgroundSize: "200% 100%",
            animation: `facet-shimmer ${duration}ms linear infinite`,
          }}
        />
      ) : (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full transition-transform group-hover:translate-x-full"
          style={{
            backgroundImage: gradient,
            transitionDuration: `${duration}ms`,
          }}
        />
      )}
      <span className="relative block">{children}</span>
    </Card>
  );
}

ShineCard.displayName = "ShineCard";

/* ── GradientBorderCard ───────────────────────────────────── */

export interface GradientBorderCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Gradient stops for the border. Default: primary -> fuchsia -> cyan. */
  colors?: string[];
  /** Border thickness, in px. Default: 1.5. */
  thickness?: number;
}

/** A card with a static gradient border and a solid content surface. */
export function GradientBorderCard({
  colors = ["var(--primary)", "#d946ef", "var(--alpha-electric-cyan)"],
  thickness = 1.5,
  className,
  children,
  style,
  ...props
}: GradientBorderCardProps) {
  return (
    <div
      className={cn("relative w-full rounded-xl", className)}
      style={
        {
          ...style,
          padding: thickness,
          background: `linear-gradient(135deg, ${colors.join(", ")})`,
        } as React.CSSProperties
      }
      {...props}
    >
      <Card className="relative w-full rounded-[calc(0.75rem-1px)] border-0 bg-background">
        {children}
      </Card>
    </div>
  );
}

GradientBorderCard.displayName = "GradientBorderCard";

/* ── RevealCard ───────────────────────────────────────────── */

export interface RevealCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Delay before reveal, in ms. Default: 0. */
  delay?: number;
  /** Reveal duration, in ms. Default: 600. */
  duration?: number;
  /** Y offset before reveal, in px. Default: 24. */
  y?: number;
}

/**
 * A card wrapper that fades + slides in when it scrolls into view
 * (IntersectionObserver, one-shot).
 */
export function RevealCard({
  delay = 0,
  duration = 600,
  y: _y = 24,
  className,
  children,
  style,
  ...props
}: RevealCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  const [reduce, setReduce] = React.useState(false);
  const resolved = React.useMemo(() => resolveMotion("fade", { direction: "up" }), []);
  React.useEffect(() => {
    const isReduced = preferReducedMotion();
    setReduce(isReduced);
    if (isReduced) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={cn("w-full will-change-[opacity,transform]", className)}
      style={
        {
          ...style,
          ...(visible ? resolved?.to : resolved?.from),
          transition: reduce
            ? "none"
            : `opacity, transform ${duration}ms ${resolveEasing("standard")}`,
          transitionDelay: `${delay}ms`,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  );
}

RevealCard.displayName = "RevealCard";

/* ── HoverScaleCard ───────────────────────────────────────── */

export interface HoverScaleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Hover scale. Default: 1.03. */
  scale?: number;
  /** Transition duration, in ms. Default: 200. */
  duration?: number;
  /** Shadow lift on hover. Default: true. */
  lift?: boolean;
}

/** A card that subtly scales and lifts on hover. */
export function HoverScaleCard({
  scale = 1.03,
  duration = 200,
  lift = true,
  className,
  children,
  style,
  ...props
}: HoverScaleCardProps) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      className={cn("w-full transition-all will-change-transform", className)}
      style={{
        ...style,
        transform: hovered ? `scale(${scale})` : "none",
        boxShadow:
          hovered && lift ? "0 12px 32px -12px rgb(0 0 0 / 0.25)" : undefined,
        transitionDuration: `${duration}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...props}
    >
      {children}
    </div>
  );
}

HoverScaleCard.displayName = "HoverScaleCard";

/* ── MagneticCard ─────────────────────────────────────────── */

export interface MagneticCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Magnetic pull strength, in px. Default: 12. */
  strength?: number;
}

/**
 * A card that gravitates toward the cursor (translates up to
 * `strength` px in the cursor's direction).
 */
export function MagneticCard({
  strength = 12,
  className,
  children,
  style,
  ...props
}: MagneticCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const dist = Math.hypot(dx, dy) || 1;
    const pull = Math.min(1, 200 / dist);
    setOffset({
      x: (dx / dist) * strength * pull,
      y: (dy / dist) * strength * pull,
    });
  };
  const onLeave = () => setOffset({ x: 0, y: 0 });
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "w-full transition-transform duration-200 will-change-transform",
        className,
      )}
      style={{ ...style, transform: `translate(${offset.x}px, ${offset.y}px)` }}
      {...props}
    >
      {children}
    </div>
  );
}

MagneticCard.displayName = "MagneticCard";

/* ── DissolveCard ──────────────────────────────────────────── */

export interface DissolveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Entrance delay in ms for staggered layouts. Default: 0. */
  delay?: number;
}

/** A card that dissolves into view on mount, then reveals a subtle
 *  overlay on hover. SSR-safe: content renders statically; the
 *  entrance animation is applied client-side via CSS fill-mode. */
export function DissolveCard({
  className,
  delay = 0,
  children,
  ...props
}: DissolveCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-border bg-background p-6 shadow-sm",
        "animate-facet-dissolve",
        "before:absolute before:inset-0 before:-z-10 before:rounded-xl",
        "before:bg-gradient-to-r before:from-white/0 before:via-white/5 before:to-white/0",
        "before:opacity-0 before:blur before:duration-300 before:ease-out",
        "hover:before:opacity-100",
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </div>
  );
}
DissolveCard.displayName = "DissolveCard";

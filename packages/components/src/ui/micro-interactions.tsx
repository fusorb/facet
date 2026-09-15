/**
 * @fusorb/facet-components: card & button micro-interactions
 *
 * Subtle, dependency-free interactive surfaces: 3D tilt cards, cursor
 * glow, ripple/magnetic/shine buttons, and a generic scroll-reveal
 * wrapper. All SSR-safe (initial render is static; effects run after
 * mount / on interaction).
 */

import * as React from "react";
import { cn } from "../utils.js";

/* ── TiltCard ──────────────────────────────────────────────── */

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max tilt angle in degrees. Default: 8. */
  maxTilt?: number;
  /** Scale on hover. Default: 1.02. */
  scale?: number;
  /** Whether to render a glare highlight. Default: true. */
  glare?: boolean;
}

/** A card that tilts toward the cursor in 3D, with an optional glare. */
export function TiltCard({
  maxTilt = 8,
  scale = 1.02,
  glare = true,
  className,
  children,
  style,
  ...props
}: TiltCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [transform, setTransform] = React.useState("");

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTransform(
      `perspective(800px) rotateX(${(-py * maxTilt).toFixed(2)}deg) rotateY(${(px * maxTilt).toFixed(2)}deg) scale(${scale})`,
    );
  };
  const onLeave = () => setTransform("");

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "relative transition-transform duration-200 will-change-transform",
        className,
      )}
      style={
        {
          ...style,
          transform,
          transformStyle: "preserve-3d",
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
      {glare && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-200 [background:radial-gradient(600px_circle_at_var(--gx,50%)_var(--gy,50%),rgba(255,255,255,0.12),transparent_45%)]"
          onMouseMove={(e) => {
            const el = ref.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            e.currentTarget.style.setProperty(
              "--gx",
              `${((e.clientX - r.left) / r.width) * 100}%`,
            );
            e.currentTarget.style.setProperty(
              "--gy",
              `${((e.clientY - r.top) / r.height) * 100}%`,
            );
            e.currentTarget.style.opacity = "1";
          }}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
        />
      )}
    </div>
  );
}

/* ── GlowCard ──────────────────────────────────────────────── */

export interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Glow color. Default: var(--primary). */
  color?: string;
  /** Glow blur radius in px. Default: 80. */
  blur?: number;
}

/** A card with a cursor-following radial glow on its surface. */
export function GlowCard({
  color = "var(--primary)",
  blur = 80,
  className,
  children,
  style,
  ...props
}: GlowCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [glow, setGlow] = React.useState<{ x: number; y: number; o: number }>({
    x: 0,
    y: 0,
    o: 0,
  });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setGlow({ x: e.clientX - r.left, y: e.clientY - r.top, o: 1 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setGlow((g) => ({ ...g, o: 0 }))}
      className={cn("relative overflow-hidden", className)}
      style={style}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: glow.o,
          background: `radial-gradient(circle ${blur}px at ${glow.x}px ${glow.y}px, ${color}, transparent 70%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ── RippleButton ──────────────────────────────────────────── */

export interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Ripple color. Default: rgba(255,255,255,0.35). */
  rippleColor?: string;
}

/** A button that bursts an ink ripple from the click point. */
export function RippleButton({
  rippleColor = "rgba(255,255,255,0.35)",
  className,
  children,
  onClick,
  ...props
}: RippleButtonProps) {
  const host = React.useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = host.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const d = Math.max(r.width, r.height) * 2;
      const span = document.createElement("span");
      span.className =
        "pointer-events-none absolute rounded-full animate-[facet-ripple_0.6s_ease-out_forwards]";
      span.style.width = span.style.height = `${d}px`;
      span.style.left = `${e.clientX - r.left - d / 2}px`;
      span.style.top = `${e.clientY - r.top - d / 2}px`;
      span.style.background = rippleColor;
      el.appendChild(span);
      setTimeout(() => span.remove(), 600);
    }
    onClick?.(e);
  };

  return (
    <button
      ref={host}
      onClick={handleClick}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── MagneticButton ────────────────────────────────────────── */

export interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Max pull distance in px. Default: 12. */
  strength?: number;
}

/** A button that gravitates toward the cursor and springs back. */
export function MagneticButton({
  strength = 12,
  className,
  children,
  style,
  ...props
}: MagneticButtonProps) {
  const inner = React.useRef<HTMLButtonElement>(null);

  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = inner.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${(x / r.width) * strength}px, ${(y / r.height) * strength}px)`;
  };
  const onLeave = () => {
    const el = inner.current;
    if (el) el.style.transform = "translate(0,0)";
  };

  return (
    <button
      ref={inner}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "transition-transform duration-200 will-change-transform",
        className,
      )}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── ShineButton ───────────────────────────────────────────── */

export interface ShineButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Shine color. Default: rgba(255,255,255,0.4). */
  shineColor?: string;
}

/** A button with a light sweep across on hover. */
export function ShineButton({
  shineColor = "rgba(255,255,255,0.4)",
  className,
  children,
  style,
  ...props
}: ShineButtonProps) {
  return (
    <button
      className={cn("group relative overflow-hidden", className)}
      style={style}
      {...props}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </button>
  );
}

/* ── ScrollReveal ──────────────────────────────────────────── */

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Delay before revealing, in ms. Default: 0. */
  delay?: number;
  /** Animation duration, in ms. Default: 600. */
  duration?: number;
  /** Trigger once and stay revealed. Default: true. */
  once?: boolean;
}

/** Wraps children in a scroll-triggered fade/slide-up reveal (IntersectionObserver). */
export function ScrollReveal({
  delay = 0,
  duration = 600,
  once = true,
  className,
  children,
  style,
  ...props
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) io.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={cn("will-change-opacity", className)}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transition: `opacity ${duration}ms ease-out`,
        transitionDelay: `${delay}ms`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── DissolveButton ────────────────────────────────────────── */

export interface DissolveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button label. Default: "Get started". */
  label?: string;
}

/** A button that emits a particle-dissolve burst on click.
 *  Rectangular particles radiate from the click point and fade out.
 *  SSR-safe: button renders statically; bursts happen on interaction. */
export const DissolveButton = React.forwardRef<
  HTMLButtonElement,
  DissolveButtonProps
>(({ className, label = "Get started", children, onClick, ...props }, ref) => {
  const hostRef = React.useRef<HTMLButtonElement | null>(null);

  const burst = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = hostRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    for (let i = 0; i < 16; i++) {
      const span = document.createElement("span");
      span.className =
        "pointer-events-none absolute h-1 w-2 rounded bg-white/50 opacity-70 blur-[1px] animate-[facet-dissolve_0.7s_ease-out_reverse]";
      const angle = (Math.PI * 2 * i) / 16;
      const dist = 25 + Math.random() * 25;
      span.style.left = `${x}px`;
      span.style.top = `${y}px`;
      span.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      span.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
      span.style.transform = `translate(var(--dx), var(--dy))`;
      el.appendChild(span);
      setTimeout(() => span.remove(), 750);
    }
    onClick?.(e);
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
DissolveButton.displayName = "DissolveButton";

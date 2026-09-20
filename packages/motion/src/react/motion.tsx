"use client";

import { useRef, useEffect, useMemo, useContext } from "react";
import type { HTMLAttributes, CSSProperties } from "react";
import { resolveMotion } from "../registry/index.js";
import { motionValue } from "../values/index.js";
import { animate } from "../core/index.js";
import { cssDriver, resolveDuration, resolveEasing } from "../drivers/index.js";
import { StaggerContext } from "./stagger.js";
import type { AnimationController } from "../core/index.js";
import type {
  Direction,
  Intensity,
  Duration,
  Easing,
  ResolvedMotion,
  MotionTransition,
  MotionVariant,
} from "../registry/types.js";
import { cn } from "../utils/cn.js";

export interface MotionProps extends HTMLAttributes<HTMLDivElement> {
  /** Effect id from the registry (e.g. "fade", "zoom", "reveal"). */
  effect: string;
  /** Direction / variant for the effect. */
  direction?: Direction;
  /** Intensity tier. */
  intensity?: Intensity;
  /** Transition overrides (tokens or ms). */
  duration?: Duration;
  ease?: Easing;
  /** Fixed delay before the animation starts (ms). */
  delay?: number;
  /** Whether to render the "from" state initially. */
  initial?: boolean;
  /** Position in a <Stagger> sequence for delay offset. */
  staggerIndex?: number;
}

function isSpringType(type: string | undefined): boolean {
  return type === "spring";
}

/**
 * <Motion> is the main animation primitive.
 *
 * It resolves an effect+variant through the registry, creates motion
 * values, mounts the CSS driver, and drives values with core `animate()`.
 * No animation logic lives here - this is a thin wiring layer.
 */
export function Motion({
  effect,
  direction,
  intensity,
  duration,
  ease,
  delay = 0,
  initial = true,
  staggerIndex,
  className,
  children,
  style,
  ...rest
}: MotionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const staggerDelay = useContext(StaggerContext);
  const staggerOffset =
    staggerIndex !== undefined ? staggerIndex * staggerDelay : 0;

  const variant: MotionVariant = { direction, intensity };
  const transition: MotionTransition = {
    duration,
    ease,
    delay: delay + staggerOffset,
  };

  const resolved = useMemo<ResolvedMotion | null>(
    () => resolveMotion(effect, variant, transition),
    [effect, direction, intensity, duration, ease, delay, staggerDelay, staggerIndex],
  );

  // SSR / first-paint: apply the "from" state so there's no flash.
  const initialStyle = useMemo<CSSProperties>(() => {
    if (!initial || !resolved) return style ?? {};
    const fromStyle: CSSProperties = {};
    for (const [prop, value] of Object.entries(resolved.from)) {
      (fromStyle as Record<string, unknown>)[prop] = value;
    }
    return { ...fromStyle, ...style };
  }, [initial, resolved, style]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !resolved) return;

    const { from, to, transition: resolvedTransition } = resolved;
    const target = { style: el.style };
    const isReduced =
      cssDriver.isSupported() && cssDriver.preferReducedMotion();

    if (isReduced) {
      for (const [prop, value] of Object.entries(to)) {
        el.style.setProperty(prop, String(value));
      }
      return;
    }

    // Set initial from-state (string props: transforms, filters, etc.)
    for (const [prop, value] of Object.entries(from)) {
      if (typeof value === "string") {
        el.style.setProperty(prop, value);
      }
    }

    void el.offsetHeight; // force reflow

    const ms = resolveDuration(resolvedTransition.duration);
    const easing = resolveEasing(resolvedTransition.ease);
    const doSpring = isSpringType(resolvedTransition.type);

    // CSS variable references for the CSS transition (string properties).
    // The registry never hardcodes ms/bezier - these resolve to the
    // facet-tokens CSS custom properties at runtime.
    const durCSS =
      typeof resolvedTransition.duration === "number"
        ? `${resolvedTransition.duration}ms`
        : `var(--facet-motion-duration-${resolvedTransition.duration})`;
    const easeCSS = `var(--facet-motion-ease-${resolvedTransition.ease})`;

    const controllers: AnimationController[] = [];
    const unsubscribers: (() => void)[] = [];

    // Set CSS transition BEFORE setting string "to" values so the browser
    // actually transitions (transition property must be present before
    // the value changes).
    const stringProps = Object.entries(to).filter(
      ([, v]) => typeof v !== "number",
    );
    if (stringProps.length > 0) {
      const propList = stringProps.map(([p]) => p).join(", ");
      el.style.transition = `${propList} ${durCSS} ${easeCSS}`;
    }

    for (const [prop, toValue] of Object.entries(to)) {
      if (typeof toValue === "number") {
        // Numeric prop - JS-driven via motion value + core animate()
        const fromValue =
          typeof from[prop] === "number" ? (from[prop] as number) : toValue;
        const mv = motionValue(fromValue);

        const handle = cssDriver.apply(target, { [prop]: mv });
        unsubscribers.push(handle.cleanup);

        const controller = animate(mv, toValue, {
          type: doSpring ? "spring" : "tween",
          duration: ms,
          ease: doSpring ? undefined : easing,
          stiffness: resolvedTransition.stiffness,
          damping: resolvedTransition.damping,
          mass: resolvedTransition.mass,
          delay: resolvedTransition.delay ?? 0,
        });
        controllers.push(controller);
      } else {
        // String prop - CSS transition handles the interpolation
        el.style.setProperty(prop, String(toValue));
      }
    }

    return () => {
      controllers.forEach((c) => c.stop());
      unsubscribers.forEach((fn) => fn());
      el.style.transition = "";
    };
  }, [resolved, delay, staggerDelay, staggerIndex]);

  return (
    <div ref={ref} className={cn(className)} style={initialStyle} {...rest}>
      {children}
    </div>
  );
}

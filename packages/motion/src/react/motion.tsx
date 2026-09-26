"use client";

import {
  useRef,
  useEffect,
  useMemo,
  useContext,
  Children,
  cloneElement,
} from "react";
import type {
  HTMLAttributes,
  CSSProperties,
  ReactElement,
  Ref,
  MutableRefObject,
  RefAttributes,
} from "react";
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
import { cn } from "@fusorb/facet-utils";

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
  /**
   * Render the animation styles on the child element directly instead of a
   * wrapper <div>. Required when wrapping Radix popover primitives so the
   * animated element IS the positioned Content (no extra host node that would
   * intercept Radix positioning, focus lifecycle, and z-index stacking).
   */
  asChild?: boolean;
}

/** Assign a ref (object or function) to a node. */
function setRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref != null && "current" in ref) {
    (ref as MutableRefObject<T | null>).current = value;
  }
}

/**
 * Merge multiple refs into a single stable callback ref.
 * Mirrors Framer Motion's useMergeRefs so the same animated node can be
 * owned by both the Motion engine and a forwarded consumer ref.
 */
function useMergeRefs<T>(
  ...refs: (Ref<T> | undefined)[]
): (node: T | null) => void {
  const latest = useRef(refs);
  latest.current = refs;
  return useMemo(
    () =>
      (node: T | null) => {
        for (const ref of latest.current) {
          setRef(ref, node);
        }
      },
    [],
  );
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
  asChild,
  ...rest
}: MotionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const staggerDelay = useContext(StaggerContext);
  const staggerOffset =
    staggerIndex !== undefined ? staggerIndex * staggerDelay : 0;

  const variant: MotionVariant = { direction, intensity };
  const transition: MotionTransition = {
    ...(duration != null && { duration }),
    ...(ease != null && { ease }),
    delay: delay + staggerOffset,
  };

  const resolved = useMemo<ResolvedMotion | null>(
    () => resolveMotion(effect, variant, transition),
    [
      effect,
      direction,
      intensity,
      duration,
      ease,
      delay,
      staggerDelay,
      staggerIndex,
    ],
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

  // For asChild mode: read the single child element (a plain function call,
  // not a hook, so a conditional read is fine) and prepare a stable merged
  // ref unconditionally so the Rules of Hooks are never violated.
  const asChildChild = asChild
    ? (Children.only(children) as ReactElement<
        HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement>
      >)
    : null;
  const asChildRef = asChildChild?.props.ref as Ref<HTMLElement> | undefined;
  const mergedRef = useMergeRefs<HTMLElement>(ref, asChildRef);

  // asChild: apply animation styles directly on the child element (no wrapper
  // <div>). This is critical for Radix popover primitives — the animated node
  // must BE the positioned Content so positioning, focus scope, and z-index
  // are never intercepted by an extra host element.
  if (asChild && asChildChild) {
    return cloneElement(asChildChild, {
      ref: mergedRef,
      style: { ...asChildChild.props.style, ...initialStyle },
      className: cn(asChildChild.props.className, className),
    });
  }

  return (
    <div ref={ref} className={cn(className)} style={initialStyle} {...rest}>
      {children}
    </div>
  );
}

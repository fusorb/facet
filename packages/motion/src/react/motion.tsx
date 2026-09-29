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
import { usePresence } from "./presence.js";
import {
  animationName,
  buildKeyframesCSS,
  injectStyle,
  buildAnimationProperties,
  shouldUseCSSAnimation,
} from "./keyframes.js";
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
  /** Whether the animation is playing (not paused). Default: true. */
  playing?: boolean;
  /** Override repeat count from the registry transition. */
  repeat?: number | "infinite";
  /** Override repeat strategy: "loop" (restart) or "reverse" (ping-pong). */
  repeatType?: "loop" | "reverse";
  /** Fires when the enter animation completes. */
  onEnter?: () => void;
  /** Fires when the exit animation completes. */
  onExit?: () => void;
  /** Fires when any animation (enter or exit) completes. */
  onComplete?: () => void;
  /** Enable exit animation when inside <Presence>. Default: true. */
  exit?: boolean;
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

/** Convert a kebab-case CSS property to camelCase for React style objects. */
function toCamelCase(prop: string): string {
  return prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * <Motion> is the main animation primitive.
 *
 * Resolves an effect+variant through the registry, then drives the element's
 * style via either a CSS @keyframes animation (when the resolved transition
 * carries `repeat` or `keyframes`) or the core `animate()` engine for
 * per-property tween/spring interpolation. Supports enter/exit lifecycle
 * when placed inside <Presence>.
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
  playing = true,
  repeat,
  repeatType,
  onEnter,
  onExit,
  onComplete,
  exit = true,
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
  const presence = usePresence();
  const isPresent = presence.isPresent;
  const hasPresence = presence.hasPresence;
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const callbacksRef = useRef({ onEnter, onExit, onComplete });
  callbacksRef.current = { onEnter, onExit, onComplete };

  const variant: MotionVariant = { direction, intensity };
  const transition: MotionTransition = {
    ...(duration != null && { duration }),
    ...(ease != null && { ease }),
    ...(repeat != null && { repeat }),
    ...(repeatType != null && { repeatType }),
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
      repeat,
      repeatType,
    ],
  );

  const effectiveRepeat = repeat ?? resolved?.transition.repeat;
  const effectiveRepeatType = repeatType ?? resolved?.transition.repeatType;
  const useCSS = shouldUseCSSAnimation(resolved ?? null, effectiveRepeat);
  const kfName = useMemo(
    () => (resolved ? animationName(effect, resolved) : ""),
    [effect, resolved],
  );

  // Shared isExiting flag computed during render so both initialStyle (for
  // SSR / first-paint) and the animation useEffect observe the same value.
  const isExiting = hasPresence && isPresent === false && exit;

  // SSR / first-paint: render the element in its "from" state so there is no
  // flash of the final value before the enter animation begins. During exit
  // we skip this so the element stays at its current (settled) target state
  // and the reverse animation reads from the correct starting point.
  const initialStyle = useMemo<CSSProperties>(() => {
    if (isExiting || !initial || !resolved) return style ?? {};
    const fromStyle: CSSProperties = {};
    for (const [prop, value] of Object.entries(resolved.from)) {
      (fromStyle as Record<string, unknown>)[toCamelCase(prop)] = value;
    }
    return { ...fromStyle, ...style };
  }, [initial, resolved, style, isExiting]);

  // Inject @keyframes CSS into <head> when using the CSS animation path.
  useEffect(() => {
    if (resolved && useCSS) {
      injectStyle(kfName, buildKeyframesCSS(kfName, resolved));
    }
  }, [kfName, resolved, useCSS]);

  // Separate effect for play-state so toggling `playing` doesn't restart the
  // animation (only the CSS path uses playState; JS path treats playing=true).
  useEffect(() => {
    const el = ref.current;
    if (!el || !useCSS || isPresent === false) return;
    el.style.animationPlayState = playing ? "running" : "paused";
  }, [playing, useCSS, isPresent]);

  // --- main animation engine ---
  useEffect(() => {
    const el = ref.current;
    if (!el || !resolved) return;

    const { from, to, transition: resTrans } = resolved;
    const isReduced =
      cssDriver.isSupported() && cssDriver.preferReducedMotion();

    if (isReduced) {
      for (const [prop, value] of Object.entries(to)) {
        el.style.setProperty(prop, String(value));
      }
      callbacksRef.current.onEnter?.();
      callbacksRef.current.onComplete?.();
      return;
    }

    let active = true;

    if (useCSS) {
      return runCSSAnimation();
    }
    return runJSAnimation();

    function runCSSAnimation(): (() => void) | undefined {
      if (!el || !resolved) return undefined;
      if (isExiting) {
        const completeExit = presence.registerExit();
        Object.entries(to).forEach(([p, v]) =>
          el.style.setProperty(p, String(v)),
        );
        void el.offsetHeight;
        const props = buildAnimationProperties(resolved, kfName, {
          delay: 0,
          playing: true,
        });
        props.animationDirection = "reverse";
        Object.assign(el.style, props);

        const onEnd = () => {
          if (!active) return;
          el.removeEventListener("animationend", onEnd);
          el.style.animation = "";
          completeExit();
          callbacksRef.current.onExit?.();
          callbacksRef.current.onComplete?.();
        };
        el.addEventListener("animationend", onEnd);
        return () => {
          active = false;
          el.removeEventListener("animationend", onEnd);
          el.style.animation = "";
        };
      }

      // ENTER via CSS animation
      Object.entries(from).forEach(([p, v]) =>
        el.style.setProperty(p, String(v)),
      );
      void el.offsetHeight;
      const props = buildAnimationProperties(resolved, kfName, {
        repeat: effectiveRepeat,
        repeatType: effectiveRepeatType,
        delay: resTrans.delay,
        playing: playingRef.current,
      });
      Object.assign(el.style, props);

      const hasRepeat = effectiveRepeat !== undefined && effectiveRepeat !== 0;

      if (hasRepeat) {
        callbacksRef.current.onEnter?.();
        return () => {
          active = false;
          el.style.animation = "";
        };
      }

      const onEnd = () => {
        if (!active) return;
        el.removeEventListener("animationend", onEnd);
        callbacksRef.current.onEnter?.();
        callbacksRef.current.onComplete?.();
      };
      el.addEventListener("animationend", onEnd);
      return () => {
        active = false;
        el.removeEventListener("animationend", onEnd);
        el.style.animation = "";
      };
    }

    function runJSAnimation(): (() => void) | undefined {
      if (!el || !resolved) return undefined;
      const ms = resolveDuration(resTrans.duration);
      const easing = resolveEasing(resTrans.ease);
      const doSpring = isSpringType(resTrans.type);

      const durCSS =
        typeof resTrans.duration === "number"
          ? `${resTrans.duration}ms`
          : `var(--facet-motion-duration-${resTrans.duration})`;
      const easeCSS = `var(--facet-motion-ease-${resTrans.ease})`;

      const controllers: AnimationController[] = [];
      const unsubscribers: (() => void)[] = [];
      const target = { style: el.style };

      if (isExiting) {
        const completeExit = presence.registerExit();

        // The element is settled at its `to` state (from enter). Animate it
        // back to `from`: numeric props via spring, string props (transform,
        // filter, box-shadow, …) via a CSS transition. The transition MUST be
        // registered before the string values are driven, otherwise setting
        // `from` would snap instantly instead of transitioning (to -> from).
        const stringProps = Object.entries(from).filter(
          ([, v]) => typeof v !== "number",
        );
        const hasStringTransition =
          playingRef.current !== false && stringProps.length > 0;
        // Held so the cleanup can detach it even on a forced unmount.
        let stringEndListener: ((e: TransitionEvent) => void) | null = null;

        if (playingRef.current !== false) {
          void el.offsetHeight;

          if (hasStringTransition) {
            el.style.transition = `${stringProps.map(([p]) => p).join(", ")} ${durCSS} ${easeCSS}`;
            void el.offsetHeight;

            Object.entries(from).forEach(([p, v]) => {
              if (typeof v === "string") el.style.setProperty(p, String(v));
            });
          }

          for (const [prop, fromValue] of Object.entries(from)) {
            if (typeof fromValue === "number") {
              const toValue =
                typeof to[prop] === "number"
                  ? (to[prop] as number)
                  : fromValue;
              const mv = motionValue(toValue);
              const handle = cssDriver.apply(target, { [prop]: mv });
              unsubscribers.push(handle.cleanup);
              const controller = animate(mv, fromValue, {
                type: doSpring ? "spring" : "tween",
                duration: ms,
                ease: doSpring ? undefined : easing,
                stiffness: resTrans.stiffness,
                damping: resTrans.damping,
                mass: resTrans.mass,
                delay: resTrans.delay ?? 0,
              });
              controllers.push(controller);
            }
          }
        }

        const finish = () => {
          if (!active) return;
          completeExit();
          callbacksRef.current.onExit?.();
          callbacksRef.current.onComplete?.();
        };

        if (playingRef.current === false) {
          // Paused: no animation to wait for, unmount immediately.
          finish();
        } else {
          // Presence must keep the element mounted until BOTH the numeric
          // springs AND any CSS string transitions have completed.
          const numericDone = Promise.all(
            controllers.map((c) => c.finished),
          );
          const transitionDone = hasStringTransition
            ? new Promise<void>((resolve) => {
                stringEndListener = (e: TransitionEvent) => {
                  if (stringProps.some(([p]) => p === e.propertyName)) {
                    el.removeEventListener("transitionend", stringEndListener!);
                    stringEndListener = null;
                    resolve();
                  }
                };
                el.addEventListener("transitionend", stringEndListener);
              })
            : Promise.resolve();

          Promise.all([numericDone, transitionDone]).then(finish);
        }

        return () => {
          active = false;
          controllers.forEach((c) => c.stop());
          unsubscribers.forEach((fn) => fn());
          el.style.transition = "";
          if (stringEndListener) {
            el.removeEventListener("transitionend", stringEndListener);
            stringEndListener = null;
          }
        };
      }

      // --- ENTER via JS ---
      if (playingRef.current === false) {
        Object.entries(from).forEach(([p, v]) => {
          if (typeof v === "string") el.style.setProperty(p, String(v));
        });
        return () => {
          active = false;
        };
      }

      Object.entries(from).forEach(([p, v]) => {
        if (typeof v === "string") el.style.setProperty(p, String(v));
      });

      void el.offsetHeight;

      const stringProps = Object.entries(to).filter(
        ([, v]) => typeof v !== "number",
      );
      if (stringProps.length > 0) {
        const propList = stringProps.map(([p]) => p).join(", ");
        el.style.transition = `${propList} ${durCSS} ${easeCSS}`;
      }

      for (const [prop, toValue] of Object.entries(to)) {
        if (typeof toValue === "number") {
          const fromValue =
            typeof from[prop] === "number" ? (from[prop] as number) : toValue;
          const mv = motionValue(fromValue);
          const handle = cssDriver.apply(target, { [prop]: mv });
          unsubscribers.push(handle.cleanup);
          const controller = animate(mv, toValue, {
            type: doSpring ? "spring" : "tween",
            duration: ms,
            ease: doSpring ? undefined : easing,
            stiffness: resTrans.stiffness,
            damping: resTrans.damping,
            mass: resTrans.mass,
            delay: resTrans.delay ?? 0,
          });
          controllers.push(controller);
        } else {
          el.style.setProperty(prop, String(toValue));
        }
      }

      Promise.all(controllers.map((c) => c.finished)).then(() => {
        if (!active) return;
        callbacksRef.current.onEnter?.();
        callbacksRef.current.onComplete?.();
      });

      return () => {
        active = false;
        controllers.forEach((c) => c.stop());
        unsubscribers.forEach((fn) => fn());
        el.style.transition = "";
      };
    }
  }, [
    resolved,
    isPresent,
    exit,
    useCSS,
    kfName,
    effectiveRepeat,
    effectiveRepeatType,
    hasPresence,
    presence.registerExit,
  ]);

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
    <div
      ref={ref}
      className={cn(className)}
      style={initialStyle}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * Native Motion component — React Native equivalent of the web Motion.
 *
 * Resolves an effect through the shared registry (same families / variants
 * / transitions as web), then drives an `Animated.Value`-backed view via the
 * registered native driver. Only numeric motion values are animated; transform
 * strings (e.g. `scale(0.85)`) are parsed and each numeric component becomes
 * its own animated `Animated.Value` in the RN `transform` array.
 *
 * Place inside <Presence> for enter/exit support; call bindAnimated() once at
 * the app entry point before rendering any Motion components.
 */

import {
  cloneElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactElement } from "react";
import {
  animate,
  motionValue,
  resolveDriver,
  resolveDuration,
  resolveEasing,
  resolveMotion,
  StaggerContext,
  usePresence,
} from "@fusorb/facet-motion";
import type {
  AnimationController,
  Direction,
  DriverBindings,
  DriverTarget,
  Duration,
  Easing,
  Intensity,
  MotionTransition,
  MotionVariant,
  ResolvedMotion,
} from "@fusorb/facet-motion";
import type { NativeValue } from "../native-driver.js";

/* ---------------------------------------------------------------------------
 * CSS → RN transform string parser
 * ------------------------------------------------------------------------- */

interface TransformOp {
  type: string;
  value: number;
}

const transformRegex = /(\w+)\(([^)]+)\)/g;

function parseCSSTransform(transform: string): TransformOp[] {
  const ops: TransformOp[] = [];
  let match: RegExpExecArray | null;
  while ((match = transformRegex.exec(transform)) !== null) {
    const type = match[1];
    const raw = match[2];
    if (type === undefined || raw === undefined) continue;
    const args = raw.trim();

    // translate(x, y) → translateX + translateY
    if (type === "translate" && args.includes(",")) {
      const parts = args.split(",").map((s) => parseFloat(s.trim()));
      const v0 = parts[0];
      if (v0 !== undefined && !Number.isNaN(v0)) {
        ops.push({ type: "translateX", value: v0 });
      }
      const v1 = parts[1];
      if (v1 !== undefined && !Number.isNaN(v1)) {
        ops.push({ type: "translateY", value: v1 });
      }
    } else {
      const value = parseFloat(args);
      if (!Number.isNaN(value)) {
        ops.push({ type, value });
      }
    }
  }
  return ops;
}

/** Convert a kebab-case CSS property name to camelCase (RN style). */
function toCamel(prop: string): string {
  return prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/** Convert a CSS from/to record to a plain RN style (numbers only, no Animated nodes). */
function toInitialRNStyle(
  style: Record<string, string | number>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [prop, value] of Object.entries(style)) {
    if (prop === "transform" && typeof value === "string") {
      const ops = parseCSSTransform(value);
      if (ops.length > 0) {
        result.transform = ops.map((op) => ({ [op.type]: op.value }));
      }
    } else if (typeof value === "number") {
      result[toCamel(prop)] = value;
    }
    // Skip non-numeric string properties (filter, box-shadow, etc.) — not animatable on RN.
  }
  return result;
}

function isSpringType(type: string | undefined): boolean {
  return type === "spring";
}

/* ---------------------------------------------------------------------------
 * Motion component
 * ------------------------------------------------------------------------- */

export interface MotionProps {
  /** Effect id from the registry (e.g. "fade", "zoom", "reveal"). */
  effect?: string | null;
  /** Direction / variant for the effect. */
  direction?: Direction;
  /** Intensity tier. */
  intensity?: Intensity;
  /** Transition overrides (tokens or ms). */
  duration?: Duration;
  ease?: Easing;
  /** Fixed delay before the animation starts (ms). */
  delay?: number;
  /** Whether to play the initial (enter) animation. */
  initial?: boolean;
  /** Index within a <Stagger> for delay calculation. */
  staggerIndex?: number;
  /** Render mode: when `true` (default), clones `children` and injects style. */
  asChild?: boolean;
  /** Pause the animation when `false`. */
  playing?: boolean;
  /** Callbacks. */
  onEnter?: () => void;
  onExit?: () => void;
  onComplete?: () => void;
  /** Whether to animate on exit (inside <Presence>). */
  exit?: boolean;
  /** Static style merged under the animated values. */
  style?: Record<string, unknown>;
  /** The child element to animate (required in asChild mode). */
  children?: ReactElement;
}

const noop = () => {};

export function Motion({
  effect,
  direction,
  intensity,
  duration,
  ease,
  delay = 0,
  initial = true,
  staggerIndex,
  asChild = true,
  playing = true,
  onEnter,
  onExit,
  onComplete,
  exit = true,
  style,
  children,
}: MotionProps) {
  const staggerDelay = useContext(StaggerContext);
  const staggerOffset =
    staggerIndex !== undefined ? staggerIndex * staggerDelay : 0;

  const presence = usePresence();
  const isPresent = presence.isPresent;
  const hasPresence = presence.hasPresence;

  const isExiting = hasPresence && isPresent === false && exit;

  const variant: MotionVariant = { direction, intensity };

  const transition: MotionTransition = {
    ...(duration != null && { duration }),
    ...(ease != null && { ease }),
    delay: delay + staggerOffset,
  };

  const resolved = useMemo<ResolvedMotion | null>(
    () => (effect ? resolveMotion(effect, variant, transition) : null),
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

  /* ---- Style proxy that the driver writes Animated.Value nodes into ---- */
  const styleRef = useRef<Record<string, unknown>>({});
  const [, setVersion] = useState(0);

  /* ---- Initial render style (plain numbers for first paint) ---- */
  const initialStyle = useMemo(() => {
    if (!resolved || !initial) {
      return style ?? {};
    }
    if (isExiting) {
      return { ...toInitialRNStyle(resolved.to), ...style };
    }
    return { ...toInitialRNStyle(resolved.from), ...style };
  }, [resolved, initial, isExiting, style]);

  useEffect(() => {
    if (!resolved || !playing) return;

    const driver = resolveDriver();
    if (!driver || !driver.isSupported()) return;

    const { from, to, transition: resTrans } = resolved;
    const ms = resolveDuration(resTrans.duration);
    const easing = resolveEasing(resTrans.ease);
    const doSpring = isSpringType(resTrans.type);

    const target = { style: styleRef.current } as unknown as DriverTarget;
    const cleanups: Array<() => void> = [];
    const controllers: AnimationController[] = [];

    // Enter: from → to ; Exit: to → from
    const animFrom = isExiting ? to : from;
    const animTo = isExiting ? from : to;

    // --- Transform operations (parsed from CSS transform strings) ---

    const fromXform =
      typeof animFrom.transform === "string"
        ? parseCSSTransform(animFrom.transform)
        : [];
    const toXform =
      typeof animTo.transform === "string"
        ? parseCSSTransform(animTo.transform)
        : [];

    const xformKeys: string[] = [];
    const maxLen = Math.max(toXform.length, fromXform.length);

    for (let i = 0; i < maxLen; i++) {
      const toOp = toXform[i];
      if (!toOp) continue;

      const fromOp =
        i < fromXform.length && fromXform[i]?.type === toOp.type
          ? fromXform[i]
          : undefined;

      const fromVal = fromOp ? fromOp.value : toOp.value;
      const propKey = `__xform_${i}`;
      xformKeys.push(propKey);

      const mv = motionValue(fromVal);
      const handle = driver.apply(target, {
        [propKey]: mv,
      } as DriverBindings);
      cleanups.push(handle.cleanup);

      const controller = animate(mv, toOp.value, {
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

    // --- Numeric properties (everything except transform) ---

    for (const [prop, toValue] of Object.entries(animTo)) {
      if (prop === "transform") continue;
      if (typeof toValue !== "number") continue;

      const fromValue =
        typeof animFrom[prop] === "number"
          ? (animFrom[prop] as number)
          : toValue;

      const mv = motionValue(fromValue);
      const handle = driver.apply(target, {
        [prop]: mv,
      } as DriverBindings);
      cleanups.push(handle.cleanup);

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
    }

    // --- Build the RN transform array from Animated.Value nodes ---

    if (xformKeys.length > 0) {
      const transformArray: Array<Record<string, unknown>> = [];
      for (let i = 0; i < xformKeys.length; i++) {
        const op = toXform[i];
        if (!op) continue;
        const key = xformKeys[i];
        if (!key) continue;
        const node = styleRef.current[key] as NativeValue | undefined;
        if (!node) continue;

        if (op.type.startsWith("rotate") || op.type.startsWith("skew")) {
          // RN needs a string like "45deg"; use interpolate if available.
          const maybeInterp =
            (node as { interpolate?: (config: { inputRange: number[]; outputRange: string[] }) => unknown }).interpolate;
          if (maybeInterp) {
            const interpolated = maybeInterp({
              inputRange: [0, 360],
              outputRange: ["0deg", "360deg"],
            });
            transformArray.push({ [op.type]: interpolated });
          } else {
            transformArray.push({ [op.type]: `${op.value}deg` });
          }
        } else {
          // scale, scaleX, scaleY, translateX, translateY — Animated.Value is numeric, works directly.
          transformArray.push({ [op.type]: node });
        }
        delete styleRef.current[key];
      }
      styleRef.current.transform = transformArray;
    }

    // Trigger a re-render so the child picks up the Animated.Value nodes.
    setVersion((v) => v + 1);

    // --- Completion handling ---

    if (isExiting) {
      const release = presence.registerExit();
      Promise.all(controllers.map((c) => c.finished))
        .then(() => {
          release();
          onExit?.();
          onComplete?.();
        })
        .catch(noop);
    } else {
      Promise.all(controllers.map((c) => c.finished))
        .then(() => {
          onEnter?.();
          onComplete?.();
        })
        .catch(noop);
    }

    return () => {
      controllers.forEach((c) => c.stop());
      cleanups.forEach((c) => c());
    };
    // Keyed on presence/playing only; reading the callbacks at run time avoids
    // restarting an in-flight animation when they change identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved, isPresent, playing]);

  if (!asChild || !children) return null;

  const mergedStyle = {
    ...initialStyle,
    ...styleRef.current,
  };

  return cloneElement(children, {
    style: mergedStyle,
  } as any);
}

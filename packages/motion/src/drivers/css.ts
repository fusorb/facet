/**
 * @fusorb/facet-motion — CSS driver
 *
 * The only driver in Phase 1. It:
 *  1. Detects `prefers-reduced-motion` at the driver boundary —
 *     a component author using the engine directly cannot bypass it.
 *  2. Subscribes to motion values and writes them to `element.style`
 *     (regular CSS properties and CSS custom properties alike).
 *  3. Exposes `resolveDuration` / `resolveEasing` helpers that convert
 *     registry token strings ("fast", "standard") into the numeric /
 *     function values that the core `animate()` loop needs.
 *
 * The ms / bezier values in the lookup tables mirror the
 * `--facet-motion-duration-*` / `--facet-motion-ease-*` CSS custom
 * properties in `@fusorb/facet-tokens` so JS-driven and CSS-driven
 * animations stay in sync.
 */

import type { MotionValue } from "../values/motion-value.js";
import type { Duration, Easing } from "../registry/types.js";
import type {
  DriverTarget,
  DriverBindings,
  DriverHandle,
  MotionDriver,
  Unsubscribe,
} from "./types.js";
import type { EasingFunction } from "../core/generators.js";

/* ---------- easing curve solver ---------- */

/**
 * CSS-compatible cubic-bezier solver.
 * Maps normalized input x (0–1) to y (0–1) on a cubic-bezier curve
 * defined by control points (x1, y1) and (x2, y2).
 */
function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): EasingFunction {
  if (x1 === y1 && x2 === y2) {
    return (x: number) => x; // linear shortcut
  }

  const sampleCount = 12;
  const sampleStep = 1 / (sampleCount - 1);
  const sampleValues = new Float64Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const t = i * sampleStep;
    sampleValues[i] =
      3 * x1 * (1 - t) * (1 - t) * t +
      3 * x2 * (1 - t) * t * t +
      t * t * t;
  }

  function getTForX(x: number): number {
    let a = 0;
    let b = sampleCount - 1;
    while (b - a > 1) {
      const i = a + Math.floor((b - a) / 2);
      if (sampleValues[i]! <= x) a = i;
      else b = i;
    }
    const dist = (x - sampleValues[a]!) / (sampleValues[b]! - sampleValues[a]!);
    const prevT = a * sampleStep;
    const nextT = b * sampleStep;
    return prevT + dist * (nextT - prevT);
  }

  return (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const t = getTForX(x);
    return (
      3 * y1 * (1 - t) * (1 - t) * t +
      3 * y2 * (1 - t) * t * t +
      t * t * t
    );
  };
}

/* ---------- token → value lookup tables ---------- */

const DURATION_VALUES: Record<string, number> = {
  instant: 0,
  fast: 150,
  base: 250,
  slow: 500,
  cinematic: 1000,
};

const EASING_FUNCTIONS: Record<string, EasingFunction> = {
  linear: (t: number) => t,
  standard: cubicBezier(0.2, 0, 0, 1),
  smooth: cubicBezier(0.4, 0, 0.2, 1),
  emphasized: cubicBezier(0.2, 0, 0, 1),
  spring: cubicBezier(0.34, 1.56, 0.64, 1),
  elastic: cubicBezier(0.25, 0.1, 0.25, 5),
};

/* ---------- public helpers ---------- */

/**
 * Convert a `Duration` token to milliseconds.
 * Numbers pass through; strings are looked up; unknown → 250.
 */
export function resolveDuration(token: Duration): number {
  if (typeof token === "number") return token;
  return DURATION_VALUES[token] ?? 250;
}

/**
 * Convert an `Easing` token to a JS easing function.
 * Unknown tokens default to linear.
 */
export function resolveEasing(token: Easing): EasingFunction {
  const fn = EASING_FUNCTIONS[token];
  return fn ?? ((t: number) => t);
}

/* ---------- prefers-reduced-motion ---------- */

/**
 * Detect whether the user has requested reduced motion.
 *
 * Checked at the driver boundary so it cannot be bypassed by
 * component authors using the engine directly.
 */
export function preferReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false; // SSR / non-browser: no explicit preference
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ---------- cssDriver ---------- */

/**
 * The CSS driver.
 *
 * `apply()` subscribes a set of motion values to an element's `style`
 * and returns a cleanup handle. When `prefers-reduced-motion` is active,
 * it applies the *current* (terminal) values directly with no animation
 * and returns `{ active: false }`.
 */
export const cssDriver: MotionDriver & {
  resolveDuration: typeof resolveDuration;
  resolveEasing: typeof resolveEasing;
  preferReducedMotion: typeof preferReducedMotion;
} = {
  apply(target: DriverTarget, bindings: DriverBindings): DriverHandle {
    const reduced = preferReducedMotion();

    if (reduced) {
      for (const [prop, value] of Object.entries(bindings)) {
        const resolved =
          value && typeof value === "object" && "get" in value
            ? (value as MotionValue).get()
            : value;
        target.style.setProperty(prop, String(resolved));
      }
      return { cleanup: () => {}, active: false };
    }

    const unsubscribers: Unsubscribe[] = [];

    for (const [prop, value] of Object.entries(bindings)) {
      if (value && typeof value === "object" && "subscribe" in value) {
        const mv = value as MotionValue;
        target.style.setProperty(prop, String(mv.get()));
        const unsub = mv.subscribe((v: number) => {
          target.style.setProperty(prop, String(v));
        });
        unsubscribers.push(unsub);
      } else {
        target.style.setProperty(prop, String(value));
      }
    }

    return {
      cleanup: () => {
        unsubscribers.forEach((unsub) => unsub());
      },
      active: true,
    };
  },

  isSupported(): boolean {
    return typeof window !== "undefined" && typeof window.matchMedia === "function";
  },

  resolveDuration,
  resolveEasing,
  preferReducedMotion,
};

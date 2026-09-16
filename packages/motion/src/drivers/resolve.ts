/**
 * @fusorb/facet-motion — token resolution (platform-agnostic)
 *
 * Converts registry token strings ("fast", "standard") into the numeric /
 * function values the core `animate()` loop needs. These lookup tables
 * mirror the `--facet-motion-duration-*` / `--facet-motion-ease-*` CSS
 * custom properties in `@fusorb/facet-tokens` so JS-driven and CSS-driven
 * animations stay in sync.
 *
 * Extracted from the CSS driver so that both cssDriver (DOM) and a future
 * nativeDriver (React Native Animated) can reuse the same resolution logic
 * without pulling in any browser APIs.
 */

import type { EasingFunction } from "../core/generators.js";
import type { Duration, Easing } from "../registry/types.js";

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

export const DURATION_VALUES: Record<string, number> = {
  instant: 0,
  fast: 150,
  base: 250,
  slow: 500,
  cinematic: 1000,
};

export const EASING_FUNCTIONS: Record<string, EasingFunction> = {
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

export type { EasingFunction };

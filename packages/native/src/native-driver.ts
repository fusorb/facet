/**
 * @fusorb/facet-native — React Native motion driver shell (Phase 2C)
 *
 * Provides native equivalents of the motion token resolution tables,
 * plus a `toEasingCurve` adapter that converts CSS easing references
 * to cubic-bezier coordinate arrays for React Native's `Animated` API.
 *
 * No `react-native` dependency — consumers pass their own `Animated`
 * module when the driver becomes active (Phase 3).
 *
 * The easing coordinates below mirror the `--motion-ease-*` CSS variables
 * in @fusorb/facet-tokens/tokens.css so JS-driven and CSS-driven animations
 * stay in sync across platforms.
 */

import { motionValues } from "@fusorb/facet-tokens";
import type { EasingValue } from "@fusorb/facet-tokens";

// ── Native easing coordinates ─────────────────────────────────────
// Same curves as the --motion-ease-* CSS variables and the
// EASING_FUNCTIONS table in facet-motion's resolve.ts, expressed
// as raw [x1, y1, x2, y2] arrays for RN's Easing.bezier().

export type EasingCurve = [number, number, number, number];

const NATIVE_EASING: Record<string, EasingCurve> = {
  linear: [0, 0, 1, 1],
  standard: [0.2, 0, 0, 1],
  "standard-decelerate": [0.05, 0.7, 0.1, 1],
  "standard-accelerate": [0.4, 0, 1, 1],
  emphasized: [0.2, 0, 0, 1],
  "emphasized-decelerate": [0.05, 0.7, 0.1, 1],
  "emphasized-accelerate": [0.4, 0, 1, 1],
  smooth: [0.4, 0, 0.2, 1],
  spring: [0.34, 1.56, 0.64, 1],
  bounce: [0.175, 0.885, 0.32, 1.275],
  elastic: [0.25, 0.1, 0.25, 5],
};

/**
 * Convert a CSS easing reference to native cubic-bezier coordinates.
 *
 * Accepts facet token names ("standard"), CSS variable references
 * ("var(--motion-ease-standard)", "var(--facet-motion-ease-smooth)"),
 * and the CSS keyword "linear".
 *
 * Returns [x1, y1, x2, y2] for use with RN's `Easing.bezier()`.
 * Unknown easings fall back to linear [0, 0, 1, 1].
 */
export function toEasingCurve(easing: string | EasingValue): EasingCurve {
  if (Array.isArray(easing)) return easing;
  const match = easing.match(/var\(--(?:facet-)?motion-ease-(.+)\)/);
  const token = match?.[1] ?? easing;
  if (token === "linear") return [0, 0, 1, 1];
  return NATIVE_EASING[token] ?? [0, 0, 1, 1];
}

// ── Native animation spec ─────────────────────────────────────────

export interface NativeAnimationSpec {
  /** Duration in milliseconds. */
  duration: number;
  /** Cubic-bezier curve [x1, y1, x2, y2] for use with Easing.bezier(). */
  easing: EasingCurve;
  /** Optional delay in milliseconds. */
  delay?: number;
  /** Optional travel distance in pixels. */
  distance?: number;
  /** Optional scale factor. */
  scale?: number;
  /** Optional blur radius in pixels. */
  blur?: number;
}

export interface NativeTransitionSpec {
  /** Duration as a facet token ("base", "slow", "cinematic"),
   * a numeric ms value, or a granular string ("300"). */
  duration?: string | number;
  /** Easing token or CSS variable reference from motionValues. */
  easing?: string;
  /** Distance token key ("sm", "md", "lg", "xl", "xl2"). */
  distance?: string;
  /** Scale token key ("inactive", "pop"). */
  scale?: string;
  /** Blur token key ("inactive"). */
  blur?: string;
  /** Delay in milliseconds. */
  delay?: number;
}

/**
 * Resolve a duration token to milliseconds.
 *
 * Accepts facet tokens ("instant", "fast", "base", "slow", "cinematic"),
 * granular strings ("300"), or raw numbers. Falls back to `base` (250ms).
 */
function resolveNativeDuration(duration: string | number | undefined): number {
  if (typeof duration === "number") return duration;
  if (duration === undefined) return motionValues.facetDuration.base;

  const facetVal =
    motionValues.facetDuration[duration as keyof typeof motionValues.facetDuration];
  if (facetVal !== undefined) return facetVal;

  const num = Number(duration);
  if (!Number.isNaN(num)) return num;

  return motionValues.facetDuration.base;
}

/**
 * Resolve a motion transition spec to native animation values.
 *
 * Uses `motionValues` for numeric defaults and `toEasingCurve`
 * for easing. This is the primary entry point for native consumers
 * building `Animated.timing()` configurations.
 *
 * @example
 * ```ts
 * const spec = resolveNativeTransition({
 *   duration: "slow",
 *   easing: motionValues.facetEasing.standard,
 *   distance: "md",
 * });
 * // → { duration: 500, easing: [0.2, 0, 0, 1], distance: 8 }
 * ```
 */
export function resolveNativeTransition(
  spec: NativeTransitionSpec = {},
): NativeAnimationSpec {
  const { duration, easing, distance, scale, blur, delay } = spec;

  return {
    duration: resolveNativeDuration(duration),
    easing: toEasingCurve(easing ?? motionValues.facetEasing.standard),
    delay,
    distance:
      distance !== undefined
        ? motionValues.distance[distance as keyof typeof motionValues.distance]
        : undefined,
    scale:
      scale !== undefined
        ? motionValues.scale[scale as keyof typeof motionValues.scale]
        : undefined,
    blur:
      blur !== undefined
        ? motionValues.blur[blur as keyof typeof motionValues.blur]
        : undefined,
  };
}

// ── Native driver shell ───────────────────────────────────────────

export interface NativeDriverHandle {
  cleanup: () => void;
  /** Whether the driver is actively animating. */
  active: boolean;
}

/**
 * Native motion driver shell (Phase 2C).
 *
 * `isSupported()` returns `false` until a real `Animated` module
 * is bound in Phase 3. The `apply()` stub is a no-op that returns
 * `{ active: false }` so callers can detect the shell state.
 */
export const nativeDriver = {
  apply(): NativeDriverHandle {
    return { cleanup: () => {}, active: false };
  },
  isSupported(): boolean {
    return false;
  },
  toEasingCurve,
  resolveNativeTransition,
};

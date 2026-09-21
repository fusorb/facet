/**
 * @fusorb/facet-motion - driver interface (stub)
 *
 * A driver is the only layer that touches a real rendering target.
 * `css.ts` implements this interface for the web; `react-native.ts`
 * (Phase 3) will be the second implementation.
 *
 * Phase 1 only ships `css.ts`. This file defines the contract so
 * Phase 3's driver has a shape to conform to.
 */

import type { MotionValue } from "../values/motion-value.js";

/** Any object with a CSSStyleDeclaration `style` property.
 * In Phase 1, this is a DOM Element; in Phase 3 it could be a
 * RN Animated-style view. */
export interface DriverTarget {
  style: CSSStyleDeclaration;
}

/** A property name mapped to either a motion value (driven live)
 * or a static value (applied once). */
export interface DriverBindings {
  [property: string]: MotionValue | string | number;
}

/** Handle returned by `apply()` - call `cleanup()` to unsubscribe. */
export interface DriverHandle {
  cleanup: () => void;
  /** Whether the driver is actively animating (false if prefers-reduced-motion). */
  active: boolean;
}

/** Subscribe return - call to unsubscribe from a driver binding. */
export type Unsubscribe = () => void;

/**
 * A motion driver applies motion values to a target.
 *
 * Phase 1 ships `cssDriver` only. A `reactNativeDriver` stub
 * will implement this interface in Phase 3.
 */
export interface MotionDriver {
  /**
   * Subscribe to motion values and apply them to the target's `style`.
   * Returns a handle with `cleanup()` and an `active` flag.
   */
  apply(target: DriverTarget, bindings: DriverBindings): DriverHandle;

  /** Whether the driver's target API is available in this environment. */
  isSupported(): boolean;
}

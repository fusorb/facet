import { cssDriver } from "./css.js";
import type { MotionDriver } from "./types.js";

export { cssDriver } from "./css.js";
export type {
  DriverTarget,
  DriverBindings,
  DriverHandle,
  MotionDriver,
  Unsubscribe,
} from "./types.js";
export { preferReducedMotion } from "./css.js";
export { resolveDuration, resolveEasing } from "./resolve.js";
export type { EasingFunction } from "./resolve.js";
export { DURATION_VALUES, EASING_FUNCTIONS } from "./resolve.js";

// ── Driver registry ──────────────────────────────────────────────
// Allows external drivers (e.g. nativeDriver from @fusorb/facet-native)
// to register themselves so resolveDriver() can pick them up in
// environments where cssDriver is not supported (e.g. React Native).

const _drivers: MotionDriver[] = [cssDriver];

/** Register a motion driver. Drivers are checked in registration order by
 * `resolveDriver()`. cssDriver is always registered first. */
export function registerDriver(driver: MotionDriver): void {
  if (!_drivers.includes(driver)) _drivers.push(driver);
}

/** Resolve the first driver whose `isSupported()` returns true.
 * Falls back to `cssDriver` if no registered driver is supported. */
export function resolveDriver(): MotionDriver {
  return _drivers.find((d) => d.isSupported()) ?? cssDriver;
}

/** Remove a previously-registered driver (mainly for testing). */
export function unregisterDriver(driver: MotionDriver): void {
  const i = _drivers.indexOf(driver);
  if (i !== -1) _drivers.splice(i, 1);
}

/** Reset the registry to just cssDriver (mainly for testing). */
export function clearDriverRegistry(): void {
  _drivers.length = 0;
  _drivers.push(cssDriver);
}

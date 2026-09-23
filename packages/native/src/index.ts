/**
 * @fusorb/facet-native — React Native motion driver bridge (EXPERIMENTAL, v0.1.0).
 *
 * Provides a framework-agnostic RN motion adapter (`bindAnimated`,
 * `unbindAnimated`, `nativeDriver`, `resolveNativeTransition`, `toEasingCurve`,
 * etc.) that subscribes motion values to a consumer-provided Animated module
 * (react-native `Animated` or reanimated v2) via `bindAnimated(...)`.
 *
 * §7 disposition: this is intentionally NOT wired into @fusorb/facet-motion —
 * motion does not import this package and this package does not import motion.
 * The cross-package contract (motion's `animate()` dispatching to the bound
 * native driver when available) is the documented INTENDED integration, not yet
 * realized, and it is absent from the default web build path.
 *
 * Isolation: depends only on @fusorb/facet-tokens; the Animated API is
 * consumer-provided via `bindAnimated`'s argument, so RN consumers get a native
 * driver without dragging web runtime into RN. Tests deferred on this surface
 * pending a React Native test environment.
 */
export { motionValues } from "@fusorb/facet-tokens";
export type { MotionValues, EasingValue } from "@fusorb/facet-tokens";
export {
  bindAnimated,
  unbindAnimated,
  isBound,
  setReduceMotion,
  toEasingCurve,
  resolveNativeTransition,
  nativeDriver,
} from "./native-driver.js";
export type {
  EasingCurve,
  NativeAnimationSpec,
  NativeTransitionSpec,
  NativeDriverHandle,
  NativeMotionDriver,
  NativeMotionValue,
  NativeValue,
  NativeAnimatedAPI,
  NativeTarget,
  NativeBindings,
} from "./native-driver.js";

/**
 * @fusorb/facet-native — React Native motion driver bridge (EXPERIMENTAL, v0.1.0).
 *
 * Provides a framework-agnostic RN motion adapter (`bindAnimated`,
 * `unbindAnimated`, `nativeDriver`, `resolveNativeTransition`, `toEasingCurve`,
 * etc.) that subscribes motion values to a consumer-provided Animated module
 * (react-native `Animated` or reanimated v2) via `bindAnimated(...)`.
 *
 * §7 disposition: intentionally NOT wired into @fusorb/facet-motion today.
 * This is a published package intended for the SovGrant/SovPort UI layer to bind
 * (`bindAnimated`) against a consumer-provided Animated API (react-native
 * `Animated` or reanimated v2). The motion→native driver dispatch contract is
 * the deferred intended integration. Kept isolated as its own package — depends
 * only on @fusorb/facet-tokens; the Animated API is consumer-provided — so
 * RN/SovGrant consumers get a native driver without pulling web runtime into RN,
 * and it is absent from the web build path. Not moved under motion: that would
 * bloat the web motion package with a bridge no web consumer uses and erase the
 * package boundary SovGrant/SovPort integration relies on. Tests deferred
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

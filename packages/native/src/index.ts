/**
 * @fusorb/facet-native — React Native motion driver bridge for @fusorb/facet-motion.
 *
 * Provides a framework-agnostic RN motion adapter (`bindAnimated`,
 * `unbindAnimated`, `nativeDriver`, `resolveNativeTransition`, `toEasingCurve`,
 * etc.) that subscribes motion values to a consumer-provided Animated module
 * (react-native `Animated` or reanimated v2) via `bindAnimated(...)`.
 *
 * §7 disposition: facetDriver is auto-registered with @fusorb/facet-motion's
 * driver registry on import. After `bindAnimated()` is called, `resolveDriver()`
 * in the motion package will return the native driver (because `cssDriver.isSupported()`
 * is false on React Native). The Motion component in @fusorb/facet-motion uses
 * `resolveDriver()` to pick the right driver, so it works on both web and native.
 *
 * This package is kept separate from @fusorb/facet-motion so web consumers
 * never pull RN bridge code into their bundle. It depends on both
 * @fusorb/facet-tokens (token values) and @fusorb/facet-motion (driver registry
 * + core engine types); the Animated API itself is consumer-provided.
 *
 * Usage:
 *   import { bindAnimated, Motion } from "@fusorb/facet-native";
 *   import { Animated } from "react-native";
 *
 *   bindAnimated({
 *     createValue: (initial) => new Animated.Value(initial),
 *   });
 *
 *   // Motion uses resolveDriver() → nativeDriver on RN after binding
 *   <Motion effect="fade" asChild>
 *     <Animated.View />
 *   </Motion>
 */
import { registerDriver } from "@fusorb/facet-motion";
import { facetDriver } from "./adapter.js";

// Auto-register the native driver with @fusorb/facet-motion's driver registry.
// This runs on import — harmless in web/Node (nativeDriver.isSupported()
// returns false until bindAnimated() is called).
registerDriver(facetDriver);

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
export { facetDriver } from "./adapter.js";

// Native Motion component (React Native counterpart to web Motion).
// Uses resolveDriver() → nativeDriver after bindAnimated() is called.
export { Motion } from "./react/index.js";
export type { MotionProps } from "./react/index.js";

/**
 * @fusorb/facet-native — adapter bridging nativeDriver to @fusorb/facet-motion's
 * MotionDriver contract.
 *
 * The motion package's `MotionDriver` uses `DriverTarget = { style: CSSStyleDeclaration }`
 * (a CSS-style proxy). The nativeDriver's `NativeTarget` is a plain `Record<string, unknown>`
 * (RN style proxy). This adapter extracts `target.style` and forwards it to
 * `nativeDriver.apply()`, so the Motion component's `{ style: styleProxy }` target
 * works with both CSS and native drivers.
 *
 * On web, `resolveDriver()` returns `cssDriver` (whose `isSupported()` is true
 * because `window` exists). On React Native, `cssDriver.isSupported()` is false,
 * so `resolveDriver()` checks registered drivers — this adapter is the one that
 * becomes active once `bindAnimated()` is called.
 */
import { nativeDriver } from "./native-driver.js";
import type { MotionDriver } from "@fusorb/facet-motion";
import type { NativeTarget, NativeBindings, NativeDriverHandle } from "./native-driver.js";

export const facetDriver: MotionDriver = {
  apply(target, bindings) {
    const nativeTarget = target.style as unknown as NativeTarget;
    const handle: NativeDriverHandle = nativeDriver.apply(
      nativeTarget,
      bindings as unknown as NativeBindings,
    );
    return { cleanup: handle.cleanup, active: handle.active };
  },
  isSupported(): boolean {
    return nativeDriver.isSupported();
  },
};

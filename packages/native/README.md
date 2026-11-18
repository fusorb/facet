# @fusorb/facet-native

React Native motion driver bridge for `@fusorb/facet-motion`. It lets facet motion
values/effects drive a consumer-provided React Native `Animated` (or compatible)
implementation.

> **Scope (current):** this package is a **motion-driver bridge**, not a standalone
> React Native component library. It is kept separate from `@fusorb/facet-motion`
> so web consumers never pull RN bridge code into their bundle.

## Install

```bash
pnpm add @fusorb/facet-native @fusorb/facet-motion
# plus a React Native / Animated-compatible runtime in your app
```

`react` is a peer dependency; the Animated API itself is provided by the consumer
(no hard dependency on `react-native`).

## Usage

```tsx
import { bindAnimated, Motion } from "@fusorb/facet-native";
import { Animated } from "react-native";

// Bind the React Native Animated API (run once at app startup).
bindAnimated({
  createValue: (initial) => new Animated.Value(initial),
});

// After binding, <Motion> from facet-native uses the native driver.
export function Example() {
  return (
    <Motion effect="fade" asChild>
      <Animated.View />
    </Motion>
  );
}
```

## How it works

1. On import, `@fusorb/facet-native` auto-registers `facetDriver` with
   `@fusorb/facet-motion`'s driver registry.
2. `bindAnimated()` provides the `NativeAnimatedAPI` bridge.
3. On React Native, `cssDriver.isSupported()` is `false`, so `resolveDriver()`
   returns the native driver after binding.
4. `<Motion>` resolves the appropriate driver, enabling the same motion API on web
   (CSS) and native (bridge).

## Key exports

| Export | Description |
| --- | --- |
| `bindAnimated(opts)` | Bind a native Animated API to the motion engine. |
| `unbindAnimated()` | Tear down the active native binding. |
| `isBound()` / `setReduceMotion()` | Binding state and reduced-motion control. |
| `nativeDriver` / `facetDriver` | Native motion driver instances/registration. |
| `resolveNativeTransition()` / `toEasingCurve()` | Transition/easing helpers for native specs. |
| `Motion` | React Native counterpart to web `<Motion>`. |

## License

MIT © facet contributors. See [LICENSE](../../LICENSE) at the repository root.

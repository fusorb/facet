# @fusorb/facet-native

React Native motion driver bridge for `@fusorb/facet-motion`. Kept separate from
the motion package so web consumers never pull Native bridge code into their bundle.

## Install

```bash
pnpm add @fusorb/facet-native
pnpm add react-native
```

## Usage

```tsx
import { bindAnimated, Motion } from "@fusorb/facet-native";
import { Animated } from "react-native";

// Bind the React Native Animated API (run once at app startup).
bindAnimated({
  createValue: (initial) => new Animated.Value(initial),
});

// After binding, <Motion> from facet-native uses the native driver.
// On web, @fusorb/facet-motion's <Motion> auto-resolves to cssDriver.
```

## How it works

1. On import, `@fusorb/facet-native` auto-registers its `facetDriver` with
   `@fusorb/facet-motion`'s driver registry via `registerDriver()`.
2. `bindAnimated()` sets up the `NativeAnimatedAPI` bridge.
3. After binding, `cssDriver.isSupported()` returns `false` on React Native,
   so `resolveDriver()` in `@fusorb/facet-motion` returns the native driver
   instead of CSS.
4. The `<Motion>` component works transparently on both web and native.

The `Animated` API itself is consumer-provided — this package has no hard
dependency on `react-native` (it's a peer dependency).

## API

| Export | Type | Description |
|--------|------|-------------|
| `bindAnimated` | `function(opts: NativeBindings): NativeDriverHandle` | Bind a Native Animated API to the motion engine. |
| `unbindAnimated` | `function(): void` | Tear down the active native driver binding. |
| `nativeDriver` | `MotionDriver` | The auto-registered Native driver instance. |
| `resolveNativeTransition` | `function(spec: NativeTransitionSpec): MotionTransition` | Convert an RN transition spec to a motion transition. |
| `toEasingCurve` | `function(easing: EasingValue): number[]` | Convert a token easing value to an RN easing curve. |
| `Motion` | `Component<MotionProps>` | React Native counterpart to web `<Motion>`. |
| `facetDriver` | `MotionDriver` | The auto-registered RN driver. |

## License

MIT © facet contributors. See [LICENSE](../../LICENSE) at the repository root.

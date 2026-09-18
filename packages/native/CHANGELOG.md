# @fusorb/facet-native

## 0.2.0

### Minor Changes

- 3999eee: Added @fusorb/facet-native package — the React Native motion driver for @fusorb/facet-motion. Re-exports `motionValues` from `@fusorb/facet-tokens` and provides: `toEasingCurve` (CSS easing var → native cubic-bezier coordinates), `resolveNativeTransition` (motion spec → native animation values), and a bindable `nativeDriver` that subscribes facet motion values to a consumer-provided `Animated` module (react-native or reanimated v2) via `bindAnimated()`. Until bound, `nativeDriver` is no-op (`isSupported()` → `false`, `apply()` → inactive handle). No `react-native` dependency — consumers supply their own `Animated`.

### Patch Changes

- Updated dependencies [db287b3]
- Updated dependencies [3fefa64]
  - @fusorb/facet-tokens@1.2.0

# @fusorb/facet-native

## 1.2.0

### Minor Changes

- ba81b34: Native Motion Component — Stage 1 integration:

  - **facet-motion**: Added an extensible driver registry (`registerDriver`,
    `resolveDriver`, `unregisterDriver`, `clearDriverRegistry`) so external
    drivers (e.g. `@fusorb/facet-native`) can register themselves and
    `resolveDriver()` picks the first supported one. `Motion` now calls
    `resolveDriver()` instead of importing `cssDriver` directly. Made
    `preferReducedMotion` optional on the `MotionDriver` interface.
  - **facet-native**: The native driver (`facetDriver`) is now auto-registered
    with `@fusorb/facet-motion` on import, so `resolveDriver()` returns it on
    React Native after `bindAnimated()` is called. Added a React Native
    `Motion` component and `adapter.ts` bridge (`MotionDriver` →
    `NativeTarget.style`). Added `@fusorb/facet-motion` as a runtime dependency
    and `react` as a peer dependency. `sideEffects` set to `true` (side-effectful
    auto-registration).
  - **facet-cli**: Added `@fusorb/facet-motion`, `@fusorb/facet-native`,
    `@fusorb/facet-sandbox`, and `@fusorb/facet-utils` to `ALL_FACET_PACKAGES`
    so the CLI discovers them during scaffolding/updates.
  - **check-boundaries**: Updated `@fusorb/facet-native` allowed-dependency set
    to include `@fusorb/facet-motion` (the host runtime it registers into).

### Patch Changes

- Updated dependencies [3920b90]
- Updated dependencies [ba81b34]
- Updated dependencies [f76a519]
  - @fusorb/facet-tokens@1.4.0
  - @fusorb/facet-motion@1.2.0

## 1.1.0

### Minor Changes

- ba81b34: Native Motion Component — Stage 1 integration:

  - **facet-motion**: Added an extensible driver registry (`registerDriver`,
    `resolveDriver`, `unregisterDriver`, `clearDriverRegistry`) so external
    drivers (e.g. `@fusorb/facet-native`) can register themselves and
    `resolveDriver()` picks the first supported one. `Motion` now calls
    `resolveDriver()` instead of importing `cssDriver` directly. Made
    `preferReducedMotion` optional on the `MotionDriver` interface.
  - **facet-native**: The native driver (`facetDriver`) is now auto-registered
    with `@fusorb/facet-motion` on import, so `resolveDriver()` returns it on
    React Native after `bindAnimated()` is called. Added a React Native
    `Motion` component and `adapter.ts` bridge (`MotionDriver` →
    `NativeTarget.style`). Added `@fusorb/facet-motion` as a runtime dependency
    and `react` as a peer dependency. `sideEffects` set to `true` (side-effectful
    auto-registration).
  - **facet-cli**: Added `@fusorb/facet-motion`, `@fusorb/facet-native`,
    `@fusorb/facet-sandbox`, and `@fusorb/facet-utils` to `ALL_FACET_PACKAGES`
    so the CLI discovers them during scaffolding/updates.
  - **check-boundaries**: Updated `@fusorb/facet-native` allowed-dependency set
    to include `@fusorb/facet-motion` (the host runtime it registers into).

### Patch Changes

- Updated dependencies [3920b90]
- Updated dependencies [ba81b34]
  - @fusorb/facet-tokens@1.3.0
  - @fusorb/facet-motion@1.1.0

## 1.0.0

### Major Changes

- 8891898: Evolve the facet workspace.

  No more 0.1.0 stragglers: motion and native reach their first
  stable 1.0.0, sandbox advances to 2.0.0 alongside its token/UI
  integration. The workspace root, landing app, and playground app
  also evolve to 2.0.0.

  The landing app is rebuilt with a borrowed scratchpad UI - a
  LayerGraph architecture visualization, motion effect gallery,
  token explorer, and four new dedicated route pages
  (/components, /lab/auth, /lab/motion, /lab/tokens).

### Minor Changes

- 3999eee: Added @fusorb/facet-native package - the React Native motion driver for @fusorb/facet-motion. Re-exports `motionValues` from `@fusorb/facet-tokens` and provides: `toEasingCurve` (CSS easing var → native cubic-bezier coordinates), `resolveNativeTransition` (motion spec → native animation values), and a bindable `nativeDriver` that subscribes facet motion values to a consumer-provided `Animated` module (react-native or reanimated v2) via `bindAnimated()`. Until bound, `nativeDriver` is no-op (`isSupported()` → `false`, `apply()` → inactive handle). No `react-native` dependency - consumers supply their own `Animated`.

### Patch Changes

- Updated dependencies [db287b3]
- Updated dependencies [3fefa64]
- Updated dependencies [6591426]
  - @fusorb/facet-tokens@1.2.0

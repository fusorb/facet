# @fusorb/facet-native

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

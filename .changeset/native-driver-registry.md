---
"@fusorb/facet-motion": minor
"@fusorb/facet-native": minor
"@fusorb/facet-cli": patch
---

Native Motion Component — Stage 1 integration:

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

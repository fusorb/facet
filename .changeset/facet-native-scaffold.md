---
"@fusorb/facet-native": minor
---

Added @fusorb/facet-native package: Phase 2C native motion driver shell. Re-exports `motionValues` from `@fusorb/facet-tokens` and provides a `toEasingCurve` adapter (CSS easing var → native cubic-bezier coordinates) plus `resolveNativeTransition` helper for resolving motion specs to native animation values. No `react-native` dependency — consumers provide their own `Animated` module in Phase 3.

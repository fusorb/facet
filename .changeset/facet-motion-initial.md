---
"@fusorb/facet-motion": minor
---

## facet-motion - initial release (0.1.0)

New `@fusorb/facet-motion` package: declarative animation system
built on facet motion tokens. CSS-keyframe driver, stagger/sequence
orchestrator, registry, and thin React bindings.

- Core: `animate`, `sequence`, `stagger` - framework-agnostic
- CSS driver: applies `facet-*` animation classes to DOM elements
- Registry: 10-entry generative animation lookup (fade, slide, zoom,
  attention, 3d, layout, glass, marketing families)
- Values: spring easing presets mapped to motion easing tokens
- Presets: pre-built combos (modal, toast, card, list stagger)
- React hooks: `useMotion`, `useAnimationControls`, `useStagger`
- Accessibility: respects `prefers-reduced-motion` with instant fallback
- `cn`: clsx + tailwind-merge className utility
- SSR-safe: zero runtime JS on CSS-only path

Bumped from 0.0.0 → 0.1.0 (new package).

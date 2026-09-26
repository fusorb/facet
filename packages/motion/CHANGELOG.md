# @fusorb/facet-motion

## 1.0.1

### Patch Changes

- e0b3053: ## motion: fix first-frame delta causing spring animations to snap

  Fixed a bug in `defaultScheduler` (the browser `requestAnimationFrame`-based
  scheduler) where the **first-frame delta** was the absolute DOMHighResTimeStamp
  (e.g. 5432 ms since page load) instead of 0. In `animate.tick`, this was
  accumulated into `elapsed`, causing the spring generator to receive a huge
  elapsed value on the first frame and return its settled value (~1.0)
  immediately — the animation snapped instead of playing.

  This affected all JS-driven spring animations in the browser (e.g. the
  opacity fade on popover enter animations). CSS-transition props (transform)
  were unaffected. Tests passed because they run in Node with a `setInterval`
  fallback where the first delta is ~16 ms.

  Fix: initialize `last` to `null` and use `0` as the first delta
  (`last === null ? 0 : now - last`).

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

- 3fefa64: ## facet-motion - initial release (0.1.0)

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

- 9905bd9: ## motion: asChild mode + dropdown render fix

  Fixed a render issue where dropdowns triggered on hover/click (Navbar, UserMenu)
  appeared behind other content or mispositioned. Root cause: `<Motion>` rendered a
  plain `<div>` wrapper around Radix popover `Content`, whose inline `transform`/
  `opacity` styles created a stacking context and distorted Radix positioning.

  ### facet-motion
  - Added `asChild` prop to `<Motion>`: when set, Motion clones its single child
    element and applies animation styles + a merged ref directly on it — **no
    wrapper `<div>`**. The rendered element becomes the animated node, preserving
    Radix Portal positioning, focus scope, and z-index stacking.
  - Added `setRef` + `useMergeRefs` helpers for stable ref merging.

  ### facet-components
  - Migrated all 10 Radix popover `Content` components from CSS
    `data-[state=open]:animate-facet-zoom-in` to `<Motion asChild
effect="zoom" direction="up">`:
    - dropdown-menu (Content + SubContent), tooltip, popover, hover-card,
      context-menu (Content + SubContent), menubar (Content + SubContent),
      navigation-menu (Viewport), select, dialog, sheet, alert-dialog
  - Removed enter animation CSS classes from all Contents (Motion JS spring handles enter).
  - Preserved `data-[state=closed]:animate-facet-zoom-out` exit classes on all Contents.
  - Left overlays (Dialog/Sheet/AlertDialog) and NavigationMenuIndicator as CSS-only.

- f4ca95a: ## Domain Motion Presets

  Adds domain-customizable motion presets that mirror the auth/layout preset
  pattern - the same domain name (`"fintech"`, `"med"`, `"edu"`, `"enterprise"`)
  drives both auth behavior and motion behavior.

  - **DomainMotionConfig** interface: `defaultTransition`, `allowSpring`,
    `distanceScale`, `forceReducedMotion`, `preferredFamilies`, `maxIntensity`
  - **5 presets**: `fintechMotion` (fast, no spring, 0.75x distance), `medMotion`
    (smooth, spring ok, 1.0x), `eduMotion` (spring easing, 1.2x distance,
    dramatic), `enterpriseMotion` (standard, no spring, 0.9x), `defaultMotion`
    (balanced, spring ok, 1.0x)
  - **getDomainMotionConfig(domain)**: resolves a domain string to its config,
    falling back to `defaultMotion` for unknown domains
  - **easingFor(easing)**: resolves an easing token name to cubic-bezier coordinates,
    sourced from `@fusorb/facet-tokens` `motionValues.facetEasing` - no hardcoded
    bezier values
  - **GENERATIVE_FAMILY_IDS**: exported list of family identifiers for validation
  - **24 tests** covering preset validation, easing resolution, and family
    enumeration

  Additionally, `DURATION_VALUES` and `EASING_FUNCTIONS` in `drivers/resolve.ts`
  now derive directly from `motionValues` (`facetDuration` / `facetEasing`) instead
  of being copied tables - single source of truth across the web CSS driver, the
  React Native driver binding, and the JS registry.

  Added `scripts/audit-motion-parity.mjs`: verifies that `motionValues.facetDuration`
  and `motionValues.facetEasing` stay in sync with the `--facet-motion-duration-*`
  and `--facet-motion-ease-*` CSS custom properties in `tokens.css`, and structurally
  asserts that `resolve.ts` derives its tables from `motionValues` (no hardcoded
  literals).

### Patch Changes

- Updated dependencies [db287b3]
- Updated dependencies [3fefa64]
- Updated dependencies [6591426]
  - @fusorb/facet-tokens@1.2.0

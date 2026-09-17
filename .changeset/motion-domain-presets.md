---
"@fusorb/facet-motion": minor
---

## Domain Motion Presets

Adds domain-customizable motion presets that mirror the auth/layout preset
pattern — the same domain name (`"fintech"`, `"med"`, `"edu"`, `"enterprise"`)
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
  sourced from `@fusorb/facet-tokens` `motionValues.facetEasing` — no hardcoded
  bezier values
- **GENERATIVE_FAMILY_IDS**: exported list of family identifiers for validation
- **24 tests** covering preset validation, easing resolution, and family
  enumeration

Additionally, `DURATION_VALUES` and `EASING_FUNCTIONS` in `drivers/resolve.ts`
now derive directly from `motionValues` (`facetDuration` / `facetEasing`) instead
of being copied tables — single source of truth across the web CSS driver, the
React Native driver binding, and the JS registry.

Added `scripts/audit-motion-parity.mjs`: verifies that `motionValues.facetDuration`
and `motionValues.facetEasing` stay in sync with the `--facet-motion-duration-*`
and `--facet-motion-ease-*` CSS custom properties in `tokens.css`, and structurally
asserts that `resolve.ts` derives its tables from `motionValues` (no hardcoded
literals).

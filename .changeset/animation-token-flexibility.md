---
"@fusorb/facet-tokens": minor
"@fusorb/facet-components": patch
---

Animation flexibility pass - remove hardcoded values from the animation surfaces.

- **New tokens**: `--accent-fuchsia` (third stop of the brand gradient used by
  Aurora / GradientText / GradientBorderCard) and ambient loop durations
  `--motion-duration-beam` / `--motion-duration-aurora` / `--motion-duration-marquee`.
  Mapped into the Tailwind theme as `--color-accent-fuchsia`.
- **Components**: the animation components (`card-animations`, `micro-interactions`,
  `text-animations`, `animated`) now accept `@fusorb/facet-motion`'s `Duration`
  tokens in every `duration` prop (plain numbers still work), so timing is
  themeable per domain instead of hardcoded in milliseconds. Replaced the last
  inline `#d946ef` literals with `var(--accent-fuchsia)` and converted the
  remaining `duration-*` utility classes on these surfaces to token-driven
  durations.
- **Fix**: `RevealCard` / `ScrollReveal` interpolated `resolveEasing("standard")`
  (a JS easing function) into a CSS `transition` string, which stringified the
  function source and produced an invalid timing function; both now use
  `var(--motion-ease-standard)`.
- `--animate-facet-{marquee,aurora,beam}` now resolve their durations and
  easings from tokens instead of literal `20s` / `18s` / `7s`.

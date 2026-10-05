---
"@fusorb/facet-tokens": minor
---

Composable brand palettes. Ship `@fusorb/facet-tokens/palettes/alpha.css` and
`@fusorb/facet-tokens/palettes/ember.css` (built + minified into
`dist/palettes/`, and exported from the package).

Each palette re-maps the full semantic token contract (`--primary`,
`--background`, `--card`, `--ring`, charts, sidebar, …) for both dark and light
themes, so the same components render under a completely different brand by
swapping a single `@import` — no component changes. Landing + docs now use the
Alpha palette (deep-space + electric-cyan); the playground uses the Ember
palette (warm orange/rose) as the counter-example.

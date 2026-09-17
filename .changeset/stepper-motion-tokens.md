---
"@fusorb/facet-components": patch
---

StepperPanel animation is now driven by motion tokens (`--facet-motion-duration-base` / `--facet-motion-ease-standard`) instead of a hardcoded `250ms ease-out`. This is the first consumption of the `@fusorb/facet-motion` token system in the existing component library.

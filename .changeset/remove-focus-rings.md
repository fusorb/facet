---
"@fusorb/facet-components": patch
"@fusorb/facet-tokens": patch
---

Removed all focus-ring (blue border) styles from components, combobox, and ready-to-use components. Removed `focus:ring-*`, `focus-visible:ring-*`, `focus-within:ring-*`, `hover:ring-*`, and `focus:border-primary` Tailwind classes across 48 component/app/layout/doc files. Removed the global `:focus-visible` outline rule from `tokens.css` and the `.lab :focus-visible` outline rule from `labs.css`. Static ring classes for selected/active/badge states (e.g., pill selected, stepper active, input-otp active slot) are preserved — only focus-triggered ring/border styles were removed. `outline-none` is retained to suppress the browser's default blue outline, so clicking a component shows no border.

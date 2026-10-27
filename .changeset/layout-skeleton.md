---
"@fusorb/facet-layout": minor
---

Add `LayoutSkeleton` — a loading placeholder that mirrors the geometry of each layout shell kind (console, auth, landing, docs, chat). Uses `@fusorb/facet-components`' `Skeleton` (with built-in `animate-pulse`) so every bar animates in sync for a uniform shimmer across the shell.

Available via the new `@fusorb/facet-layout/skeleton` subpath or the main barrel export. The skeleton imports only `@fusorb/facet-components` + React, staying decoupled from the layout-context provider chain.

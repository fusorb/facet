---
"@fusorb/facet-motion": patch
"@fusorb/facet-components": patch
---

Comment- and refactor-only edits (no observable change)

- `@fusorb/facet-motion`: corrected the `src/index.ts` header comment (authored
  effect count 18 → 27). Comment only; no runtime or type change.
- `@fusorb/facet-components`: `ui/navbar.tsx` dropped the commented-out scroll
  listener skeleton and the stale TODO in favour of a note that the `data-stuck`
  hook point is currently inert. `stuck` was already a constant `false` (its
  setter was only ever called from the removed commented block), so rendered
  output, props and `data-stuck` behaviour are unchanged.

Patch rather than `--empty`: changesets v3's gate needs a real entry per changed
published package, and ADR-008 classifies an internal refactor with no
observable change as a patch.

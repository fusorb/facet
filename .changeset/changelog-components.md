---
"@fusorb/facet-components": major
---

Replace the single-purpose `Changeset` docs block with a full ChangelogCard /
ChangelogFeed component pair for release timelines.

**Breaking:** `Changeset` is removed. Use `ChangelogCard` (single release card
with category/status badges, highlights, inline diff toggle) and
`ChangelogFeed` (filterable vertical timeline with staggered entrances) instead.

- Added `ChangelogCard` + 6 compound sub-components (Header, Title, Description,
  Highlights, DiffToggle, DiffViewer) — all token-driven (no hardcoded colors).
- Added `ChangelogFeed` + FilterBar + Timeline + TimelineItem — search + category
  filter, stagger via `@fusorb/facet-motion`.
- Exported `ChangelogItem`, `ReleaseCategory`, `ReleaseStatus`, `ChangeCategory`
  types alongside the components.
- Bumped component count 117 → 118 in CLAUDE.md, README, package.json, and
  generated site data.

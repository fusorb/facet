---
"@fusorb/facet-components": minor
"@fusorb/facet-tokens": minor
---

Rebuild the changelog timeline on the Roadmap timeline, and make the glass /
frost surfaces token-driven.

- **ChangelogFeed**: the release timeline now composes `<Roadmap>` through its
  new `renderItem` slot, so the connector line and dots are aligned by
  construction. Previously the line ran at `left-5` while each dot sat at
  `left-[-13px]` on a zero-padding list, so they never met (the line stuck to
  the start of the card).
- **ChangelogCard**: the in-card category dot and the status badge are removed
  from the default render and are now opt-in (`showCategoryDot` / `showStatus`);
  the outside timeline dot is kept and carries the category colour.
- **Customization**: `categoryConfig` (label / dot / badge variant, merged over
  token-driven defaults via `resolveChangelogCategoryConfig`), `labels`, and
  `classNames` slots on both `ChangelogCard` and `ChangelogFeed`. New exports:
  `ChangelogCategoryMeta`, `ChangelogCategoryConfig`, `ChangelogCardLabels`,
  `ChangelogCardClassNames`, `ChangelogFeedLabels`, `ChangelogFeedClassNames`,
  `ChangelogTimelineProps`, `ChangelogFeedFilterBarProps`,
  `DEFAULT_CHANGELOG_CATEGORY_CONFIG`, `resolveChangelogCategoryConfig`.
- **Roadmap**: `renderItem(item, index)` slot and `RoadmapItem.dotClassName`
  (additive) so a surface can reuse the timeline chrome with custom content.
- **Tokens**: `.glass`, `.glass-card`, and `.frost` are now driven by
  `--glass-*` / `--glass-card-*` / `--frost-*` variables defined on `:root`
  with light-theme overrides, so consumers can retune opacity, blur, border,
  and shadow per theme. Fixes light-theme glass reading as invisible
  (white-on-white) and a malformed `rgba(0,0,0,0.12%)` frost shadow.

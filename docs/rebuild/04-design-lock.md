# Design Lock (Phase 4)

**Status:** Accepted (accepted under architect delegation 2026-11-01; owner may reverse)  
**Owner sign-off:** ☑ Accepted (defaults below)  
**Companion:** `docs/rebuild/SURFACE-SPEC.md` §10 phase 4, ADR-001..009

## Sign-off checklist (tick to accept)

- [x] Type scale defined (below).
- [x] Spacing scale defined (below).
- [x] Container widths defined.
- [x] Breakpoints defined.
- [x] Surfaces / borders / radii / shadows defined.
- [x] Z-index scale defined (already in AGENTS.md).
- [x] Motion usage rules defined.
- [x] Focus / contrast rules defined.
- [x] Density (compact/comfortable/spacious) defined.
- [x] Wireframes: playground, docs, landing (desktop + mobile) — ASCII below.
- [x] A11y budgets defined.
- [x] Performance budgets defined.

## Type scale

| Token | Size | Line height | Weight | Use |
|---|---|---|---|---|
| `--text-xs` | 0.75rem | 1.0 | 400 | captions, metadata |
| `--text-sm` | 0.875rem | 1.25 | 400 | body small, form labels |
| `--text-base` | 1rem | 1.5 | 400 | body |
| `--text-lg` | 1.125rem | 1.5 | 500 | subheadings |
| `--text-xl` | 1.25rem | 1.25 | 600 | section titles |
| `--text-2xl` | 1.5rem | 1.25 | 700 | page titles |
| `--text-3xl` | 1.875rem | 1.2 | 700 | hero titles |

Font family: `--font-sans` (system stack + Inter via tokens); `--font-mono` for code.

## Spacing

4px base grid: `--space-1`=4px, `--space-2`=8px, `--space-3`=12px, `--space-4`=16px,
`--space-6`=24px, `--space-8`=32px, `--space-12`=48px, `--space-16`=64px.
Components use `gap-4` (16px) default; `gap-6` for sections; `gap-8` for page.

## Containers

| Name | Max width | Use |
|---|---|---|
| `--container-sm` | 640px | narrow content (auth cards) |
| `--container-md` | 768px | docs article |
| `--container-lg` | 1024px | docs with sidebar |
| `--container-xl` | 1280px | playground stage |
| `--container-2xl` | 1536px | landing |

## Breakpoints

`sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px (Tailwind v4 defaults).

## Surfaces / borders / radii / shadows

- Radius: `--radius-sm` 4px, `--radius` 6px, `--radius-md` 8px, `--radius-lg` 12px, `--radius-full` 9999px.
- Borders: 1px `--border` (oklch 0.9/0.2 light/dark). Focus ring: `--ring` (#38bdf8), 2px, keyboard-only.
- Shadows: `--shadow-sm` (card), `--shadow-md` (popover), `--shadow-lg` (modal). No arbitrary shadows.
- Surfaces: `--background`, `--foreground`, `--card`, `--muted`, `--accent`, `--primary`.

## Z-index scale (valid Tailwind v4 values)

- `z-50` — persistent page chrome (navbar, cookie banner).
- `z-[60]` — modal backdrops (Dialog/Sheet/AlertDialog).
- `z-[70]` — floating content (modal content, popovers, tooltips, navbar mobile menu).

## Motion usage rules

- Motion communicates state, not decoration. Use `animate-facet-*` grammar.
- Respect `prefers-reduced-motion`: all animations gated.
- Durations: `--duration-fast` 150ms, `--duration-base` 250ms, `--duration-slow` 400ms.
- Easings: `--ease-out`, `--ease-in-out`, `--ease-spring` (from tokens).
- No inline duration literals (enforced by check:motion-drift).

## Focus / contrast

- Focus rings keyboard-only: `focus-visible:ring-2 focus-visible:ring-[var(--ring)]`.
- Contrast: WCAG AA (4.5:1 body, 3:1 large text). Verified by a11y audit (M8).
- All interactive elements reachable via keyboard; tab order follows DOM.

## Density

`compact` / `comfortable` (default) / `spacious`. Maps to gap-3/gap-4/gap-6 and
padding p-3/p-4/p-6. Used by LayoutSkeleton and real shells.

## Wireframes (ASCII)

### Playground (desktop)
```
+--------------------------------------------------+
| Navbar (pill)                                    |
+----------+---------------------------------------+
| Sidebar  |  Stage (bounded viewport)              |
| (nav)    |  +---------------------------------+ |
|          |  |  Artifact preview               | |
|          |  +---------------------------------+ |
|          |  Inspector (controls)  |  Code view  |
+----------+---------------------------------------+
```

### Playground (mobile)
```
+------------------+
| Navbar (hamburger)|
+------------------+
| Stage (full width)|
| Inspector (stack) |
| Code view (stack) |
+------------------+
```

### Docs (desktop)
```
+--------------------------------------------------+
| Topbar (brand, search, theme, github)            |
+----------+------------------------+--------------+
| Sidebar  |  Content (article)     | Aside (TOC)  |
| (nav)    |                        |              |
+----------+------------------------+--------------+
```

### Docs (mobile)
```
+------------------+
| Topbar (hamburger)|
+------------------+
| Content (full)   |
| (aside collapsed)|
+------------------+
```

### Landing (desktop)
```
+--------------------------------------------------+
| Navbar (floating, frosted)                        |
+--------------------------------------------------+
| Hero (headline, CTAs, proof)                     |
+--------------------------------------------------+
| Sections (each declares purpose + proof)         |
+--------------------------------------------------+
| Footer (ecosystem, security, about)              |
+--------------------------------------------------+
```

### Landing (mobile)
```
+------------------+
| Navbar (hamburger)|
+------------------+
| Hero (stacked)   |
+------------------+
| Sections (stack) |
+------------------+
| Footer (stack)   |
+------------------+
```

## A11y budgets
- Keyboard: all interactive elements focusable and operable.
- Screen reader: semantic HTML, ARIA labels, live regions for dynamic content.
- Contrast: WCAG AA (4.5:1 body, 3:1 large).
- Reduced motion: all animations gated by `prefers-reduced-motion`.
- 320px min width, 200% zoom without horizontal scroll.

## Performance budgets
- Lighthouse: Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥90.
- Bundle: landing ≤300KB gzipped, docs ≤250KB gzipped, playground ≤200KB gzipped.
- No layout shift (CLS ≤0.1).

## New token additions (if any)
None in this lock — all values reuse existing tokens. Future additions go to
`@fusorb/facet-tokens` with a changeset.

## check:app-tokens (warn-only until apps rebuilt)
Scans apps/** for raw colour literals, `font-family:` declarations, `@import url(`,
and arbitrary z-index (`z-[...]` outside the scale). Warns, does not fail,
until M5-M7 rebuild lands. Becomes hard-fail at M8.
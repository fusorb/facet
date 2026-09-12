# @fusorb/facet-tokens

## 1.1.4

### Patch Changes

- b7accc3: Polish pass: SpotlightCard default spotlight now uses color-mix for a visible semi-transparent glow (was a flat var(--primary) that was barely visible); BorderBeamCard beam refined with soft entry/exit ramps for a cleaner sweep; AnimatedButton default animation changed from shine to sparkle (consistent with BillingPageConfig's existing default); tokens CSS hides scrollbars globally across all facet apps (code blocks, tables, tabs, etc.) so interfaces look clean on mobile and medium screens.

## 1.1.3

### Patch Changes

- 18547dc: feat(components): MailInput with domain suggestions + Dissolve animation family

  ### @fusorb/facet-components (minor)
  - **MailInput** -- email input with a domain-suggestion dropdown. Typing `@` (or
    continuing after it) surfaces common provider domains (gmail.com,
    icloud.com, etc.); click or press Enter to auto-complete. Works controlled
    (RHF/Shadcn forms) and uncontrolled.
  - **DissolveText** -- 10th text animation (char-by-char dissolve-in). SSR-safe.
  - **DissolveButton** -- micro-interaction that emits a particle-dissolve burst
    on click. SSR-safe.
  - **DissolveCard** -- card-surface animation that dissolves in on mount with a
    subtle hover overlay.
  - **AnimatedButton** -- new `animation="dissolve"` variant.
  - **Footer** -- new `variant="streamline"` with `steps` (how-it-works grid) and
    `notices` (research notices, cookie callouts) slots; new `FooterStep` type.
  - **FaqSection** -- `type="multiple"|"single"` accordion behavior + `children`
    slot for footer strips.
  - **Roadmap** -- `maxHeight` prop for scrollable timeline layouts.
  - **BillingPage / PlanCta** -- CTA now renders a real `<a>` (via `Button
asChild`) for accessible, right/middle-clickable links; `renderButton`
    override preserved.
  - New `facet-dissolve` CSS keyframe in tokens (shared by DissolveText,
    DissolveButton, DissolveCard, AnimatedButton dissolve variant).

  ### @fusorb/facet-layout (minor)
  - **Sidebar** -- new `singleOpen` (accordion) prop; `Collapse all` / `Expand
all` toolbar buttons; active section scrolls into view.
  - **ConsoleLayout** -- passes `singleOpen` through to the sidebar (both docked
    and mobile Sheet).
  - **LayoutContext** -- new `openSection`, `collapseAll`, `expandAll` methods
    (all persisted to localStorage alongside the existing `toggleSection`).
  - The docs layout opts into `singleOpen`.

  ### @fusorb/facet-tokens (patch)
  - New `--animate-facet-dissolve` keyframe (500ms ease-out, both fill-mode).

  ### @fusorb/facet-docs (patch)
  - Docs manifest regenerated: `mail-input` added (inputs category);
    `typewriter-text` now documented as tabs on the text-animations page
    instead of a standalone slug.
  - Animation sidebar is now a flat list (removed nested Text/Cards parents).
  - Variant previews + usage snippets for DissolveText, DissolveButton,
    DissolveCard, AnimatedButton dissolve, and the Footer streamline variant;
    TypewriterText preview moved to the text-animations tab set.
  - `check-docs-inventory` drift gate accounts for `typewriter-text`
    (documented elsewhere), `gen-docs-manifest` excludes it from generation.

## 1.1.2

### Patch Changes

- a058223: feat(tokens): animation keyframes for the facet animation family

  Adds `facet-text-blur`, `facet-text-wave`, `facet-shimmer`, `facet-gradient-shift`, `facet-flip`, `facet-fade-up`, and `facet-glow-pulse` keyframes to the Tailwind theme so the components text-animation + micro-interaction components animate without inline CSS.

## 1.1.1

### Patch Changes

- b95bcb0: fix(tokens): complete light-theme token parity

  The light theme (`[data-theme="light"]`) was missing 28 tokens that exist
  in the dark `:root` block -- consuming apps got undefined/fallback values
  for light mode:

  - `success` / `success-foreground` and `warning` / `warning-foreground`
    (light-optimized hues).
  - Chart palette `chart-1..5` (light-optimized, higher contrast).
  - `sidebar-ring`.
  - `radius` + the `radius-sm..3xl` scale (declared so a light-only subtree
    is self-contained).
  - `sub-brand-accent` / `sub-brand-accent-foreground`.
  - Alpha palette (`alpha-*`) and font families (`font-*`) -- theme-
    independent tokens that were previously `:root`-only.

  The light theme is now fully self-contained: a consumer applying
  `[data-theme="light"]` on a subtree gets every token arc-id/components
  expect, with no fallback to undefined.

## 1.1.0

### Minor Changes

- 3de0e04: - Adds the `tw-animate-css` enter/exit animation utility set (animate-in/out, fade, zoom, slide) to the Tailwind v4 theme extension (`tailwind.css`), so facet component class strings resolve for Tailwind consumers.
  - Adds `facet-marquee` and `caret-blink` keyframes plus `--animate-facet-marquee` / `--animate-caret-blink` theme vars; plain-CSS equivalents live in `tokens.css` for non-Tailwind consumers.

## 1.0.1

### Patch Changes

- d94a724: chore: update homepage to facet.arcevocirqle.com.ng

## 1.0.0

### Major Changes

- e79cbd5: initial publish...

# @fusorb/facet-docs

## 1.4.7

### Patch Changes

- 205d83b: Remove the collapsible/vertical-collapsible docs gallery variants for Resizable (were never wired to the variants.tsx list, leaving dead code in previews.tsx and usage.ts). Make the horizontal variant as polished as the vertical by adding the same height constraint and proper border separation.
- Updated dependencies [205d83b]
- Updated dependencies [205d83b]
- Updated dependencies [1bf5de5]
- Updated dependencies [205d83b]
- Updated dependencies [b1da261]
- Updated dependencies [205d83b]
- Updated dependencies [1bf5de5]
- Updated dependencies [1bf5de5]
- Updated dependencies [cfabae9]
  - @fusorb/facet-auth@1.2.3
  - @fusorb/facet-components@1.11.0
  - @fusorb/facet-sdk@1.2.0
  - @fusorb/facet-layout@1.4.2

## 1.4.6

### Patch Changes

- Updated dependencies [b7accc3]
  - @fusorb/facet-components@1.10.0
  - @fusorb/facet-tokens@1.1.4
  - @fusorb/facet-auth@1.2.2
  - @fusorb/facet-layout@1.4.1

## 1.4.5

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

- Updated dependencies [18547dc]
  - @fusorb/facet-components@1.9.0
  - @fusorb/facet-layout@1.4.0
  - @fusorb/facet-tokens@1.1.3
  - @fusorb/facet-auth@1.2.1

## 1.4.4

### Patch Changes

- Updated dependencies [9360e93]
- Updated dependencies [9360e93]
- Updated dependencies [a058223]
- Updated dependencies [8d922f7]
- Updated dependencies [2236aa8]
- Updated dependencies [78b6543]
  - @fusorb/facet-auth@1.2.0
  - @fusorb/facet-components@1.8.0
  - @fusorb/facet-tokens@1.1.2
  - @fusorb/facet-layout@1.3.4

## 1.4.3

### Patch Changes

- Updated dependencies [d2b43d0]
  - @fusorb/facet-components@1.7.0
  - @fusorb/facet-auth@1.1.6
  - @fusorb/facet-layout@1.3.3

## 1.4.2

### Patch Changes

- Updated dependencies [8a7aef3]
- Updated dependencies [b95bcb0]
  - @fusorb/facet-components@1.6.0
  - @fusorb/facet-tokens@1.1.1
  - @fusorb/facet-auth@1.1.5
  - @fusorb/facet-layout@1.3.2

## 1.4.1

### Patch Changes

- Updated dependencies [b95bcb0]
  - @fusorb/facet-sdk@1.1.0
  - @fusorb/facet-auth@1.1.4
  - @fusorb/facet-layout@1.3.1

## 1.4.0

### Minor Changes

- 3554506: Animated surfaces + page components + full location dataset.

  Components:
  - Button gains `shine` (hover sweep) and `ripple` (click ink burst)
    variants plus a `magnetic` prop (button gravitates toward the cursor).
  - Card gains `tilt` (3D cursor-follow), `gradient-border`, `zoom`
    (image hover), and `flip` (state-driven 3D reveal: flips on hover,
    returns on mouse-out, click toggles for touch; `flipDirection`
    horizontal/vertical; `CardFlipBack` back-face component).
  - New `animated` module: Spotlight (cursor glow), Aurora (conic
    gradient motion), Beams (sweeping light), GridPattern (masked grid),
    SparkleButton (click sparkle burst). Zero-dependency, backed by new
    facet-* keyframes in the tokens tailwind.css.
  - New `Footer` (config-driven site footer: brand, link columns,
    socials, bottom links, legal, bottomBar override) and `FeedbackPage`
    (ready-to-use feedback/contact page: mailto form, config channels,
    form override).
  - `SelectSearch` added to the Select component: a sticky search input
    that stays pinned while the option list scrolls. The LocationPicker's
    searchable selects use it (Country/State/LGA type-to-filter).
  - LocationPicker: DEFAULT_COUNTRIES + DEFAULT_REGIONS regenerated from
    the dr5hn countries-states dataset (ODbL) - 168 countries, ~3,600
    states/regions (was 16). Nigeria's full 774-LGA layer preserved.
    Dynamic region labels (state/county/province/governorate/emirate)
    resolve per country.

  Layout:
  - Topbar + ConsoleLayout gain a `themeToggle` prop that renders the
    built-in ThemeToggle (requires a ThemeProvider ancestor), so apps no
    longer hand-wire theme switching.
  - AuthLayout default brand panel is theme-token + config driven (no
    hardcoded Arcevo colors or footer text); `brand.footerText` and
    `brandPanel`/`brandPanelClassName` cover customization.

  Docs:
  - New dedicated "Pages" section (sidebar + /pages route) for full-page
    components (FeedbackPage, Footer) with live previews, usage, and
    customization docs. New page components land there automatically.
  - Card variants (tilt/gradient-border/zoom/flip) + SelectSearch +
    animated surfaces documented with usage snippets.

### Patch Changes

- Updated dependencies [3554506]
  - @fusorb/facet-components@1.5.0
  - @fusorb/facet-layout@1.3.0
  - @fusorb/facet-auth@1.1.3

## 1.3.1

### Patch Changes

- DataTable: export consolidated into a single Export dropdown (CSV + pluggable exporters), plus a new overflow (⋯) actions menu for bulk row actions (select-all, mark-as-read, delete-all, custom). NavigationMenuLink is now a padded, hover-styled block link (fixes cramped dropdown items) and supports an optional description. NumberInput gains a built-in currency picker: CURRENCIES list, currencyPicker dropdown, currencyOptions override, and onCurrencyChange.

  New components: DateInput (ISO date validation + native fallback), PasswordInput (show/hide toggle), and InfiniteScroll (vertical/horizontal, IntersectionObserver sentinel).

  CountryCodeInput expands to the full ISO country list with regional restriction filtering (includeRegions/excludeRegions). LocationPicker deepens the country dataset (Nigeria states + LGA/LCDA) and exports typed CountryInput / StateInput / LGAInput sub-inputs. DatePicker adds a year picker. QRCode gains a logo variant with configurable position. DataTable's generic constraint is relaxed so plain interfaces work as row types.

  Docs package: demos, variants, and usage snippets updated for all of the above.

- Updated dependencies
  - @fusorb/facet-components@1.4.0
  - @fusorb/facet-auth@1.1.2
  - @fusorb/facet-layout@1.2.1

## 1.3.0

### Minor Changes

- 865bf7e: perf(docs): lazy-load the layout shell, component gallery, and demo blocks

  The docs engine now code-splits its heavy surfaces so the initial bundle
  stays small for consumers:

  - `DocsLayout` (ConsoleLayout + CommandPalette) is lazy-loaded.
  - The `/components`, `/components/:slug`, and `/ready-to-use` routes are
    lazy-loaded.
  - The auth/layout demo blocks (`AuthDemo`, `AuthPreviews`,
    `LayoutPreviews`) are lazy-loaded inside the content page.
  - `InteractiveDemo` lazy-loads the heavy `variants` preview graph.
  - The barrel no longer statically re-exports the heavy internal demo/page
    modules (ComponentsPage, ComponentPage, AuthDemo, Playground, ...) which
    were never part of the public contract.

  Measured on the facet docs site: initial-load JS dropped ~33% (1.44 MB to
  ~960 KB), and the heavy component-preview code now only downloads when a
  user visits the component gallery.

### Patch Changes

- 251a0e4: fix: alert success/warning colors, mobile table overflow, auth docs cleanup

  - components: Alert success and warning variants now use their semantic
    text colors (text-success green, text-warning amber) matching the
    destructive variant, instead of text-foreground. Added an alert test.
  - layout: the ConsoleLayout main area gets min-w-0 so wide tables scroll
    inside their own overflow-x-auto container instead of overflowing the
    page on mobile.
  - docs: remove the /auth/forms page (its LoginForm demo rendered a blank
    page) and the redundant /auth/layouts page (covered by the Ecosystem
    Layout page). Cleaned up the login-form manifest entry, variant, and
    usage. Fixed stale docs claims: 52 -> 57 components, added facet-cli to
    the package list, corrected the publishing note (CI is validation-only)
    and the fintechAuthPreset -> fintechPreset snippet name.

- df7c8f6: fix(docs): auth pages render again; remove crashing live demos

  The SignUp, MFA, and Guard pages rendered a blank screen because their live
  demos wrapped auth forms in ArcProvider with a dead demo endpoint, which
  suspended the render without an error. Converted those pages to code-first
  documentation (accurate importable snippets + full prose) and removed the
  crashing sign-up/mfa-dialog/guard entries from the gallery manifest,
  variant cells, and usage snippets. SignIn keeps its working live demo.

  Verified in the browser: /auth/sign-up, /auth/mfa, and /auth/guard all
  render their content again.

- 00fcbb4: docs: add Breadcrumb ellipsis + InputOTP 8-digit variants

  - Breadcrumb: new "Ellipsis" demo/usage showing BreadcrumbEllipsis between
    items (component already existed; it's now showcased).
  - InputOTP: new "8-digit" demo/usage. Paste-spread, 8-digit maxLength, and
    cap-at-maxLength behavior verified by a new component test
    (packages/components input-otp.test.tsx, 4 tests).

- 2dae8e2: fix: mobile overflow, contained layout docs, settings menu cleanup

  - layout: responsive `p-4 md:p-8` main padding, `px-4 md:px-6` topbar,
    and a `w-40 sm:w-64` search trigger so the docs shell fits phones.
  - docs: the /layout page documents full app shells code-first (their
    fixed-position sidebars escaped the docs shell); standalone Sidebar +
    Topbar and pill Navbar keep live previews.
  - docs: settings gear no longer duplicates the theme toggle (it has its
    own icon); it now shows ecosystem links + a Ctrl+K search hint.
  - docs: accordion previews now show 3 items so spacing consistency is
    visible; Docs Package + Layout pages moved under the Ecosystem section.
  - apps/docs + apps/landing vercel.json SPA-fallback rewrites fix 404s on
    deep-route refresh.

- 91da99d: docs: Menubar composability + Navbar dropdown variants; emdash purge

  - Menubar: new "Composed" variant showing radio groups, checkboxes,
    submenus, and shortcuts (the tabs composability story).
  - Navbar: new "With dropdown" variant using link children (nested links
    with descriptions + badge).
  - Purge em dashes from all repo copy and comments per the style rule.

- b878bfd: fix(docs): layout page no longer takes over the shell; back button; marquee

  - docs: the /layout page had live layout demo blocks whose fixed-position
    sidebars escaped and covered the docs shell (the arc-id demo sidebar).
    Removed every live demo block from the page; it is now text + copyable
    code only. Verified in the browser: the facet sidebar renders normally.
  - docs: add a Back button at the top of every content page body (goes back
    in history, falls back to /) so routing between pages is easier.
  - components: Marquee track no longer forces whitespace-nowrap, so card
    children wrap naturally instead of clipping; the default text variant
    wraps its items in nowrap spans.
  - landing: the install steps strip switched from ScrollArea to the facet
    Marquee (pause-on-hover), dogfooding the component internally.

- Updated dependencies [251a0e4]
- Updated dependencies
- Updated dependencies [865bf7e]
- Updated dependencies [69c1fec]
- Updated dependencies [2dae8e2]
- Updated dependencies [b878bfd]
- Updated dependencies [6bb55a2]
  - @fusorb/facet-components@1.3.0
  - @fusorb/facet-layout@1.2.0
  - @fusorb/facet-auth@1.1.1

## 1.2.0

### Minor Changes

- 568497d: - Adds the interactive `AuthDemo` component and `authDemo` docs block: a configurable live `<SignIn>` with method/OAuth toggles that generates the exact `config` code for the selected method.
  - Adds the reusable `InteractiveDemo` component and `demo` docs block: a variant/method switcher drives a live preview and a copyable code snippet for any manifest slug (auth, layout, and forms guide pages).
  - Adds the `keyboardShortcuts` docs block (Kbd-chip shortcuts table).
  - Splits the gallery: base UI components, the auth/layout surfaces, and the "Ready to Use" extras (Dropzone, ColorPicker, QRCode, Marquee, Roadmap, Form) each get their own sidebar section or guide page with live previews and copyable usage snippets.
  - All new blocks are exported from the package barrel and documented in the docs package README block table.

### Patch Changes

- Updated dependencies [3de0e04]
- Updated dependencies [568497d]
- Updated dependencies [3de0e04]
  - @fusorb/facet-components@1.2.0
  - @fusorb/facet-auth@1.1.0
  - @fusorb/facet-tokens@1.1.0
  - @fusorb/facet-layout@1.1.1

## 1.1.0

### Minor Changes

- - Initial publish: installable, config-driven docs site engine. Mount `<DocsApp config={...} pages={...} />` with your own brand, nav, content pages, and ecosystem links, without forking.
  - Ships a searchable sidebar shell (VS Code-style collapsible rail), paginated component gallery with per-component variant pages, per-variant usage tabs, install tabs for pnpm/npm/yarn/bun, and an optional ecosystem links section.
  - Pages and nav derive from a single pages registry; the component manifest is auto-generated from `packages/components/src/ui`.

### Patch Changes

- Updated dependencies [3752a98]
- Updated dependencies [3752a98]
- Updated dependencies [3752a98]
- Updated dependencies [3752a98]
  - @fusorb/facet-components@1.1.0
  - @fusorb/facet-layout@1.1.0
  - @fusorb/facet-auth@1.0.3

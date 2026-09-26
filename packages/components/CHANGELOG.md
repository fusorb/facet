# @fusorb/facet-components

## 2.0.0

### Major Changes

- 4ecefd6: Replace the single-purpose `Changeset` docs block with a full ChangelogCard /
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

### Minor Changes

- 046ca4f: Chart: fix 3 failing tests (handlePointerMove no longer bails on zero-width SVG rects in jsdom; ResizeObserver scaleRef formula corrected to width/rect.width).

  Chart: add visible axis spine lines (solid y-axis + x-axis) so axes are properly framed instead of floating with only dashed gridlines. Increased left padding from 48 to 56px for better y-axis label clearance.

  Chart: add `maxHeight` prop - when set, the chart container becomes vertically scrollable so charts with many categories (especially horizontal bar layouts) can be fully viewed without crowding.

  Chart: add `rowHeight` prop (default 36px) - horizontal bar charts now auto-grow their height to `n * rowHeight + padding` so each category row gets adequate vertical space, and bars distribute across the plot height (not width) via a new `catY` positioning function.

  Docs: add chart component variant gallery (Line, Bar, Area, Pie, Donut, Composed, Horizontal, Stacked, Smooth, Step) to the variant gallery and usage snippets.

  Chart: pie slices no longer scale(1.03) on hover from the label position (which caused an inconsistent pop) - hover now dims via opacity only, matching donut behavior.

  Chart: new `crosshairPoints` prop (default false) - the colored point markers that chased the crosshair cursor are now opt-in, so the crosshair line is the only element that follows the mouse by default.

- d6a688a: Chart v2 polish - crosshair fix, animations, and range selector:

  - **Crosshair**: The guide line + intersection dot snap to the nearest data point
    when `crosshairSnap` is on; the dot is hidden there (the active marker already
    marks the position, so rendering both would look duplicated). When off (the
    default for bar/histogram), the line and dot track the raw cursor and
    `interpolateAtX` pins the dot's value to a bar as it passes - bar/histogram
    crosshairs follow the cursor smoothly. The old fixed 8px snap window (which made
    bars jitter between snapping and floating) is removed.

  - **Crosshair dot centering**: The active data-point dot's hover `scale(1.15)`
    is now anchored to the dot's centre with `transformOrigin` (matching the
    pie/donut slices). Without it, SVG's default origin-`0` scaling shifted the
    active dot off the band centre, re-creating the drift the snap fix was meant
    to eliminate (the dot floated right/down away from the snapped guide line).

  - **View animations**: Replaced all slide-from-top entry animations
    (`translateY` / `slide-in-from-top-*`) with pure fade or fade+zoom in
    Tooltip, Popover, DropdownMenu, Select, Dialog, AlertDialog, NavigationMenu,
    Sheet, Chart (facet-chart-fadeIn keyframe), MicroInteractions,
    RevealCard, and the `facet-fade-up` / `facet-dissolve` Tailwind keyframes.

  - **ChartRangeSelector**: Now positional (`position` prop: top-left/top-right/
    bottom-left/bottom-right/top/bottom), customizable (`size` prop: compact/
    normal/wide), minimizable (collapsible with a toggle button, controlled or
    uncontrolled), and opt-in via the new `rangeSelector` prop on `Chart`.

- 703aea1: Chart crosshair + dynamic axis range:

  - Crosshair intersection dot border now inherits the chart background color instead of the foreground, so it renders as the background (black in dark mode, light in light mode) - matching the crosshair point dots and keeping the snapped intersection visually grounded.
  - New `tickCount` prop (default `4`) controls how many ticks are drawn on the value axis (`niceTicks` previously hardwired 4).
  - New optional `yMin` / `yMax` props override the auto-computed value-axis range. The range still falls back to the data-derived min/max (clamped to include 0 for bar correctness) when omitted, so existing charts are unchanged.

- 70b7054: Chart crosshair + animation customization:

  - Crosshair now snaps to the nearest data point by default (was "dynamic - follows cursor"), fixing the visual misalignment where the crosshair dot floated away from the data-point dots that grow on hover. Added `crosshairSnap` prop (default `true`); set `crosshairSnap={false}` to revert to cursor-following behavior.
  - `transitionDuration` (default 150ms) and `animationDuration` (default 500ms) props are now wired to all CSS transitions and animations - previously declared but ignored (hardcoded 0.3s fade-in, 0.15s hover transitions, 0.05s crosshair-point tracking).
  - Horizontal bar charts now swap crosshair axes: the guide line tracks Y (category axis) and the dot tracks X (value axis), so crosshair snap and cursor-follow both work correctly in `layout="horizontal"` bar charts (previously the crosshair only worked for vertical layouts).

- 63fb165: Chart: add pie/donut/composed chart types, per-series type override, smooth & step curves, crosshair cursor, floating tooltip, stacked mode, animation, legend toggle, horizontal bars, bar grouping, and histogram support.

  DataTable: add `loading` (skeleton), `density` (compact/comfortable), `emptyState` (custom empty), and `total` props.

  DataTablePage: removed - features merged into DataTable.

- 046ca4f: Chart polish + ThemeToggle icon sizing:

  - Chart `width` prop - make the viewBox width customizable (default 800) so text stays readable in narrower containers
  - `axisFontSize` (default 11) and `pieLabelFontSize` (default 12) props - all font sizes are now customizable with sensible defaults, fixing the "too tiny" pie labels in constrained cards
  - Pie + Donut: leader lines connect each slice to its label, labels spaced 24px from the arc (was 16), text anchored based on slice angle for readability, two-line default label (bold category + muted percentage), and `renderSliceLabel` prop for fully custom label content (supports bold+sublabel, icons, etc.)
  - Pie + Donut hover focus tightened - the hovered slice stays at full opacity, non-hovered slices dim to 0.4, and `onMouseLeave` clears the hover state
  - Cartesian bar opacity made consistent with pie/donut - full opacity by default, dim to 0.85 for non-hovered bars on hover
  - ThemeToggle icon sized to 16px (`size={16}`) to match Navbar's other icon buttons (sun/moon icons were defaulting to 24px and overflowing the 16px container)
  - Crosshair tracking circles now carry `data-crosshair-point="true"` (targeting + styling hook)
  - Docs changelog surface list cleaned up - removed stale `DataTablePage` and `BorderBeamCard` (both ejected/removed), updated count to 19

- 56b99e7: KanbanCard gains a full action menu (Edit, Duplicate, Export,
  Delete) bound to the board API - zero-config or fully customizable
  via the `actions` prop. Includes an inline edit dialog and JSON
  export.

  Chart: hover tracking fixed - tooltip and dot highlight now follow
  the actually-hovered series instead of always series 0.

  BorderBeamCard: hover brightness boost + will-change for smoother
  animation on large screens.

  Navbar: hover-dropdown blink fixed - Radix's internal auto-close no
  longer fires during hover transitions; click-to-toggle and Escape
  support added.

  ConsoleLayout: mobile sidebar z-index raised to z-[80] - above all
  portaled overlays (dialog/drawer/sheet/alert-dialog at z-[70]) so
  component previews never cover the sidebar on small screens.

  Topbar z-index raised to z-60 - above body content so floating elements
  never render over the top navigation bar on mobile.

  Navbar z-index raised to z-60 - above body content so the sticky nav bar
  never gets buried under page scroll. Navbar + UserAvatar DropdownMenuContent
  raised to z-70 - above the z-60 navbar/topbar bars so hover and user-menu
  dropdowns aren't clipped behind their own trigger bar.

  AlertDialog z-index raised from z-50 to z-[70] - consistent with
  Dialog/Drawer/Sheet overlays so confirm modals (e.g. KanbanCard delete)
  always render above the sticky header.

  KanbanBoard: Delete action now uses an AlertDialog modal instead of
  window.confirm().

  Docs: LiveCodePlayground exported and integrated into component pages
  as the second preview box - default-usage code is now an editable
  live-rendered sandbox (second preview box pattern).

  Export `facetChangelog` release log from the package barrel.

  (The 21 new surfaces + auth/docs wiring are tracked in the separate
  `ready-to-use-components-1.12` and `stepper-kanban-changelog` changesets;
  this changeset covers only the polish layer above.)

- 9905bd9: ## motion: asChild mode + dropdown render fix

  Fixed a render issue where dropdowns triggered on hover/click (Navbar, UserMenu)
  appeared behind other content or mispositioned. Root cause: `<Motion>` rendered a
  plain `<div>` wrapper around Radix popover `Content`, whose inline `transform`/
  `opacity` styles created a stacking context and distorted Radix positioning.

  ### facet-motion
  - Added `asChild` prop to `<Motion>`: when set, Motion clones its single child
    element and applies animation styles + a merged ref directly on it — **no
    wrapper `<div>`**. The rendered element becomes the animated node, preserving
    Radix Portal positioning, focus scope, and z-index stacking.
  - Added `setRef` + `useMergeRefs` helpers for stable ref merging.

  ### facet-components
  - Migrated all 10 Radix popover `Content` components from CSS
    `data-[state=open]:animate-facet-zoom-in` to `<Motion asChild
effect="zoom" direction="up">`:
    - dropdown-menu (Content + SubContent), tooltip, popover, hover-card,
      context-menu (Content + SubContent), menubar (Content + SubContent),
      navigation-menu (Viewport), select, dialog, sheet, alert-dialog
  - Removed enter animation CSS classes from all Contents (Motion JS spring handles enter).
  - Preserved `data-[state=closed]:animate-facet-zoom-out` exit classes on all Contents.
  - Left overlays (Dialog/Sheet/AlertDialog) and NavigationMenuIndicator as CSS-only.

- 63fb165: Add `Pill` component - a theme-adaptable, fully-rounded pill with a leading dot, icon, or custom indicator. Renders as a span by default, a button when `selected` or `onClick` is provided, or an anchor with `href`. Supports `color` (primary, secondary, success, warning, destructive), `variant` (default, outline, filled, ghost, subtle), `radius`, `size`, `removable`/`onRemove`, and `indicator` props.

  Also exports `PillGroup` (tablist container) and `PillTrigger` (tab trigger with keyboard navigation) for toggle interfaces. All three are typed, SSR-safe, and dogfooded on the landing site's section headers.

  Docs engine wired with usage snippets, variant gallery, and live preview for Pill. Landing app: ad-hoc inline pills consolidated onto `<Pill>`, off-grid spacing (`px-1.5`/`py-0.5`, `mt-0.5`, `gap-1.5`, `space-y-1.5`, `px-2.5`) normalized to the 4pt/8pt grid, component counts synced to 114 across all surfaces.

- 5dcbb02: Add 21 ready-to-use components that developers repeatedly rebuild:

  - `WizardFormPage` - react-hook-form + zod + Stepper orchestration
  - `DateRangePicker` - single-date and range modes with quick presets
  - `Chart` - dependency-free line / bar / area chart in pure SVG
  - `EmptyStatePage` - full-page empty state with CTA + illustration slot
  - `QrScanner` - browser getUserMedia QR / barcode scanner
  - `ConsentCapture` - scroll-to-accept legal consent + signature pad
  - `DataTablePage` - header, filter bar, density toggle, pagination wrapper
  - `PricingComparison` - mobile-friendly tier cards + feature matrix
  - `Tree` - collapsible nested list with selection and keyboard nav
  - `MultiCombobox` - multi-select chips with search and keyboard nav
  - `TagInput` - free-form tag/chip input with separators + paste
  - `RangeSlider` - two-thumb range slider with active-track highlight
  - `RatingInput` - 5-star / N-item rating with half-star and keyboard
  - `CookieBanner` - top-bar cookie notice with accept / reject / manage
  - `OtpInput` - standalone OTP input with auto-advance and paste
  - `RichTextEditor` - lightweight contenteditable + toolbar
  - `PhoneInput` - country-code dropdown + E.164 formatting
  - `MentionInput` - @mention autocomplete with paste handling
  - `ShineBorderCard` - card with animated border shine
  - `GlowBorderCard` - card with pulsing border glow

  Also includes `PasswordStrengthMeter` wiring in `@fusorb/facet-auth`
  (`SignUp` + `ResetPasswordForm`, opt-out via `showPasswordStrength` prop),
  a `changelog` block type in `@fusorb/facet-docs`, and `facet docs init`
  now scaffolds a populated `/changelog` page.

- 5dcbb02: # Ready-to-use pages: Stepper, KanbanBoard, ChangelogList

  Three new ready-to-use surfaces in `@fusorb/facet-components`:

  - **`Stepper`** - headless-first wizard primitive (`useStepper` hook +
    `Stepper` / `StepperNav` / `StepperPanel` / `StepperFooter` renderers).
    Per-step `validate` gating, controlled + uncontrolled modes, loop
    support, onStepChange callback. The headless split is intentional: the
    hook owns the state so the rendering layer can be re-implemented for
    React Native later without redesigning the logic. Closes the Phase 1
    roadmap item: "Generic <Stepper> with per-step validation gating".

  - **`KanbanBoard`** - drop-in kanban with native HTML5 drag-and-drop,
    `useKanban` hook (controlled + uncontrolled), per-column WIP limits,
    add/remove cards, add/remove columns. Every project tracker is a
    kanban; consumers shouldn't wire 200 lines of DnD + state.

  - **`ChangelogList`** - vertical release-log timeline with version, date,
    kind-grouped bullets (added / changed / fixed / deprecated / removed /
    security), optional filter row, optional pre-release tag. Every docs
    site needs one; nobody should hand-style it again.

  ## Wired into the auth package
  - `<SignUp>` now renders the live `PasswordStrengthMeter` under the
    password field by default. Opt out with `showPasswordStrength={false}`.
  - `<ResetPasswordForm>` got the same treatment (`showPasswordStrength`).
  - Existing tests + types stay backward-compatible.

  ## Wired into the docs engine
  - New `changelog` block type for `<DocsApp>` content pages. Pass
    `{ type: "changelog", releases: [...] }` and the engine renders the
    same `ChangelogList` from facet-components.
  - `facet docs init` (product-docs template) now scaffolds a populated
    `/changelog` page so consumers ship with a working release log on day
    one.

  ## Landing site
  - New home section: `ChangelogSection` shows the live facet release log
    via the same `ChangelogList` component, with the filter row.
  - Ecosystem page now lists every published package (Components, Auth,
    Layout, Tokens added alongside Docs, CLI, Emails, SDK, Store, and the
    Stack-Agnosticism concept entry).
  - Three new dedicated pages that demo ready-to-use surfaces end-to-end:
    `/pricing` (BillingPage + BillingPageTable + BillingPageFreemium),
    `/security` (AccountSettingsPanel + SecuritySectionCard + ApiKeyManager
    - TwoFactorSetupPanel + PasswordStrengthMeter), `/dashboard-demo`
      (PageHeader + StatCard + ActivityFeed + BorderBeamCard + SpotlightCard).

### Patch Changes

- db287b3: De-brand and production hardening:

  - tokens: brand color changed from indigo to Electric Cyan; new facet animation
    keyframes (overlay-in/out, fade-up, chart-fadeIn/draw); new CSS variables
    (elevation, hero-glow); dist CSS minified via esbuild (zero API change,
    smaller consumer payloads)
  - components: changelog-list pre-release badge uses the semantic `warning` token instead of hardcoded amber classes
  - sdk: docs and test fixtures neutralized (`auth.arcevo.dev` → `auth.example.dev`)
  - emails: default brand color is now a neutral slate instead of indigo
  - cli: emails generator default matches the new neutral emails default
  - auth: package metadata neutralized (description, keywords, homepage removed "ArcevoCirqle")
  - layout: package metadata neutralized (description, keywords, homepage)
  - store: package keywords updated (`arc-id` → `SovGrant`); homepage neutralized

- 6591426: Removed all focus-ring (blue border) styles from components, combobox, and ready-to-use components. Removed `focus:ring-*`, `focus-visible:ring-*`, `focus-within:ring-*`, `hover:ring-*`, and `focus:border-primary` Tailwind classes across 48 component/app/layout/doc files. Removed the global `:focus-visible` outline rule from `tokens.css` and the `.lab :focus-visible` outline rule from `labs.css`. Static ring classes for selected/active/badge states (e.g., pill selected, stepper active, input-otp active slot) are preserved — only focus-triggered ring/border styles were removed. `outline-none` is retained to suppress the browser's default blue outline, so clicking a component shows no border.
- cf4f516: Removed unused `tw-animate-css` dependency after migration to facet-native `animate-facet-*` animation grammar. No component source or CSS bundle references it anymore.
- cbb5d1d: StepperPanel animation is now driven by motion tokens (`--facet-motion-duration-base` / `--facet-motion-ease-standard`) instead of a hardcoded `250ms ease-out`. This is the first consumption of the `@fusorb/facet-motion` token system in the existing component library.
- Updated dependencies [db287b3]
- Updated dependencies [8891898]
- Updated dependencies [3fefa64]
- Updated dependencies [9905bd9]
- Updated dependencies [f4ca95a]
- Updated dependencies [3fefa64]
- Updated dependencies [6591426]
  - @fusorb/facet-tokens@1.2.0
  - @fusorb/facet-motion@1.0.0

## 1.11.0

### Minor Changes

- 1bf5de5: Export individual brand icon components (GithubIcon, LinkedinIcon, InstagramIcon,
  FacebookIcon, TiktokIcon, WhatsappIcon, XIcon, TwitterIcon, YoutubeIcon, SlackIcon,
  DiscordIcon, TelegramIcon, FigmaIcon, SpotifyIcon) from the main barrel so consuming
  apps can import them directly without duplicating the SVGs. These components already
  power the icon registry's `brandIcons` map and `LightIcon` - they were simply not
  re-exported as named exports from the package entry point.
- 205d83b: Add `hoverDropdowns` prop to Navbar for hover-to-open dropdown menus on desktop, with shared close-timer coordination so only one dropdown is open at a time. Also add optional `icon` field to FooterLink and `lg:px-8` to navbar padding.

  - facet-components: Navbar accepts `hoverDropdowns?: boolean` (default `false`). When enabled, desktop dropdown menus open on hover and close on mouse-leave with a short delay; rapid transitions between links cancel the previous close timer. Click still toggles as a fallback on touch devices.
  - facet-components: FooterLink now accepts an optional `icon?: IconName` resolved through the icon registry.

- b1da261: Add 5 new composable UI components: AspectRatio, Carousel, Drawer,
  InputGroup, Resizable. Also fix Navbar hamburger (X-icon toggle +
  outside-click close) and register new bundled deps in facet-cli.

  Carousel: add <CarouselDots> pagination component (uses context API, no extra deps);
  update docs preview with dots + loop. Add carousel-vertical variant to docs.
  Marquee: add composable `variant` prop ("loop" | "strip"); strip variant
  defaults to no pause-on-hover + dedicated className. Add marquee-strip variant to docs.
  Resizable: docs preview now shows both horizontal and vertical orientations.

  CLI enhancements:
  - `facet clean -y` now auto-runs the remove command instead of just printing it
  - Auto-update check on CLI startup (pnpm-style notification box, 24h cache, CI skip, --no-update-check)
  - `facet self-update`: updates the globally-installed facet-cli
  - `facet install <name>`: installs a facet package by shorthand or full name
    (full: `facet install @fusorb/facet-layout`, shorthand: `facet install layout`)
    Supports the scoped-dropped alias `facet-cli` -> `@fusorb/facet-cli` (so any
    `facet-X` alias resolves), and `-g`/`--global` to install globally, e.g.
    `facet install -g facet-cli` runs `npm i -g @fusorb/facet-cli@latest`.
  - `facet copy <ComponentName>`: copies a component into your source (shadcn-style) only
    (passing a package name prints a redirect hint to `facet install`)
  - `facet latest`: shows latest published versions of all facet packages
  - `facet --log`: global verbose flag for detailed command output

  SDK: add `OAuthSdk.updateClient(clientId, data)` for full OAuth-client
  CRUD (PATCH `/oauth/clients/:clientId`); add `IssueCredentialParams` interface.

- 1bf5de5: Rebuild the Resizable component for react-resizable-panels v4 compatibility and
  flexibility:

  - **Fix defaultSize bug**: react-resizable-panels v4 interprets bare numbers as
    pixels (e.g. `defaultSize={50}` → 50 px), but facet docs and examples all
    pass `defaultSize={50}` expecting 50 %. The component now normalizes 0–100
    numbers to percentage strings automatically (`normalizeSize`).
  - **Add `useResizable` hook** for imperative control - `groupRef`, `panelRef`,
    `getLayout`, `setLayout`, `collapse`, `expand`, `isCollapsed`, `resize`,
    `getSize`.
  - **Add `useResizableLayout` hook** wrapping v4's `useDefaultLayout` for
    localStorage persistence of panel sizes.
  - **Export TypeScript types**: `ResizablePanelGroupProps`,
    `ResizablePanelProps`, `ResizableHandleProps`, `ResizableImperativeHandle`.
  - **Expose collapsible panel support** (`collapsible` / `collapsedSize` props)
    via v4 pass-through.
  - **Fix** stale manifest description and **add** a collapsible variant to the
    docs gallery.
  - **Fix** flaky `docs-app.test.tsx` - lazy-loaded `DocsLayout` needs >1000 ms
    under load; `findByTestId` timeout raised to 5000 ms.

- 1bf5de5: Fix sidebar accordion (singleOpen) collapse, auto-infer ResizableHandle orientation, and export brand icons from the components barrel.

  - facet-components: `ResizableHandle` now inherits `orientation` from its parent
    `ResizablePanelGroup` via context (explicit prop still overrides). Exported
    individual brand icon components (`GithubIcon`, `LinkedinIcon`, etc.) from the
    barrel for direct import. Added `ChevronsUp`/`ChevronsDown` to the eagerly-loaded
    semantic icon maps so they render synchronously.
  - facet-layout: restored explicit-collapse-wins rule in `NavSectionRenderer.open`
    so active sections can be collapsed (fixes accordion/singleOpen). Auto-open-on-
    navigation moved to a `useEffect` keyed on route change. Added `asPath` to
    `RouterAdapter` interface and default adapter.

### Patch Changes

- 205d83b: Add a 3s fetch timeout to `resolveFacetVersions` and `discoverFacetPackages` so the CLI never hangs on an unreachable or slow npm registry. Add a global `testTimeout: 15000` in the CLI vitest config to absorb slow CI and DTS parsing overhead.

  - cli: `resolveFacetVersions()` now uses an `AbortController` with a 3s timeout (was unbounded); `discoverFacetPackages()` timeout reduced from 5s to 3s.
  - cli: Add `LUCIDE_ALIASES` entry `alert-circle → circle-alert` so the deprecated lucide name still resolves in generated icon registries.
  - components: Add `alert-circle`, `external-link`, `globe`, and `store` to the `@fusorb/facet-components/light` `LightIcon` set (used by the landing and docs sites).

- cfabae9: Add an ESM `"use client"` banner to the `dist` builds of `@fusorb/facet-components`,
  `@fusorb/facet-auth`, and `@fusorb/facet-layout`.

  Next.js 15+/16 App Router builds React Server Components with the `react-server`
  condition, which resolves `react-hook-form` to `react-server.esm.mjs` - an entry that
  does not export `Controller`, `FormProvider`, `useForm`, or `useFormContext`. Importing
  any of these packages from a Server Component therefore failed the build with
  `Export Controller/FormProvider/useForm/useFormContext doesn't exist in target module`.

  The banner marks each package's module graph as a client boundary, so those imports
  resolve to the normal client entry under RSC. The directive is a no-op for non-RSC
  consumers (Vite/CRA/Rolldown ignore it), so this is a transparent fix.

  Consumers hitting the Next 16 error pick this up on the next published release.

## 1.10.0

### Minor Changes

- b7accc3: Polish pass: SpotlightCard default spotlight now uses color-mix for a visible semi-transparent glow (was a flat var(--primary) that was barely visible); BorderBeamCard beam refined with soft entry/exit ramps for a cleaner sweep; AnimatedButton default animation changed from shine to sparkle (consistent with BillingPageConfig's existing default); tokens CSS hides scrollbars globally across all facet apps (code blocks, tables, tabs, etc.) so interfaces look clean on mobile and medium screens.

### Patch Changes

- Updated dependencies [b7accc3]
  - @fusorb/facet-tokens@1.1.4

## 1.9.0

### Minor Changes

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

### Patch Changes

- Updated dependencies [18547dc]
  - @fusorb/facet-tokens@1.1.3

## 1.8.0

### Minor Changes

- 9360e93: feat: AnimatedButton - uniform animated CTAs in composed components (overridable)

  New `AnimatedButton` renders an animated button variant (shine default, sparkle, ripple, magnetic, or none = plain Button) and accepts a `renderButton` full override. It is used by default in composed components so consumers get a consistent animated feel without extra imports, while staying fully flexible:

  - `BillingPageConfig.ctaButton` (default animation "sparkle"): the plan CTAs are now animated.
  - `FeedbackPageProps.submitButton` (default "shine"): the feedback submit is now animated.
  - `AnimatedButton` is exported from the barrel for direct use.

  `animation="none"` gives today's plain Button; `renderButton` lets consumers drop in their own component entirely.

- 8d922f7: feat: animation family - text animations + card/button micro-interactions

  New zero-dependency animation components, all SSR-safe (final state renders
  server-side, effects run after mount):

  Text animations (text-animations.tsx):
  - BlurText: characters fade in from a blur, staggered.
  - WaveText: characters bob in a continuous wave.
  - FlipText: characters flip in sequentially (rotateX).
  - SplitText: words (or chars) rise into place.
  - FadeUpText: the whole block fades + slides up on mount.
  - ShimmerText: a light sheen sweeps across the text.
  - GradientText: an animated gradient fills the text.
  - LetterSpacingText: letters expand on hover (or loop).
  - CountUpText: counts from `from` to `to` with an ease-out curve.

  Card/button micro-interactions (micro-interactions.tsx):
  - TiltCard: 3D tilt toward the cursor with optional glare.
  - GlowCard: cursor-following radial glow on a card surface.
  - RippleButton: ink-burst ripple on click at the pointer position.
  - MagneticButton: button gravitates toward the cursor.
  - ShineButton: light sweep across on hover.
  - ScrollReveal: IntersectionObserver scroll-triggered fade/slide-up wrapper.

  Docs: new dedicated "Animation" sidebar section grouping text animations
  under a "Text" parent plus surfaces (Aurora/Beams/GridPattern/Spotlight/
  SparkleButton) and micro-interactions as top-level items. Keyframes added
  to @fusorb/facet-tokens (facet-text-blur, facet-text-wave, facet-shimmer,
  facet-gradient-shift, facet-flip, facet-fade-up, facet-glow-pulse).

- 78b6543: feat: TypewriterText component - a dependency-free type/erase text animation for hero sections and headers

  `TypewriterText` cycles through a list of phrases with a type/erase loop and a blinking caret. Zero dependencies (pure React + timeouts), SSR-safe (renders the first phrase synchronously, animates after mount). Props: `phrases`, `typeSpeed`, `eraseSpeed`, `delay`, `showCaret`, `caretClassName`, plus the usual span props.

  Used on the landing hero to glimpse the ecosystem (components, auth presets, tokens, layouts, SDK, emails, CLI).

### Patch Changes

- Updated dependencies [a058223]
  - @fusorb/facet-tokens@1.1.2

## 1.7.0

### Minor Changes

- d2b43d0: feat: config-driven billing pages, footer variants, and the new @fusorb/facet-emails package

  **@fusorb/facet-components**

  - New billing / pricing page components, all consuming a shared config-driven plan model (`BillingPageConfig` + `BillingPlan`) so tiers (Free / Starter / Pro / Enterprise / any other names), prices, intervals, feature lists, and CTAs are plain data:
    - `BillingPage` - a responsive card grid with a monthly/yearly toggle, per-plan icons, highlighted "Most popular" treatment, and feature bullets.
    - `BillingPageTable` - a full feature comparison table (rows = features, columns = plans, check/cross/string per cell, highlighted recommended column).
    - `BillingPageFreemium` - a free/paid split: hero pitch for the free tier + one featured paid plan, then a compact card list for the rest.
  - `Footer` gains a `variant` prop: `default` (unchanged), `minimal`, `columns`, `newsletter`, and `split`, plus an optional `newsletter` capture slot. Existing consumers are unaffected.

  **@fusorb/facet-emails** (new package)

  - Framework-agnostic email template renderer: render plain, serializable template trees (`{ tag, props, children }`) to email-safe HTML and plain text with zero runtime dependencies.
  - Optional React bridge: write emails in JSX with `EmailLayout`, `EmailButton`, `EmailText`, `EmailCodeBlock`, `EmailDivider`, `EmailLink`, `EmailSecurityNotice`, and `EmailList`, all compiled down to template trees.
  - Brand token injection (colors, fonts, radius) through the render options.
  - Dependency-light dev preview server (`@fusorb/facet-emails/server`) with a template index and per-template HTML/text previews.

## 1.6.0

### Minor Changes

- 8a7aef3: feat(components): icon set + SSR-safe theme

  - Icon: add ArrowLeft, Mail, MessageSquare, MessageCircle, Boxes,
    ShieldCheck, Zap, Terminal, Puzzle, Lock, Ruler, FingerprintPattern to
    the semantic/light icon set, plus aliases (document, grid, grid).
    Remove the `lucideIconMap` / `lucideIconNames` root exports (they were
    a duplicate of the icon registry; consumers should use `Icon` /
    `getIcon` / `registerIcon`).
  - ThemeProvider: read the stored theme synchronously in the state
    initializer so the first client render matches the no-flash shell
    script (no wrong-theme flash).
  - ThemeToggle: render the icon only after mount (SSR-safe) - fixes the
    server/client hydration mismatch when the toggle is rendered inside
    SSR'd layouts (e.g. Navbar `showThemeToggle` in Next.js).

### Patch Changes

- Updated dependencies [b95bcb0]
  - @fusorb/facet-tokens@1.1.1

## 1.5.0

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

## 1.4.0

### Minor Changes

- DataTable: export consolidated into a single Export dropdown (CSV + pluggable exporters), plus a new overflow (⋯) actions menu for bulk row actions (select-all, mark-as-read, delete-all, custom). NavigationMenuLink is now a padded, hover-styled block link (fixes cramped dropdown items) and supports an optional description. NumberInput gains a built-in currency picker: CURRENCIES list, currencyPicker dropdown, currencyOptions override, and onCurrencyChange.

  New components: DateInput (ISO date validation + native fallback), PasswordInput (show/hide toggle), and InfiniteScroll (vertical/horizontal, IntersectionObserver sentinel).

  CountryCodeInput expands to the full ISO country list with regional restriction filtering (includeRegions/excludeRegions). LocationPicker deepens the country dataset (Nigeria states + LGA/LCDA) and exports typed CountryInput / StateInput / LGAInput sub-inputs. DatePicker adds a year picker. QRCode gains a logo variant with configurable position. DataTable's generic constraint is relaxed so plain interfaces work as row types.

  Docs package: demos, variants, and usage snippets updated for all of the above.

## 1.3.0

### Minor Changes

- 865bf7e: feat(components): add a slim `/light` subpath entry

  `@fusorb/facet-components/light` re-exports only the lightweight,
  high-frequency modules (cn, Button, Icon registry, ThemeProvider/useTheme/
  ThemeToggle, DropdownMenu family, Kbd, Tabs). Consumers whose eager app
  shell only needs those can import from `/light` instead of the full barrel,
  so the heavy components (Dialog, Form, Dropzone, QRCode, InputOTP, ...)
  stay out of the initial bundle.

  ```ts
  import {
    Icon,
    ThemeProvider,
    DropdownMenu,
  } from "@fusorb/facet-components/light";
  ```

- 6bb55a2: feat(components): add `timeline` variant to Roadmap

  `<Roadmap variant="timeline" />` renders the lighter landing-page look:
  a mono uppercase phase label next to the status badge, with a status dot
  on the connector line and no card chrome. The `date` field renders as the
  phase label. Default (`card`) behavior is unchanged. Added a docs variant
  ("Timeline") + usage snippet + test.

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

- 69c1fec: fix(data-table): relax generic row constraint from `Record<string, unknown>` to `object`

  DataTable/DataTableColumn previously required `T extends Record<string, unknown>`,
  which rejects plain `interface` row types (TS2344: interfaces lack an index
  signature). Consumers had to convert their row interfaces to `type` aliases.
  The constraint is now `object`, with index access isolated behind narrow
  helpers (`cellValue`, `rowKeyValue`), so interfaces and classes both work.

- b878bfd: fix(docs): layout page no longer takes over the shell; back button; marquee

  - docs: the /layout page had live layout demo blocks whose fixed-position
    sidebars escaped and covered the docs shell (the SovGrant demo sidebar).
    Removed every live demo block from the page; it is now text + copyable
    code only. Verified in the browser: the facet sidebar renders normally.
  - docs: add a Back button at the top of every content page body (goes back
    in history, falls back to /) so routing between pages is easier.
  - components: Marquee track no longer forces whitespace-nowrap, so card
    children wrap naturally instead of clipping; the default text variant
    wraps its items in nowrap spans.
  - landing: the install steps strip switched from ScrollArea to the facet
    Marquee (pause-on-hover), dogfooding the component internally.

## 1.2.0

### Minor Changes

- 3de0e04: - `AvatarGroup` gains a subtle hover effect (lift + ring) with a `disableHover` opt-out.
  - `Dropzone` gains clipboard paste support (`allowPaste`): pasted files are validated against `accept`, and pasted text is wrapped in a text file when the clipboard carries no files.
  - Adds `tw-animate-css` as a direct dependency so the animation utilities resolve for components consumers.

### Patch Changes

- Updated dependencies [3de0e04]
  - @fusorb/facet-tokens@1.1.0

## 1.1.0

### Minor Changes

- 3752a98: - `UserAvatar` gains a `variant` prop (`"auth"` default / `"default"` plain avatar), plus `settingsHref`/`settingsLabel`/`renderSettingsLink` for a router-aware Settings item.
  - `AlertDialogContent` accepts a `variant="destructive"` tinted surface; `AlertDialogAction` accepts a `variant` (default/destructive) built on `buttonVariants`; new `AlertDialogIcon` warning-icon component. Alert dialogs now close when the overlay (outside) is clicked.
  - New `isMac()`/`getModSymbol()` platform helpers and a `mod` prop on `Kbd` for platform-aware shortcut hints (⌘ on macOS, Ctrl elsewhere).
  - Buttons now render with `cursor-pointer`.
  - `Pagination` spacing/glyph alignment tightened (`gap-1.5`, `shrink-0` icons).
  - Icon registry adds `triangleAlert`.

## 1.0.2

### Patch Changes

- feat: wire internal components through the Icon registry; Icon spreads SVG props for pass-through overrides
- fix: navbar mobile menu closes when an item is tapped (custom mobileMenu included)

## 1.0.1

### Patch Changes

- d94a724: chore: update homepage to facet.arcevocirqle.com.ng
- Updated dependencies [d94a724]
  - @fusorb/facet-tokens@1.0.1

## 1.0.0

### Major Changes

- e79cbd5: initial publish...

### Patch Changes

- Updated dependencies [e79cbd5]
  - @fusorb/facet-tokens@1.0.0

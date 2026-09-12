import type { ChangelogRelease } from "../ui/changelog-list.js";

/**
 * Canonical release log for the @fusorb/facet-* ecosystem.
 *
 * Curated from the shipped changesets and updated when
 * `pnpm changeset version` runs. Both the docs site (`/changelog`
 * route) and the landing page pull from this single source of truth
 * so consumers can see version drift at a glance.
 */
export const facetChangelog: ChangelogRelease[] = [
  {
    version: "1.12.0",
    date: "2026-08-27",
    tag: "release",
    changes: [
      // Ready-to-use pages
      { kind: "added", text: "WizardFormPage - react-hook-form + zod + Stepper orchestration" },
      { kind: "added", text: "DateRangePicker - single-date and range modes with quick presets" },
      { kind: "added", text: "Chart - dependency-free line / bar / area chart in pure SVG" },
      { kind: "added", text: "EmptyStatePage - full-page empty state with CTA + illustration slot" },
      { kind: "added", text: "QrScanner - browser getUserMedia QR / barcode scanner" },
      { kind: "added", text: "ConsentCapture - scroll-to-accept legal consent + signature pad" },
      { kind: "added", text: "DataTablePage - header + filters + density toggle + pagination wrapper" },
      { kind: "added", text: "PricingComparison - mobile-friendly tier cards + feature matrix" },
      { kind: "added", text: "Tree - collapsible nested list with selection + keyboard nav" },
      { kind: "added", text: "MultiCombobox - multi-select chips with search + keyboard nav" },
      { kind: "added", text: "TagInput - free-form tag/chip input with separator / paste handling" },
      { kind: "added", text: "RangeSlider - two-thumb range slider with active-track highlight" },
      { kind: "added", text: "RatingInput - 5-star / N-item rating with half-star + keyboard" },
      { kind: "added", text: "CookieBanner - top-bar cookie notice with preferences drawer" },
      { kind: "added", text: "OtpInput - standalone OTP input with auto-advance + paste" },
      { kind: "added", text: "RichTextEditor - lightweight contenteditable + toolbar" },
      { kind: "added", text: "PhoneInput - country-code dropdown + E.164 formatting" },
      { kind: "added", text: "MentionInput - @mention autocomplete with paste handling" },
      { kind: "added", text: "ShineBorderCard - card with animated border shine" },
      { kind: "added", text: "GlowBorderCard - card with pulsing border glow" },
      { kind: "added", text: "PasswordStrengthMeter - standalone strength meter (also wired into SignUp + ResetPasswordForm)" },
      // Board-level polish
      { kind: "added", text: "KanbanCard action menu (edit / duplicate / export / delete) bound to the board API" },
      { kind: "changed", text: "KanbanCard exposes `actions` + `showActions` props for fully custom action menus" },
      // Chart
      { kind: "fixed", text: "Chart hover now tracks the nearest series instead of always seriesIndex 0" },
      { kind: "added", text: "Chart hover brightens the nearest data point for visual feedback" },
      // Navbar
      { kind: "fixed", text: "Navbar hover dropdowns no longer blink; modal={false} in hover mode + 250ms close delay + Escape support" },
      // Layout
      { kind: "fixed", text: "Docs sidebar (z-60) now renders above portaled preview content (z-50) on mobile" },
      // Card animations
      { kind: "added", text: "BorderBeamCard and SpotlightCard ejected in favor of simple Card primitives" },
      { kind: "fixed", text: "Topbar + Navbar z-index raised to z-60 to render above Radix portaled preview content (z-50)" },
      { kind: "fixed", text: "KanbanBoard Delete action uses AlertDialog modal instead of window.confirm()" },
    ],
  },
  {
    version: "1.4.7",
    date: "2026-08-27",
    tag: "docs",
    title: "Docs Engine 1.4.7",
    changes: [
      { kind: "added", text: "@fusorb/facet-docs changelog block type for DocsApp content pages - pass { type: \"changelog\", releases: [...] } to render ChangelogList inline" },
      { kind: "added", text: "facet docs init now scaffolds a populated /changelog page so consumers ship with a working release log on day one" },
      { kind: "added", text: "LiveCodePlayground on component pages - default-usage code block is now an editable, live-rendered sandbox (second preview box pattern)" },
      { kind: "fixed", text: "LiveCodePlayground ErrorBoundary surfaces a readable message when a demo snippet throws, instead of hanging the Suspense page loader" },
      { kind: "fixed", text: "QrScanner playground demo no longer auto-starts the camera (autoStart={false}), preventing a camera-permission hang" },
      { kind: "fixed", text: "PasswordStrengthMeter + AnnouncementBar playground wrappers supply fallback values / unique storageKeys so previews always render" },
    ],
  },
  {
    version: "1.2.3",
    date: "2026-08-27",
    tag: "auth",
    title: "Auth 1.2.3",
    changes: [
      { kind: "changed", text: "SignUp now renders the live PasswordStrengthMeter under the password field by default - opt out with showPasswordStrength={false}" },
      { kind: "changed", text: "ResetPasswordForm got the same PasswordStrengthMeter treatment (showPasswordStrength opt-out)" },
      { kind: "fixed", text: "SignIn mfa_challenge wired to MfaVerifyForm" },
    ],
  },
  {
    version: "2026-08-27",
    date: "2026-08-27",
    tag: "landing",
    title: "Landing Site",
    changes: [
      { kind: "added", text: "ChangelogSection home section - renders facetChangelog via ChangelogList with filter row" },
      { kind: "added", text: "Ecosystem page now lists every published package (Components, Auth, Layout, Tokens + Docs, CLI, Emails, SDK, Store, Stack Agnosticism)" },
      { kind: "added", text: "/pricing page (BillingPage + BillingPageTable + BillingPageFreemium)" },
      { kind: "added", text: "/security page (AccountSettingsPanel + SecuritySectionCard + ApiKeyManager + TwoFactorSetupPanel + PasswordStrengthMeter)" },
      { kind: "added", text: "/dashboard-demo page (PageHeader + StatCard + ActivityFeed + Card + HoverScaleCard)" },
    ],
  },
  {
    version: "1.11.0",
    date: "2026-08-26",
    tag: "release",
    changes: [
      { kind: "added", text: "Stepper primitive (headless useStepper + StepperNav / StepperPanel / StepperFooter)" },
      { kind: "added", text: "KanbanBoard with native HTML5 drag-and-drop, move/add/remove cards" },
      { kind: "added", text: "ChangelogList with filter chips and kind-grouped bullets" },
      { kind: "fixed", text: "SignIn mfa_challenge wired to MfaVerifyForm" },
    ],
  },
  {
    version: "1.10.0",
    date: "2026-08-18",
    tag: "release",
    changes: [
      { kind: "added", text: "AccountSettingsPanel nav + section content" },
      { kind: "added", text: "SecuritySectionCard grid (MFA, passkeys, sessions, audit, webhooks, API keys)" },
      { kind: "added", text: "ActivityFeed + StatCard + PageHeader for console surfaces" },
      { kind: "changed", text: "NotFound component gains gradient animation variant" },
    ],
  },
  {
    version: "1.4.0",
    date: "2026-08-12",
    tag: "release",
    changes: [
      { kind: "added", text: "FaqSection component (drop-in FAQ surface with copy)" },
      { kind: "added", text: "IconRegistry (IconProvider / Icon / registerIcon)" },
      { kind: "fixed", text: "Billing interval toggle now honors the active state" },
      { kind: "removed", text: "Storybook + 48 story fixtures (replaced by docs inventory drift gate)" },
    ],
  },
];

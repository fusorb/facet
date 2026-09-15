import type { ChangelogRelease } from "@fusorb/facet-components";

/**
 * facet release log, version-aligned with @fusorb/facet-components.
 *
 * This is the single source of truth rendered by both the docs-site
 * /changelog route and the landing site's ChangelogSection. Update when
 * `pnpm changeset version` runs and CHANGELOG.md is touched - the
 * `facet docs init` scaffold reads this module when bootstrapping a
 * fresh docs site.
 */
export const facetChangelog: ChangelogRelease[] = [
  {
    version: "1.12.0",
    date: "2026-08-27",
    tag: "release",
    changes: [
      {
        kind: "added",
        text: "19 ready-to-use surfaces: WizardFormPage, DateRangePicker, Chart, EmptyStatePage, QrScanner, ConsentCapture, DataTable, PricingComparison, Tree, MultiCombobox, TagInput, RangeSlider, RatingInput, CookieBanner, OtpInput, RichTextEditor, PhoneInput, MentionInput, ShineBorderCard, GlowBorderCard",
      },
      {
        kind: "added",
        text: "Stepper - headless wizard (useStepper + StepperNav / StepperPanel / StepperFooter, per-step validate gates, controlled + uncontrolled, loop, onStepChange)",
      },
      {
        kind: "added",
        text: "KanbanBoard - native HTML5 DnD, useKanban hook, per-column WIP limits, add/remove cards/columns",
      },
      {
        kind: "added",
        text: "ChangelogList - vertical release timeline with filter chips and kind-grouped bullets",
      },
      {
        kind: "changed",
        text: "SignUp + ResetPasswordForm render PasswordStrengthMeter by default (opt-out via showPasswordStrength={false})",
      },
      {
        kind: "added",
        text: "LiveCodePlayground ErrorBoundary surfaces a readable message when a demo snippet throws instead of hanging the page loader",
      },
      {
        kind: "fixed",
        text: "PasswordStrengthMeter + AnnouncementBar playground wrappers supply fallback values / unique storageKeys so previews always render",
      },
    ],
  },
  {
    version: "1.4.7",
    date: "2026-08-27",
    tag: "docs",
    title: "Docs Engine 1.4.7",
    changes: [
      {
        kind: "added",
        text: '@fusorb/facet-docs changelog block type for DocsApp content pages - pass { type: "changelog", releases: [...] } to render ChangelogList inline',
      },
      {
        kind: "added",
        text: "facet docs init now scaffolds a populated /changelog page so consumers ship with a working release log on day one",
      },
      {
        kind: "added",
        text: "LiveCodePlayground on component pages - default-usage code block is now an editable, live-rendered sandbox (second preview box pattern)",
      },
      {
        kind: "added",
        text: "LiveCodePlayground ErrorBoundary surfaces a readable message when a demo snippet throws instead of hanging the page loader",
      },
      {
        kind: "fixed",
        text: "QrScanner playground demo disabled autoStart so the preview does not request camera permission",
      },
      {
        kind: "fixed",
        text: "PasswordStrengthMeter + AnnouncementBar playground wrappers supply fallback values / unique storageKeys so previews always render",
      },
    ],
  },
  {
    version: "1.2.3",
    date: "2026-08-27",
    tag: "auth",
    title: "Auth 1.2.3",
    changes: [
      {
        kind: "changed",
        text: "SignUp now renders the live PasswordStrengthMeter under the password field by default - opt out with showPasswordStrength={false}",
      },
      {
        kind: "changed",
        text: "ResetPasswordForm got the same PasswordStrengthMeter treatment (showPasswordStrength opt-out)",
      },
      { kind: "fixed", text: "SignIn mfa_challenge wired to MfaVerifyForm" },
    ],
  },
  {
    version: "2026-08-27",
    date: "2026-08-27",
    tag: "landing",
    title: "Landing Site",
    changes: [
      {
        kind: "added",
        text: "ChangelogSection home section - renders facetChangelog via ChangelogList with filter row",
      },
      {
        kind: "added",
        text: "Ecosystem page now lists every published package (Components, Auth, Layout, Tokens + Docs, CLI, Emails, SDK, Store, Stack Agnosticism)",
      },
      {
        kind: "added",
        text: "/pricing page (BillingPage + BillingPageTable + BillingPageFreemium)",
      },
      {
        kind: "added",
        text: "/security page (AccountSettingsPanel + SecuritySectionCard + ApiKeyManager + TwoFactorSetupPanel + PasswordStrengthMeter)",
      },
      {
        kind: "added",
        text: "/dashboard-demo page (PageHeader + StatCard + ActivityFeed + Card + HoverScaleCard)",
      },
    ],
  },
  {
    version: "1.11.0",
    date: "2026-08-26",
    tag: "release",
    changes: [
      {
        kind: "added",
        text: "Stepper primitive (headless useStepper + StepperNav / StepperPanel / StepperFooter)",
      },
      {
        kind: "added",
        text: "KanbanBoard with native HTML5 drag-and-drop, move/add/remove cards",
      },
      {
        kind: "added",
        text: "ChangelogList with filter chips and kind-grouped bullets",
      },
      { kind: "fixed", text: "SignIn mfa_challenge wired to MfaVerifyForm" },
    ],
  },
  {
    version: "1.10.0",
    date: "2026-08-18",
    tag: "release",
    changes: [
      { kind: "added", text: "AccountSettingsPanel nav + section content" },
      {
        kind: "added",
        text: "SecuritySectionCard grid (MFA, passkeys, sessions, audit, webhooks, API keys)",
      },
      {
        kind: "added",
        text: "ActivityFeed + StatCard + PageHeader for console surfaces",
      },
      {
        kind: "changed",
        text: "NotFound component gains gradient animation variant",
      },
    ],
  },
  {
    version: "1.4.0",
    date: "2026-08-12",
    tag: "release",
    changes: [
      {
        kind: "added",
        text: "FaqSection component (drop-in FAQ with copy-to-clipboard)",
      },
      {
        kind: "added",
        text: "IconRegistry (IconProvider / Icon / registerIcon)",
      },
      {
        kind: "fixed",
        text: "Billing interval toggle now honors the active state",
      },
      {
        kind: "removed",
        text: "Storybook + 48 story fixtures (replaced by docs inventory drift gate)",
      },
    ],
  },
];

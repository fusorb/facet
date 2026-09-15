import type { ChangelogRelease } from "@fusorb/facet-components";

/**
 * Landing site release log. Kept local to the app (not the library) so
 * the component package stays brand-neutral; consumers supply their own.
 */
export const changelog: ChangelogRelease[] = [
  {
    version: "1.12.0",
    date: "2026-08-27",
    tag: "release",
    changes: [
      {
        kind: "added",
        text: "WizardFormPage - react-hook-form + zod + Stepper orchestration",
      },
      {
        kind: "added",
        text: "DateRangePicker - single-date and range modes with quick presets",
      },
      {
        kind: "added",
        text: "Chart - dependency-free line / bar / area chart in pure SVG",
      },
      {
        kind: "added",
        text: "EmptyStatePage - full-page empty state with CTA + illustration slot",
      },
      {
        kind: "added",
        text: "QrScanner - browser getUserMedia QR / barcode scanner",
      },
      {
        kind: "added",
        text: "ConsentCapture - scroll-to-accept legal consent + signature pad",
      },
      {
        kind: "added",
        text: "PricingComparison - mobile-friendly tier cards + feature matrix",
      },
      {
        kind: "added",
        text: "Tree - collapsible nested list with selection + keyboard nav",
      },
      {
        kind: "added",
        text: "MultiCombobox - multi-select chips with search + keyboard nav",
      },
      {
        kind: "added",
        text: "TagInput - free-form tag/chip input with separator / paste handling",
      },
      {
        kind: "added",
        text: "RangeSlider - two-thumb range slider with active-track highlight",
      },
      {
        kind: "added",
        text: "RatingInput - 5-star / N-item rating with half-star + keyboard",
      },
      {
        kind: "added",
        text: "CookieBanner - top-bar cookie notice with preferences drawer",
      },
      {
        kind: "added",
        text: "OtpInput - standalone OTP input with auto-advance + paste",
      },
      {
        kind: "added",
        text: "RichTextEditor - lightweight contenteditable + toolbar",
      },
      {
        kind: "added",
        text: "PhoneInput - country-code dropdown + E.164 formatting",
      },
      {
        kind: "added",
        text: "MentionInput - @mention autocomplete with paste handling",
      },
      {
        kind: "added",
        text: "ShineBorderCard - card with animated border shine",
      },
      { kind: "added", text: "GlowBorderCard - card with pulsing border glow" },
      {
        kind: "added",
        text: "PasswordStrengthMeter - standalone strength meter",
      },
      {
        kind: "added",
        text: "KanbanCard action menu (edit / duplicate / export / delete)",
      },
      { kind: "fixed", text: "Chart hover now tracks the nearest series" },
      { kind: "fixed", text: "Navbar hover dropdowns no longer blink" },
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
      { kind: "added", text: "SecuritySectionCard grid" },
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
      { kind: "added", text: "FaqSection component" },
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

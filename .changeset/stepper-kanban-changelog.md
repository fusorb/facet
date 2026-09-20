---
"@fusorb/facet-components": minor
"@fusorb/facet-auth": minor
"@fusorb/facet-docs": minor
"@fusorb/facet-cli": minor
---

# Ready-to-use pages: Stepper, KanbanBoard, ChangelogList

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

# @fusorb/facet-emails

## 1.1.1

### Patch Changes

- 310b27f: fix(react): wrapped components no longer drop React-element children

  `EmailLayout`/`EmailText`/`EmailButton` (and the other `wrap()`-based React
  components) silently dropped React-element children passed into them, e.g.
  `<EmailLayout><EmailText>Hello</EmailText><EmailButton>Go</EmailButton></EmailLayout>`
  rendered the heading and footer but lost the body. The `toReactNode` bridge
  only understood raw template nodes (`{tag, props, children}`); a React element
  has `type`/`props` and no `tag`, so it became `React.createElement(undefined)`
  and vanished.

  `toReactNode` now converts React-element children through the React bridge
  before rendering, so composed children survive the round-trip. The framework
  agnostic core (`render.ts` + `emailLayout`/`emailButton`/...) is untouched and
  still has zero React dependency.

  Also fixes the emails test config: `vitest.config.ts` only included
  `src/**/*.test.ts`, so the `.tsx` React-bridge tests never ran (the bug slipped
  through). Include now matches `.ts` and `.tsx`, and a regression test pins the
  wrapped-children case.

## 1.1.0

### Minor Changes

- 76b902c: feat: email template primitives (Section/Row/Column, variants, code grid) + `facet emails init`

  **@fusorb/facet-emails**

  - New `EmailSection` / `EmailRow` / `EmailColumn` primitives (table-based containers matching react-email Section/Row/Column), so consumers can build grid/detail layouts.
  - `EmailSecurityNotice` gains a `variant` prop (`warning` | `danger` | `info`) and a children/callout form in addition to the IP/device table form.
  - `EmailCodeBlock` now supports a `codes: string[]` + `columns: 1 | 2` grid path for recovery-code style emails, alongside the existing single-code path.
  - All primitives continue to accept inline `style` objects and inherit the `brand` tokens (primary, background, surface, text, muted, fontFamily, radius, brandName) passed to `renderEmail`, so consumers can fully re-brand without forking.

  **@fusorb/facet-cli**

  - New `facet emails init` command that detects the consumer's mail setup (react-email, mjml, nodemailer, resend, sendgrid, SES, postmark) from the manifests and either:
    - offers a migration path when an existing renderer is found, or
    - scaffolds a fresh `emails/` dir (brand tokens, layout wrapper, template registry with a sample welcome template, dev preview server, provider `send.ts` for resend/nodemailer, and `.env.example`).
  - Auto-installs `@fusorb/facet-emails` plus the provider SDK via the detected package manager (fails soft printing the exact command), and prints the setup guide (provider keys, preview URL, how to send).
  - Flags: `-y`, `--framework`, `--migrate` / `--fresh`, `--provider resend|nodemailer|none`, `--location`, `--name`.

  **Consumer validation**

  - SovGrant's mail system (13 templates, components, engine, preview route) now renders through `@fusorb/facet-emails` with ArcID's own design tokens mapped into the brand option; all templates verified rendering valid HTML + plain text with no `undefined`. react-email is removed from SovGrant; resend stays for delivery.

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

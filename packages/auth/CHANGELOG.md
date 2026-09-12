# @fusorb/facet-auth

## 1.2.3

### Patch Changes

- 205d83b: Swap ShineButton for the shared AnimatedButton component on auth form submit buttons (forgot-password, magic-link, MFA recovery, MFA verify) for visual consistency across the form suite.
- 205d83b: Phase 0 security fix: warn developers when `defaultStorage` (localStorage) is used for tokens, surface the XSS risk prominently, and add an optional `persist` adapter so consumers can plug in a cookie-backed strategy.

  - facet-auth: `<ArcProvider>` now emits a dev-time `console.warn` when no explicit `storage` prop is provided (fires once per page-load). `defaultStorage` and the `TokenStorage` type now carry a prominent JSDoc security warning documenting the XSS risk of storing tokens in `localStorage`.
  - facet-store: `createZustandTokenStorage` gains an optional `persist` adapter argument so consumers can plug in a cookie-backed persistence strategy for the access token. The refresh token is never passed through the persist adapter.

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

- Updated dependencies [205d83b]
- Updated dependencies [1bf5de5]
- Updated dependencies [205d83b]
- Updated dependencies [b1da261]
- Updated dependencies [1bf5de5]
- Updated dependencies [1bf5de5]
- Updated dependencies [cfabae9]
  - @fusorb/facet-components@1.11.0
  - @fusorb/facet-sdk@1.2.0

## 1.2.2

### Patch Changes

- Updated dependencies [b7accc3]
  - @fusorb/facet-components@1.10.0

## 1.2.1

### Patch Changes

- Updated dependencies [18547dc]
  - @fusorb/facet-components@1.9.0

## 1.2.0

### Minor Changes

- 9360e93: feat(auth): animated submit buttons on all auth forms (overridable)

  SignUp, LoginForm, ResetPasswordForm, ForgotPasswordForm, MagicLinkForm, and the MFA recovery-codes form now render their primary submit/confirm buttons through `AnimatedButton` (default "shine"), so forms get a consistent animated CTA. Each form accepts a `submitButton` prop:

  - `submitButton.animation`: "sparkle" | "ripple" | "magnetic" | "shine" | "none" (default "shine").
  - `submitButton.renderButton`: fully replace the built-in button with your own component.

  Secondary/utility buttons (back, cancel, recovery, OAuth, outline) stay as plain Button by design.

- 2236aa8: feat(auth): full copy flexibility on forms - every label, placeholder, button, and error is editable

  SignUp, LoginForm, and ResetPasswordForm now accept a `copy` prop that overrides any static text: titles, descriptions, field labels, placeholders, submit/submitting labels, footer links, and in-form error messages (e.g. password mismatch). Each copy object falls back to the existing defaults when omitted, so current consumers are unaffected.

  New exported types + defaults: `SignUpCopy` / `LoginCopy` / `ResetPasswordCopy` (+ `MfaCopy` reserved) and `defaultSignUpCopy` / `defaultLoginCopy` / `defaultResetPasswordCopy` / `defaultMfaCopy`. `slots.title` / `slots.description` still take precedence when both are provided.

  Docs: Sign Up page documents the `copy` prop with an example.

### Patch Changes

- Updated dependencies [9360e93]
- Updated dependencies [8d922f7]
- Updated dependencies [78b6543]
  - @fusorb/facet-components@1.8.0

## 1.1.6

### Patch Changes

- Updated dependencies [d2b43d0]
  - @fusorb/facet-components@1.7.0

## 1.1.5

### Patch Changes

- Updated dependencies [8a7aef3]
  - @fusorb/facet-components@1.6.0

## 1.1.4

### Patch Changes

- Updated dependencies [b95bcb0]
  - @fusorb/facet-sdk@1.1.0

## 1.1.3

### Patch Changes

- Updated dependencies [3554506]
  - @fusorb/facet-components@1.5.0

## 1.1.2

### Patch Changes

- Updated dependencies
  - @fusorb/facet-components@1.4.0

## 1.1.1

### Patch Changes

- Updated dependencies [251a0e4]
- Updated dependencies [865bf7e]
- Updated dependencies [69c1fec]
- Updated dependencies [b878bfd]
- Updated dependencies [6bb55a2]
  - @fusorb/facet-components@1.3.0

## 1.1.0

### Minor Changes

- 568497d: SignIn now supports a controlled `step` + `onStepChange` API: pass `step` to render exactly that step and drive the component from outside (e.g. a live state-machine diagram), and SignIn reports every internal transition via `onStepChange`. Fully backward compatible: when `step` is omitted, SignIn manages its own transitions as before.

### Patch Changes

- Updated dependencies [3de0e04]
  - @fusorb/facet-components@1.2.0

## 1.0.3

### Patch Changes

- Updated dependencies [3752a98]
  - @fusorb/facet-components@1.1.0

## 1.0.2

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @fusorb/facet-components@1.0.2

## 1.0.1

### Patch Changes

- d94a724: chore: update homepage to facet.arcevocirqle.com.ng
- Updated dependencies [d94a724]
  - @fusorb/facet-components@1.0.1
  - @fusorb/facet-sdk@1.0.1

## 1.0.0

### Major Changes

- e79cbd5: initial publish...

### Patch Changes

- Updated dependencies [e79cbd5]
  - @fusorb/facet-sdk@1.0.0
  - @fusorb/facet-components@1.0.0

# @fusorb/facet-store

## 2.0.0

### Major Changes

- 43ccd14: Bump CLI and store to stable 1.0.0. The store handles auth-critical token-refresh
  state consumed by SovGrant in production, so 0.1.0 (alpha) stability is no longer
  acceptable. The CLI is the primary developer tool and all other packages are
  already 1.x - aligning both to 1.0.0 signals release-readiness and removes
  pre-release confusion. Per the handbook rule: "anything release-ready should be
  at 1.0.0".

### Patch Changes

- 205d83b: Phase 0 security fix: warn developers when `defaultStorage` (localStorage) is used for tokens, surface the XSS risk prominently, and add an optional `persist` adapter so consumers can plug in a cookie-backed strategy.

  - facet-auth: `<ArcProvider>` now emits a dev-time `console.warn` when no explicit `storage` prop is provided (fires once per page-load). `defaultStorage` and the `TokenStorage` type now carry a prominent JSDoc security warning documenting the XSS risk of storing tokens in `localStorage`.
  - facet-store: `createZustandTokenStorage` gains an optional `persist` adapter argument so consumers can plug in a cookie-backed persistence strategy for the access token. The refresh token is never passed through the persist adapter.

- Updated dependencies [b1da261]
  - @fusorb/facet-sdk@1.2.0

## 0.1.0

### Minor Changes

- b7accc3: feat(store): extract ArcID Zustand auth/tenant stores into @fusorb/facet-store

  Pulls the framework-agnostic state stores (auth session + tenant) out of
  ArcID into a standalone `@fusorb/facet-store` package that is consumable
  across web and React Native. The stores are pure Zustand (`create`, no React
  coupling in the store logic) - React is only required by the auto-generated
  hooks at the consumer boundary, so it stays a peer, not a bundled dependency.

  Consumers share one source of truth: SovGrant, the docs preview surface, and
  the RN wallet app. The state layer has zero `any` and zero SovGrant-specific
  logic (verified: `grep any src/store` returns no matches); types
  (`User`/`Tenant`) are re-exported from `@fusorb/facet-sdk`.

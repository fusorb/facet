---
"@fusorb/facet-auth": minor
---

Add `useAuthSession()` hook returning `{ user, isAuthenticated, isLoading, signOut }`,
built on `useOptionalAuth`, structurally identical to layout's `LayoutSession`
(ADR-004). Consumers (layout shells, docs) inject it via `LayoutProvider`'s
`session` prop instead of relying on auto-detection. Includes `check:pins`-
compliant dependency on facet-components/sdk.
---
"@fusorb/facet-layout": minor
---

`LayoutProvider` now accepts an injected `session` prop (new `LayoutSession` type: `user`, `isAuthenticated`, `isLoading`, `signOut`) so layout shells decouple from `@fusorb/facet-auth`. Consumers wire their own auth (e.g. `useAuthSession()` from facet-auth); the default is a no-user, authenticated session so static/docs sites render the shell without auth. Additive — no breaking change.

---
"@fusorb/facet-layout": minor
---

Layout shells now read auth from an injected `session` instead of depending on `@fusorb/facet-auth` directly.

- `LayoutProvider` accepts an optional `session` prop (new `LayoutSession` type: `user`, `isAuthenticated`, `isLoading`, `signOut`), passed through by `ConsoleLayout` and `ChatLayout`.
- `UserMenu` and `SidebarAuth` read the session from `useLayout()` and render nothing when there is no user (static/docs sites).
- `@fusorb/facet-auth` is no longer a runtime dependency of `@fusorb/facet-layout`.

Migration: consumers who previously relied on the shell auto-detecting an `SgProvider` ancestor must now inject `session` explicitly (e.g. `session={useAuthSession()}`), and `UserMenu`/`SidebarAuth` must render inside a `LayoutProvider`.

---
"@fusorb/facet-sdk": major
"@fusorb/facet-auth": major
---

Renamed the SovGrant-facing identifiers across the SDK and auth packages.

**`@fusorb/facet-sdk`**
- `ArcIdClient` → `SgClient`
- `ArcIdClientConfig` → `SgClientConfig`

**`@fusorb/facet-auth`**
- `ArcProvider` → `SgProvider`
- `ArcProviderProps` → `SgProviderProps`
- default `TokenStorage` keys: `arcid_access_token` / `arcid_refresh_token` → `sg_access_token` / `sg_refresh_token`

Migration: update imports and JSX to the new names (`ArcIdClient` → `SgClient`, `ArcProvider` → `SgProvider`). Sessions stored under the old `arcid_*` keys are not restored after upgrade, so users will re-authenticate.

# @fusorb/facet-store

Framework-agnostic auth/tenant state for SovGrant, built on Zustand.

This package owns `useAuthStore`, `useTenantStore`, and a
`createZustandTokenStorage` bridge for SDK token refresh. It is an
**alternative** state layer for consumers that drive auth outside React hooks
(e.g. React Native or non-React shells). The default web React path is
`@fusorb/facet-auth`'s `<SgProvider>`, which does **not** consume this package.

## Install

```bash
pnpm add @fusorb/facet-store
```

## Usage

```ts
import {
  useAuthStore,
  useTenantStore,
  createZustandTokenStorage,
} from "@fusorb/facet-store";

// Read/write auth state
const { user, accessToken, setUser, setTokens, clearAuth } =
  useAuthStore.getState();

// React hook usage
const user = useAuthStore((s) => s.user);
const tenant = useTenantStore((s) => s.tenant);

// Bridge Zustand store tokens to an SDK refresher
const tokenStorage = createZustandTokenStorage({
  authStore: useAuthStore,
  sdk, // object exposing refresh(refreshToken): Promise<ApiResponse<RefreshResult>>
  // persist?: { getAccessToken, setAccessToken } // optional access-token persistence
});
```

## API

| Export | Type | Description |
|--------|------|-------------|
| `useAuthStore` | Zustand store | Auth session store (`user`, `accessToken`, `refreshToken`, loading/error flags, setters/clear). |
| `AuthState` | type | Shape of the auth store state/actions. |
| `User` | type | User shape stored in auth state. |
| `useTenantStore` | Zustand store | Active tenant store (`tenant`, `setTenant`, `clearTenant`). |
| `TenantState` | type | Shape of the tenant store state/actions. |
| `Tenant` | type | Tenant shape stored in tenant state. |
| `createZustandTokenStorage` | function | Creates a token storage/refresh bridge (`getAccessToken`, `getRefreshToken`, `setTokens`, `clearTokens`, `onTokenRefresh`) backed by the Zustand auth store. |
| `TokenStorage` | type | Token storage/refresh interface returned by `createZustandTokenStorage`. |
| `TokenStoreLike` | type | Minimal auth-store interface required by the bridge. |
| `TokenRefresher` | type | SDK refresh interface (`refresh(token)`). |
| `PersistAdapter` | type | Optional adapter for persisting the access token (e.g. secure storage). |

## Notes

- `@fusorb/facet-auth` and `@fusorb/facet-store` both define token-storage adapter concepts for different platform paths; unifying them is a follow-up tracked in-repo.
- The refresh token should not be persisted via `PersistAdapter`; keep it in a secure backend/session mechanism as appropriate.

## License

MIT © facet contributors. See [LICENSE](../../LICENSE) at the repository root.

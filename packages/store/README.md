# @fusorb/facet-store

Framework-agnostic Zustand state stores for facet auth + tenant, with a
token-refresh middleware bridge that integrates with `@fusorb/facet-sdk`.

## Install

```bash
pnpm add @fusorb/facet-store
```

## Usage

```ts
import { authStore, useAuth, useToken, tokenRefreshMiddleware } from "@fusorb/facet-store";

// Read current session
const session = useAuth.getState().session;

// React hook
const { user, session, loading } = useAuth();

// Token refresh is automatic — the middleware listens for 401s
// from @fusorb/facet-sdk and retries with a refreshed token.
```

### Tenant switching

```ts
import { tenantStore } from "@fusorb/facet-store";

tenantStore.setTenant("acme-corp");
// All SDK calls now target acme-corp's API endpoints.
```

## API

| Export | Type | Description |
|--------|------|-------------|
| `authStore` | `ZustandStore` | Auth state: session, user, tokens, loading flags. |
| `useAuth` | hook | React hook for auth state. |
| `useToken` | hook | React hook for token + refresh status. |
| `tenantStore` | `ZustandStore` | Tenant state: current tenant, list, switching logic. |
| `useTenant` | hook | React hook for tenant state. |
| `tokenRefreshMiddleware` | `ZustandMiddleware` | Intercepts 401s, refreshes token via SDK, retries failed request. |
| `TokenStorage` | interface | Pluggable token storage (localStorage default). |

## Token-refresh bridge

The `tokenRefreshMiddleware` wraps `@fusorb/facet-sdk` calls. When the SDK
returns a 401, the middleware:

1. Checks if a refresh token is available.
2. Calls `AuthSdk.refreshToken()`.
3. Retries the original request transparently.
4. If refresh fails, clears the session and emits an event.

This keeps all ten domain SDKs unaware of token expiry — the bridge lives in
the store layer.

## License

MIT © facet contributors. See [LICENSE](../../LICENSE) at the repository root.

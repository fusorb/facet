# @fusorb/facet-sdk

SovGrant API client — pure `fetch`, typed, 10 domain SDK modules. Each module
maps to a facet surface (auth, passkey, identity, OAuth, tenant, billing,
webhooks, audit, identity-provider, core).

## Install

```bash
pnpm add @fusorb/facet-sdk
```

## Usage

```ts
import { ArcIdClient, AuthSdk, TenantSdk } from "@fusorb/facet-sdk";

const arc = new ArcIdClient({
  baseUrl: "https://api.sovgrant.com",
  apiKey: process.env.SOVGRANT_API_KEY,
});

const { data: tenant } = await arc.tenant.get("acme-corp");

const auth = new AuthSdk(arc);
const { data: session } = await auth.getSession();
```

## Architecture

Every domain SDK is a thin, typed wrapper around `ArcIdClient.fetch()`. No
business logic lives here — just request serialization, response parsing, error
types, and ergonomic method chaining.

| Module | Export | Surface |
|--------|--------|---------|
| `ArcIdClient` | class | Core HTTP client (fetch + retry + typed errors). |
| `AuthSdk` | class | Session, token refresh, sign-in/sign-up lifecycle. |
| `PasskeySdk` | class | Passkey registration + assertion flow. |
| `IdentitySdk` | class | DID resolution, credential presentation. |
| `OAuthSdk` | class | OAuth 2.0 / OIDC flows (authorize, token,userinfo). |
| `TenantSdk` | class | Tenant CRUD, branding, config. |
| `BillingSdk` | class | Subscriptions, invoices, payment methods. |
| `WebhooksSdk` | class | Webhook registration, signing, delivery history. |
| `AuditSdk` | class | Audit log query + streaming. |
| `IdpSdk` | class | Identity-provider federation (OIDC/SAML). |

## Token-refresh bridge

The `auth` surface integrates with `@fusorb/facet-store`'s token-refresh
middleware. When a 401 is received, the store transparently retries with a
refreshed token before the SDK surfaces the error to the caller.

## License

MIT © facet contributors. See [LICENSE](../../LICENSE) at the repository root.

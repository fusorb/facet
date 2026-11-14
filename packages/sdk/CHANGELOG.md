# @fusorb/facet-sdk

## 4.1.0

### Minor Changes

- 5af9c0a: Add `ApiKeySdk` — machine-to-machine API key management over SovGrant's
  `/api-keys` routes: `list()`, `create()` (returns the plaintext key exactly
  once, then never again), and `revoke()`. Also exports the `ApiKey`,
  `CreateApiKeyParams`, and `CreatedApiKey` types.

## 4.0.1

### Patch Changes

- e4250b8: Fix facet summary to report 10 domain SDK classes (metadata only).

## 4.0.0

### Major Changes

- f2d4b1c: Align external-id, tenant policy, and delegation contracts with SovGrant 3.0.0 routes.

  - `confirmExternalId` now sends `{ code }` (was `{ verification }`), accepts `{ code: string }`, and returns `{ id: string; verified: boolean }` (was `ExternalId`), matching the route body/handler and response.
  - `verifyExternalId` now returns `{ success: boolean; type: string }` (was `{ verification: string }`), matching the route response.
  - `getPolicy` now returns `TenantPolicy | null` (was `TenantPolicy`), matching routes that return `data: null` when no policy is set.
  - Removed delegation APIs and types (`listDelegations`, `createDelegation`, `revokeDelegation`, `Delegation`) because the corresponding SovGrant endpoints are 501 by design and cannot succeed.

  **Release note:** these signature/type changes are published as a major under ADR-008 even though the affected external-id/policy shapes did not work correctly against the real SovGrant 3.0.0 API, to make the contract break explicit and safe for consumers upgrading. Remove any local adapters/workarounds for the fixed external-id and policy methods after upgrading to this release.

## 3.0.0

### Major Changes

- 71b1de6: Align SDK identity/VC/device-approval contracts with SovGrant route schemas (G8, G9, G10 follow-up)

  **Breaking (response/type and payload contract changes):**

  - `identity.approveDeviceApproval` now requires and forwards `deviceId` in both params and body: `approveDeviceApproval({ challenge, signature })` -> `approveDeviceApproval({ challenge, deviceId, signature })`, posting `{ deviceId, signature }` to `/identity/device-approvals/:challenge/approve`.
  - `identity.registerWalletDid` result type is now `{ did, didDocument, walletId, keyType }` (was void-like), matching the route response.
  - `vcs.acceptOffer` result type is now `{ credentialId, credential }` (was void-like), matching the route response, and now sends an explicit `{}` body.
  - `identity.linkExternalId` payload now matches the route: `{ type, value, displayValue? }` (was `{ provider, externalId }`), and it returns `ExternalId`.
  - `ExternalId` type shape: `{ id, type, displayValue, verified, createdAt }` (was `{ id, provider, externalId, linkedAt? }`).
  - `Device` type shape: `{ id, platform, browser, createdAt, lastSeenAt }` (was `{ id, name, platform?, lastUsedAt?, createdAt }`).
  - `TenantPolicy` type shape: `{ requireMfa?, requireLegalConsent?, sessionTtlMinutes?, allowedEmailDomains?, maxSessionsPerUser?, allowPasskeys? }` (replaces `passwordRules`/`loginMethods` which the route rejected/stripped).

  **Additions (same major):**

  - `identity.verifyExternalId(id)` -> `POST /identity/external-ids/:id/verify`
  - `identity.confirmExternalId(id, { verification })` -> `POST /identity/external-ids/:id/confirm`

  **Tests (G10):**

  - Mutating SDK methods now assert request bodies (not just URL/method), so payload contract drift is caught by CI.

  **Migration notes:**

  - Update device approval calls to pass `deviceId` (the paired/trusted device whose key signs the challenge).
  - Update `linkExternalId` callers to send `{ type, value, displayValue? }` (e.g. NIN/BVN/passport) and handle the returned `ExternalId`.
  - Replace reads of `ExternalId.provider/externalId/linkedAt` with `type/displayValue/verified/createdAt`.
  - Replace reads of `Device.name/lastUsedAt` with `platform/browser/lastSeenAt`.
  - Replace `TenantPolicy.passwordRules/loginMethods` updates with the route-supported fields (`requireLegalConsent`, `sessionTtlMinutes`, `allowedEmailDomains`, `maxSessionsPerUser`, `allowPasskeys`).
  - Handle typed responses from `registerWalletDid` and `acceptOffer` instead of assuming empty/void data.

  Consumers (SovGrant/SovPort) can remove workarounds/adapters for these once 3.0.0 is published. (Typed under ADR-008: non-additive public contract/type changes ship as a major.)

## 2.1.1

### Patch Changes

- 9bc65e6: Switch published inter-package dependencies from `workspace:*` to `workspace:^` so the
  published range keeps the caret and consumers can dedupe across versions (ADR-008, M1).
  Enforced by the new `check:pins` gate.

## 2.1.0

### Minor Changes

- 0e667d2: Add paired device methods to IdentitySdk (register/list/revoke).

## 2.0.0

### Major Changes

- b5f9579: Renamed the SovGrant-facing identifiers across the SDK and auth packages.

  **`@fusorb/facet-sdk`**
  - `ArcIdClient` → `SgClient`
  - `ArcIdClientConfig` → `SgClientConfig`

  **`@fusorb/facet-auth`**
  - `ArcProvider` → `SgProvider`
  - `ArcProviderProps` → `SgProviderProps`
  - default `TokenStorage` keys: `arcid_access_token` / `arcid_refresh_token` → `sg_access_token` / `sg_refresh_token`

  Migration: update imports and JSX to the new names (`ArcIdClient` → `SgClient`, `ArcProvider` → `SgProvider`). Sessions stored under the old `arcid_*` keys are not restored after upgrade, so users will re-authenticate.

## 1.2.1

### Patch Changes

- db287b3: De-brand and production hardening:

  - tokens: brand color changed from indigo to Electric Cyan; new facet animation
    keyframes (overlay-in/out, fade-up, chart-fadeIn/draw); new CSS variables
    (elevation, hero-glow); dist CSS minified via esbuild (zero API change,
    smaller consumer payloads)
  - components: changelog-list pre-release badge uses the semantic `warning` token instead of hardcoded amber classes
  - sdk: docs and test fixtures neutralized (`auth.arcevo.dev` → `auth.example.dev`)
  - emails: default brand color is now a neutral slate instead of indigo
  - cli: emails generator default matches the new neutral emails default
  - auth: package metadata neutralized (description, keywords, homepage removed "ArcevoCirqle")
  - layout: package metadata neutralized (description, keywords, homepage)
  - store: package keywords updated (`arc-id` → `SovGrant`); homepage neutralized

## 1.2.0

### Minor Changes

- b1da261: Add 5 new composable UI components: AspectRatio, Carousel, Drawer,
  InputGroup, Resizable. Also fix Navbar hamburger (X-icon toggle +
  outside-click close) and register new bundled deps in facet-cli.

  Carousel: add <CarouselDots> pagination component (uses context API, no extra deps);
  update docs preview with dots + loop. Add carousel-vertical variant to docs.
  Marquee: add composable `variant` prop ("loop" | "strip"); strip variant
  defaults to no pause-on-hover + dedicated className. Add marquee-strip variant to docs.
  Resizable: docs preview now shows both horizontal and vertical orientations.

  CLI enhancements:
  - `facet clean -y` now auto-runs the remove command instead of just printing it
  - Auto-update check on CLI startup (pnpm-style notification box, 24h cache, CI skip, --no-update-check)
  - `facet self-update`: updates the globally-installed facet-cli
  - `facet install <name>`: installs a facet package by shorthand or full name
    (full: `facet install @fusorb/facet-layout`, shorthand: `facet install layout`)
    Supports the scoped-dropped alias `facet-cli` -> `@fusorb/facet-cli` (so any
    `facet-X` alias resolves), and `-g`/`--global` to install globally, e.g.
    `facet install -g facet-cli` runs `npm i -g @fusorb/facet-cli@latest`.
  - `facet copy <ComponentName>`: copies a component into your source (shadcn-style) only
    (passing a package name prints a redirect hint to `facet install`)
  - `facet latest`: shows latest published versions of all facet packages
  - `facet --log`: global verbose flag for detailed command output

  SDK: add `OAuthSdk.updateClient(clientId, data)` for full OAuth-client
  CRUD (PATCH `/oauth/clients/:clientId`); add `IssueCredentialParams` interface.

## Unreleased

### Minor Changes

- feat(sdk): add `OAuthSdk.updateClient(clientId, data)` for full OAuth-client
  CRUD (PATCH `/oauth/clients/:clientId`). Backed by SovGrant's
  `PATCH /oauth/clients/:clientId` route (requires `client:update` permission
  - PRO plan); returns `ApiResponse<OAuthClient>`, same shape as
    `createClient`. `UpdateClientParams` is exported from the package entry.

## 1.1.0

### Minor Changes

- b95bcb0: feat(sdk): OAuth2/OIDC integration for external consumers + refresh client_id

  The SDK is now a proper OAuth2/OIDC client for third-party integrations,
  not just a first-party session client:

  - `SgClientConfig` gains `clientId` + `clientSecret` (optional), and
    `SgClient.setClientCredentials()` for dynamic integration.
  - `AuthSdk.refresh()` now sends `client_id` (and `client_secret`) when
    configured -- required by SovGrant's TokenExchangeSchema for all clients
    (the backend defaults only cover the first-party direct client).
  - New `AuthSdk.exchangeCode()` -- authorization_code grant with PKCE
    (`code_verifier`) + redirect_uri.
  - New `AuthSdk.clientCredentials()` -- service-to-service tokens.
  - New `AuthSdk.authorizeUrl()` -- OIDC authorize redirect builder
    (client_id, redirect_uri, scope, state, nonce, PKCE S256 challenge,
    prompt, max_age).
  - New `AuthSdk.switchContext({ tenantId })` -- POST /auth/switch-context,
    with the result typed to SovGrant's real response shape (was TokenBundle,
    which requires sessionId the route does not return).
  - `TenantSdk.create()` now returns `ApiResponse<Tenant>` (was `void`).
    SovGrant's POST /tenants responds with the created tenant -- the void
    return meant consumers could not capture the new tenant id to operate
    on it (found by the live E2E: listMembers/getPolicy failed with
    'Invalid cuid').

## 1.0.1

### Patch Changes

- d94a724: chore: update homepage to facet.arcevocirqle.com.ng

## 1.0.0

### Major Changes

- e79cbd5: initial publish...

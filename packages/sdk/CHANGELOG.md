# @fusorb/facet-sdk

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
  CRUD (PATCH `/oauth/clients/:clientId`). Backed by arc-id's
  `PATCH /oauth/clients/:clientId` route (requires `client:update` permission
  - PRO plan); returns `ApiResponse<OAuthClient>`, same shape as
    `createClient`. `UpdateClientParams` is exported from the package entry.

## 1.1.0

### Minor Changes

- b95bcb0: feat(sdk): OAuth2/OIDC integration for external consumers + refresh client_id

  The SDK is now a proper OAuth2/OIDC client for third-party integrations,
  not just a first-party session client:

  - `ArcIdClientConfig` gains `clientId` + `clientSecret` (optional), and
    `ArcIdClient.setClientCredentials()` for dynamic integration.
  - `AuthSdk.refresh()` now sends `client_id` (and `client_secret`) when
    configured -- required by arc-id's TokenExchangeSchema for all clients
    (the backend defaults only cover the first-party direct client).
  - New `AuthSdk.exchangeCode()` -- authorization_code grant with PKCE
    (`code_verifier`) + redirect_uri.
  - New `AuthSdk.clientCredentials()` -- service-to-service tokens.
  - New `AuthSdk.authorizeUrl()` -- OIDC authorize redirect builder
    (client_id, redirect_uri, scope, state, nonce, PKCE S256 challenge,
    prompt, max_age).
  - New `AuthSdk.switchContext({ tenantId })` -- POST /auth/switch-context,
    with the result typed to arc-id's real response shape (was TokenBundle,
    which requires sessionId the route does not return).
  - `TenantSdk.create()` now returns `ApiResponse<Tenant>` (was `void`).
    arc-id's POST /tenants responds with the created tenant -- the void
    return meant consumers could not capture the new tenant id to operate
    on it (found by the live E2E: listMembers/getPolicy failed with
    'Invalid cuid').

## 1.0.1

### Patch Changes

- d94a724: chore: update homepage to facet.arcevocirqle.com.ng

## 1.0.0

### Major Changes

- e79cbd5: initial publish...

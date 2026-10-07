# @fusorb/facet-auth

Domain-customizable authentication components (sign-in, sign-up, MFA, guard,
TOTP) with 5 domain presets (fintech, med, edu, enterprise, default) and
integration with `@fusorb/facet-sdk` + `@fusorb/facet-store`.

## Install

```bash
pnpm add @fusorb/facet-auth @fusorb/facet-sdk @fusorb/facet-store
```

## Usage

### ArcProvider (top-level)

```tsx
import { ArcProvider } from "@fusorb/facet-auth";
import { ArcIdClient } from "@fusorb/facet-sdk";

const arc = new ArcIdClient({ baseUrl: "...", apiKey: "..." });

<ArcProvider client={arc}>
  <App />
</ArcProvider>
```

### Sign-in form

```tsx
import { SignIn } from "@fusorb/facet-auth";

<SignIn
  copy={{
    title: "Welcome back",
    subtitle: "Sign in to continue",
  }}
  onSuccess={(session) => console.log("signed in:", session)}
/>
```

### Route guard

```tsx
import { Guard } from "@fusorb/facet-auth";

<Guard fallback={<SignIn />}>
  <Dashboard />
</Guard>
```

### MFA / TOTP

```tsx
import { MfaDialog, TwoFactorSetupPanel } from "@fusorb/facet-auth";

<MfaDialog onVerify={handleVerify} />
<TwoFactorSetupPanel userId={user.id} />
```

### Standalone forms

Each auth flow step is independently importable as a form component:

```tsx
import {
  LoginForm,
  MagicLinkForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  MfaVerifyForm,
  MfaSetupForm,
  MfaRecoveryCodesForm,
  MfaRecoveryForm,
} from "@fusorb/facet-auth";

<LoginForm
  onSubmit={async (email, password) => {
    // Call your auth backend and return an error string or null.
    return null;
  }}
  onForgotPassword={() => router.push("/forgot")}
/>
```

### User button

```tsx
import { UserButton } from "@fusorb/facet-auth";

<UserButton onSignOut={() => router.push("/")} />
```

## Domain presets

Five domain-specific auth presets ship with the package. Each configures
branding (colors, copy, logo), required fields, MFA requirements, session TTL,
and the token-refresh cadence:

| Preset | Domain | MFA required | Copy tone |
|--------|--------|-------------|-----------|
| `fintechPreset` | Financial services | TOTP + push | Formal, compliance-first |
| `medPreset` | Healthcare | TOTP | HIPAA-aware |
| `eduPreset` | Education | Optional | Student-friendly |
| `enterprisePreset` | B2B SaaS | TOTP + WebAuthn | Enterprise-ready |
| `defaultPreset` | General purpose | Optional | Neutral |

```tsx
import { ArcProvider, SignIn, fintechPreset } from "@fusorb/facet-auth";

<ArcProvider client={arc}>
  <SignIn config={fintechPreset} />
</ArcProvider>
```

## Token management

The auth surface reads/writes tokens to `localStorage` by default. An optional
`TokenStorage` interface lets you plug in your own (Keychain, SecureStorage,
HTTP-only cookies). The `@fusorb/facet-store` `authStore` is kept in sync and
the `@fusorb/facet-sdk` automatically refreshes tokens on 401.

## API

| Export | Type | Description |
|--------|------|-------------|
| `ArcProvider` | component | Top-level provider; initializes the `ArcIdClient`, manages auth state via `@fusorb/facet-store`. |
| `SignIn` | component | Full sign-in form (email, password, social, passwordless). |
| `SignUp` | component | Full sign-up form (with domain-specific fields). |
| `Guard` | component | Client-side route guard with fallback. |
| `MfaDialog` | component | MFA challenge dialog (TOTP + push). |
| `TwoFactorSetupPanel` | component | QR + TOTP enrollment UI. |
| `PasswordStrengthMeter` | component | Real-time password scoring (zxcvbn-style). |
| `ApiKeyManager` | component | API key list + create/revoke management surface. |
| `InviteTeamForm` | component | Team invitation form with email + role. |
| `LoginForm` | component | Standalone sign-in form (email + password). |
| `MagicLinkForm` | component | Standalone passwordless email link form. |
| `ForgotPasswordForm` | component | Standalone "forgot password" email form. |
| `ResetPasswordForm` | component | Standalone new-password entry form. |
| `MfaVerifyForm` | component | Standalone MFA challenge form (TOTP + push). |
| `MfaSetupForm` | component | Standalone MFA enrollment form. |
| `MfaRecoveryCodesForm` | component | Standalone recovery-code display/verification form. |
| `MfaRecoveryForm` | component | Standalone recovery-code entry form. |
| `UserButton` | component | Account dropdown button (profile, settings, sign-out). |
| `fintechPreset` / `medPreset` / `eduPreset` / `enterprisePreset` / `defaultPreset` | `AuthConfig` | Domain-specific auth configurations. |
| `PresetName` | type | Union of preset names. |
| `TokenStorage` | interface | Storage adapter protocol for token persistence. |
| `defaultStorage` | `TokenStorage` | In-memory token storage adapter (swap for KV/IndexedDB). |

## License

MIT © facet contributors. See [LICENSE](../../LICENSE) at the repository root.

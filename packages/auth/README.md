# @fusorb/facet-auth

Domain-customizable authentication components for SovGrant-backed apps: provider,
sign-in/sign-up, guard, MFA dialog, presets, standalone auth forms, and
SDK-integrated session helpers.

## Install

```bash
pnpm add @fusorb/facet-auth @fusorb/facet-sdk
```

`@fusorb/facet-components` (and its peer dependencies) is required for the UI
building blocks used by these components.

## Usage

### Provider and guard

```tsx
import { SgProvider, Guard, SignIn } from "@fusorb/facet-auth";
import { SgClient } from "@fusorb/facet-sdk";

const sg = new SgClient({ baseUrl: "https://api.example.com" });

export function App() {
  return (
    <SgProvider client={sg}>
      <Guard fallback={<SignIn onSuccess={() => { /* signed in */ }} />}>
        <Dashboard />
      </Guard>
    </SgProvider>
  );
}
```

### MFA dialog

```tsx
import { MfaDialog } from "@fusorb/facet-auth";

<MfaDialog
  open={mfaOpen}
  onOpenChange={setMfaOpen}
  client={sg}
  sessionId={sessionId}
  onComplete={(result) => {
    // handle verified MFA/session result
  }}
/>;
```

`MfaDialog` orchestrates MFA verification/setup/recovery flows using the SDK and
the standalone MFA forms exported by this package.

### Standalone forms

Each auth step is independently importable:

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
```

### Domain presets and registry

```tsx
import { fintechPreset, resolvePreset, registerPreset } from "@fusorb/facet-auth";

// built-in presets: fintechPreset, medPreset, eduPreset, enterprisePreset, defaultPreset
const config = resolvePreset("fintech"); // or pass a custom AuthConfig
```

## API (selected exports)

| Export | Kind | Description |
|--------|------|-------------|
| `SgProvider`, `useAuth`, `useOptionalAuth`, `useAuthSession` | provider/hooks | SDK-backed auth context and session access. |
| `Guard` | component | Renders children when authenticated, otherwise a fallback. |
| `SignIn`, `SignUp`, `UserButton`, `MfaDialog` | components | Auth UI surfaces wired to the provider/SDK flows. |
| `LoginForm`, `MagicLinkForm`, `ForgotPasswordForm`, `ResetPasswordForm`, `MfaVerifyForm`, `MfaSetupForm`, `MfaRecoveryCodesForm`, `MfaRecoveryForm` | components | 8 standalone auth/MFA form components. |
| `fintechPreset`, `medPreset`, `eduPreset`, `enterprisePreset`, `defaultPreset` | config | Built-in domain presets. |
| `registerPreset`, `getPreset`, `hasPreset`, `listPresets`, `resolvePreset` | functions | Preset registry helpers. |
| `TokenStorage`, `defaultStorage` | storage | Token storage interface and default localStorage-backed adapter. |
| Validators/copy/types | utilities/types | Form validators, default copy, and exported auth types. |

For the complete export surface, see `packages/auth/src/index.ts`.

## Token storage

Auth state/tokens are managed by `SgProvider` with a pluggable `TokenStorage`
(default: browser `localStorage` via `defaultStorage`). Pass a custom `storage`
to `SgProvider` for alternative persistence strategies.

## License

MIT © facet contributors. See [LICENSE](../../LICENSE) at the repository root.

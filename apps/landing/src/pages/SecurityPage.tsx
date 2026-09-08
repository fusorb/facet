import * as React from "react";
import {
  AccountSettingsPanel,
  SecuritySectionCard,
  ApiKeyManager,
  PasswordStrengthMeter,
  PasswordInput,
  TwoFactorSetupPanel,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from "@arcevo/facet-components";
import { LandingLayout } from "@arcevo/facet-layout";
import { LightIcon } from "@arcevo/facet-components/light";
import { Nav } from "../components/Nav.js";
import { Footer } from "../components/Footer.js";
import {
  SECURITY_FEATURES,
  DEMO_API_KEYS,
  ACCOUNT_SECTIONS,
} from "../data/dashboard-demo.js";

/**
 * /security - a settings console built entirely from ready-to-use facet
 * surfaces. Shows the AccountSettingsPanel nav + per-section content
 * (SecuritySectionCard + ApiKeyManager + TwoFactorSetupPanel +
 * PasswordStrengthMeter), so the landing demos the exact screens
 * consumers can ship.
 */
export function SecurityPage() {
  const [password, setPassword] = React.useState("");

  const content: Record<string, React.ReactNode> = {
    profile: (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Display name, email, and locale. Live-editable in a real app, the demo
            surface here just shows the section shape.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <p className="font-medium text-foreground">Ada Lovelace</p>
              <p className="text-xs text-muted-foreground">ada.lovelace@arcevocirqle.com.ng</p>
            </div>
            <Badge variant="outline">Owner</Badge>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <p className="font-medium text-foreground">Display name</p>
              <p className="text-xs text-muted-foreground">Ada</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <p className="font-medium text-foreground">Locale</p>
              <p className="text-xs text-muted-foreground">en-NG</p>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    security: (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LightIcon name="key-round" size={18} className="text-primary" />
              Password
            </CardTitle>
            <CardDescription>
              Update your password. The PasswordStrengthMeter and PasswordInput are
              the same surfaces shipped in the SignIn / SignUp forms.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
            />
            <PasswordStrengthMeter value={password} />
          </CardContent>
        </Card>
        <TwoFactorSetupPanel
          otpauthUri="otpauth://totp/facet:ada.lovelace@arcevocirqle.com.ng?secret=JBSWY3DPEHPK3PXP&issuer=facet"
          secret="JBSW-Y3DP-EHPK-3PXP"
          recoveryCodes={[
            "a1b2-c3d4",
            "e5f6-g7h8",
            "i9j0-k1l2",
            "m3n4-o5p6",
            "q7r8-s9t0",
            "u1v2-w3x4",
            "y5z6-a7b8",
            "c9d0-e1f2",
          ]}
          onConfirm={async () => {
            /* demo: any code accepted */
          }}
        />
      </div>
    ),
    sessions: (
      <Card>
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>
            Devices currently signed in. Sign out of any you don't recognize.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              { device: "MacBook Pro · Chrome", location: "Lagos, NG", current: true },
              { device: "iPhone 15 · Safari", location: "Lagos, NG", current: false },
              { device: "CI runner · Linux", location: "us-east-1", current: false },
            ].map((s) => (
              <li
                key={s.device}
                className="flex items-center justify-between rounded-md border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {s.device}
                    {s.current && (
                      <Badge variant="outline" className="ml-2 text-[10px]">
                        current
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.location}</p>
                </div>
                {!s.current && (
                  <button
                    type="button"
                    className="text-xs font-medium text-destructive hover:underline"
                  >
                    Revoke
                  </button>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    ),
    "api-keys": (
      <ApiKeyManager
        keys={DEMO_API_KEYS}
        onCreate={async ({ name }) => ({
          secret: `facet_live_${name.replace(/\W+/g, "-").toLowerCase()}_${Math.random()
            .toString(36)
            .slice(2, 10)}`,
        })}
        onRevoke={async () => {
          /* demo */
        }}
      />
    ),
    notifications: (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Choose how facet notifies you about events in your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            { id: "email-mfa", label: "MFA challenge by email", on: true },
            { id: "email-issue", label: "Credential issuance", on: true },
            { id: "email-rotation", label: "API key rotation", on: false },
            { id: "webhook-issue", label: "Webhook delivery failures", on: true },
          ].map((row) => (
            <label
              key={row.id}
              className="flex items-center justify-between rounded-md border border-border p-3"
            >
              <span className="font-medium text-foreground">{row.label}</span>
              <input
                type="checkbox"
                defaultChecked={row.on}
                className="size-4 accent-primary"
                aria-label={row.label}
              />
            </label>
          ))}
        </CardContent>
      </Card>
    ),
  };

  return (
    <LandingLayout
      nav={<Nav />}
      footer={<Footer />}
      hero={
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50 ring-1 ring-border">
            <LightIcon name="shield-check" className="size-5 text-primary" />
          </span>
          <h1 className="mt-3 font-heading text-4xl font-bold text-foreground sm:text-5xl">
            Security surface, ready to ship
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Account settings, API keys, MFA, sessions, the surfaces every auth
            console needs, wired from the ready-to-use components in
            <code className="ml-1 rounded bg-secondary/50 px-2 py-1 text-sm">
              @arcevo/facet-components
            </code>
            .
          </p>
        </div>
      }
    >
      {/* Top: SecuritySectionCard grid - the "tiles" that greet the user */}
      <section className="mx-auto max-w-7xl px-8 py-12">
        <h2 className="text-2xl font-bold text-foreground">At a glance</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Click any tile to jump to the matching section in the settings panel below.
        </p>
        <div className="mt-6">
          <SecuritySectionCard features={SECURITY_FEATURES} columns={3} />
        </div>
      </section>

      {/* Bottom: full AccountSettingsPanel - nav + per-section content */}
      <section className="mx-auto max-w-5xl px-8 py-12">
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The full AccountSettingsPanel: nav on the left (collapses to a scrollable
          tab row on mobile), per-section content on the right.
        </p>
        <div className="mt-6">
          <AccountSettingsPanel sections={ACCOUNT_SECTIONS} content={content} />
        </div>
      </section>

      {/* CTA back to docs */}
      <section className="mx-auto max-w-3xl px-8 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Every surface above is a typed component. Read the docs to wire them into
          your own console, and your own auth backend.
        </p>
      </section>
    </LandingLayout>
  );
}
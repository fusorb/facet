import * as React from "react";
import { ArcProvider, SignIn } from "@fusorb/facet-auth";
import type { SignInStep } from "@fusorb/facet-auth";
import { ArcIdClient } from "@fusorb/facet-sdk";
import {
  Checkbox,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@fusorb/facet-components";
import { CodeBlock } from "./CodeBlock.js";

const OAUTH_PROVIDERS = ["google", "github", "microsoft"] as const;

export interface AuthDemoProps {
  /** Default config shown in the demo + code sample. */
  initialConfig?: {
    allowMagicLink?: boolean;
    allowPasskey?: boolean;
    oauthProviders?: string[];
  };
}

export interface AuthDemoConfig {
  allowMagicLink: boolean;
  allowPasskey: boolean;
  oauthProviders: string[];
}

/** The step the live <SignIn> preview is driven to. */
export type AuthDemoStep = Exclude<
  SignInStep,
  "idle" | "check_session" | "check_mfa"
>;

/** Method name -> the SignIn step that renders that method's form. */
const METHOD_STEPS = {
  "Email + password": "login_form",
  "Magic link": "magic_link_form",
  Passkey: "passkey_auth",
  OAuth: "login_form",
} as const satisfies Record<string, AuthDemoStep>;

/** Whether a method is offered under the current config. */
function methodEnabled(
  config: AuthDemoConfig,
  method: keyof typeof METHOD_STEPS,
): boolean {
  switch (method) {
    case "Email + password":
      return true;
    case "Magic link":
      return config.allowMagicLink;
    case "Passkey":
      return config.allowPasskey;
    case "OAuth":
      return config.oauthProviders.length > 0;
    default:
      return false;
  }
}

/**
 * Live, configurable auth demo: the config checkboxes are the single source
 * of truth. Checking/unchecking a method (or an OAuth provider) updates the
 * method switcher, the live <SignIn> preview, and the generated code in
 * lockstep. On large screens the method switcher and live preview sit
 * side-by-side with the copyable code below.
 *
 * The demo is intentionally client-free: <ArcProvider> bootstraps signed
 * out (no stored token -> no network call), and <SignIn> renders its
 * method forms purely from `config`. Consumers wiring a real ArcIdClient
 * get the full login/MFA flow.
 */
export function AuthDemo({ initialConfig }: AuthDemoProps) {
  const [config, setConfig] = React.useState<AuthDemoConfig>({
    allowMagicLink: initialConfig?.allowMagicLink ?? true,
    allowPasskey: initialConfig?.allowPasskey ?? true,
    oauthProviders: initialConfig?.oauthProviders ?? ["google"],
  });
  const [step, setStep] = React.useState<AuthDemoStep>("login_form");

  // No network: bootstrap stays signed out because no token is stored.
  // A real consumer passes their own ArcIdClient here.
  const client = React.useMemo(
    () => new ArcIdClient({ baseUrl: "https://demo.invalid" }),
    [],
  );

  const selectMethod = (method: keyof typeof METHOD_STEPS) => {
    setStep(METHOD_STEPS[method]);
  };

  const activeMethod = (
    Object.keys(METHOD_STEPS) as (keyof typeof METHOD_STEPS)[]
  ).find((m) => METHOD_STEPS[m] === step && methodEnabled(config, m));

  // If the active method is disabled by a checkbox, hop to the first
  // enabled method so the preview + code never show a grayed-out method.
  React.useEffect(() => {
    if (!activeMethod) {
      const first = (
        Object.keys(METHOD_STEPS) as (keyof typeof METHOD_STEPS)[]
      ).find((m) => methodEnabled(config, m));
      if (first) setStep(METHOD_STEPS[first]);
    }
  }, [activeMethod, config]);

  const toggleMethod = (method: keyof typeof METHOD_STEPS) => {
    const turningOff = methodEnabled(config, method);
    setConfig((prev) => {
      switch (method) {
        case "Magic link":
          return { ...prev, allowMagicLink: !prev.allowMagicLink };
        case "Passkey":
          return { ...prev, allowPasskey: !prev.allowPasskey };
        default:
          return prev; // email/password and OAuth (as a block) are handled below
      }
    });
    // OAuth is enabled/disabled by checking/unchecking its providers.
    if (method === "OAuth" && turningOff) {
      setConfig((prev) => ({ ...prev, oauthProviders: [] }));
    }
  };

  const toggleProvider = (provider: string) => {
    setConfig((prev) => ({
      ...prev,
      oauthProviders: prev.oauthProviders.includes(provider)
        ? prev.oauthProviders.filter((p) => p !== provider)
        : [...prev.oauthProviders, provider],
    }));
  };

  const methodCheckboxes: { method: keyof typeof METHOD_STEPS; id: string }[] =
    [
      { method: "Email + password", id: "auth-method-email" },
      { method: "Magic link", id: "auth-method-magic-link" },
      { method: "Passkey", id: "auth-method-passkey" },
    ];

  const configCode = `<SignIn
  config={{
    allowMagicLink: ${config.allowMagicLink},
    allowPasskey: ${config.allowPasskey},
    oauthProviders: ${JSON.stringify(config.oauthProviders)},
  }}
  initialStep="${step}"
/>`;

  const active = activeMethod ?? "Email + password";

  return (
    <div className="not-prose space-y-6">
      {/* Configuration: checkboxes determine methods + providers */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Check the methods and providers your app offers. The preview and
            code update live.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm font-medium">Methods</p>
          {methodCheckboxes.map(({ method, id }) => {
            const enabled = methodEnabled(config, method);
            return (
              <div
                key={method}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={id}
                    checked={enabled}
                    onCheckedChange={() => toggleMethod(method)}
                  />
                  <Label htmlFor={id} className="text-sm font-normal">
                    {method}
                  </Label>
                </div>
                {!enabled && (
                  <span className="text-xs text-muted-foreground">off</span>
                )}
              </div>
            );
          })}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="auth-method-oauth"
                checked={config.oauthProviders.length > 0}
                onCheckedChange={() => {
                  if (config.oauthProviders.length > 0) {
                    setConfig((prev) => ({ ...prev, oauthProviders: [] }));
                  } else {
                    setConfig((prev) => ({
                      ...prev,
                      oauthProviders: ["google"],
                    }));
                  }
                }}
              />
              <Label
                htmlFor="auth-method-oauth"
                className="text-sm font-normal"
              >
                OAuth
              </Label>
            </div>
            {config.oauthProviders.length === 0 && (
              <span className="text-xs text-muted-foreground">off</span>
            )}
          </div>

          <div className="space-y-2 border-t border-border pt-3">
            <p className="text-sm font-medium">OAuth providers</p>
            {OAUTH_PROVIDERS.map((provider) => (
              <div key={provider} className="flex items-center gap-2">
                <Checkbox
                  id={`oauth-${provider}`}
                  checked={config.oauthProviders.includes(provider)}
                  onCheckedChange={() => toggleProvider(provider)}
                />
                <Label
                  htmlFor={`oauth-${provider}`}
                  className="text-sm font-normal"
                >
                  {provider}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Method switcher + live preview side-by-side on large screens */}
      <div className="flex min-w-0 flex-col gap-6 lg:flex-row">
        <Card className="w-full lg:w-72 lg:shrink-0">
          <CardHeader>
            <CardTitle>Sign-in methods</CardTitle>
            <CardDescription>
              Pick a method to preview it. Disabled methods are off in the
              config.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {(Object.keys(METHOD_STEPS) as (keyof typeof METHOD_STEPS)[]).map(
              (method) => {
                const enabled = methodEnabled(config, method);
                return (
                  <button
                    key={method}
                    type="button"
                    disabled={!enabled}
                    onClick={() => selectMethod(method)}
                    aria-pressed={active === method}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
                      active === method
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border bg-background text-foreground hover:bg-accent/40"
                    } ${!enabled ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    <span>{method}</span>
                    {!enabled && (
                      <span className="text-xs font-normal text-muted-foreground">
                        off
                      </span>
                    )}
                  </button>
                );
              },
            )}
          </CardContent>
        </Card>

        {/* Live preview */}
        <Card className="min-w-0 flex-1">
          <CardHeader>
            <CardTitle>Live preview</CardTitle>
            <CardDescription>
              Renders the {active} step from `config` alone, no backend
              required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ArcProvider client={client}>
              <SignIn
                config={config}
                step={step}
                onStepChange={(next) => setStep(next as AuthDemoStep)}
                slots={{
                  complete: <p className="text-sm text-success">Signed in!</p>,
                }}
              />
            </ArcProvider>
          </CardContent>
        </Card>
      </div>

      <CodeBlock code={configCode} title="SignIn config" />
    </div>
  );
}

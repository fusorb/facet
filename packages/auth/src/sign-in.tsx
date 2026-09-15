/**
 * SignIn: multi-step sign-in component with state machine.
 *
 * Orchestrates LoginForm, MagicLinkForm, and ForgotPasswordForm through
 * the auth step flow. Extracted forms are independently importable from
 * @fusorb/facet-auth.
 *
 * Steps: idle → check_session → login_form / magic_link_form / passkey_auth
 *        → check_mfa → mfa_challenge → complete
 *
 * The email/password form is the embedded default entry point; other
 * methods (magic link, passkey, OAuth) are offered as alternates on the
 * same card. `select_method` remains reachable as a fallback step.
 *
 * Controlled mode: pass `step` + `onStepChange` to render exactly a given
 * step and drive SignIn from outside (e.g. a live state-machine diagram).
 * When omitted, SignIn manages its own transitions.
 */

import * as React from "react";
import { AuthSdk, PasskeySdk } from "@fusorb/facet-sdk";
import type { LoginResult, TokenPair } from "@fusorb/facet-sdk";
import { useAuth } from "./provider.js";
import { defaultConfig } from "./types.js";
import type {
  AuthConfig,
  Appearance,
  ComponentSlots,
  SignInStep,
} from "./types.js";
import { LoginForm } from "./forms/auth/login-form.js";
import { MagicLinkForm } from "./forms/auth/magic-link-form.js";
import { ForgotPasswordForm } from "./forms/auth/forgot-password-form.js";
import { MfaVerifyForm } from "./forms/mfa/verify-form.js";

import {
  ShineButton,
  buttonVariants,
  cn,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Separator,
} from "@fusorb/facet-components";

/* ── Props ─────────────────────────────────────────────────── */

export interface SignInProps {
  appearance?: Appearance;
  config?: Partial<AuthConfig>;
  slots?: ComponentSlots;
  onSuccess?: (result: TokenPair) => void;
  /** Called when a user clicks an OAuth provider button. Receives the provider id (e.g. "google"). */
  onOAuth?: (provider: string) => void;
  /** Enable zod client-side validation on the email/password forms. Default: false */
  validate?: boolean;
  /**
   * Initial step to render. Defaults to "login_form" (the email/password
   * form with the other methods embedded below it). Set to "select_method"
   * to land on the method picker instead.
   */
  initialStep?: "select_method" | "login_form";
  /**
   * Controlled step. When set, SignIn renders exactly this step instead of
   * managing its own transition: `onStepChange` is called for every
   * internal transition. Use it to drive SignIn from outside (e.g. a live
   * state-machine diagram in the docs). When omitted, SignIn is
   * self-managed.
   */
  step?: SignInStep;
  /** Called whenever SignIn would change step (only when `step` is set). */
  onStepChange?: (step: SignInStep) => void;
  /** Override user-visible text strings. All keys fall back to English defaults. */
  copy?: Partial<SignInCopy>;
}

/* ── Copy ──────────────────────────────────────────────────── */

export interface SignInCopy {
  /** "Sign In" - card title in the method picker. */
  methodTitle: string;
  /** "Choose how to sign in to your account" - card description in the method picker. */
  methodDescription: string;
  /** "Continue with Email & Password" - email/password entry button. */
  emailPasswordLabel: string;
  /** "Continue with Magic Link" - magic link entry button. */
  magicLinkLabel: string;
  /** "Continue with Passkey" - passkey entry button. */
  passkeyLabel: string;
  /** "Sign in with {provider}" - OAuth button (uses {provider} token). */
  oauthButtonLabel: string;
  /** "Sign In Failed" - error card title. */
  errorTitle: string;
  /** "An unexpected error occurred" - fallback error description. */
  errorFallback: string;
  /** "Try Again" - error card retry button. */
  tryAgainLabel: string;
}

const defaultSignInCopy: SignInCopy = {
  methodTitle: "Sign In",
  methodDescription: "Choose how to sign in to your account",
  emailPasswordLabel: "Continue with Email & Password",
  magicLinkLabel: "Continue with Magic Link",
  passkeyLabel: "Continue with Passkey",
  oauthButtonLabel: "Sign in with {provider}",
  errorTitle: "Sign In Failed",
  errorFallback: "An unexpected error occurred",
  tryAgainLabel: "Try Again",
};

function SelectMethodStep({
  appearance,
  slots,
  cfg,
  onSelectMethod,
  handlePasskeyAuth,
  onOAuth,
  copy,
}: {
  appearance?: Appearance;
  slots?: ComponentSlots;
  cfg: AuthConfig;
  copy: SignInCopy;
  onSelectMethod: (step: SignInStep) => void;
  handlePasskeyAuth: () => void;
  onOAuth?: (provider: string) => void;
}) {
  return (
    <Card className={appearance?.className}>
      <CardHeader>
        {slots?.title ?? <CardTitle>{copy.methodTitle}</CardTitle>}
        {slots?.description ?? (
          <CardDescription>{copy.methodDescription}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ShineButton
          className={cn(buttonVariants({ variant: "default" }), "w-full")}
          onClick={() => onSelectMethod("login_form")}
        >
          {copy.emailPasswordLabel}
        </ShineButton>
        {cfg.allowMagicLink && (
          <ShineButton
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            onClick={() => onSelectMethod("magic_link_form")}
          >
            {copy.magicLinkLabel}
          </ShineButton>
        )}
        {cfg.allowPasskey && (
          <ShineButton
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            onClick={handlePasskeyAuth}
          >
            {copy.passkeyLabel}
          </ShineButton>
        )}
        {cfg.oauthProviders.length > 0 && (
          <>
            <Separator className="my-2" />
            {cfg.oauthProviders.map((provider) => (
              <ShineButton
                key={provider}
                className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                onClick={() => onOAuth?.(provider)}
              >
                {copy.oauthButtonLabel.replace("{provider}", provider)}
              </ShineButton>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ── SignIn orchestrator ───────────────────────────────────── */

export function SignIn({
  appearance,
  config: configOverrides,
  slots,
  onSuccess,
  onOAuth,
  validate = false,
  initialStep = "login_form",
  step: controlledStep,
  onStepChange,
  copy,
}: SignInProps) {
  const cfg = { ...defaultConfig, ...configOverrides };
  const c = { ...defaultSignInCopy, ...copy };
  const { login, verifyMfa, isAuthenticated, client } = useAuth();

  const authSdk = React.useMemo(() => new AuthSdk(client), [client]);
  const passkeySdk = React.useMemo(() => new PasskeySdk(client), [client]);

  const [step, setStep] = React.useState<SignInStep>(initialStep);
  const [error, setError] = React.useState<string | null>(null);

  // Controlled mode: when the consumer passes `step`, the component renders
  // that step and reports transitions via `onStepChange` instead of storing
  // its own state.
  const isControlled = controlledStep !== undefined;
  const activeStep = isControlled ? controlledStep : step;

  // Apply a step transition (internal state when uncontrolled, callback
  // when controlled).
  const go = React.useCallback(
    (next: SignInStep) => {
      if (isControlled) {
        onStepChange?.(next);
      } else {
        setStep(next);
      }
    },
    [isControlled, onStepChange],
  );

  // Form fields that persist across steps
  const [, setEmail] = React.useState("");
  const [sessionId, setSessionId] = React.useState<string | null>(null);

  /* ── Bootstrap ───────────────────────────────────────────── */

  React.useEffect(() => {
    if (isAuthenticated) {
      go("complete");
    }
  }, [isAuthenticated, go]);

  /* ── Handlers ────────────────────────────────────────────── */

  const handleEmailPasswordLogin = async (
    emailVal: string,
    password: string,
  ) => {
    setError(null);
    setEmail(emailVal);

    try {
      const res = await login({ email: emailVal, password });
      if (res.data) {
        const result = res.data as LoginResult;
        if (result.sessionId && !result.accessToken) {
          setSessionId(result.sessionId);
          go("mfa_challenge");
          return null;
        }
        go("complete");
        onSuccess?.(res.data as unknown as TokenPair);
        return null;
      }
      return res.error?.message ?? "Login failed";
    } catch (err) {
      return err instanceof Error ? err.message : "Unexpected error";
    }
  };

  const handleMagicLinkRequest = async (emailVal: string) => {
    setEmail(emailVal);
    // Magic link is initiated server-side; the form handles sent state
    return null;
  };

  const handleForgotPassword = () => {
    go("forgot_password");
  };

  const handleForgotPasswordSubmit = async (email: string) => {
    setError(null);
    const res = await authSdk.forgotPassword(email);
    return res.error?.message ?? null;
  };

  const handleMfaVerify = async (code: string) => {
    const sId = sessionId;
    if (!sId) {
      go("select_method");
      return;
    }
    const res = await verifyMfa(code, sId);
    if (res.data) {
      go("complete");
    } else {
      setError(res.error?.message ?? "Invalid code");
    }
  };

  const handlePasskeyAuth = async () => {
    setError(null);
    try {
      const optsRes = await passkeySdk.authenticationOptions();
      if (!optsRes.data) {
        setError(optsRes.error?.message ?? "Failed to initiate passkey auth");
        return;
      }

      const challengeId = optsRes.data.challengeId;
      const publicKey = optsRes.data
        .options as unknown as PublicKeyCredentialRequestOptions;

      // WebAuthn API: browser creates the assertion
      const credential = (await navigator.credentials.get({
        publicKey,
      })) as PublicKeyCredential | null;

      if (!credential) {
        setError("Passkey authentication cancelled");
        return;
      }

      const res = await passkeySdk.authenticate({
        response: {
          id: credential.id,
          rawId: Array.from(new Uint8Array(credential.rawId)),
          type: credential.type,
          response: {
            authenticatorData: Array.from(
              new Uint8Array(
                (credential.response as AuthenticatorAssertionResponse)
                  .authenticatorData,
              ),
            ),
            clientDataJSON: Array.from(
              new Uint8Array(
                (credential.response as AuthenticatorAssertionResponse)
                  .clientDataJSON,
              ),
            ),
            signature: Array.from(
              new Uint8Array(
                (credential.response as AuthenticatorAssertionResponse)
                  .signature,
              ),
            ),
            userHandle: (credential.response as AuthenticatorAssertionResponse)
              .userHandle
              ? Array.from(
                  new Uint8Array(
                    (credential.response as AuthenticatorAssertionResponse)
                      .userHandle!,
                  ),
                )
              : null,
          },
        },
        challengeId,
      });

      if (res.data) {
        go("complete");
        onSuccess?.(res.data as unknown as TokenPair);
      } else {
        setError(res.error?.message ?? "Passkey authentication failed");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Passkey authentication failed",
      );
    }
  };

  /* ── Root render ─────────────────────────────────────────── */

  switch (activeStep) {
    case "check_session":
    case "idle":
      return null;
    case "select_method":
      return (
        <SelectMethodStep
          appearance={appearance}
          slots={slots}
          cfg={cfg}
          copy={c}
          onSelectMethod={go}
          handlePasskeyAuth={handlePasskeyAuth}
          onOAuth={onOAuth}
        />
      );
    case "login_form":
      return (
        <div className="flex flex-col gap-3">
          <LoginForm
            appearance={appearance}
            onSubmit={handleEmailPasswordLogin}
            onBack={
              initialStep === "select_method"
                ? () => go("select_method")
                : undefined
            }
            onForgotPassword={handleForgotPassword}
            validate={validate}
          />
          {(cfg.allowMagicLink ||
            cfg.allowPasskey ||
            cfg.oauthProviders.length > 0) && (
            <div className="space-y-3">
              {cfg.allowMagicLink && (
                <ShineButton
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full",
                  )}
                  onClick={() => go("magic_link_form")}
                >
                  {c.magicLinkLabel}
                </ShineButton>
              )}
              {cfg.allowPasskey && (
                <ShineButton
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full",
                  )}
                  onClick={handlePasskeyAuth}
                >
                  {c.passkeyLabel}
                </ShineButton>
              )}
              {cfg.oauthProviders.length > 0 && (
                <>
                  <Separator className="my-2" />
                  {cfg.oauthProviders.map((provider) => (
                    <ShineButton
                      key={provider}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full",
                      )}
                      onClick={() => onOAuth?.(provider)}
                    >
                      {c.oauthButtonLabel.replace("{provider}", provider)}
                    </ShineButton>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      );
    case "magic_link_form":
      return (
        <MagicLinkForm
          appearance={appearance}
          onSubmit={handleMagicLinkRequest}
          onBack={() => go("select_method")}
          validate={validate}
        />
      );
    case "forgot_password":
      return (
        <ForgotPasswordForm
          appearance={appearance}
          onSubmit={handleForgotPasswordSubmit}
          onBack={() => go("login_form")}
          validate={validate}
        />
      );
    case "mfa_challenge":
      return (
        <Card className={appearance?.className}>
          <CardContent className="p-0">
            <MfaVerifyForm
              onVerify={handleMfaVerify}
              onCancel={() => go("select_method")}
              error={error ?? undefined}
            />
          </CardContent>
        </Card>
      );
    case "complete":
      return slots?.complete ?? null;
    case "error":
      return (
        <Card className={appearance?.className}>
          <CardHeader>
            <CardTitle>{c.errorTitle}</CardTitle>
            <CardDescription>{error ?? c.errorFallback}</CardDescription>
          </CardHeader>
          <CardContent>
            <ShineButton
              className={cn(buttonVariants({ variant: "default" }), "w-full")}
              onClick={() => go("select_method")}
            >
              {c.tryAgainLabel}
            </ShineButton>
          </CardContent>
        </Card>
      );
  }
}

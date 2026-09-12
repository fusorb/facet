/**
 * SignUp: registration form component.
 *
 * Calls the ArcProvider register action. Supports appearance overrides,
 * domain config, and slot overrides for title/description.
 */

import * as React from "react";
import { useAuth } from "./provider.js";
import { defaultConfig } from "./types.js";
import type { AuthConfig, Appearance, ComponentSlots, SignUpCopy } from "./types.js";
import { defaultSignUpCopy } from "./types.js";

import {
  Button,
  Input,
  Label,
  PasswordInput,
  PasswordStrengthMeter,
  AnimatedButton,
  type AnimatedButtonRenderProps,
  type AnimatedButtonVariant,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@fusorb/facet-components";

/* ── Props ─────────────────────────────────────────────────── */

export interface SignUpProps {
  appearance?: Appearance;
  config?: Partial<AuthConfig>;
  slots?: ComponentSlots;
  /** Override any form copy (labels, placeholders, buttons, errors). */
  copy?: SignUpCopy;
  /** Animated submit button options. Default animation: "shine". */
  submitButton?: {
    animation?: AnimatedButtonVariant;
    renderButton?: (props: AnimatedButtonRenderProps) => React.ReactNode;
  };
  /**
   * Show the live PasswordStrengthMeter under the password field.
   * Default: true (most apps want this signal on sign-up).
   */
  showPasswordStrength?: boolean;
  onSuccess?: () => void;
}

/* ── Component ─────────────────────────────────────────────── */

export function SignUp({
  appearance,
  config: configOverrides,
  slots,
  copy,
  submitButton,
  showPasswordStrength = true,
  onSuccess,
}: SignUpProps) {
  const cfg = { ...defaultConfig, ...configOverrides };
  const { register } = useAuth();
  const c = { ...defaultSignUpCopy, ...copy };

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(c.passwordMismatch ?? "Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError(c.passwordTooShort ?? "Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await register({ name, email, password });
      if (res.data) {
        onSuccess?.();
      } else {
        setError(res.error?.message ?? "Registration failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    }
    setIsSubmitting(false);
  };

  return (
    <Card className={appearance?.className}>
      <CardHeader>
        {slots?.title ?? <CardTitle>{c.title}</CardTitle>}
        {slots?.description ?? <CardDescription>{c.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="signup-name">{c.nameLabel}</Label>
            <Input
              id="signup-name"
              type="text"
              placeholder={c.namePlaceholder}
              autoComplete="name"
              required
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="signup-email">{c.emailLabel}</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder={c.emailPlaceholder}
              autoComplete="email"
              required
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="signup-password">{c.passwordLabel}</Label>
            <PasswordInput
              id="signup-password"
              placeholder={c.passwordPlaceholder}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
            {showPasswordStrength && <PasswordStrengthMeter value={password} />}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="signup-confirm">{c.confirmLabel}</Label>
            <PasswordInput
              id="signup-confirm"
              placeholder={c.confirmPlaceholder}
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setConfirmPassword(e.target.value)
              }
            />
          </div>
          {cfg.requireEmailVerification && (
            <p className="text-xs text-muted-foreground">
              You'll need to verify your email address after signing up.
            </p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <AnimatedButton
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            animation={submitButton?.animation ?? "shine"}
            renderButton={submitButton?.renderButton}
          >
            {isSubmitting ? c.submittingLabel : c.submitLabel}
          </AnimatedButton>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        {slots?.footer ?? (
          <span>
            {c.alreadyHaveAccount}{" "}
            <Button variant="link" className="h-auto p-0 text-sm">
              {c.signInLink}
            </Button>
          </span>
        )}
      </CardFooter>
    </Card>
  );
}

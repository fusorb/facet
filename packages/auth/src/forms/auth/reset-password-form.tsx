/**
 * ResetPasswordForm: new password input for password reset flow.
 *
 * Accepts a token (from the reset link) and new password, calls the
 * AuthSdk.resetPassword method. Designed to be embedded in apps that
 * handle the token extraction from URL search params.
 */

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "../../validators.js";
import type { Appearance, ResetPasswordCopy } from "../../types.js";
import { defaultResetPasswordCopy } from "../../types.js";

import {
  Button,
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

export interface ResetPasswordFormProps {
  appearance?: Appearance;
  /** Override any form copy (labels, placeholders, buttons). */
  copy?: ResetPasswordCopy;
  /** Animated submit button options. Default animation: "shine". */
  submitButton?: {
    animation?: AnimatedButtonVariant;
    renderButton?: (props: AnimatedButtonRenderProps) => React.ReactNode;
  };
  /** Reset token from the email link (extracted by the consuming app). */
  token: string;
  /** Called with token + new password. Return error string or null/undefined on success. */
  onSubmit: (token: string, newPassword: string) => Promise<string | null | undefined>;
  onSuccess?: () => void;
  onBack?: () => void;
  /** Enable zod client-side validation. Default: false */
  validate?: boolean;
  /**
   * Show the live PasswordStrengthMeter under the new-password field.
   * Default: true (most apps want this signal on reset).
   */
  showPasswordStrength?: boolean;
}

type ResetValues = { password: string; confirm: string };

/* ── Component ─────────────────────────────────────────────── */

export function ResetPasswordForm({
  appearance,
  copy,
  submitButton,
  token,
  onSubmit,
  onSuccess,
  onBack,
  validate = false,
  showPasswordStrength = true,
}: ResetPasswordFormProps) {
  const c = { ...defaultResetPasswordCopy, ...copy };
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetValues>({
    resolver: validate ? zodResolver(resetPasswordSchema) : undefined,
  });

  const runSubmit = async (values?: ResetValues) => {
    setError(null);

    if (!validate) {
      if (password !== confirm) {
        setError("Passwords do not match");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const err = await onSubmit(token, values?.password ?? password);
      if (err) {
        setError(err);
      } else {
        setDone(true);
        onSuccess?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    }
    setIsSubmitting(false);
  };

  const handleFormSubmit = validate
    ? handleSubmit((values) => runSubmit(values))
    : (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        return runSubmit();
      };

  const passwordError = validate ? errors.password?.message : undefined;
  const confirmError = validate ? errors.confirm?.message : undefined;

  const passwordFieldProps = validate
    ? register("password")
    : {
        value: password,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
      };

  const confirmFieldProps = validate
    ? register("confirm")
    : {
        value: confirm,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value),
      };

  if (done) {
    return (
      <Card className={appearance?.className}>
        <CardHeader>
          <CardTitle>{c.successTitle}</CardTitle>
          <CardDescription>{c.successDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {c.successBody}
          </p>
        </CardContent>
        {onBack && (
          <CardFooter className="justify-center">
            <Button variant="link" size="sm" onClick={onBack}>
              {c.backLabel}
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  }

  return (
    <Card className={appearance?.className}>
      <CardHeader>
        <CardTitle>{c.title}</CardTitle>
        <CardDescription>{c.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4" noValidate={validate}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reset-password">{c.passwordLabel}</Label>
            <PasswordInput
              id="reset-password"
              placeholder={c.passwordPlaceholder}
              autoComplete="new-password"
              required
              minLength={8}
              {...passwordFieldProps}
              aria-invalid={passwordError ? true : undefined}
            />
            {showPasswordStrength && <PasswordStrengthMeter value={password} />}
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reset-confirm">{c.confirmLabel}</Label>
            <PasswordInput
              id="reset-confirm"
              placeholder={c.confirmPlaceholder}
              autoComplete="new-password"
              required
              minLength={8}
              {...confirmFieldProps}
              aria-invalid={confirmError ? true : undefined}
            />
            {confirmError && <p className="text-sm text-destructive">{confirmError}</p>}
          </div>
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
      {onBack && (
        <CardFooter className="justify-center">
          <Button variant="link" size="sm" onClick={onBack}>
            {c.backLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

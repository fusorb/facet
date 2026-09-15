/**
 * LoginForm: email/password form with forgot-password link.
 *
 * Standalone form for direct use outside the SignIn state machine.
 */

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../validators.js";
import type { Appearance, LoginCopy } from "../../types.js";
import { defaultLoginCopy } from "../../types.js";

import {
  Button,
  Input,
  Label,
  PasswordInput,
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

export interface LoginFormProps {
  appearance?: Appearance;
  /** Override any form copy (labels, placeholders, buttons, links). */
  copy?: LoginCopy;
  /** Animated submit button options. Default animation: "shine". */
  submitButton?: {
    animation?: AnimatedButtonVariant;
    renderButton?: (props: AnimatedButtonRenderProps) => React.ReactNode;
  };
  /** Called with email + password. Return error string or null/undefined. */
  onSubmit: (
    email: string,
    password: string,
  ) => Promise<string | null | undefined>;
  /** Called when user clicks the back button */
  onBack?: () => void;
  /** Called when user clicks "Forgot password?" */
  onForgotPassword?: () => void;
  /** Enable zod client-side validation. Default: false */
  validate?: boolean;
}

type LoginValues = { email: string; password: string };

/* ── Component ─────────────────────────────────────────────── */

export function LoginForm({
  appearance,
  copy,
  submitButton,
  onSubmit,
  onBack,
  onForgotPassword,
  validate = false,
}: LoginFormProps) {
  const c = { ...defaultLoginCopy, ...copy };
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: validate ? zodResolver(loginSchema) : undefined,
  });

  const runSubmit = async (values?: LoginValues) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const err = await onSubmit(
        values?.email ?? email,
        values?.password ?? password,
      );
      if (err) setError(err);
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

  const emailError = validate ? errors.email?.message : undefined;
  const passwordError = validate ? errors.password?.message : undefined;

  const emailFieldProps = validate
    ? register("email")
    : {
        value: email,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          setEmail(e.target.value),
      };

  const passwordFieldProps = validate
    ? register("password")
    : {
        value: password,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          setPassword(e.target.value),
      };

  return (
    <Card className={appearance?.className}>
      <CardHeader>
        <CardTitle>{c.title}</CardTitle>
        <CardDescription>{c.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleFormSubmit}
          className="flex flex-col gap-4"
          noValidate={validate}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="signin-email">{c.emailLabel}</Label>
            <Input
              id="signin-email"
              type="email"
              placeholder={c.emailPlaceholder}
              autoComplete="email"
              required
              {...emailFieldProps}
              aria-invalid={emailError ? true : undefined}
            />
            {emailError && (
              <p className="text-sm text-destructive">{emailError}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="signin-password">{c.passwordLabel}</Label>
              {onForgotPassword && (
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-xs"
                  onClick={onForgotPassword}
                >
                  {c.forgotPassword}
                </Button>
              )}
            </div>
            <PasswordInput
              id="signin-password"
              placeholder={c.passwordPlaceholder}
              autoComplete="current-password"
              required
              {...passwordFieldProps}
              aria-invalid={passwordError ? true : undefined}
            />
            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
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

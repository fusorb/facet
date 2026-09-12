/**
 * ForgotPasswordForm: email input for password reset request.
 *
 * Currently the SignIn component has an empty stub for "Forgot password?".
 * This fills that gap with a proper form.
 */

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailOnlySchema } from "../../validators.js";
import type { Appearance } from "../../types.js";

import {
  ShineButton,
  buttonVariants,
  cn,
  Button,
  Input,
  Label,
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

export interface ForgotPasswordFormProps {
  appearance?: Appearance;
  /** Animated submit button options. Default animation: "shine". */
  submitButton?: {
    animation?: AnimatedButtonVariant;
    renderButton?: (props: AnimatedButtonRenderProps) => React.ReactNode;
  };
  /** Called with email. Return error string or null/undefined on success. */
  onSubmit: (email: string) => Promise<string | null | undefined>;
  onBack?: () => void;
  /** Enable zod client-side validation. Default: false */
  validate?: boolean;
}

type EmailValues = { email: string };

/* ── Component ─────────────────────────────────────────────── */

export function ForgotPasswordForm({
  appearance,
  submitButton,
  onSubmit,
  onBack,
  validate = false,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailValues>({
    resolver: validate ? zodResolver(emailOnlySchema) : undefined,
  });

  const runSubmit = async (values?: EmailValues) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const err = await onSubmit(values?.email ?? email);
      if (err) {
        setError(err);
      } else {
        setSent(true);
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

  const emailError = validate ? errors.email?.message : undefined;

  const emailFieldProps = validate
    ? register("email")
    : {
        value: email,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
      };

  if (sent) {
    return (
      <Card className={appearance?.className}>
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            If an account exists for <strong>{email}</strong>, we've sent a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ShineButton
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            onClick={() => setSent(false)}
          >
            Send again
          </ShineButton>
        </CardContent>
        {onBack && (
          <CardFooter className="justify-center">
            <Button variant="link" size="sm" onClick={onBack}>
              Back to sign in
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  }

  return (
    <Card className={appearance?.className}>
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Enter your email and we'll send you a reset link.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4" noValidate={validate}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="forgot-email">Email</Label>
            <Input
              id="forgot-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              {...emailFieldProps}
              aria-invalid={emailError ? true : undefined}
            />
            {emailError && <p className="text-sm text-destructive">{emailError}</p>}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <AnimatedButton
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            animation={submitButton?.animation ?? "shine"}
            renderButton={submitButton?.renderButton}
          >
            {isSubmitting ? "Sending…" : "Send Reset Link"}
          </AnimatedButton>
        </form>
      </CardContent>
      {onBack && (
        <CardFooter className="justify-center">
          <Button variant="link" size="sm" onClick={onBack}>
            Back to sign in
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

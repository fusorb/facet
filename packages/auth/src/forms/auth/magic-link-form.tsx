/**
 * MagicLinkForm: email input form for magic link sign-in.
 *
 * Handles sent/resent confirmation state.
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

export interface MagicLinkFormProps {
  appearance?: Appearance;
  /** Animated submit button options. Default animation: "shine". */
  submitButton?: {
    animation?: AnimatedButtonVariant;
    renderButton?: (props: AnimatedButtonRenderProps) => React.ReactNode;
  };
  /** Called with the email address. Return error string or null/undefined. */
  onSubmit: (email: string) => Promise<string | null | undefined>;
  onBack?: () => void;
  /** Enable zod client-side validation. Default: false */
  validate?: boolean;
}

type EmailValues = { email: string };

/* ── Component ─────────────────────────────────────────────── */

export function MagicLinkForm({
  appearance,
  submitButton,
  onSubmit,
  onBack,
  validate = false,
}: MagicLinkFormProps) {
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
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          setEmail(e.target.value),
      };

  if (sent) {
    return (
      <Card className={appearance?.className}>
        <CardHeader>
          <CardTitle>Magic Link</CardTitle>
          <CardDescription>
            Check your inbox for the sign-in link
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            We sent a link to <strong>{email}</strong>. Click it to sign in.
          </p>
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
              Back to sign-in options
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  }

  return (
    <Card className={appearance?.className}>
      <CardHeader>
        <CardTitle>Magic Link</CardTitle>
        <CardDescription>
          Enter your email to receive a sign-in link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleFormSubmit}
          className="flex flex-col gap-4"
          noValidate={validate}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="signin-ml-email">Email</Label>
            <Input
              id="signin-ml-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              {...emailFieldProps}
              aria-invalid={emailError ? true : undefined}
            />
            {emailError && (
              <p className="text-sm text-destructive">{emailError}</p>
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
            {isSubmitting ? "Sending…" : "Send Magic Link"}
          </AnimatedButton>
        </form>
      </CardContent>
      {onBack && (
        <CardFooter className="justify-center">
          <Button variant="link" size="sm" onClick={onBack}>
            Back to sign-in options
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

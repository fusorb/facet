/**
 * @fusorb/facet-components: OtpVerificationCard
 *
 * A ready-to-use one-time-password verification card: auto-focusing
 * OTP input, resend countdown, error state, and a submit action. Fully
 * customizable via `onVerify`, `onResend`, and `copy`.
 */

import * as React from "react";
import { cn } from "../utils.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card.js";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./input-otp.js";
import { Button } from "./button.js";
import { Icon, type IconName } from "../icon/index.js";
import { Spinner } from "./spinner.js";

export interface OtpVerificationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Called with the entered code when the user submits. */
  onVerify: (code: string) => Promise<void> | void;
  /** Optional resend handler. Omit to hide the resend row. */
  onResend?: () => Promise<void> | void;
  /** Number of OTP digits. Default: 6. */
  length?: number;
  /** Seconds to wait before resend re-enables. Default: 30. */
  resendCooldown?: number;
  /** Semantic icon in the header. Default: "mail". */
  icon?: IconName;
  /** Copy overrides (defaults are provided). */
  copy?: Partial<{
    title: string;
    description: string;
    label: string;
    placeholder: string;
    submit: string;
    submitting: string;
    resend: string;
    resendActive: string;
    error: string;
    success: string;
  }>;
  /** Render the submit button as anything (e.g. AnimatedButton). */
  submitButton?: (props: {
    children: React.ReactNode;
    type: "submit";
    disabled: boolean;
    className?: string;
  }) => React.ReactNode;
  /** Icon overrides for the status states. Every icon defaults to a sensible
   *  lucide glyph, and nothing here is hardcoded so consumers can theme them. */
  icons?: Partial<Record<"error" | "success" | "timer" | "resend", IconName>>;
}

/**
 * A self-contained OTP verification card. Handles input state, a resend
 * countdown, error/success messages, and calls `onVerify(code)` on
 * submit. Pass `onResend` to show the resend row.
 */
export function OtpVerificationCard({
  onVerify,
  onResend,
  length = 6,
  resendCooldown = 30,
  icon = "mail",
  icons = {},
  copy = {},
  submitButton,
  className,
  ...props
}: OtpVerificationCardProps) {
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(resendCooldown);
  const timer = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    if (cooldown <= 0) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    if (!timer.current) {
      timer.current = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onVerify(code);
      setSuccess(true);
    } catch {
      setError(copy.error ?? "That code did not match. Please try again.");
      setCode("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setCooldown(resendCooldown);
    if (onResend) await onResend();
  };

  const submit = submitButton ? (
    submitButton({
      children: copy.submit ?? "Verify code",
      type: "submit",
      disabled: submitting || code.length !== length,
      className: "w-full",
    })
  ) : (
    <Button
      type="submit"
      className="w-full"
      disabled={submitting || code.length !== length}
    >
      {submitting ? (
        <span className="inline-flex items-center gap-2">
          <Spinner className="size-4" />
          {copy.submitting ?? "Verifying..."}
        </span>
      ) : (
        (copy.submit ?? "Verify code")
      )}
    </Button>
  );

  return (
    <Card className={cn("w-full max-w-sm", className)} {...props}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name={icon} className="size-4 text-primary" />
          {copy.title ?? "Check your email"}
        </CardTitle>
        <CardDescription>
          {copy.description ??
            `We sent a ${length}-digit code. Enter it below to continue.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <div className="flex justify-center">
              <InputOTP
                value={code}
                onChange={(v) => {
                  setCode(v);
                  setError(null);
                }}
                maxLength={length}
                inputMode="numeric"
                pattern="[0-9]*"
                className="gap-2"
              >
                <InputOTPGroup>
                  {Array.from({ length }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            {error && (
              <p
                role="alert"
                className="flex items-center justify-center gap-1.5 text-center text-sm text-destructive"
              >
                <Icon
                  name={icons.error ?? "circle-alert"}
                  className="size-3.5"
                />
                {error}
              </p>
            )}
            {success && (
              <p className="flex items-center justify-center gap-1.5 text-center text-sm text-success">
                <Icon
                  name={icons.success ?? "circle-check"}
                  className="size-3.5"
                />
                {copy.success ?? "Code verified."}
              </p>
            )}
          </div>
          {submit}
        </form>
      </CardContent>
      {onResend && (
        <CardFooter className="flex items-center justify-center">
          {cooldown > 0 ? (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Icon name={icons.timer ?? "timer"} className="size-3.5" />
              {copy.resendActive ?? `Resend code in ${cooldown}s`}
            </p>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResend}
            >
              <Icon
                name={icons.resend ?? "rotate-ccw"}
                className="mr-1.5 size-3.5"
              />
              {copy.resend ?? "Resend code"}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

OtpVerificationCard.displayName = "OtpVerificationCard";

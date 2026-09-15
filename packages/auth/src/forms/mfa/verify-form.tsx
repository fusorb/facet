/**
 * MfaVerifyForm: OTP input for TOTP verification.
 *
 * Standalone form: manages its own OTP state, calls onVerify when
 * complete (6 digits entered).
 */

import * as React from "react";
import type { Appearance } from "../../types.js";

import {
  ShineButton,
  buttonVariants,
  cn,
  Button,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@fusorb/facet-components";

/* ── Props ─────────────────────────────────────────────────── */

export interface MfaVerifyFormProps {
  appearance?: Appearance;
  /** Called when 6-digit code is entered */
  onVerify: (code: string) => Promise<void>;
  /** Called when user clicks "Use a recovery code" */
  onRecovery?: () => void;
  /** Called when user cancels */
  onCancel?: () => void;
  error?: string;
  isSubmitting?: boolean;
}

/* ── Component ─────────────────────────────────────────────── */

export function MfaVerifyForm({
  onVerify,
  onRecovery,
  onCancel,
  error,
  isSubmitting = false,
}: MfaVerifyFormProps) {
  const [otp, setOtp] = React.useState("");

  return (
    <>
      <DialogHeader>
        <DialogTitle>Two-Factor Authentication</DialogTitle>
        <DialogDescription>
          Enter the code from your authenticator app.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center gap-4 py-4">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          onComplete={onVerify}
          disabled={isSubmitting}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <div className="flex flex-col gap-2">
        {onRecovery && (
          <ShineButton
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full",
            )}
            onClick={onRecovery}
          >
            Use a recovery code
          </ShineButton>
        )}
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    </>
  );
}

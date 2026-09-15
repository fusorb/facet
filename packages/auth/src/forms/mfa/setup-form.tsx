/**
 * MfaSetupForm: QR code + manual key display, then OTP confirmation.
 *
 * Two-phase form inside a single component:
 *   1. Show secret/URI for scanning
 *   2. Confirm by entering TOTP code
 *   3. Show recovery codes on success
 */

import type { MfaSetupResult } from "@fusorb/facet-sdk";
import type { Appearance } from "../../types.js";

import {
  Label,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  AnimatedButton,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@fusorb/facet-components";

/* ── Props ─────────────────────────────────────────────────── */

export interface MfaSetupFormProps {
  appearance?: Appearance;
  setupData: MfaSetupResult;
  onConfirm: (code: string) => Promise<void>;
  error?: string;
  isSubmitting?: boolean;
}

export interface MfaRecoveryCodesFormProps {
  appearance?: Appearance;
  codes: string[];
  onSaved: () => void;
}

/* ── Setup & Confirm ───────────────────────────────────────── */

export function MfaSetupForm({
  setupData,
  onConfirm,
  error,
  isSubmitting = false,
}: MfaSetupFormProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
        <DialogDescription>
          Scan this QR code with your authenticator app.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="rounded-lg border bg-muted p-4 text-center">
          <p className="font-mono text-xs break-all">{setupData.uri}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Or enter the key manually:{" "}
          <code className="rounded bg-muted px-1">{setupData.secret}</code>
        </p>
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor="mfa-setup-code">Enter the code from your app</Label>
          <InputOTP
            maxLength={6}
            onComplete={onConfirm}
            disabled={isSubmitting}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>
    </>
  );
}

/* ── Recovery Codes Display ────────────────────────────────── */

export function MfaRecoveryCodesForm({
  codes,
  onSaved,
}: MfaRecoveryCodesFormProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Recovery Codes</DialogTitle>
        <DialogDescription>
          Store these codes in a safe place. Each code can only be used once.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="grid w-full grid-cols-2 gap-2">
          {codes.map((code, i) => (
            <code
              key={i}
              className="rounded bg-muted px-2 py-1 text-center font-mono text-xs"
            >
              {code}
            </code>
          ))}
        </div>
        <AnimatedButton className="w-full" onClick={onSaved}>
          I've saved my codes
        </AnimatedButton>
      </div>
    </>
  );
}

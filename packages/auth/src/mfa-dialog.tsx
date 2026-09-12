/**
 * MfaDialog: MFA verification dialog with OTP input and recovery code fallback.
 *
 * Orchestrates MfaVerifyForm, MfaSetupForm, MfaRecoveryCodesForm, and
 * MfaRecoveryForm through the MFA phase flow. Extracted forms are
 * independently importable from @fusorb/facet-auth.
 *
 * Steps: verify → setup → confirm_setup → recovery_codes → recovery
 */

import * as React from "react";
import { AuthSdk } from "@fusorb/facet-sdk";
import type { ArcIdClient, MfaVerifyResult, MfaSetupResult } from "@fusorb/facet-sdk";
import { MfaVerifyForm } from "./forms/mfa/verify-form.js";
import { MfaSetupForm, MfaRecoveryCodesForm } from "./forms/mfa/setup-form.js";
import { MfaRecoveryForm } from "./forms/mfa/recovery-form.js";

import { Dialog, DialogContent } from "@fusorb/facet-components";
import type { Appearance } from "./types.js";

/* ── Props ─────────────────────────────────────────────────── */

export interface MfaDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  client: ArcIdClient;
  sessionId: string;
  onComplete: (result: MfaVerifyResult) => void;
  onCancel?: () => void;
  appearance?: Appearance;
}

/* ── Phases ────────────────────────────────────────────────── */

type MfaPhase =
  | { step: "verify"; error?: string }
  | { step: "setup"; data: MfaSetupResult }
  | { step: "confirm_setup"; data: MfaSetupResult; error?: string }
  | { step: "recovery_codes"; codes: string[] }
  | { step: "recovery"; error?: string };

/* ── Component ─────────────────────────────────────────────── */

export function MfaDialog({
  open,
  onOpenChange,
  client,
  sessionId,
  onComplete,
  onCancel,
  appearance,
}: MfaDialogProps) {
  const authSdk = React.useMemo(() => new AuthSdk(client), [client]);

  const [phase, setPhase] = React.useState<MfaPhase>({ step: "verify" });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setPhase({ step: "verify" });
      setIsSubmitting(false);
    }
  }, [open]);

  /* ── Handlers ────────────────────────────────────────────── */

  const handleVerify = async (code: string) => {
    setIsSubmitting(true);
    const res = await authSdk.verifyMfa(code, sessionId);
    if (res.data) {
      onComplete(res.data);
    } else {
      setPhase({ step: "verify", error: res.error?.message ?? "Invalid code" });
    }
    setIsSubmitting(false);
  };

  const handleConfirmSetup = async (code: string) => {
    setIsSubmitting(true);
    const res = await authSdk.confirmMfa(code);
    if (res.data) {
      setPhase({ step: "recovery_codes", codes: res.data.recoveryCodes });
    } else {
      const current = phase as { step: "setup" | "confirm_setup"; data: MfaSetupResult };
      setPhase({
        step: "confirm_setup",
        data: current.data,
        error: res.error?.message ?? "Invalid code",
      });
    }
    setIsSubmitting(false);
  };

  const handleRecovery = async (code: string) => {
    setIsSubmitting(true);
    const res = await authSdk.mfaRecovery(code, sessionId);
    if (res.data) {
      onComplete(res.data);
    } else {
      setPhase({
        step: "recovery",
        error: res.error?.message ?? "Invalid recovery code",
      });
    }
    setIsSubmitting(false);
  };

  /* ── Render by phase ─────────────────────────────────────── */

  const renderPhase = () => {
    switch (phase.step) {
      case "verify":
        return (
          <MfaVerifyForm
            appearance={appearance}
            onVerify={handleVerify}
            onRecovery={() => setPhase({ step: "recovery" })}
            onCancel={() => {
              onOpenChange?.(false);
              onCancel?.();
            }}
            error={phase.error}
            isSubmitting={isSubmitting}
          />
        );
      case "setup":
      case "confirm_setup": {
        return (
          <MfaSetupForm
            appearance={appearance}
            setupData={phase.data}
            onConfirm={handleConfirmSetup}
            error={phase.step === "confirm_setup" ? phase.error : undefined}
            isSubmitting={isSubmitting}
          />
        );
      }
      case "recovery_codes":
        return <MfaRecoveryCodesForm codes={phase.codes} onSaved={() => onOpenChange?.(false)} />;
      case "recovery":
        return (
          <MfaRecoveryForm
            onVerify={handleRecovery}
            onBack={() => setPhase({ step: "verify" })}
            error={phase.error}
            isSubmitting={isSubmitting}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={appearance?.className}>{renderPhase()}</DialogContent>
    </Dialog>
  );
}

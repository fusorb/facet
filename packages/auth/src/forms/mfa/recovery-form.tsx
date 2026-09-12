/**
 * MfaRecoveryForm: single recovery code input.
 */

import * as React from "react";

import { Button, ShineButton, buttonVariants, cn, Input, DialogHeader, DialogTitle, DialogDescription } from "@fusorb/facet-components";

/* ── Props ─────────────────────────────────────────────────── */

export interface MfaRecoveryFormProps {
  onVerify: (code: string) => Promise<void>;
  onBack?: () => void;
  error?: string;
  isSubmitting?: boolean;
}

/* ── Component ─────────────────────────────────────────────── */

export function MfaRecoveryForm({
  onVerify,
  onBack,
  error,
  isSubmitting = false,
}: MfaRecoveryFormProps) {
  const [recoveryCode, setRecoveryCode] = React.useState("");

  return (
    <>
      <DialogHeader>
        <DialogTitle>Recovery Code</DialogTitle>
        <DialogDescription>Enter one of your recovery codes to sign in.</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-4 py-4">
        <Input
          placeholder="XXXXX-XXXXX"
          value={recoveryCode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecoveryCode(e.target.value)}
          disabled={isSubmitting}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <ShineButton
          className={cn(buttonVariants({ variant: "default" }), "w-full")}
          disabled={!recoveryCode || isSubmitting}
          onClick={() => onVerify(recoveryCode)}
        >
          {isSubmitting ? "Verifying…" : "Verify"}
        </ShineButton>
        {onBack && (
          <Button variant="ghost" size="sm" className="w-full" onClick={onBack}>
            Back to authenticator code
          </Button>
        )}
      </div>
    </>
  );
}

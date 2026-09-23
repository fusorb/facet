/**
 * @fusorb/facet-components: TwoFactorSetupPanel
 *
 * A ready-to-use 2FA enrollment flow: scan the QR (or enter a manual
 * secret), confirm with a one-time code, then reveal recovery codes.
 * Fully customizable via props and `copy`. A stepper header keeps the
 * three steps legible on every breakpoint.
 *
 * Customization: appearance (className), configuration (secret/otpauth),
 * slots — `renderQRCode` replaces the QR rendering so consumers can swap
 * the QR library or layout without forking the verify/codes steps.
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
import { QRCode } from "./qrcode.js";
import { Input } from "./input.js";
import { Icon, type IconName } from "../icon/index.js";
import { Spinner } from "./spinner.js";

export interface TwoFactorSetupPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** otpauth:// URI for the QR code (or any string to encode). */
  otpauthUri: string;
  /** Manual entry secret (shown under the QR). */
  secret: string;
  /** Called when the user confirms a valid code. */
  onConfirm: (code: string) => Promise<void> | void;
  /** Called after confirmation to persist the recovery codes. */
  onRecoveryCodesSaved?: () => Promise<void> | void;
  /** Recovery codes to reveal after confirmation. */
  recoveryCodes?: string[];
  /** Replace the QR rendering (e.g. a different QR library). */
  renderQRCode?: (otpauthUri: string, secret: string) => React.ReactNode;
  /** Copy overrides. */
  copy?: Partial<{
    title: string;
    description: string;
    manualTitle: string;
    manualHint: string;
    confirmTitle: string;
    confirmHint: string;
    verify: string;
    verifying: string;
    back: string;
    codesTitle: string;
    codesHint: string;
    save: string;
    codesSaved: string;
    error: string;
  }>;
}

const STEP_META: {
  id: "scan" | "confirm" | "codes";
  icon: IconName;
  label: string;
}[] = [
  { id: "scan", icon: "qrcode", label: "Scan" },
  { id: "confirm", icon: "shield-check", label: "Verify" },
  { id: "codes", icon: "key-round", label: "Recovery" },
];

/**
 * A three-step 2FA enrollment panel: scan QR -> verify a code -> save
 * recovery codes. The steps advance automatically after a successful
 * `onConfirm`, and `onRecoveryCodesSaved` is called when the user clicks
 * "I saved my codes".
 */
export function TwoFactorSetupPanel({
  otpauthUri,
  secret,
  onConfirm,
  onRecoveryCodesSaved,
  recoveryCodes = [],
  renderQRCode,
  copy = {},
  className,
  ...props
}: TwoFactorSetupPanelProps) {
  const [step, setStep] = React.useState<"scan" | "confirm" | "codes">("scan");
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [verifying, setVerifying] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const activeIndex = STEP_META.findIndex((s) => s.id === step);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setVerifying(true);
    try {
      await onConfirm(code);
      setStep("codes");
    } catch {
      setError(copy.error ?? "That code was not accepted. Please try again.");
      setCode("");
    } finally {
      setVerifying(false);
    }
  };

  const handleSaved = async () => {
    setSaved(true);
    if (onRecoveryCodesSaved) await onRecoveryCodesSaved();
  };

  return (
    <Card className={cn("w-full max-w-md", className)} {...props}>
      <CardHeader>
        {/* Stepper */}
        <div
          className="mb-2 flex items-center gap-2"
          aria-label="Setup progress"
        >
          {STEP_META.map((s, i) => {
            const isActive = s.id === step;
            const isDone = i < activeIndex;
            return (
              <React.Fragment key={s.id}>
                {i > 0 && (
                  <div
                    className={cn(
                      "h-px flex-1",
                      isDone ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
                <div
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                    isActive && "bg-primary/10 text-primary",
                    isDone && "text-primary",
                    !isActive && !isDone && "text-muted-foreground",
                  )}
                >
                  <Icon name={isDone ? "check" : s.icon} className="size-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
        <CardTitle>
          {step === "codes"
            ? (copy.codesTitle ?? "Recovery codes")
            : (copy.title ?? "Set up two-factor authentication")}
        </CardTitle>
        <CardDescription>
          {step === "scan" &&
            (copy.description ??
              "Scan the QR code with your authenticator app, then enter the code it shows.")}
          {step === "confirm" &&
            (copy.confirmHint ??
              "Enter the 6-digit code from your authenticator app.")}
          {step === "codes" &&
            (copy.codesHint ??
              "Save these codes somewhere safe. Each code works once.")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {step === "scan" && (
          <>
            <div className="flex justify-center">
              {renderQRCode
                ? renderQRCode(otpauthUri, secret)
                : (
                  <QRCode
                    value={otpauthUri}
                    size={168}
                    className="rounded-md border border-border bg-background p-2"
                  />
                )}
            </div>
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Icon name="key-round" className="size-3.5" />
                {copy.manualTitle ?? "Can't scan? Enter this code manually."}
              </p>
              <Input
                readOnly
                value={secret}
                aria-label={copy.manualTitle ?? "Manual secret"}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                {copy.manualHint ??
                  "Keep it secret. Anyone with it can set up 2FA."}
              </p>
            </div>
            <Button className="w-full" onClick={() => setStep("confirm")}>
              <Icon name="shield-check" className="mr-1.5 size-4" />
              {copy.verify ?? "I've scanned it, continue"}
            </Button>
          </>
        )}
        {step === "confirm" && (
          <form onSubmit={handleVerify} className="space-y-4" noValidate>
            <div className="flex justify-center">
              <InputOTP
                value={code}
                onChange={(v) => {
                  setCode(v);
                  setError(null);
                }}
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                className="gap-2"
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
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
                <Icon name="circle-alert" className="size-3.5" />
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={verifying || code.length !== 6}
            >
              {verifying ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner className="size-4" />
                  {copy.verifying ?? "Verifying..."}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="shield-check" className="size-4" />
                  {copy.verify ?? "Verify and continue"}
                </span>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setStep("scan")}
            >
              {copy.back ?? "Back"}
            </Button>
          </form>
        )}
        {step === "codes" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {recoveryCodes.map((c) => (
                <code
                  key={c}
                  className="truncate rounded-md border border-border bg-muted/40 px-2 py-1.5 text-center font-mono text-sm"
                >
                  {c}
                </code>
              ))}
            </div>
            <Button className="w-full" onClick={handleSaved} disabled={saved}>
              {saved ? (
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="check" className="size-4" />
                  {copy.codesSaved ?? "Saved"}
                </span>
              ) : (
                (copy.save ?? "I saved my codes")
              )}
            </Button>
          </div>
        )}
      </CardContent>
      {step === "codes" && (
        <CardFooter className="text-xs text-muted-foreground">
          {copy.codesHint ?? "Recovery codes can only be used once each."}
        </CardFooter>
      )}
    </Card>
  );
}

TwoFactorSetupPanel.displayName = "TwoFactorSetupPanel";

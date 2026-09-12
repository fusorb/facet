/**
 * @fusorb/facet-components: ConsentCapture
 *
 * A scroll-to-accept legal consent surface. The submit button is blocked
 * until the consumer scrolls the document to the bottom and ticks the
 * consent checkbox. Optional signature capture (canvas drawing).
 *
 * Why: every ToS / privacy policy / EULA / KYC disclosure needs this.
 * Phase 1 roadmap item #3; arc-id's `TenantPolicy.requireLegalConsent`
 * uses it directly.
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Button } from "./button.js";
import { Checkbox } from "./checkbox.js";
import { Label } from "./label.js";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card.js";

/* ── Types ─────────────────────────────────────────────────── */

export interface ConsentCaptureProps {
  /** Document title. Default: "Legal agreement". */
  title?: string;
  /** Optional description shown above the scrollable body. */
  description?: string;
  /** The legal text (HTML or plain text). The body must be scrollable. */
  body: React.ReactNode;
  /** Label for the consent checkbox. */
  consentLabel?: React.ReactNode;
  /** Label for the submit button. */
  submitLabel?: string;
  /** Label for the reject button. */
  rejectLabel?: string;
  /** Show a signature canvas. Default: false. */
  requireSignature?: boolean;
  /** Placeholder / hint shown inside the signature pad. */
  signatureHint?: string;
  /** Called with the signature data URL when the user signs + accepts. */
  onSubmit?: (signature: string | undefined) => Promise<void> | void;
  /** Called when the user rejects. */
  onReject?: () => void;
  /** Require scroll-to-bottom before accept is allowed. Default: true. */
  requireScroll?: boolean;
  /** Require checkbox before accept is allowed. Default: true. */
  requireCheckbox?: boolean;
  /** Hint shown until the user scrolls to the bottom. */
  scrollHint?: string;
  /** Label for the signature clear button. */
  clearLabel?: string;
  /** Button text shown while submitting. */
  submittingLabel?: string;
  /** Extra className for the wrapper. */
  className?: string;
}

/* ── Helpers ───────────────────────────────────────────────── */

function readCanvasDataURL(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/png");
}

/* ── Component ─────────────────────────────────────────────── */

/**
 * A drop-in legal consent capture: scroll-to-bottom + checkbox +
 * optional signature pad + accept/reject. Hosts pass the legal body
 * (HTML or plain text) and an `onSubmit` handler that receives the
 * signature (if any) and runs the rest of the flow.
 */
export function ConsentCapture({
  title = "Legal agreement",
  description,
  body,
  consentLabel = "I have read and agree to the terms above.",
  submitLabel = "Accept",
  rejectLabel = "Decline",
  requireSignature = false,
  signatureHint = "Draw your signature with your mouse or finger.",
  onSubmit,
  onReject,
  requireScroll = true,
  requireCheckbox = true,
  scrollHint = "Scroll to the bottom to continue.",
  clearLabel = "Clear",
  submittingLabel = "Saving…",
  className,
}: ConsentCaptureProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [scrolledToEnd, setScrolledToEnd] = React.useState(!requireScroll);
  const [accepted, setAccepted] = React.useState(false);
  const [hasSignature, setHasSignature] = React.useState(!requireSignature);
  const [submitting, setSubmitting] = React.useState(false);

  // Track scroll position; mark as "scrolled to end" once the user hits
  // the bottom. Threshold is 24px to allow for subpixel rounding.
  const handleScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 24) {
      setScrolledToEnd(true);
    }
  }, []);

  // Reset scrolledToEnd if the body length changes (different content).
  React.useEffect(() => {
    if (!requireScroll) return;
    const el = scrollRef.current;
    if (!el) return;
    const fits = el.scrollHeight <= el.clientHeight + 1;
    if (fits) setScrolledToEnd(true);
    else setScrolledToEnd(false);
  }, [body, requireScroll]);

  // Wire up signature pad.
  React.useEffect(() => {
    if (!requireSignature) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset to a clean canvas.
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "var(--foreground)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    let drawing = false;
    let drew = false;

    const getPoint = (
      e: PointerEvent | React.PointerEvent<HTMLCanvasElement>,
    ): { x: number; y: number } => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) * canvas.width) / rect.width,
        y: ((e.clientY - rect.top) * canvas.height) / rect.height,
      };
    };

    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      drawing = true;
      const { x, y } = getPoint(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };
    const onMove = (e: PointerEvent) => {
      if (!drawing) return;
      const { x, y } = getPoint(e);
      ctx.lineTo(x, y);
      ctx.stroke();
      drew = true;
    };
    const onUp = (e: PointerEvent) => {
      drawing = false;
      canvas.releasePointerCapture(e.pointerId);
      if (drew) setHasSignature(true);
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [requireSignature]);

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const canSubmit =
    (!requireScroll || scrolledToEnd) &&
    (!requireCheckbox || accepted) &&
    (!requireSignature || hasSignature) &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      let signature: string | undefined;
      if (requireSignature && canvasRef.current) {
        signature = readCanvasDataURL(canvasRef.current);
      }
      await onSubmit?.(signature);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-72 overflow-y-scroll rounded-md border border-border bg-secondary/20 p-4 text-sm leading-relaxed"
        >
          {body}
        </div>

        {requireScroll && !scrolledToEnd && (
          <p className="text-xs text-muted-foreground">
            {scrollHint}
          </p>
        )}

        {requireSignature && (
          <div className="space-y-2">
            <div className="rounded-md border border-border bg-secondary/20 p-2">
              <canvas
                ref={canvasRef}
                width={600}
                height={140}
                className="block h-32 w-full touch-none cursor-crosshair rounded-sm bg-white"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{signatureHint}</span>
              <button
                type="button"
                className="text-primary underline-offset-2 hover:underline"
                onClick={handleClearSignature}
              >
                {clearLabel}
              </button>
            </div>
          </div>
        )}

        {requireCheckbox && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="consent-accept"
              checked={accepted}
              onCheckedChange={(c) => setAccepted(c === true)}
            />
            <Label htmlFor="consent-accept" className="cursor-pointer text-sm">
              {consentLabel}
            </Label>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-end gap-2">
        {onReject && (
          <Button variant="ghost" onClick={onReject} disabled={submitting}>
            {rejectLabel}
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}

ConsentCapture.displayName = "ConsentCapture";
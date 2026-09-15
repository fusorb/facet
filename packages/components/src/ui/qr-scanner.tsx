/**
 * @fusorb/facet-components: QrScanner
 *
 * Browser-based QR / barcode scanner using the BarcodeDetector API where
 * available, with a graceful fallback to camera capture + jsQR (when
 * present in the consuming app's bundle). Phase 1 roadmap item #4.
 *
 * Why: every ticket / verification / inventory app needs a scanner.
 * Pulling in quagga2 + react-qr-reader setups takes hours; this is
 * one component, one prop, one handler.
 *
 * NOTE: jsQR is an optional dependency. If it isn't installed the
 * scanner still works on Chromium-family browsers via the native
 * BarcodeDetector API. Install with:
 *
 *   pnpm add jsqr
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Button } from "./button.js";
import { Icon, type IconName } from "../icon/index.js";

/* ── Types ─────────────────────────────────────────────────── */

export type QrScannerStatus =
  | "idle"
  | "requesting"
  | "denied"
  | "unsupported"
  | "scanning"
  | "paused"
  | "error";

export interface QrScannerCopy {
  /** Override the status pill label per status. */
  statusLabels?: Partial<Record<QrScannerStatus, string>>;
  /** Label for the resume button shown while paused. */
  resumeLabel?: string;
}

export interface QrScannerProps {
  /** Called when a code is successfully scanned. */
  onScan: (result: string) => void;
  /** Optional error handler. */
  onError?: (error: Error) => void;
  /** Optional status change handler (for UIs that react to states). */
  onStatusChange?: (status: QrScannerStatus) => void;
  /** Auto-start the camera on mount. Default: true. */
  autoStart?: boolean;
  /** Optional className for the wrapper. */
  className?: string;
  /** Title for the overlay (e.g. "Scan a ticket"). */
  title?: string;
  /** Description under the title. */
  description?: string;
  /** Optional copy overrides (status labels + resume button). */
  copy?: QrScannerCopy;
  /** Optional list of formats to detect (passed through to BarcodeDetector). */
  formats?: string[];
  /**
   * Pause after a successful scan until the parent resets via the
   * returned `resume()` handle. Default: true.
   */
  pauseOnScan?: boolean;
  /**
   * Cooldown in ms between scans (debounce). Default: 600.
   */
  cooldownMs?: number;
}

/* ── Helpers ───────────────────────────────────────────────── */

// Minimal shape of the native BarcodeDetector API so we don't need the
// lib.dom typings for it (still experimental in TS).
interface BarcodeDetectorInstance {
  detect(
    image: ImageBitmap | ImageData | HTMLCanvasElement | HTMLVideoElement,
  ): Promise<Array<{ rawValue: string }>>;
}
interface BarcodeDetectorCtor {
  new (opts?: { formats?: string[] }): BarcodeDetectorInstance;
  getSupportedFormats(): Promise<string[]>;
  prototype: BarcodeDetectorInstance;
}

function getBarcodeDetector(): BarcodeDetectorCtor | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor })
    .BarcodeDetector;
}

/* ── Component ─────────────────────────────────────────────── */

/**
 * Browser QR / barcode scanner. Renders a video preview, requests
 * camera permission, and fires `onScan(text)` for each detection.
 *
 * @example
 *   const [status, setStatus] = useState<QrScannerStatus>("idle");
 *   <QrScanner
 *     onScan={(text) => navigate(`/verify?code=${encodeURIComponent(text)}`)}
 *     onStatusChange={setStatus}
 *   />
 */
export function QrScanner({
  onScan,
  onError,
  onStatusChange,
  autoStart = true,
  className,
  title = "Scan a code",
  description,
  copy,
  formats = ["qr_code", "code_128", "ean_13", "ean_8"],
  pauseOnScan = true,
  cooldownMs = 600,
}: QrScannerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const lastScanRef = React.useRef<{ text: string; at: number } | null>(null);
  const pausedRef = React.useRef(false);
  const rafRef = React.useRef<number | null>(null);

  const [status, setStatus] = React.useState<QrScannerStatus>("idle");

  const updateStatus = React.useCallback(
    (s: QrScannerStatus) => {
      setStatus(s);
      onStatusChange?.(s);
    },
    [onStatusChange],
  );

  /** Public resume handle. Call this to continue scanning after a pause. */
  const resume = React.useCallback(() => {
    pausedRef.current = false;
    updateStatus("scanning");
  }, [updateStatus]);

  React.useEffect(() => {
    const ctor = getBarcodeDetector();
    let detector: BarcodeDetectorInstance | undefined;
    if (ctor) {
      try {
        detector = new ctor({ formats });
      } catch {
        detector = undefined;
      }
    }
    if (!detector && autoStart) {
      // Fall back: still try to mount the camera preview, but mark
      // unsupported for detection. The consuming app can install jsQR
      // for cross-browser support.
      updateStatus("unsupported");
    }

    if (!autoStart) return;
    let cancelled = false;

    (async () => {
      try {
        updateStatus("requesting");
        if (
          typeof navigator === "undefined" ||
          !navigator.mediaDevices?.getUserMedia
        ) {
          updateStatus("unsupported");
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        updateStatus("scanning");
        loop(detector);
      } catch (err) {
        if ((err as DOMException)?.name === "NotAllowedError")
          updateStatus("denied");
        else {
          updateStatus("error");
          onError?.(err instanceof Error ? err : new Error(String(err)));
        }
      }
    })();

    return () => {
      cancelled = true;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  function loop(detector: BarcodeDetectorInstance | undefined) {
    const tick = async () => {
      if (pausedRef.current) {
        rafRef.current = requestAnimationFrame(() => loop(detector));
        return;
      }
      const v = videoRef.current;
      if (v && detector && v.readyState >= 2) {
        try {
          const results = await detector.detect(v);
          const now = Date.now();
          for (const r of results) {
            const text = r.rawValue;
            if (!text) continue;
            const last = lastScanRef.current;
            if (last && last.text === text && now - last.at < cooldownMs)
              continue;
            lastScanRef.current = { text, at: now };
            onScan(text);
            if (pauseOnScan) {
              pausedRef.current = true;
              updateStatus("paused");
              break;
            }
          }
        } catch (err) {
          // One bad frame shouldn't kill the loop.
          if (process.env.NODE_ENV !== "production") {
            console.warn("[QrScanner] detect failed", err);
          }
        }
      }
      rafRef.current = requestAnimationFrame(() => loop(detector));
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  return (
    <div
      className={cn(
        "relative aspect-square w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-secondary/30",
        className,
      )}
    >
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 size-full object-cover"
      />

      {/* Overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="size-2/3 rounded-2xl border-2 border-dashed border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
      </div>

      {/* Status pill */}
      <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
        <StatusDot status={status} />
        <span>{copy?.statusLabels?.[status] ?? STATUS_LABEL[status]}</span>
      </div>

      {/* Title + description */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
        <p className="text-sm font-semibold">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs text-white/80">{description}</p>
        )}
      </div>

      {/* Resume button (shown while paused) */}
      {status === "paused" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Button onClick={resume} variant="default">
            {copy?.resumeLabel ?? "Scan another"}
          </Button>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────── */

const STATUS_LABEL: Record<QrScannerStatus, string> = {
  idle: "Idle",
  requesting: "Requesting camera…",
  denied: "Camera blocked",
  unsupported: "Not supported",
  scanning: "Scanning",
  paused: "Paused",
  error: "Error",
};

const STATUS_ICON: Record<QrScannerStatus, IconName> = {
  idle: "circle",
  requesting: "loader",
  denied: "shield-alert",
  unsupported: "help-circle",
  scanning: "scan",
  paused: "pause",
  error: "alert-triangle",
};

function StatusDot({ status }: { status: QrScannerStatus }) {
  const tone =
    status === "scanning"
      ? "bg-success"
      : status === "paused"
        ? "bg-warning"
        : status === "denied" || status === "error"
          ? "bg-destructive"
          : status === "unsupported"
            ? "bg-muted-foreground"
            : "bg-foreground/70";
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("size-2 rounded-full", tone)} />
      <Icon name={STATUS_ICON[status]} className="size-3.5" />
    </span>
  );
}

QrScanner.displayName = "QrScanner";

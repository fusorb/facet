/**
 * QRCode: render a value as a scannable QR code.
 */
import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "../utils.js";

export type QRLogoPosition =
  "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface QRCodeProps {
  /** The value to encode. */
  value: string;
  /** Render size in pixels. Default: 160 */
  size?: number;
  /** Foreground color (any CSS color). Default: currentColor */
  fgColor?: string;
  /** Background color. Default: transparent */
  bgColor?: string;
  /** Include a quiet zone around the code. Default: true */
  includeMargin?: boolean;
  /** Error correction level. Default: "M" */
  level?: "L" | "M" | "Q" | "H";
  className?: string;
  /** Accessible label for the generated image. */
  label?: string;
  /** Optional logo image URL rendered over the QR code. */
  logo?: string;
  /** Accessible name for the logo image. Default: the logo URL. */
  logoAlt?: string;
  /** Logo size in pixels. Default: 40 */
  logoSize?: number;
  /** Logo position. Default: "center" */
  logoPosition?: QRLogoPosition;
}

/** Map a position to absolute CSS placement over the QR area (percent + translate). */
function positionStyle(
  position: QRLogoPosition,
  insetPct: number,
): React.CSSProperties {
  switch (position) {
    case "top-left":
      return {
        top: `${insetPct}%`,
        left: `${insetPct}%`,
        transform: "translate(0, 0)",
      };
    case "top-right":
      return {
        top: `${insetPct}%`,
        right: `${insetPct}%`,
        transform: "translate(0, 0)",
      };
    case "bottom-left":
      return {
        bottom: `${insetPct}%`,
        left: `${insetPct}%`,
        transform: "translate(0, 0)",
      };
    case "bottom-right":
      return {
        bottom: `${insetPct}%`,
        right: `${insetPct}%`,
        transform: "translate(0, 0)",
      };
    case "center":
    default:
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }
}

/**
 * A lightweight QR code renderer built on qrcode.react. Encodes any string
 * into a crisp SVG that inherits the current text color by default. Pass a
 * `logo` URL to overlay a brand mark (centered by default, or at a corner).
 *
 * The logo is rendered as an absolutely-positioned overlay on top of the QR
 * SVG (not via qrcode.react's imageSettings), so it is always pixel-perfect
 * centered or corner-placed regardless of the QR module count / scale. A
 * small padded backdrop behind the logo keeps the code scannable by clearing
 * the modules underneath (equivalent to "excavate").
 */
const QRCode = React.forwardRef<HTMLDivElement, QRCodeProps>(
  (
    {
      value,
      size = 160,
      fgColor = "currentColor",
      bgColor = "transparent",
      includeMargin = true,
      level = "M",
      className,
      label = "QR code",
      logo,
      logoAlt,
      logoSize = 40,
      logoPosition = "center",
    },
    ref,
  ) => {
    // Keep the logo inside the QR "quiet zone" for the corner positions.
    const insetPct = Math.max(8, Math.min(16, (logoSize / size) * 100 * 0.6));

    return (
      <div
        ref={ref}
        className={cn(
          "inline-block rounded-md border border-border bg-background text-foreground p-2",
          className,
        )}
      >
        <div className="relative" style={{ width: size, height: size }}>
          <QRCodeSVG
            value={value}
            size={size}
            fgColor={fgColor}
            bgColor={bgColor}
            includeMargin={includeMargin}
            level={level}
            aria-label={label}
            role="img"
            style={{ display: "block", width: size, height: size }}
          />
          {logo && (
            <div
              data-logo-overlay
              style={{
                position: "absolute",
                ...positionStyle(logoPosition, insetPct),
                width: logoSize,
                height: logoSize,
              }}
            >
              {/* Backdrop: pads the logo so the modules underneath are cleared,
                  keeping the code scannable. */}
              <div
                className="flex h-full w-full items-center justify-center rounded-full bg-background"
                style={{ boxShadow: "0 0 0 3px var(--background)" }}
              >
                <img
                  src={logo}
                  alt={logoAlt ?? logo}
                  width={logoSize}
                  height={logoSize}
                  className="dark:brightness-0 dark:invert"
                  style={{
                    width: logoSize,
                    height: logoSize,
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);
QRCode.displayName = "QRCode";

export { QRCode };

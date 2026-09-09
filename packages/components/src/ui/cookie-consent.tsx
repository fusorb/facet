/**
 * @arcevo/facet-components: CookieConsent
 *
 * A GDPR-style cookie consent banner with Accept / Decline and an
 * optional preferences disclosure. Persists the choice to localStorage.
 * Responsive: stacks on mobile, row on sm+.
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Button } from "./button.js";

export type CookieChoice = "accepted" | "declined" | null;

export interface CookieConsentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Called with the user's choice when they decide. */
  onDecision?: (choice: Exclude<CookieChoice, null>) => void;
  /** localStorage key. Default: "facet-cookie-consent". */
  storageKey?: string;
  /** Text for the accept button. Default: "Accept all". */
  acceptLabel?: string;
  /** Text for the decline button. Default: "Decline". */
  declineLabel?: string;
  /** Main banner message. Defaults to a built-in consent blurb. */
  message?: React.ReactNode;
  /** Extra text under the main message (optional disclosure). */
  details?: React.ReactNode;
  /** Position. Default: "bottom". */
  position?: "bottom" | "top";
  /** Force the banner to render even when a choice is already persisted
   *  (useful for docs/gallery previews that must always be visible).
   *  Default: false. */
  alwaysShow?: boolean;
}

/**
 * A GDPR-style consent banner. On mount it reads the persisted choice and
 * renders nothing if the visitor already decided. Accept/Decline persist
 * and call `onDecision`.
 */
export function CookieConsent({
  onDecision,
  storageKey = "facet-cookie-consent",
  acceptLabel = "Accept all",
  declineLabel = "Decline",
  message,
  details,
  position = "bottom",
  alwaysShow = false,
  className,
  ...props
}: CookieConsentProps) {
  const [choice, setChoice] = React.useState<CookieChoice>(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored === "accepted" || stored === "declined") setChoice(stored);
    } catch {
      // ignore
    }
    setLoaded(true);
  }, [storageKey]);

  const decide = (value: Exclude<CookieChoice, null>) => {
    setChoice(value);
    try {
      window.localStorage.setItem(storageKey, value);
    } catch {
      // ignore
    }
    onDecision?.(value);
  };

  if (!loaded || (!alwaysShow && choice !== null)) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 z-50 p-4",
        position === "bottom" ? "bottom-0" : "top-0",
        className,
      )}
      role="dialog"
      aria-label="Cookie consent"
      {...props}
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-xl border border-border bg-background p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2 text-sm text-muted-foreground">
          {message ?? (
            <p>
              We use cookies to improve your experience and analyze traffic. You can accept or
              decline them below.
            </p>
          )}
          {details && <div className="text-xs">{details}</div>}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" onClick={() => decide("declined")}>
            {declineLabel}
          </Button>
          <Button size="sm" onClick={() => decide("accepted")}>
            {acceptLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

CookieConsent.displayName = "CookieConsent";

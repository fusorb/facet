/**
 * @fusorb/facet-components: CookieBanner
 *
 * A top-bar cookie notice with three CTAs (Accept all, Reject
 * non-essential, Manage). Distinct from `CookieConsent` (which is a
 * bottom-sheet modal); this is the lighter-weight top-banner variant
 * that ships on first visit.
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Button } from "./button.js";
import { Icon } from "../icon/index.js";

/* ── Types ─────────────────────────────────────────────────── */

export interface CookieChoice {
  /** Whether essential (always-on) cookies are allowed. Default: true. */
  essential?: boolean;
  /** Whether analytics cookies are allowed. */
  analytics?: boolean;
  /** Whether marketing cookies are allowed. */
  marketing?: boolean;
  /** Whether personalization cookies are allowed. */
  personalization?: boolean;
}

export interface CookieBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Called with the user's cookie preferences. */
  onChoose: (choice: CookieChoice) => void;
  /** Banner message (HTML). */
  message?: React.ReactNode;
  /** Learn-more link target. */
  learnMoreHref?: string;
  /** Persisted key (localStorage). Default: "facet.cookie-banner". */
  storageKey?: string;
  /** Position. Default: "bottom". */
  position?: "top" | "bottom";
  /** Override user-visible labels. All keys fall back to English defaults. */
  labels?: Partial<{
    accept: string;
    reject: string;
    manage: string;
    cancel: string;
    savePreferences: string;
    learnMore: string;
  }>;
  /** Override cookie category labels (keys: "essential", "analytics", "marketing", "personalization"). */
  categoryLabels?: Partial<Record<string, string>>;
  /** Override cookie category hint text. */
  categoryHints?: Partial<Record<string, string>>;
}

/* ── Helpers ───────────────────────────────────────────────── */

const ACCEPT_ALL: CookieChoice = {
  essential: true,
  analytics: true,
  marketing: true,
  personalization: true,
};
const REJECT_NON_ESSENTIAL: CookieChoice = {
  essential: true,
  analytics: false,
  marketing: false,
  personalization: false,
};

const defaultLabels: NonNullable<NonNullable<CookieBannerProps["labels"]>> = {
  accept: "Accept all",
  reject: "Reject",
  manage: "Manage",
  cancel: "Cancel",
  savePreferences: "Save preferences",
  learnMore: "Learn more",
};

/* ── Component ─────────────────────────────────────────────── */

/**
 * A drop-in cookie notice banner. Shows until the user makes a choice,
 * then persists the choice in localStorage under `storageKey` so it
 * doesn't reappear on subsequent visits.
 */
export function CookieBanner({
  onChoose,
  message,
  learnMoreHref,
  storageKey = "facet.cookie-banner",
  labels,
  categoryLabels,
  categoryHints,
  className,
  position = "bottom",
  ...props
}: CookieBannerProps) {
  const l = { ...defaultLabels, ...labels };
  const [visible, setVisible] = React.useState(false);
  const [manageOpen, setManageOpen] = React.useState(false);
  const [prefs, setPrefs] = React.useState<CookieChoice>(REJECT_NON_ESSENTIAL);

  // Show only if the storage key is unset.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [storageKey]);

  const persist = (choice: CookieChoice) => {
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ choice, at: new Date().toISOString() }),
      );
    } catch {
      // localStorage may be unavailable (private mode); fall through.
    }
    onChoose(choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className={cn(
        "fixed inset-x-0 z-50 px-3 py-3 sm:px-6 sm:py-4",
        position === "top" ? "top-0" : "bottom-0",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 rounded-xl border border-border bg-popover p-4 shadow-lg sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-start gap-3">
          <Icon name="cookie" className="mt-0.5 size-5 text-amber-500" />
          <div className="text-sm text-foreground">
            {message ?? (
              <>
                We use cookies to improve your experience.{" "}
                {learnMoreHref && (
                  <a
                    href={learnMoreHref}
                    className="font-medium text-primary underline-offset-2 hover:underline"
                  >
                    {l.learnMore}
                  </a>
                )}
                .
              </>
            )}
          </div>
        </div>

        {manageOpen ? (
          <div className="flex w-full flex-col gap-2 text-xs sm:w-auto">
            <Toggle
              label={categoryLabels?.essential ?? "Essential"}
              checked
              disabled
              hint={categoryHints?.essential ?? "Required for the app to work."}
            />
            <Toggle
              label={categoryLabels?.analytics ?? "Analytics"}
              checked={!!prefs.analytics}
              onChange={(v) => setPrefs({ ...prefs, analytics: v })}
            />
            <Toggle
              label={categoryLabels?.marketing ?? "Marketing"}
              checked={!!prefs.marketing}
              onChange={(v) => setPrefs({ ...prefs, marketing: v })}
            />
            <Toggle
              label={categoryLabels?.personalization ?? "Personalization"}
              checked={!!prefs.personalization}
              onChange={(v) => setPrefs({ ...prefs, personalization: v })}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:ml-auto">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setManageOpen(true)}
            >
              {l.manage}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => persist(REJECT_NON_ESSENTIAL)}
            >
              {l.reject}
            </Button>
            <Button size="sm" onClick={() => persist(ACCEPT_ALL)}>
              {l.accept}
            </Button>
          </div>
        )}

        {manageOpen && (
          <div className="flex items-center gap-2 sm:ml-auto">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setManageOpen(false)}
            >
              {l.cancel}
            </Button>
            <Button size="sm" onClick={() => persist(prefs)}>
              {l.savePreferences}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub: preferences toggle ───────────────────────────────── */

function Toggle({
  label,
  checked,
  onChange,
  disabled,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <label
      className={cn(
        "flex items-center justify-between gap-2 rounded-md border border-border px-2 py-1.5",
        disabled && "opacity-60",
      )}
    >
      <span className="flex flex-col">
        <span className="font-medium">{label}</span>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="size-4 accent-primary"
      />
    </label>
  );
}

CookieBanner.displayName = "CookieBanner";
/**
 * @fusorb/facet-components: AnnouncementBar
 *
 * A dismissible top announcement banner, persisted in localStorage by
 * default so it only shows once per visitor. Fully customizable.
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Icon } from "../icon/index.js";

export interface AnnouncementBarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** localStorage key for dismissal persistence. Default: "facet-announcement-dismissed". */
  storageKey?: string;
  /** Show a close button. Default: true. */
  dismissible?: boolean;
  /** Callback when dismissed. */
  onDismiss?: () => void;
  /** Background classes. Default: "bg-primary text-primary-foreground". */
  className?: string;
}

/**
 * A slim, dismissible announcement bar pinned to the top of the page.
 * Dismissal persists to localStorage (per storageKey) so the banner only
 * reappears for a new visitor or when the key changes.
 */
export function AnnouncementBar({
  children,
  storageKey = "facet-announcement-dismissed",
  dismissible = true,
  onDismiss,
  className,
  ...props
}: AnnouncementBarProps) {
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.localStorage.getItem(storageKey) === "1") setDismissed(true);
    } catch {
      // localStorage unavailable (private mode): ignore.
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch {
      // ignore
    }
    onDismiss?.();
  };

  if (dismissed) return null;

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center gap-3 px-4 py-2 text-center text-sm font-medium sm:px-6",
        className ?? "bg-primary text-primary-foreground",
      )}
      role="region"
      aria-label="Announcement"
      {...props}
    >
      <div className="flex-1 text-balance">{children}</div>
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="shrink-0 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name="x" className="size-4" />
        </button>
      )}
    </div>
  );
}

AnnouncementBar.displayName = "AnnouncementBar";

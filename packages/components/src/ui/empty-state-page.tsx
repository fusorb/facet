/**
 * @fusorb/facet-components: EmptyStatePage
 *
 * A full-page "you don't have any X yet" surface with optional
 * illustration slot, primary + secondary CTA, and a description slot.
 * Distinct from `EmptyState` (which is inline / inline-block sized).
 *
 * Why: every list / table / dashboard starts empty. A full-page
 * treatment with a CTA is the most-clicked UI in onboarding flows.
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Button, type ButtonProps } from "./button.js";
import { Icon, type IconName } from "../icon/index.js";

/* ── Types ─────────────────────────────────────────────────── */

export interface EmptyStatePageCTA {
  /** Button label. */
  label: string;
  /** Click handler. */
  onClick?: () => void;
  /** href for an anchor button. */
  href?: string;
  /** Visual variant. */
  variant?: ButtonProps["variant"];
  /** Optional icon. */
  icon?: IconName;
}

export interface EmptyStatePageProps {
  /** Page heading. */
  title: string;
  /** One-line description. */
  description?: string;
  /** Optional icon (lucide name) shown above the title. */
  icon?: IconName;
  /** Optional custom illustration node (rendered in place of `icon`). */
  illustration?: React.ReactNode;
  /** Primary call-to-action. */
  primaryAction?: EmptyStatePageCTA;
  /** Secondary call-to-action. */
  secondaryAction?: EmptyStatePageCTA;
  /** Below-the-fold content (e.g. a quick-start guide, links, docs). */
  children?: React.ReactNode;
  /** Layout density. */
  size?: "default" | "compact";
  /** Center the content horizontally. Default: true. */
  centered?: boolean;
  /** Background variant. */
  surface?: "card" | "transparent";
  /** Extra className for the wrapper. */
  className?: string;
}

/* ── Component ─────────────────────────────────────────────── */

/**
 * Drop-in full-page empty state. Pick an icon (or render an illustration),
 * write a title + description, and add one or two CTAs.
 *
 * @example
 *   <EmptyStatePage
 *     icon="inbox"
 *     title="No projects yet"
 *     description="Create your first project to get started."
 *     primaryAction={{ label: "New project", onClick: () => setOpen(true) }}
 *     secondaryAction={{ label: "Read the docs", href: "/docs" }}
 *   />
 */
export function EmptyStatePage({
  title,
  description,
  icon,
  illustration,
  primaryAction,
  secondaryAction,
  children,
  size = "default",
  centered = true,
  surface = "card",
  className,
}: EmptyStatePageProps) {
  const isCompact = size === "compact";

  return (
    <section
      role="status"
      aria-live="polite"
      className={cn(
        "flex w-full flex-col items-stretch",
        centered && "mx-auto",
        surface === "card" &&
          "rounded-2xl border border-border bg-card/30 px-6 py-12 sm:px-10 sm:py-16",
        isCompact ? "max-w-md" : "max-w-2xl",
        centered ? "text-center" : "text-left",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-full",
          centered ? "flex-col items-center" : "flex-col items-start",
          isCompact ? "gap-3" : "gap-5",
        )}
      >
        {illustration ? (
          <div className="text-muted-foreground">{illustration}</div>
        ) : icon ? (
          <div
            aria-hidden
            className={cn(
              "flex items-center justify-center rounded-2xl border border-border bg-secondary/40 text-muted-foreground",
              isCompact ? "size-12" : "size-16",
            )}
          >
            <Icon name={icon} className={isCompact ? "size-5" : "size-7"} />
          </div>
        ) : null}

        <div className="space-y-1.5">
          <h2
            className={cn(
              "font-semibold tracking-tight",
              isCompact ? "text-lg" : "text-2xl",
            )}
          >
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {(primaryAction || secondaryAction) && (
          <div
            className={cn(
              "flex flex-wrap items-center gap-2",
              centered && "justify-center",
            )}
          >
            {primaryAction && <CTA action={primaryAction} />}
            {secondaryAction && <CTA action={secondaryAction} />}
          </div>
        )}

        {children && (
          <div
            className={cn(
              "mt-2 w-full border-t border-border pt-6 text-left text-sm text-muted-foreground",
              centered && "mx-auto max-w-prose",
            )}
          >
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Sub: CTA button (href → <a>, else <button>) ───────────── */

function CTA({ action }: { action: EmptyStatePageCTA }) {
  const { label, onClick, href, variant, icon } = action;
  const cls = "gap-2";

  const content = (
    <>
      {icon && <Icon name={icon} className="size-4" />}
      {label}
    </>
  );

  if (href) {
    return (
      <Button asChild variant={variant ?? "default"} className={cls}>
        <a href={href}>{content}</a>
      </Button>
    );
  }
  return (
    <Button onClick={onClick} variant={variant ?? "default"} className={cls}>
      {content}
    </Button>
  );
}

EmptyStatePage.displayName = "EmptyStatePage";
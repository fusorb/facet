/**
 * @fusorb/facet-components: SecuritySectionCard
 *
 * A ready-to-use security features grid: each item is a clickable card
 * with an icon, title, and description. Great as the landing surface of
 * a security area (2FA, passkeys, sessions, audit log...). Data-driven.
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Card, CardHeader, CardTitle, CardDescription } from "./card.js";
import { Icon, type IconName } from "../icon/index.js";

export interface SecurityFeature {
  /** Unique id. */
  id: string;
  title: string;
  description: string;
  /** Semantic icon shown at the top of the card. */
  icon?: IconName;
  /** Optional status badge text (e.g. "Enabled"). */
  badge?: string;
}

export interface SecuritySectionCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  features: SecurityFeature[];
  /** Called when a feature card is clicked. */
  onSelect?: (feature: SecurityFeature) => void;
  /** Grid columns on sm+. Default: 2. */
  columns?: 1 | 2 | 3;
}

/**
 * A responsive grid of security feature cards. Each card is a link-style
 * surface: hover lifts the border, and clicking calls `onSelect`.
 */
export function SecuritySectionCard({
  features,
  onSelect,
  columns = 2,
  className,
  ...props
}: SecuritySectionCardProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
      {...props}
    >
      {features.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onSelect?.(f)}
          className="group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
        >
          <Card className="h-full transition-colors group-hover:border-primary/50">
            <CardHeader>
              {f.icon && (
                <span className="mb-2 inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon name={f.icon} className="size-5" />
                </span>
              )}
              <CardTitle className="text-base">{f.title}</CardTitle>
              <CardDescription>{f.description}</CardDescription>
              {f.badge && (
                <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  <Icon name="badge-check" className="size-3.5" />
                  {f.badge}
                </span>
              )}
            </CardHeader>
          </Card>
        </button>
      ))}
    </div>
  );
}

SecuritySectionCard.displayName = "SecuritySectionCard";

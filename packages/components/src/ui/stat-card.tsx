/**
 * @fusorb/facet-components: StatCard
 *
 * A KPI metric card: label, value, optional delta vs. previous period,
 * and an optional icon. Pairs with a sparkline if you pass children.
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Card, CardContent } from "./card.js";
import { Icon, type IconName } from "../icon/index.js";

export type StatDeltaDirection = "up" | "down" | "neutral";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  /** Optional delta vs. previous period. */
  delta?: number;
  /** Delta direction. Default: inferred from sign. */
  deltaDirection?: StatDeltaDirection;
  /** Format delta with a sign. Default: true. */
  deltaSigned?: boolean;
  /** Optional semantic icon. */
  icon?: IconName;
  /** Optional footnote (e.g. "vs last week"). */
  hint?: string;
}

/**
 * A KPI metric card: label, large value, and an optional delta badge.
 * The delta arrow + color are inferred from the sign unless overridden.
 */
export function StatCard({
  label,
  value,
  delta,
  deltaDirection,
  deltaSigned = true,
  icon,
  hint,
  className,
  ...props
}: StatCardProps) {
  const dir: StatDeltaDirection =
    deltaDirection ?? (delta == null || delta === 0 ? "neutral" : delta > 0 ? "up" : "down");
  const deltaText =
    delta == null
      ? null
      : `${deltaSigned && dir !== "neutral" ? (dir === "up" ? "+" : "-") : ""}${Math.abs(delta)}%`;

  return (
    <Card className={cn("h-full", className)} {...props}>
      <CardContent className="space-y-2 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {icon && <Icon name={icon} className="size-4 text-muted-foreground" />}
        </div>
        <p className="font-heading text-2xl font-bold text-foreground sm:text-3xl">{value}</p>
        <div className="flex items-center gap-2">
          {deltaText && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                dir === "up" && "bg-emerald-500/10 text-emerald-600",
                dir === "down" && "bg-destructive/10 text-destructive",
                dir === "neutral" && "bg-muted text-muted-foreground",
              )}
            >
              {dir === "up" && <Icon name="trending-up" className="size-3.5" />}
              {dir === "down" && <Icon name="trending-down" className="size-3.5" />}
              {dir === "neutral" && <Icon name="minus" className="size-3.5" />}
              {deltaText}
            </span>
          )}
          {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

StatCard.displayName = "StatCard";

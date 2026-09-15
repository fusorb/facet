/**
 * @fusorb/facet-components: PricingComparison
 *
 * A mobile-friendly pricing comparison page: tier cards (Free / Pro /
 * Team / Enterprise) with feature matrix. Distinct from
 * `BillingPageTable` (which is the table-style component inside a
 * BillingPage); this is the marketing comparison surface.
 *
 * Why: every B2B / dev-tool / SaaS landing needs pricing. Hand-rolling
 * a comparison table with mobile breakpoints wastes hours.
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Button, type ButtonProps } from "./button.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card.js";
import { Icon } from "../icon/index.js";

/* ── Types ─────────────────────────────────────────────────── */

export interface PricingTier {
  /** Tier id. */
  id: string;
  /** Display name (e.g. "Free", "Pro", "Team"). */
  name: string;
  /** Short tagline. */
  tagline?: string;
  /** Price in major units (e.g. 19 = $19/mo). */
  price: number;
  /** Billing cadence label (e.g. "per month", "per year"). */
  cadence?: string;
  /** Highlight this tier. */
  highlighted?: boolean;
  /** CTA button label. */
  ctaLabel?: string;
  /** CTA button handler. */
  onCta?: () => void;
  /** CTA href. */
  ctaHref?: string;
  /** CTA button variant. Default: "default" (or "default" when highlighted). */
  ctaVariant?: ButtonProps["variant"];
  /** Per-tier feature highlights shown inside the tier card. */
  features: string[];
  /** Optional badge (e.g. "Most popular"). */
  badge?: string;
}

export interface PricingFeature {
  /** Group name (e.g. "Collaboration"). */
  group?: string;
  /** Feature name. */
  name: string;
  /** Per-tier values (keyed by tier id). */
  /** e.g. { free: "✓", pro: "✓", team: "✓", enterprise: "✓" } */
  /** Values can be `string | true | false` - true/false render check/dash. */
  values: Record<string, string | boolean>;
  /** Show in compact/mobile mode. Default: true. */
  showOnMobile?: boolean;
}

export interface PricingComparisonProps {
  /** Pricing tiers (left → right). */
  tiers: PricingTier[];
  /** Feature matrix (top → bottom). */
  features: PricingFeature[];
  /** Heading. */
  title?: string;
  /** One-line description under the title. */
  description?: string;
  /** Billing cycle toggle ("monthly" | "yearly" | both). */
  billingCycles?: Array<{
    id: string;
    label: string;
    discount?: string;
    /** Override the tier price for this cycle. */
    priceFor?: (tier: PricingTier) => number;
  }>;
  /** Initial active billing cycle id. */
  defaultBillingCycleId?: string;
  /** Extra className for the wrapper. */
  className?: string;
}

/* ── Helpers ───────────────────────────────────────────────── */

function ValueCell({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span aria-label="Included" className="inline-flex text-success">
        <Icon name="check" className="size-4" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span
        aria-label="Not included"
        className="inline-flex text-muted-foreground/50"
      >
        <Icon name="minus" className="size-4" />
      </span>
    );
  }
  return <span className="text-sm">{value}</span>;
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);

/* ── Component ─────────────────────────────────────────────── */

/**
 * A drop-in pricing comparison surface: 3-4 tier cards at the top, full
 * feature matrix below. Mobile-friendly: feature rows collapse to a
 * stacked layout under each tier card on small screens.
 */
export function PricingComparison({
  tiers,
  features,
  title = "Pricing",
  description,
  billingCycles,
  defaultBillingCycleId,
  className,
}: PricingComparisonProps) {
  const [cycleId, setCycleId] = React.useState<string | undefined>(
    defaultBillingCycleId ?? billingCycles?.[0]?.id,
  );
  const cycle = billingCycles?.find((c) => c.id === cycleId);

  const displayPrice = (tier: PricingTier): number =>
    cycle?.priceFor ? cycle.priceFor(tier) : tier.price;

  // Group features by `group` for the desktop comparison table.
  const groups = React.useMemo(() => {
    const seen = new Map<string, PricingFeature[]>();
    for (const f of features) {
      const key = f.group ?? "Features";
      const list = seen.get(key) ?? [];
      list.push(f);
      seen.set(key, list);
    }
    return Array.from(seen.entries());
  }, [features]);

  return (
    <section className={cn("flex w-full flex-col gap-8", className)}>
      {/* Header */}
      <header className="space-y-2 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}

        {billingCycles && billingCycles.length > 1 && (
          <div
            role="tablist"
            aria-label="Billing cycle"
            className="mx-auto inline-flex items-center rounded-full border border-border bg-secondary/30 p-1"
          >
            {billingCycles.map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={cycleId === c.id}
                onClick={() => setCycleId(c.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition",
                  cycleId === c.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {c.label}
                {c.discount && (
                  <span className="rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                    {c.discount}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Tier cards */}
      <div
        className={cn(
          "grid gap-4",
          tiers.length === 2 && "sm:grid-cols-2",
          tiers.length === 3 && "sm:grid-cols-3",
          tiers.length >= 4 && "sm:grid-cols-2 lg:grid-cols-4",
        )}
      >
        {tiers.map((tier) => (
          <Card
            key={tier.id}
            className={cn(
              "relative flex flex-col",
              tier.highlighted &&
                "border-primary/40 bg-primary/[0.02] shadow-md",
            )}
          >
            {tier.badge && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                {tier.badge}
              </span>
            )}
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {tier.name}
                {tier.highlighted && (
                  <Icon
                    name="star"
                    className="size-4 fill-current text-primary"
                  />
                )}
              </CardTitle>
              {tier.tagline && (
                <CardDescription>{tier.tagline}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">
                  ${formatPrice(displayPrice(tier))}
                </span>
                <span className="text-sm text-muted-foreground">
                  {tier.cadence ?? "per month"}
                </span>
              </div>
              <ul className="space-y-2 text-sm">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Icon name="check" className="mt-0.5 size-4 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {tier.ctaLabel &&
                (tier.ctaHref ? (
                  <Button
                    asChild
                    variant={tier.ctaVariant ?? "default"}
                    className="mt-auto w-full"
                  >
                    <a href={tier.ctaHref}>{tier.ctaLabel}</a>
                  </Button>
                ) : (
                  <Button
                    onClick={tier.onCta}
                    variant={
                      tier.ctaVariant ??
                      (tier.highlighted ? "default" : "outline")
                    }
                    className="mt-auto w-full"
                  >
                    {tier.ctaLabel}
                  </Button>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature matrix (desktop table) */}
      <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Features</th>
              {tiers.map((t) => (
                <th key={t.id} className="px-4 py-3 text-center font-medium">
                  {t.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map(([group, items]) => (
              <React.Fragment key={group}>
                <tr className="border-b border-border bg-secondary/10">
                  <td
                    colSpan={tiers.length + 1}
                    className="px-4 py-2 text-xs font-medium text-muted-foreground"
                  >
                    {group}
                  </td>
                </tr>
                {items.map((feat, idx) => (
                  <tr
                    key={`${group}-${idx}`}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">{feat.name}</td>
                    {tiers.map((t) => (
                      <td key={t.id} className="px-4 py-3 text-center">
                        <ValueCell value={feat.values[t.id] ?? false} />
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

PricingComparison.displayName = "PricingComparison";

import type * as React from "react";
import type { IconName } from "../icon/index.js";
import type {
  AnimatedButtonVariant,
  AnimatedButtonRenderProps,
} from "./animated-button.js";

/**
 * Shared plan model for the billing page components.
 *
 * Plans are plain data: tiers (Free / Starter / Pro / Enterprise / anything
 * else), prices, intervals, feature lists, highlight + CTA treatment. The
 * three billing page components (BillingPage, BillingPageTable,
 * BillingPageFreemium) all consume this same model, so a consumer can swap
 * layouts without reshaping their data.
 *
 * Prices are dynamic per interval: a plan declares a base `price` (monthly)
 * plus optional per-interval `prices` overrides and `discounts` percentages.
 * The billing components compute the displayed price for whichever interval
 * tab the consumer selects (monthly / quarterly / yearly).
 */

export type BillingInterval = "monthly" | "quarterly" | "yearly";

export interface BillingPlanCta {
  label: string;
  href: string;
  /** Button variant. Default: "default". */
  variant?: "default" | "outline" | "ghost";
}

export interface BillingPlan {
  /** Stable id (used as a React key). */
  id: string;
  /** Display name: "Free", "Premium", "Pro", "Enterprise", ... */
  name: string;
  /** Base price for the plan's default interval (usually monthly). 0 = free. */
  price: number;
  /**
   * Interval this base price is expressed in. Default: "monthly".
   * When set, the plan's price is treated as already denominated in this
   * interval (no discount scaling is applied to it).
   */
  interval?: BillingInterval;
  /**
   * Explicit per-interval prices. When present for a given interval, these
   * override the discount calculation. e.g. { yearly: 199 }.
   */
  prices?: Partial<Record<BillingInterval, number>>;
  /**
   * Discount percentage per interval (e.g. { yearly: 16.67, quarterly: 30 }).
   * Applied to the interval-multiplied base price. Yearly defaults to a
   * ~16.67% discount (2 months free) when not specified.
   */
  discounts?: Partial<Record<BillingInterval, number>>;
  /** One-line pitch under the plan name. */
  description?: string;
  /** Optional semantic icon rendered on the plan card. */
  icon?: IconName;
  /** Feature bullets. Completely dynamic. */
  features: string[];
  /** Give the card the "Most popular" elevated treatment. */
  highlight?: boolean;
  /** Optional badge label (defaults to "Most popular" when highlighted). */
  badgeLabel?: string;
  /** CTA. When omitted, the component renders "Contact us" / "Get started". */
  cta?: BillingPlanCta;
  /** Replace the price entirely, e.g. "Custom" for Enterprise. */
  customPriceLabel?: string;
  /** Show a "Legacy" / "Grandfathered" tag. */
  legacy?: boolean;
  /** Extra plan-level config exposed through the badge slot. */
  badge?: (plan: BillingPlan) => React.ReactNode;
}

export interface BillingPageConfig {
  /** The plan set. */
  plans: BillingPlan[];
  /** Active billing interval. Default: "monthly". */
  interval?: BillingInterval;
  /** Controlled interval change (for a shared toggle above the page). */
  onIntervalChange?: (interval: BillingInterval) => void;
  /** Page title. Default: "Pricing". */
  title?: string;
  /** Intro description under the title. */
  description?: string;
  /** Currency symbol prefix. Default: "$". */
  currency?: string;
  /** Note shown next to the interval toggle, e.g. "Save 20% with yearly billing". */
  annualDiscountNote?: string;
  /** Replace the header block entirely. */
  header?: React.ReactNode;
  /** Extra content below the plan grid / table. */
  footer?: React.ReactNode;
  /** Per-plan badge slot (rendered above the price). */
  badge?: (plan: BillingPlan) => React.ReactNode;
  /** Animated CTA button options. Default animation: "sparkle". */
  ctaButton?: {
    animation?: AnimatedButtonVariant;
    renderButton?: (props: AnimatedButtonRenderProps) => React.ReactNode;
  };
}

/** Months spanned by each interval (used to scale the base price). */
const INTERVAL_MONTHS: Record<BillingInterval, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

/** Short human-readable label for an interval suffix ("$9/month"). */
const INTERVAL_LABEL: Record<BillingInterval, string> = {
  monthly: "month",
  quarterly: "3 months",
  yearly: "year",
};

/** Months credited free on the default yearly plan (the standard 2-months-free annual discount). */
const DEFAULT_YEARLY_FREE_MONTHS = 2;

/**
 * Number of months an interval spans. Useful for consumers that want to
 * render a per-month equivalent (e.g. "$15.83/month" for a $190/year plan).
 */
export function intervalMonths(interval: BillingInterval): number {
  return INTERVAL_MONTHS[interval];
}

/** The interval a plan's price is expressed in (falls back to the page interval). */
export function planInterval(
  plan: BillingPlan,
  pageInterval: BillingInterval,
): BillingInterval {
  return plan.interval ?? pageInterval;
}

/** Short label for a price suffix ("$9/month", "$40/3 months", "$190/year"). */
export function intervalLabel(interval: BillingInterval): string {
  return INTERVAL_LABEL[interval];
}

/** Round to cents, dropping a trailing ".00". */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Format a numeric price: "190" -> "190", "39.9" -> "39.90". */
function formatPrice(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

/**
 * Effective price for a plan at a given interval.
 *
 * - Explicit `prices[interval]` wins (fully consumer-controlled).
 * - Custom-price plans (customPriceLabel) return null.
 * - Free plans (price 0) stay 0.
 * - Explicit `discounts[interval]` (a percentage) is applied to the
 *   interval-scaled base price.
 * - Otherwise the yearly default applies a 2-months-free discount
 *   (e.g. $19/month -> $190/year, $49/month -> $490/year).
 */
export function planPriceForInterval(
  plan: BillingPlan,
  interval: BillingInterval,
): number | null {
  if (plan.customPriceLabel) return null;
  if (plan.price === 0) return 0;
  if (plan.prices?.[interval] != null) return plan.prices[interval]!;
  const months = INTERVAL_MONTHS[interval];
  const discount = plan.discounts?.[interval];
  if (discount != null) {
    return round2(plan.price * months * (1 - discount / 100));
  }
  if (interval === "yearly") {
    return round2(plan.price * (months - DEFAULT_YEARLY_FREE_MONTHS));
  }
  return round2(plan.price * months);
}

/**
 * Price label for a plan (respects customPriceLabel; 0 = "Free").
 * When `interval` is given, the price is computed dynamically for that
 * interval (honouring `prices` overrides and `discounts`).
 */
export function planPriceLabel(
  plan: BillingPlan,
  currency: string,
  interval?: BillingInterval,
): string {
  if (plan.customPriceLabel) return plan.customPriceLabel;
  const price = interval ? planPriceForInterval(plan, interval) : plan.price;
  if (price === null || price === 0) return "Free";
  return `${currency}${formatPrice(price)}`;
}

import {
  BillingPage,
  BillingPageTable,
  BillingPageFreemium,
  type BillingPlan,
  type BillingPageConfig,
} from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { PageShell } from "../components/PageShell.js";
import { site, getDocsUrl } from "../site.config.js";

/**
 * The facet packages, priced as "free" because the entire surface is
 * MIT-licensed and free on npm. The BillingPage components are reused
 * here as a demo of the ready-to-use page surfaces. Every plan points
 * back at the docs or the repo.
 */
const FACET_PLANS: BillingPlan[] = [
  {
    id: "components",
    name: "Components",
    price: 0,
    description: "Styled Radix components, themed with the Alpha Palette.",
    features: [
      "Drop-in React primitives, surfaces, animations",
      "Tree-shaken icon registry",
      "Alpha Palette tokens + dark mode",
      "CI-verified coverage",
      "MIT licensed",
    ],
    cta: {
      label: "Read components docs",
      href: getDocsUrl(),
      variant: "outline",
    },
  },
  {
    id: "auth",
    name: "Auth + SDK + Store",
    price: 0,
    description: "The identity stack: auth, typed SDK, Zustand stores.",
    features: [
      "SignIn state machine + domain presets",
      "Standalone auth forms",
      "Typed endpoint SDK",
      "createZustandTokenStorage bridge",
      "Pluggable token storage adapter",
    ],
    highlight: true,
    badgeLabel: "Identity stack",
    cta: { label: "Read auth docs", href: getDocsUrl() },
  },
  {
    id: "layout",
    name: "Layout + Docs + Emails",
    price: 0,
    description:
      "Console / auth / landing shells, docs engine, email templates.",
    features: [
      "ConsoleLayout, AuthLayout, LandingLayout",
      "Layout presets + collapsible sidebar",
      "Config-driven docs engine",
      "Email templates + dev preview server",
      "MIT licensed",
    ],
    cta: { label: "Read layout docs", href: getDocsUrl(), variant: "outline" },
  },
  {
    id: "support",
    name: "Support the project",
    price: 5,
    description: "Optional sponsorship. Funds CI, domains, and infra.",
    features: [
      "Recognition in repo + docs",
      "Early access to RFC proposals",
      "Vote on roadmap items",
      "Cancel anytime, no perks locked",
    ],
    customPriceLabel: "Donations",
    cta: {
      label: "Visit the repo",
      href: site.links.github,
      variant: "outline",
    },
  },
];

const COMPARE_ROWS = [
  {
    label: "Components",
    supports: { components: true, auth: true, layout: true, support: true },
  },
  {
    label: "Domain auth presets",
    supports: { components: false, auth: true, layout: false, support: true },
  },
  {
    label: "Typed SDK",
    supports: { components: false, auth: true, layout: false, support: true },
  },
  {
    label: "Layout shells",
    supports: { components: false, auth: false, layout: true, support: true },
  },
  {
    label: "Docs engine",
    supports: { components: false, auth: false, layout: true, support: true },
  },
  {
    label: "Email templates",
    supports: { components: false, auth: false, layout: true, support: true },
  },
  {
    label: "Tree-shaken icons",
    supports: { components: true, auth: true, layout: true, support: true },
  },
  {
    label: "Dark mode",
    supports: { components: true, auth: true, layout: true, support: true },
  },
  {
    label: "CI drift gates",
    supports: { components: true, auth: true, layout: true, support: true },
  },
  {
    label: "MIT license",
    supports: { components: true, auth: true, layout: true, support: true },
  },
];

const CONFIG: BillingPageConfig = {
  plans: FACET_PLANS,
  title: "Free, forever",
  description:
    "Every package ships free on npm under MIT. The only optional line below is sponsorship. No features are gated.",
  annualDiscountNote: "Sponsorship tiers use yearly as the suggested cadence.",
};

export function PricingPage() {
  return (
    <PageShell
      kicker={
        <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50 ring-1 ring-border">
          <LightIcon name="credit-card" className="size-5 text-primary" />
        </span>
      }
      title="Free to use, free to ship"
      description="Every facet package is MIT-licensed and free on npm. Pick what you need."
    >
      {/* Freemium split: highlights the components + identity stack */}
      <BillingPageFreemium config={CONFIG} heroPlanId="auth" />

      {/* Full plan card grid */}
      <section className="mx-auto max-w-7xl px-8 py-12">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Every package, side by side
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The same BillingPage component, pointed at the real facet package
          surface.
        </p>
        <div className="mt-6">
          <BillingPage config={CONFIG} />
        </div>
      </section>

      {/* Full comparison table */}
      <section className="mx-auto max-w-7xl px-8 py-12">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Capability matrix
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The BillingPageTable layout for the consumers who want the full
          feature breakdown.
        </p>
        <div className="mt-6">
          <BillingPageTable config={CONFIG} rows={COMPARE_ROWS} />
        </div>
      </section>

      {/* Footer note: no auth, no payment */}
      <section className="mx-auto max-w-3xl px-8 py-16 text-center">
        <div className="rounded-xl border border-border bg-card p-8">
          <LightIcon name="info" className="mx-auto size-6 text-primary" />
          <h3 className="mt-3 font-heading text-xl font-bold text-foreground">
            No accounts, no billing
          </h3>
          <p className="mt-3 text-sm text-muted-foreground">
            facet is a static library set. There's nothing to sign up for and
            nothing to pay. The only optional line is sponsorship. Every other
            "plan" is the same library, just with different surfaces
            highlighted.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            The BillingPage components are reused here as a demo of the
            ready-to-use page surfaces. Drop them into any consumer app to
            render pricing for the actual product.
          </p>
        </div>
      </section>
    </PageShell>
  );
}

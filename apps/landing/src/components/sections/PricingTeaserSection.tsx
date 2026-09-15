import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Pill,
  buttonVariants,
  cn,
  Separator,
} from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { SITE_PACKAGES } from "../../data/site-data.generated.js";

interface TeaserTier {
  id: string;
  name: string;
  price: string;
  description: string;
  bullets: string[];
  highlight?: boolean;
  badge?: string;
}

const TIERS: TeaserTier[] = [
  {
    id: "oss",
    name: "Open source",
    price: "Free",
    description: "Every package, MIT-licensed. npm-install, ship.",
    bullets: [
      `All ${SITE_PACKAGES.length} packages on npm`,
      "MIT license",
      "Community-driven",
    ],
  },
  {
    id: "components",
    name: "Components",
    price: "Free",
    description: "Styled Radix components, themed with the Alpha Palette.",
    bullets: ["Drop-in ready", "Tree-shaken icons", "CI-verified coverage"],
    highlight: true,
    badge: "Most useful",
  },
  {
    id: "auth",
    name: "Auth + SDK",
    price: "Free",
    description: "Domain-customizable auth + a typed SovGrant SDK + store.",
    bullets: [
      "State machine + presets",
      "Endpoints audited",
      "Plug-in storage",
    ],
  },
];

/**
 * Pricing teaser that links to the dedicated /pricing page. Three-card
 * grid highlighting the components tier. Every tier is free.
 */
export function PricingTeaserSection() {
  return (
    <section id="pricing-teaser" className="mx-auto max-w-7xl px-8 py-24">
      <div className="mb-12 text-center">
        <Pill
          color="primary"
          indicator="icon"
          icon={<LightIcon name="credit-card" size={12} />}
        >
          Free, forever
        </Pill>
        <h2 className="mt-4 font-heading text-3xl font-bold text-foreground sm:text-4xl">
          Everything ships free, MIT-licensed
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Components, auth, layout, SDK, store, tokens, docs, emails, CLI. All
          on npm, all free. Pick the pieces you need.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {TIERS.map((tier) => (
          <Card
            key={tier.id}
            className={cn(
              "relative flex h-full flex-col",
              tier.highlight && "border-primary/60 shadow-lg shadow-primary/10",
            )}
          >
            {tier.badge && (
              <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                {tier.badge}
              </span>
            )}
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                {tier.name}
              </CardTitle>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <div className="mb-4">
                <span className="font-heading text-3xl font-bold text-foreground">
                  {tier.price}
                </span>
              </div>
              <Separator className="mb-4" />
              <ul className="space-y-2 text-sm text-muted-foreground">
                {tier.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <LightIcon
                      name="check"
                      size={14}
                      className="mt-1 text-success"
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                <Link
                  to="/pricing"
                  className={cn(
                    buttonVariants({
                      variant: tier.highlight ? "default" : "outline",
                      size: "default",
                    }),
                    "w-full",
                  )}
                >
                  See all packages
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/pricing"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          See the full pricing breakdown
          <LightIcon name="arrow-right" size={14} />
        </Link>
      </div>
    </section>
  );
}

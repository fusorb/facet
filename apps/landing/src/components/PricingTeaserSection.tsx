import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  buttonVariants,
  cn,
  Separator,
} from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";

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
    bullets: ["All 9 packages on npm", "MIT license", "Community Discord"],
  },
  {
    id: "components",
    name: "Components",
    price: "Free",
    description: "113 styled Radix components, themed with the Alpha Palette.",
    bullets: ["Drop-in ready", "Tree-shaken icons", "CI-verified coverage"],
    highlight: true,
    badge: "Most useful",
  },
  {
    id: "auth",
    name: "Auth + SDK",
    price: "Free",
    description: "Domain-customizable auth + a typed arc-id SDK + store.",
    bullets: ["State machine + presets", "62 endpoints audited", "Plug-in storage"],
  },
];

/**
 * Pricing teaser that links to the dedicated /pricing page. Three-card
 * grid highlighting the components tier. Every tier is free - facet is
 * open source end to end.
 */
export function PricingTeaserSection() {
  return (
    <section id="pricing-teaser" className="mx-auto max-w-7xl px-8 py-24">
      <div className="mb-12 text-center">
        <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
          <LightIcon name="credit-card" size={12} className="mr-1.5" />
          Free, forever
        </Badge>
        <h2 className="text-3xl font-bold text-foreground font-heading sm:text-4xl">
          Everything ships free, MIT-licensed
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Components, auth, layout, SDK, store, tokens, docs, emails, CLI -
          all on npm, all free. Pick the pieces you need.
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
              <CardTitle className="font-heading text-xl">{tier.name}</CardTitle>
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
                    <LightIcon name="check" size={14} className="mt-1 text-primary" />
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
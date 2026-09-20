import { Pill } from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { useDomain } from "../../lib/domain-context.js";

/** Feature grid: calm hover-lift cards (no reveal/glow motion).
 *  Every label, icon, and feature text flows from the active DomainContent. */
export function FeaturesSection() {
  const { domain } = useDomain();
  const { featuresSection, features } = domain;

  return (
    <section id="features" className="mx-auto max-w-7xl px-8 py-24">
      <div className="mb-12 text-center">
        <Pill
          color="primary"
          indicator="icon"
          icon={<LightIcon name={featuresSection.labelIcon} size={12} />}
        >
          {featuresSection.label}
        </Pill>
        <h2 className="mt-4 font-heading text-3xl font-bold text-foreground sm:text-4xl">
          {featuresSection.title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          {featuresSection.subtitle}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="h-full rounded-xl border border-border/60 bg-card p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
          >
            <LightIcon name={f.icon} className="size-5 text-primary" />
            <h3 className="mt-3 font-heading font-semibold text-foreground">
              {f.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

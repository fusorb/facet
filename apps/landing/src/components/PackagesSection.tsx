import { PACKAGES } from "../data/features.js";
import { LightIcon } from "@fusorb/facet-components/light";

export function PackagesSection() {
  return (
    <section id="packages" className="mx-auto max-w-7xl px-8 py-24">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold text-foreground font-heading sm:text-4xl">
          Nine packages, one system
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Install the pieces you need. Each package is versioned and published to npm.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.name}
            className="glass-card rounded-xl p-6 transition-all hover:translate-y-[-2px]"
          >
            <div className="flex items-center justify-between gap-3">
              <LightIcon name={pkg.icon} className="size-6 text-primary" />
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {pkg.version}
              </span>
            </div>
            <h3 className="mt-4 font-mono text-sm font-semibold text-foreground">{pkg.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{pkg.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

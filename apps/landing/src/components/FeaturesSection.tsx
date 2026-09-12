import { FEATURES } from "../data/features.js";
import { LightIcon } from "@fusorb/facet-components/light";

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-8 py-24">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold text-foreground font-heading sm:text-4xl">
          Everything you need, nothing you don't
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Seven capabilities across nine packages that work together or standalone.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="glass-card rounded-xl p-6 transition-all hover:translate-y-[-2px]"
          >
            <LightIcon name={f.icon} className="size-6 text-primary" />
            <h3 className="mt-4 font-semibold text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

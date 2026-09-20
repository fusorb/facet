import { Button, Pill, SparkleButton } from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { useDomain } from "../../lib/domain-context.js";

/**
 * Call-to-action section - header text and button labels come from the
 * active DomainContent; button actions go through the shared handleCta()
 * so docs/install/github are resolved in one place.
 */
export function CTASection() {
  const { domain, handleCta } = useDomain();
  const { ctaSection, ctaButtons } = domain;

  return (
    <section className="mx-auto max-w-7xl px-8 py-24 text-center">
      <div className="glass-card rounded-2xl p-12 lg:p-16">
        <Pill
          color="primary"
          indicator="icon"
          icon={<LightIcon name={ctaSection.labelIcon} size={12} />}
        >
          {ctaSection.label}
        </Pill>
        <h2 className="mt-4 font-heading text-3xl font-bold text-foreground sm:text-4xl">
          {ctaSection.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          {ctaSection.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <SparkleButton
            label={ctaButtons.primary.label}
            onClick={() => handleCta(ctaButtons.primary.action)}
            className="h-11 px-8"
          />
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleCta(ctaButtons.secondary.action)}
          >
            {ctaButtons.secondary.label}
          </Button>
        </div>
      </div>
    </section>
  );
}

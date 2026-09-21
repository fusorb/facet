import { ChangelogList, Pill } from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { changelog } from "../../data/changelog.js";
import { getDocsChangelogUrl } from "../../site.config.js";
import { useDomain } from "../../lib/domain-context.js";

export function ChangelogSection() {
  const { domain } = useDomain();
  const { changelogSection } = domain;

  return (
    <section id="changelog" className="mx-auto max-w-3xl px-8 py-24">
      <div className="mb-12 text-center">
        <Pill
          color="primary"
          indicator="icon"
          icon={<LightIcon name={changelogSection.labelIcon} size={12} />}
        >
          {changelogSection.label}
        </Pill>
        <h2 className="mt-4 font-heading text-3xl font-bold text-foreground sm:text-4xl">
          {changelogSection.title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          {changelogSection.subtitle}
        </p>
      </div>
      <ChangelogList releases={changelog} showFilter />
      <div className="mt-6 text-center">
        <a
          href={getDocsChangelogUrl()}
          onClick={(e) => {
            if (import.meta.env.DEV) e.preventDefault();
          }}
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline decoration-primary/50"
        >
          View full changelog on docs
          <LightIcon name="arrow-up-right" size={14} />
        </a>
      </div>
    </section>
  );
}

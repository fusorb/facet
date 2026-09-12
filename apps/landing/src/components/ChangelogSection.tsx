import { ChangelogList, Pill, facetChangelog } from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";

export function ChangelogSection() {
  return (
    <section id="changelog" className="mx-auto max-w-3xl px-8 py-24">
      <div className="mb-12 text-center">
        <Pill color="primary" indicator="icon" icon={<LightIcon name="history" size={12} />}>
          Release log
        </Pill>
        <h2 className="mt-4 text-3xl font-bold text-foreground font-heading sm:text-4xl">
          What shipped recently
        </h2>
        <p className="mt-4 text-muted-foreground">
          Every release is on npm. The ChangelogList component on this page is the
          same one consumers drop into their own docs sites.
        </p>
      </div>
      <ChangelogList releases={facetChangelog} showFilter />
    </section>
  );
}

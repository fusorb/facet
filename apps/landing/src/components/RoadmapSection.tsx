import { Roadmap } from "@fusorb/facet-components";
import { ROADMAP } from "../data/features.js";

export function RoadmapSection() {
  return (
    <section id="roadmap" className="mx-auto max-w-4xl px-8 py-24">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold text-foreground font-heading sm:text-4xl">
          Roadmap
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Where the ecosystem is going. Shipped work is on npm; current and
          planned items are tracked in the facet backlog.
        </p>
      </div>
      <Roadmap
        variant="timeline"
        maxHeight="max-h-[520px]"
        className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        items={ROADMAP.map((item) => ({
          title: item.title,
          description: item.desc,
          status: item.status,
          date: item.phase,
        }))}
      />
    </section>
  );
}

import { Link } from "react-router-dom";
import { Pill, Button } from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";

export function TokensExplorerSection() {
  return (
    <section id="tokens" className="mx-auto max-w-5xl px-8 py-24">
      <div className="mb-12 text-center">
        <Pill
          color="primary"
          indicator="icon"
          icon={<LightIcon name="layers" size={12} />}
        >
          Tokens
        </Pill>
        <h2 className="mt-4 font-heading text-3xl font-bold text-foreground sm:text-4xl">
          Tokens as source of truth
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Every color, font, spacing, radius, and motion value is a CSS custom
          property. Override any of them to re-theme your entire product
          instantly: no prop drilling needed.
        </p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <TokenCategory
          label="Color"
          desc="Semantic colors: primary, secondary, background, surface, and state variants."
          cssVar="--color-* / --background / --primary"
        />
        <TokenCategory
          label="Typography"
          desc="Font families, sizes, weights, and line heights."
          cssVar="--font-* / --font-sans / --font-mono"
        />
        <TokenCategory
          label="Spacing"
          desc="8-point spacing scale (0–8xl) for padding and margin."
          cssVar="--spacing-* (0–8xl)"
        />
        <TokenCategory
          label="Radius"
          desc="Border radius tokens: sm, md, lg, xl, full."
          cssVar="--radius-* / --radius-sm"
        />
        <TokenCategory
          label="Motion"
          desc="Duration ladder + easing curves for transitions and keyframes."
          cssVar="--motion-duration-* / --motion-ease-*"
        />
        <TokenCategory
          label="Shadow"
          desc="Elevated surface shadows for depth hierarchy."
          cssVar="--shadow-*"
        />
      </div>

      <div className="mt-10 flex justify-center">
        <Link to="/lab/tokens">
          <Button color="primary" size="sm">
            Explore all tokens
            <LightIcon name="arrow-right" size={12} />
          </Button>
        </Link>
      </div>
    </section>
  );
}

function TokenCategory({
  label,
  desc,
  cssVar,
}: {
  label: string;
  desc: string;
  cssVar: string;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-card p-4">
      <div className="font-heading text-sm font-semibold text-foreground">
        {label}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <code className="mt-2 block font-mono text-xs text-muted-foreground/60 break-all">
        {cssVar}
      </code>
    </div>
  );
}

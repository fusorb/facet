import { Marquee, Card, CardContent } from "@arcevo/facet-components";
import { TESTIMONIALS } from "../data/testimonials.js";

/**
 * Social proof marquee. Two rows of testimonial cards - the top row scrolls
 * left, the bottom row scrolls right - powered by the ready-to-use Marquee
 * surface. Content is driven by `data/testimonials.ts` so the quotes can be
 * updated without touching the component.
 */

/* Short-quote helper: clamp to ~120 chars so cards stay scannable in a marquee. */
function clamp(text: string, max = 120): string {
  return text.length <= max ? text : text.slice(0, max).trimEnd() + "…";
}

function TestimonialCard({ t }: { t: (typeof TESTIMONIALS)[number] }) {
  return (
    <Card className="flex h-full min-w-[260px] max-w-xs flex-col justify-between border border-border/50 bg-background/80 p-4 shadow-sm backdrop-blur">
      <CardContent className="flex h-full flex-col gap-2 p-0">
        <div className="flex items-start gap-2.5">
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: t.accent ?? "hsl(var(--primary))" }}
          >
            {t.initials ?? "?"}
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{t.author}</p>
            {t.role && <p className="text-xs text-muted-foreground">{t.role}</p>}
          </div>
        </div>
        <blockquote className="mt-1 line-clamp-3 text-xs italic text-muted-foreground">
          "{clamp(t.quote)}"
        </blockquote>
      </CardContent>
    </Card>
  );
}

export function TestimonialsSection() {
  /* Split the 6 testimonials into two halves for the two marquee rows. */
  const half = Math.ceil(TESTIMONIALS.length / 2);
  const rowA = TESTIMONIALS.slice(0, half);
  const rowB = TESTIMONIALS.slice(half);

  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-8 py-20">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-foreground font-heading sm:text-4xl">
          Adopted where standards matter
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Identity, healthcare, fintech, and education teams use facet to ship
          domain-customized auth without rebuilding the design system.
        </p>
      </div>

      {/* Row A - scrolls left */}
      <Marquee
        items={rowA.map((t) => (
          <TestimonialCard key={t.author} t={t} />
        ))}
        duration={24}
        reverse
        gap={20}
        variant="strip"
        className="mb-3"
      />

      {/* Row B - scrolls right */}
      <Marquee
        items={rowB.map((t) => (
          <TestimonialCard key={t.author} t={t} />
        ))}
        duration={26}
        gap={20}
        variant="strip"
      />
    </section>
  );
}

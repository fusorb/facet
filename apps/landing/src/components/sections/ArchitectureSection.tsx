import { cn, Pill, LayerGraph } from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import {
  CUSTOMIZATION_AXES,
  PACKAGES,
  SYSTEM_LAYERS,
} from "../../data/scratchpad.js";
import { SITE_STATS } from "../../data/site-data.generated.js";

const ARCHITECTURE_STATS = [
  { value: String(PACKAGES.length), label: "Packages" },
  {
    value:
      String(SITE_STATS.find((s) => s.label === "components")?.value ?? "0") +
      "+",
    label: "Components",
  },
  { value: "OKLCH", label: "Color space" },
  { value: "5", label: "Domain presets" },
];

/** Capitalize the customization-axis key ("appearance" -> "A"). */
function axisLetter(axis: string): string {
  return axis.charAt(0).toUpperCase();
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Architecture section. The composable layer graph lives on the left; the
 * three customization axes (Appearance, Config, Slots) sit on the right as
 * definition cards, so the seams make the graph meaningful at a glance.
 *
 * The architecture layers and axes are domain-invariant (they describe the
 * library structure itself), so this section is not domain-swappable.
 */
export function ArchitectureSection() {
  return (
    <section id="architecture" className="px-8 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <Pill
            color="primary"
            indicator="icon"
            icon={<LightIcon name="layers" size={12} />}
          >
            Architecture
          </Pill>
          <h2 className="mt-4 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Layered. Composable. Yours.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Four composable layers - from design tokens up to your application.
            Every layer is independently usable, and every seam is an extension
            point (appearance, config, slots).
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-16">
          <LayerGraph nodes={SYSTEM_LAYERS} />

          <div className="space-y-6">
            {CUSTOMIZATION_AXES.map((axis) => (
              <div
                key={axis.axis}
                className={cn(
                  "group rounded-xl border border-border/60 bg-card p-6 transition-all duration-200 hover:shadow-lg",
                  "border-l-2",
                )}
                style={{ borderLeftColor: axis.color }}
              >
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-heading text-xs font-bold uppercase"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${axis.color} 15%, transparent)`,
                      color: axis.color,
                    }}
                  >
                    {axisLetter(axis.axis)}
                  </span>
                  <div>
                    <div className="font-heading text-sm font-semibold text-foreground">
                      {capitalize(axis.axis)}
                    </div>
                    <div className="text-xs text-muted-foreground/70">
                      {axis.label} axis
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {axis.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 border-t border-border/40 pt-8 sm:grid-cols-4">
          {ARCHITECTURE_STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-heading text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

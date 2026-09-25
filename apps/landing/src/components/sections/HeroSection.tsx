import { Button, LayerGraph } from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { useNavigate } from "react-router-dom";
import { getDocsUrl } from "../../site.config.js";
import { SYSTEM_LAYERS } from "../../data/scratchpad.js";
import { SITE_VERSION } from "../../data/site-data.generated.js";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    // LandingLayout already provides the glow shell
    // (max-w-7xl / px-8 / py-16 lg:py-24 + var(--hero-glow) radial gradient)
    // plus the outer <section>; render the value prop here and let the
    // system composition carry the visual.
    <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
      {/* Value prop */}
      <div className="lg:mx-0 lg:max-w-none">
        {/* Version badge with a single status pulse (restrained micro-state) */}
        <div className="mb-4 flex items-center justify-center gap-2.5 text-[11px] font-mono text-text-dim lg:justify-start">
          <span
            className="h-1.5 w-1.5 shrink-0 animate-pulse-dot rounded-full"
            style={{ background: "var(--green)" }}
          />
          <span>v{SITE_VERSION} · MIT Licensed</span>
        </div>

        <h1
          className="font-display text-3xl font-extrabold text-balance text-center text-pretty sm:text-5xl lg:text-[56px] lg:text-left"
          style={{
            letterSpacing: "-0.035em",
            lineHeight: 1.08,
          }}
        >
          <span>One system. </span>
          <br className="hidden sm:block" />
          <span>Every surface.</span>
        </h1>

        <p className="mt-4 max-w-md text-[16px] leading-[1.5] text-center justify-center text-pretty text-muted-foreground lg:text-left">
          Facet is a ground-up UX system that stitches design tokens,
          domain-customizable components, auth, layout, and motion into one
          composable stack. Four layers, every seam an extension point.
        </p>

        {/* Two actions: explore the system, or read the docs */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
          <Button
            variant="default"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => navigate("/components")}
          >
            Explore
            <LightIcon name="arrow-right" size={16} />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => (window.location.href = getDocsUrl())}
          >
            Read the Docs
          </Button>
        </div>
      </div>

      {/* Visual: the layered Facet architecture, rendered with the same
          LayerGraph component the System section uses — no second diagram.
          Hidden on mobile so the value prop stays the focus. */}
      <div className="hidden lg:block">
        <LayerGraph nodes={SYSTEM_LAYERS} />
      </div>
    </div>
  );
}

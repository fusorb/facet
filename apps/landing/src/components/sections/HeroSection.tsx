import {
  AspectRatio,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  TiltCard,
  TypewriterText,
} from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { useNavigate } from "react-router-dom";
import { getDocsUrl } from "../../site.config.js";
import { SITE_VERSION } from "../../data/site-data.generated.js";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    // LandingLayout already provides the glow shell
    // (max-w-7xl / px-8 / py-16 lg:py-24 + var(--hero-glow) radial gradient)
    // plus the outer <section>; render the value prop here and let the
    // system composition carry the visual.
    <div className="flex items-center justify-center lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
      {/* Value prop */}
      <div className="lg:mx-0 lg:max-w-none">
        {/* Version badge with a single status pulse (restrained micro-state) */}
        <div className="mb-4 flex items-center justify-center gap-2 text-[11px] font-mono text-text-dim lg:justify-start">
          <span
            className="h-1 w-1 shrink-0 animate-pulse-dot rounded-full"
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

      {/* Visual: wide glass card (rectangular, not square) — no scroll needed
          to see the full hero. A typewriter cycles through the package names
          that compose the four-layer stack, giving a live "import" feel.
          Swap for a real diagram / LayerGraph once the hero graphic is ready. */}
      <div className="hidden lg:flex lg:items-center lg:justify-center">
        <TiltCard maxTilt={12} scale={1.04} glare>
          <AspectRatio ratio={16 / 9} className="w-full max-w-xl">
            <Card
              variant="glass"
              className="relative h-full w-full overflow-hidden"
            >
              <CardHeader>
                <CardTitle>Four Layers</CardTitle>
                <CardDescription>
                  Tokens → Components → Auth · Layout · Motion → Your App
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-3 space-y-3 font-mono">
                <Separator />
                <div className="flex items-baseline gap-2 text-xs">
                  <span className="text-muted-foreground/50">import</span>
                  <span className="text-foreground">{"{"}</span>
                  <span className="text-blue-400">Facet</span>
                  <span className="text-foreground">{"}"}</span>
                  <span className="text-muted-foreground/50">from</span>
                  <TypewriterText
                    phrases={[
                      "@fusorb/facet-tokens",
                      "@fusorb/facet-components",
                      "@fusorb/facet-motion",
                      "@fusorb/facet-layout",
                      "@fusorb/facet-sdk",
                      "@fusorb/facet-utils",
                    ]}
                    className="inline-block text-green-400"
                    caretClassName="border-green-400"
                    typeSpeed={80}
                    eraseSpeed={40}
                    delay={2200}
                  />
                </div>
                <Separator />
              </CardContent>
            </Card>
          </AspectRatio>
        </TiltCard>
      </div>
    </div>
  );
}

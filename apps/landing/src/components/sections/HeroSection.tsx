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
import { useDomain } from "../../lib/domain-context.js";
import { SITE_VERSION } from "../../data/site-data.generated.js";

export function HeroSection() {
  const { domain, handleCta } = useDomain();
  const { hero } = domain;

  return (
    // LandingLayout already provides the glow shell:
    // (max-w-7xl / px-8 / py-16 lg:py-24 + var(--hero-glow) radial gradient)
    // plus the outer <section>; render the value prop here.
    <div className="flex items-center justify-center lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
      {/* Value prop */}
      <div className="lg:mx-0 lg:max-w-none">
        {/* Badge row: version pulse + domain badges */}
        <div className="mb-5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-text-dim lg:justify-start">
          <span className="flex items-center gap-1">
            <span
              className="h-1 w-1 shrink-0 animate-pulse-dot rounded-full"
              style={{ background: "var(--green)" }}
            />
            <span>v{SITE_VERSION}</span>
          </span>
          {hero.badges.map((badge) => (
            <span
              key={badge.label}
              className="flex items-center gap-1"
            >
              <LightIcon
                name={badge.icon}
                size={10}
                className="text-primary"
              />
              {badge.label}
            </span>
          ))}
        </div>

        {/* Headline */}
        <h1
          className="font-display text-3xl font-extrabold text-balance text-center text-pretty sm:text-5xl lg:text-[56px] lg:text-left"
          style={{
            letterSpacing: "-0.035em",
            lineHeight: 1.08,
          }}
        >
          <span>{hero.headline} </span>
          <span className="text-primary">{hero.headlineAccent}</span>
        </h1>

        {/* Subtext */}
        <p className="mt-4 max-w-md text-[16px] leading-[1.5] text-center text-pretty text-muted-foreground lg:text-left">
          {hero.subtext}
        </p>

        {/* Tagline: domain value props cycling as a typewriter */}
        <div className="mt-4 text-center text-pretty lg:text-left">
          <TypewriterText
            phrases={hero.phrases}
            className="inline-block text-[15px] font-medium text-primary"
            caretClassName="border-primary"
            typeSpeed={60}
            eraseSpeed={30}
            delay={2500}
          />
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
          <Button
            variant="default"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => handleCta(hero.primaryCta.action)}
          >
            {hero.primaryCta.label}
            <LightIcon name="arrow-right" size={16} />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => handleCta(hero.secondaryCta.action)}
          >
            {hero.secondaryCta.label}
          </Button>
        </div>
      </div>

      {/* Visual: four-layer stack in a glass card */}
      <div className="mt-10 hidden lg:flex lg:items-center lg:justify-center">
        <TiltCard maxTilt={12} scale={1.04} glare>
          <AspectRatio ratio={16 / 9} className="w-full max-w-xl">
            <Card
              variant="glass"
              className="relative h-full w-full overflow-hidden"
            >
              <CardHeader>
                <CardTitle className="text-primary">Four Layers</CardTitle>
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
                      "@fusorb/facet-auth",
                      "@fusorb/facet-layout",
                      "@fusorb/facet-motion",
                      "@fusorb/facet-sdk",
                    ]}
                    className="inline-block text-cyan-400"
                    caretClassName="border-cyan-400"
                    typeSpeed={80}
                    eraseSpeed={40}
                    delay={2200}
                  />
                </div>
                <Separator />
                <div className="flex items-center gap-1.5 pt-2 text-[10px] text-muted-foreground/60">
                  <LightIcon
                    name="check"
                    size={10}
                    className="text-green-400"
                  />
                  <TypewriterText
                    phrases={hero.phrases}
                    className="inline-block text-green-400"
                    caretClassName="border-green-400"
                    typeSpeed={60}
                    eraseSpeed={30}
                    delay={3000}
                  />
                </div>
              </CardContent>
            </Card>
          </AspectRatio>
        </TiltCard>
      </div>
    </div>
  );
}

import { useNavigate, useLocation } from "react-router-dom";
import {
  SparkleButton,
  Pill,
  GradientText,
  TypewriterText,
  CountUpText,
} from "@fusorb/facet-components";
import { LightIcon } from "@fusorb/facet-components/light";
import { site, getDocsUrl } from "../../site.config.js";
import { SITE_STATS } from "../../data/site-data.generated.js";

/** Short, truthful phrases that continue the static headline. */
const PHRASES = [
  "auth flows that fit your domain",
  "docs that never drift",
  "tokens every brand can own",
  "one install, the whole system",
];

export function HeroSection() {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToInstall = () => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document
          .getElementById("install")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document
        .getElementById("install")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative flex flex-col items-center pb-16 text-center sm:pb-20">
      <div className="relative mx-auto w-full max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          <Pill
            color="primary"
            indicator="icon"
            icon={<LightIcon name="globe" size={12} />}
          >
            Open source
          </Pill>
          <Pill
            color="primary"
            indicator="icon"
            icon={<LightIcon name="layers" size={12} />}
          >
            Radix powered
          </Pill>
          <Pill
            color="primary"
            indicator="icon"
            icon={<LightIcon name="check" size={12} />}
          >
            MIT licensed
          </Pill>
        </div>

        <h1 className="font-heading text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          A component library with{" "}
          <GradientText
            text="identity built in"
            className="block sm:inline"
          />
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          <TypewriterText
            phrases={PHRASES}
            typeSpeed={45}
            eraseSpeed={28}
            delay={2200}
            showCaret
            className="inline-block min-h-[1.5em]"
          />
        </p>

        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground/80">
          Accessible React components for TypeScript and Tailwind CSS v4.
          Radix primitives, dark mode, and a pluggable auth flow that fits
          your domain. Install from npm, theme with tokens, ship.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <SparkleButton
            label="Browse components"
            onClick={() => window.open(getDocsUrl())}
            className="h-10 px-8"
          />
          <button
            type="button"
            onClick={scrollToInstall}
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md px-4 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LightIcon name="terminal" size={16} />
            Get started
          </button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          React 18/19 &middot; TypeScript &middot; Radix UI &middot; Tailwind
          CSS v4
        </p>

        {/* Live stats: generated at build time from the workspace packages */}
        <div className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {SITE_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border/60 bg-card px-4 py-6 text-center shadow-sm"
            >
              <div className="font-heading text-2xl font-bold text-foreground">
                <CountUpText to={Number(stat.value)} duration={1200} />
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted-foreground/70">
          {site.brand.name} is free, MIT-licensed, and published under the
          @fusorb npm scope.
        </p>
      </div>
    </div>
  );
}

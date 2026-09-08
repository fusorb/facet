import { useNavigate, useLocation } from "react-router-dom";
import { Badge, Aurora, Beams, SparkleButton, Spotlight, TypewriterText } from "@arcevo/facet-components";
import { LightIcon, useTheme } from "@arcevo/facet-components/light";
import { getDocsUrl } from "../lib/docs-url.js";
import { STATS } from "../data/features.js";

export function HeroSection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Theme-adaptive aurora: bright accent gradients on light, clean white
  // gradients on dark so the hero stays crisp in both modes.
  const auroraColorsLight = ["#6366f1", "#a855f7", "#06b6d4", "#6366f1"];
  const auroraColorsDark = ["#ffffff", "#f0f0f0", "#e0e0e0", "#ffffff"];
  const auroraColorsSubLight = ["#0ea5e9", "#d946ef", "#22d3ee"];
  const auroraColorsSubDark = ["#f8fafc", "#e2e8f0", "#cbd5e1"];

  const scrollToInstall = () => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById("install")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById("install")?.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <Spotlight className="relative flex flex-col items-center overflow-hidden text-center">
      {/* Animated layers: aurora + beams (zero-dep facet animated
          surfaces). Brighter opacity so the motion reads. */}
      <Aurora className="absolute inset-0 -z-20" opacity={0.75} colors={isDark ? auroraColorsDark : auroraColorsLight} />
      <Aurora className="absolute -inset-10 -z-20 opacity-40" opacity={0.4} colors={isDark ? auroraColorsSubDark : auroraColorsSubLight} />
      <Beams count={4} className="absolute inset-0 -z-10" color={isDark ? "rgba(255,255,255,0.25)" : "rgba(129,140,248,0.35)"} />
      <Badge
        variant="outline"
        icon={<LightIcon name="sparkles" size={12} />}
        className="mb-6 border-primary/30 text-primary text-xs tracking-wider uppercase px-4 py-1"
      >
        Open source &middot; Radix powered &middot; MIT
      </Badge>
      <h1 className="text-gradient text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl font-heading max-w-4xl">
        A component library that ships with auth built in
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Copy-paste ready components for React, TypeScript and Tailwind CSS v4. Radix primitives,
        dark mode, and a pluggable auth flow that fits your domain.
      </p>
      <p className="mt-4 font-heading text-xl font-semibold text-primary sm:text-2xl">
        <TypewriterText
          phrases={[
            "114 Radix components",
            "Auth presets for every domain",
            "Alpha Palette design tokens",
            "Console, auth, and landing shells",
            "A typed ArcID SDK",
            "Framework-agnostic email templates",
            "A CLI that scaffolds it all",
          ]}
          className="text-primary"
        />
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <SparkleButton
          label="Browse components"
          onClick={() => window.open(getDocsUrl())}
          className="h-10 px-8"
        />
        <SparkleButton
          label="Get started"
          onClick={scrollToInstall}
          className="h-10 px-8 bg-primary/80 hover:bg-primary/90"
        />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        React 18/19 &middot; TypeScript &middot; Radix UI &middot; Tailwind CSS v4
      </p>

      <div className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl px-4 py-6 text-center">
            <div className="text-2xl font-bold text-foreground font-heading">{stat.value}</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </Spotlight>
  );
}

import * as React from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { extendedManifest } from "../lib/manifest.js";
import { ComponentDemoCard } from "../components/ComponentDemoCard.js";
import { ComponentPreview } from "../components/previews.js";
import { InteractiveDemo } from "../components/InteractiveDemo.js";
import { PageNav } from "../components/Guide.js";
import { useDocsKeyboardNav, useDocsNavigation } from "../lib/keyboard-nav.js";
import type { Control } from "../components/Playground.js";

/** Variant/size controls for components that have obvious options. */
export function demoControls(slug: string): Control[] | undefined {
  switch (slug) {
    case "button":
      return [
        {
          label: "Variant",
          options: ["default", "secondary", "outline", "ghost", "destructive", "link", "glass", "glow"],
          value: "default",
          onChange: () => {},
        },
        {
          label: "Size",
          options: ["default", "sm", "lg", "icon"],
          value: "default",
          onChange: () => {},
        },
      ];
    case "badge":
      return [
        {
          label: "Variant",
          options: ["default", "secondary", "outline", "success", "warning", "destructive"],
          value: "default",
          onChange: () => {},
        },
      ];
    case "aspect-ratio":
      return [
        {
          label: "Variant",
          options: ["16:9", "1:1", "4:3", "21:9", "3:4"],
          value: "16:9",
          onChange: () => {},
        },
      ];
    case "resizable":
      return [
        {
          label: "Variant",
          options: ["horizontal", "vertical", "collapsible", "vertical-collapsible"],
          value: "horizontal",
          onChange: () => {},
        },
      ];
    default:
      return undefined;
  }
}

export function ComponentPage() {
  const { slug } = useParams();
  if (!slug) return <Navigate to="/components" replace />;
  const entry = extendedManifest.find((e) => e.slug === slug);
  if (!entry) return <Navigate to="/components" replace />;

  // Live controls for parameterized previews (Button/Badge).
  const controls = demoControls(slug);
  const [variant, setVariant] = React.useState("default");
  const [size, setSize] = React.useState("default");
  const liveControls = controls?.map((c) =>
    c.label === "Variant"
      ? { ...c, value: variant, onChange: setVariant }
      : { ...c, value: size, onChange: setSize },
  );

  // Unified prev/next across the whole docs site (content pages +
  // components), so Alt+Up/Down works regardless of sidebar state.
  const { prev, next } = useDocsNavigation();
  useDocsKeyboardNav();

  return (
    <article>
      <p className="mb-2 text-sm text-muted-foreground">
        <Link to="/components" className="inline-flex items-center gap-1.5 hover:text-foreground">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M10 4L6 8L10 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Components
        </Link>{" "}
        / {entry.name}
      </p>
      <h1 className="font-heading text-3xl font-bold text-foreground">{entry.name}</h1>
      {entry.description && (
        <p className="mt-2 text-muted-foreground">{entry.description}</p>
      )}

      <div className="mt-6">
        <ComponentDemoCard
          name={entry.name}
          description={entry.description}
          collapsed={<ComponentPreview slug={slug} />}
          controls={liveControls}
          expanded={<ComponentPreview slug={slug} variant={variant} size={size} />}
        />
      </div>

      {/* Variant tabs: each tab shows the live preview AND its matching
          copyable code side-by-side on desktop (stacked on mobile). */}
      <div className="mt-6">
        <InteractiveDemo slug={slug} title={null} />
      </div>

      <PageNav
        prev={prev ? { label: prev.label, to: prev.path } : undefined}
        next={next ? { label: next.label, to: next.path } : undefined}
      />
    </article>
  );
}

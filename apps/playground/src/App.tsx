import { useCallback, useEffect, useMemo, useState } from "react";
import type React from "react";

import { ThemeProvider, Navbar, Button } from "@fusorb/facet-components";
import { CodeView, type ControlRenderer } from "@fusorb/facet-sandbox/react";
import { PlaygroundErrorBoundary } from "@fusorb/facet-sandbox/live";
import {
  decodeState,
  encodeState,
  inferControls,
  toCode,
  type ControlField,
  type ControlType,
  type Example,
} from "@fusorb/facet-sandbox/core";
import { listComponents, getComponent } from "@fusorb/facet-registry";
import { surfaces } from "../../../surfaces.config.mjs";

import { CatalogPanel } from "./components/catalog-panel.js";
import { facetControlRenderers } from "./components/control-renderers.js";
import { InspectorSidebar } from "./components/inspector-sidebar.js";
import { MobileSheets } from "./components/mobile-sheets.js";
import { Toolbar } from "./components/toolbar.js";
import { buildExampleMap } from "./lib/example-map.js";
import {
  DEFAULT_VIEWPORT,
  VIEWPORT_PRESETS,
  getViewportWidth,
  type ViewportPresetId,
} from "./lib/viewport-presets.js";

const EXAMPLES_BY_SLUG = buildExampleMap();
const COMPONENTS = listComponents();
const FIRST_SLUG = COMPONENTS[0]?.slug ?? "button";

interface PermalinkState {
  slug: string;
  example?: string;
  props?: Record<string, unknown>;
  viewport?: string;
  reducedMotion?: boolean;
  embed?: boolean;
}

function readPermalink(): PermalinkState {
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.replace(/^#/, "");
  const [path, query = ""] = hash.split("?");
  const [slug, example] = (path ?? "").split("/").filter(Boolean);
  const params = new URLSearchParams(query);
  const propsRaw = params.get("props");
  const viewport = params.get("viewport") ?? undefined;
  const reducedMotion = params.get("reducedMotion") === "1" ? true : undefined;
  const embedParam = params.get("embed") ?? searchParams.get("embed");
  const embed = embedParam === "1" || embedParam === "true" ? true : undefined;

  let props: Record<string, unknown> | undefined;
  if (propsRaw) {
    try {
      const decoded = decodeState(propsRaw);
      if (decoded && typeof decoded === "object" && !Array.isArray(decoded)) {
        props = decoded as Record<string, unknown>;
      }
    } catch {
      props = undefined;
    }
  }

  return {
    slug: slug && COMPONENTS.some((component) => component.slug === slug) ? slug : FIRST_SLUG,
    example: example || undefined,
    props,
    viewport: viewport ?? undefined,
    reducedMotion,
    embed,
  };
}

function writePermalink(state: PermalinkState) {
  const params = new URLSearchParams();
  if (state.props && Object.keys(state.props).length > 0) {
    params.set("props", encodeState(state.props));
  }
  if (state.viewport && state.viewport !== DEFAULT_VIEWPORT) {
    params.set("viewport", state.viewport);
  }
  if (state.reducedMotion) params.set("reducedMotion", "1");
  if (state.embed) params.set("embed", "1");
  const query = params.toString();
  const next = `#/${state.slug}${state.example ? `/${state.example}` : ""}${query ? `?${query}` : ""}`;
  window.history.replaceState(null, "", next);
}

function resolveSchema(
  example: Example<Record<string, unknown>>,
  values: Record<string, unknown>,
) {
  const base = inferControls(values);
  const overrides = example.controls ?? {};
  if (Object.keys(overrides).length === 0) return base;
  const fields = base.fields
    .map((field) => {
      const override = overrides[field.name];
      if (!override) return field;
      const options = override.options ?? field.options;
      return {
        ...field,
        type:
          options && options.length > 0
            ? "select"
            : field.type,
        label: override.label ?? field.label,
        group: (override.group as ControlField["group"]) ?? field.group,
        hidden: override.hidden ?? field.hidden,
        options,
        min: override.min ?? field.min,
        max: override.max ?? field.max,
        step: override.step ?? field.step,
      };
    })
    .filter((field) => !field.hidden);
  return { ...base, fields };
}

export default function App() {
  const initial = useMemo(readPermalink, []);
  const [selectedSlug, setSelectedSlug] = useState(initial.slug);
  const [selectedExampleId, setSelectedExampleId] = useState(initial.example ?? "");
  const [values, setValues] = useState<Record<string, unknown>>(() => initial.props ?? {});
  const [viewport, setViewport] = useState<ViewportPresetId>(() => {
    const candidate = initial.viewport ?? DEFAULT_VIEWPORT;
    return VIEWPORT_PRESETS.some((preset) => preset.id === candidate)
      ? (candidate as ViewportPresetId)
      : DEFAULT_VIEWPORT;
  });
  const [reducedMotion, setReducedMotion] = useState(Boolean(initial.reducedMotion));
  const [embed] = useState(Boolean(initial.embed));
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const component = getComponent(selectedSlug);
  const examples = EXAMPLES_BY_SLUG[selectedSlug] ?? [];
  const example =
    examples.find((candidate) => candidate.id === selectedExampleId) ?? examples[0];
  const defaults = useMemo(
    () => ({ ...((example?.defaults ?? {}) as Record<string, unknown>) }),
    [example],
  );

  const schema = useMemo(
    () => (example ? resolveSchema(example, values) : inferControls(values)),
    [example, values],
  );

  // Reset values when switching examples to that example's defaults.
  useEffect(() => {
    if (!example) return;
    setValues({ ...((example.defaults ?? {}) as Record<string, unknown>) });
  }, [selectedSlug, example?.id]);

  // Keep selected example id in sync with what's actually rendered.
  useEffect(() => {
    if (example && example.id !== selectedExampleId) setSelectedExampleId(example.id);
  }, [example, selectedExampleId]);

  // Honor the playground's reduced-motion toggle for both CSS- and engine-driven animations.
  useEffect(() => {
    const root = document.documentElement;
    if (reducedMotion) {
      root.dataset.facetReducedMotion = "true";
    } else {
      delete root.dataset.facetReducedMotion;
    }
  }, [reducedMotion]);

  // URL is the state: encode permalink on every meaningful change.
  useEffect(() => {
    writePermalink({
      slug: selectedSlug,
      example: example?.id,
      props: values,
      viewport,
      reducedMotion,
      embed,
    });
  }, [selectedSlug, example?.id, values, viewport, reducedMotion, embed]);

  const selectExample = useCallback((nextExample: Example<Record<string, unknown>>) => {
    setSelectedExampleId(nextExample.id);
    setValues({ ...((nextExample.defaults ?? {}) as Record<string, unknown>) });
  }, []);

  const selectComponent = useCallback((slug: string) => {
    setSelectedSlug(slug);
    setCatalogOpen(false);
  }, []);

  const resetValues = useCallback(() => {
    setValues({ ...defaults });
  }, [defaults]);

  const copyPermalink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, []);

  const toggleReducedMotion = useCallback(() => setReducedMotion((current) => !current), []);
  const changeViewport = useCallback((next: ViewportPresetId) => setViewport(next), []);

  const stageWidth = getViewportWidth(viewport);
  const code = useMemo(
    () => (example?.code?.(values) ?? toCode(values)) as string,
    [example, values],
  );

  const controlRenderers = facetControlRenderers as Partial<Record<ControlType, ControlRenderer>>;

  const inspectorContent = (
    <InspectorSidebar
      summary={component?.summary}
      schema={schema}
      values={values}
      onChange={setValues}
      onReset={resetValues}
      controlRenderers={controlRenderers}
    />
  );

  const catalogContent = (
    <CatalogPanel
      components={COMPONENTS}
      examplesBySlug={EXAMPLES_BY_SLUG}
      selectedSlug={selectedSlug}
      onSelect={selectComponent}
    />
  );

  return (
    <ThemeProvider>
      <div className="pg-frame" data-embed={embed || undefined}>
        {!embed && (
          <Navbar
            variant="glass"
            brand={
              <a href="/" className="font-semibold tracking-tight text-foreground">
                facet playground
              </a>
            }
            links={[
              { label: "Docs", href: import.meta.env.DEV ? surfaces.docs.dev : surfaces.docs.prod },
              { label: "GitHub", href: surfaces.github },
            ]}
            showThemeToggle
          />
        )}

        <Toolbar
          name={component?.name ?? selectedSlug}
          category={component?.category ?? "components"}
          viewport={viewport}
          onViewportChange={changeViewport}
          reducedMotion={reducedMotion}
          onToggleReducedMotion={toggleReducedMotion}
          onCopyLink={copyPermalink}
          copied={copied}
          onOpenCatalog={() => setCatalogOpen(true)}
          onOpenInspector={() => setInspectorOpen(true)}
          tab={tab}
          onTabChange={setTab}
          embed={embed}
        />

        <div className="pg-body">
          {!embed && (
            <aside className="pg-sidebar hidden lg:block" aria-label="Catalog">
              {catalogContent}
            </aside>
          )}

          <main className="pg-main" aria-label="Stage">
            <div className="pg-stage">
              {example ? (
                <div
                  className="pg-stage-inner"
                  style={{ maxWidth: stageWidth, marginInline: "auto" }}
                >
                  {tab === "preview" ? (
                    <div
                      className="pg-frame-box"
                      data-reduced-motion={reducedMotion || undefined}
                      style={{
                        animationDuration: reducedMotion ? "0.001ms" : undefined,
                        transitionDuration: reducedMotion ? "0s" : undefined,
                      }}
                    >
                      <PlaygroundErrorBoundary>
                        {example.render(values) as React.ReactNode}
                      </PlaygroundErrorBoundary>
                    </div>
                  ) : (
                    <CodeView code={code} language="tsx" className="pg-code" />
                  )}

                  <div className="pg-example-tabs" aria-label="Examples">
                    {examples.map((item) => (
                      <Button
                        key={item.id}
                        variant={item.id === example.id ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => selectExample(item)}
                        aria-pressed={item.id === example.id}
                        title={item.description ?? item.title}
                      >
                        {item.title}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="self-center text-sm text-muted-foreground">
                  No examples registered for {selectedSlug}.
                </p>
              )}
            </div>
          </main>

          {!embed && (
            <aside className="pg-inspector hidden lg:block" aria-label="Controls">
              {inspectorContent}
            </aside>
          )}
        </div>

        {!embed && (
          <MobileSheets
            catalogOpen={catalogOpen}
            onCatalogOpenChange={setCatalogOpen}
            inspectorOpen={inspectorOpen}
            onInspectorOpenChange={setInspectorOpen}
            catalog={catalogContent}
            inspector={inspectorContent}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

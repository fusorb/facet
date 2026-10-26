/**
 * @fusorb/facet-sandbox/react — React lab kit.
 *
 * Composable components for presenting artifacts/examples: a bounded
 * {@link Stage} viewport, an {@link ArtifactRenderer}, a schema-driven
 * {@link Inspector} with injectable control renderers, a {@link Catalog}, and
 * a {@link CodeView}. Ships with zero facet components — hosts style controls
 * via `controlRenderers` or their own CSS.
 *
 * @packageDocumentation
 */

import * as React from "react";
import {
  getArtifactKind,
  inferControls,
  toCode,
  type Artifact,
  type ControlField,
  type ControlSchema,
  type ControlType,
  type Example,
  type RenderContext,
  type ViewportSpec,
} from "../core/index.js";

/*  ── ArtifactRenderer ── */

export interface ArtifactRendererProps {
  artifact: Artifact;
  values: Record<string, unknown>;
  theme?: Record<string, string>;
  reducedMotion?: boolean;
}

/**
 * Render an artifact through its registered {@link ArtifactKind}. The kind's
 * `render` returns framework-agnostic output; in React this is treated as a
 * `ReactNode`.
 */
export function ArtifactRenderer({
  artifact,
  values,
  theme,
  reducedMotion,
}: ArtifactRendererProps): React.ReactNode {
  const kind = getArtifactKind(artifact.kind);
  if (!kind) {
    return (
      <div className="facet-artifact facet-artifact--unknown text-sm text-muted-foreground">
        Unknown artifact kind: <code className="font-mono">{artifact.kind}</code>
      </div>
    );
  }
  const ctx: RenderContext = {
    theme: theme ?? {},
    reducedMotion: reducedMotion ?? false,
  };
  return kind.render(artifact, values, ctx) as React.ReactNode;
}

/*  ── Inspector ── */

export type ControlRenderer = (
  field: ControlField,
  value: unknown,
  onChange: (value: unknown) => void,
) => React.ReactNode;

export interface InspectorProps {
  schema: ControlSchema;
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  /** Optional per-type renderers; facet-styled in apps, consumer-styled in apps. */
  controlRenderers?: Partial<Record<ControlType, ControlRenderer>>;
}

/**
 * Schema-driven control panel. Renders each visible {@link ControlField} with
 * an injectable renderer (or a plain-HTML default). Emits a new values object
 * on every change.
 */
export function Inspector({
  schema,
  values,
  onChange,
  controlRenderers,
}: InspectorProps) {
  const fields = schema.fields.filter((field) => !field.hidden);

  return (
    <div className="facet-inspector">
      {fields.map((field) => {
        const renderer = controlRenderers?.[field.type];
        const update = (value: unknown) =>
          onChange({ ...values, [field.name]: value });
        return (
          <React.Fragment key={field.name}>
            {renderer
              ? renderer(field, values[field.name], update)
              : (
                  <DefaultControl
                    field={field}
                    value={values[field.name]}
                    onChange={update}
                  />
                )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function DefaultControl({
  field,
  value,
  onChange,
}: {
  field: ControlField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const label = field.label ?? field.name;

  switch (field.type) {
    case "boolean":
      return (
        <label className="facet-control facet-control--boolean">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{label}</span>
        </label>
      );
    case "number":
      return (
        <label className="facet-control facet-control--number">
          <span>{label}</span>
          <input
            type="number"
            value={typeof value === "number" ? value : ""}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </label>
      );
    case "select":
      return (
        <label className="facet-control facet-control--select">
          <span>{label}</span>
          <select
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          >
            {(field.options ?? []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      );
    case "color":
      return (
        <label className="facet-control facet-control--color">
          <span>{label}</span>
          <input
            type="color"
            value={String(value ?? "#000000")}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      );
    case "code":
      return (
        <label className="facet-control facet-control--code">
          <span>{label}</span>
          <textarea
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      );
    case "string":
    default:
      return (
        <label className="facet-control facet-control--string">
          <span>{label}</span>
          <input
            type="text"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      );
  }
}

/*  ── CodeView ── */

export interface CodeViewProps {
  code: string;
  language?: string;
  className?: string;
}

/** Present generated code. Styling is host-owned; this is the minimal shell. */
export function CodeView({ code, language = "tsx", className }: CodeViewProps) {
  return (
    <pre
      className={["facet-codeview", className].filter(Boolean).join(" ")}
      data-language={language}
    >
      <code>{code}</code>
    </pre>
  );
}

/*  ── Catalog ── */

export interface CatalogProps {
  artifacts: Artifact[];
  selected?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

/** Selectable list of artifacts. */
export function Catalog({
  artifacts,
  selected,
  onSelect,
  className,
}: CatalogProps) {
  return (
    <div className={["facet-catalog", className].filter(Boolean).join(" ")}>
      {artifacts.map((artifact) => (
        <button
          key={artifact.id}
          type="button"
          onClick={() => onSelect?.(artifact.id)}
          aria-pressed={artifact.id === selected}
          className="facet-catalog__item"
        >
          {artifact.title}
        </button>
      ))}
    </div>
  );
}

/*  ── Stage ── */

export interface StageProps {
  artifact: Artifact;
  example: Example;
  viewportConfig?: Partial<ViewportSpec>;
  theme?: Record<string, string>;
  reducedMotion?: boolean;
  className?: string;
}

const DEFAULT_VIEWPORT: ViewportSpec = {
  fit: "content",
  scroll: "inside",
};

function resolveViewport(
  artifact: Artifact,
  viewportConfig?: Partial<ViewportSpec>,
): ViewportSpec {
  const kind = getArtifactKind(artifact.kind);
  return {
    ...DEFAULT_VIEWPORT,
    ...(kind?.defaultViewport ?? {}),
    ...artifact.viewport,
    ...viewportConfig,
  };
}

function viewportStyle(
  viewport: ViewportSpec,
  theme?: Record<string, string>,
  reducedMotion?: boolean,
): React.CSSProperties {
  const style: React.CSSProperties = theme
    ? { ...(theme as React.CSSProperties) }
    : {};
  if (viewport.aspect != null) {
    style.aspectRatio =
      typeof viewport.aspect === "string"
        ? viewport.aspect.replace(":", "/")
        : String(viewport.aspect);
  }
  if (viewport.minHeight != null) style.minHeight = viewport.minHeight;
  style.overflow = viewport.scroll === "inside" ? "auto" : "hidden";
  if (viewport.fit === "frame") style.width = "100%";
  if (reducedMotion) {
    style.animationDuration = "0.001ms";
    style.transitionDuration = "0s";
  }
  return style;
}

/**
 * Bounded viewport host. Renders `example` inside a viewport (respecting
 * artifact + kind + override viewport specs), with an inferred/kind-provided
 * {@link Inspector} and a generated {@link CodeView}. The preview + controls
 * share one `values` state.
 */
export function Stage({
  artifact,
  example,
  viewportConfig,
  theme,
  reducedMotion,
  className,
}: StageProps) {
  const [values, setValues] = React.useState<Record<string, unknown>>(() => ({
    ...(example.defaults ?? {}),
  }));

  const kind = getArtifactKind(artifact.kind);
  const schema = React.useMemo(
    () => kind?.inferControls?.(artifact) ?? inferControls(values),
    [kind, artifact, values],
  );
  const viewport = React.useMemo(
    () => resolveViewport(artifact, viewportConfig),
    [artifact, viewportConfig],
  );

  const preview = example.render(values) as React.ReactNode;
  const code = example.code?.(values) ?? toCode(values);

  return (
    <section
      className={["facet-stage", className].filter(Boolean).join(" ")}
      style={viewportStyle(viewport, theme, reducedMotion)}
    >
      <div className="facet-stage__viewport">{preview}</div>
      {schema.fields.length > 0 && (
        <Inspector schema={schema} values={values} onChange={setValues} />
      )}
      <CodeView code={code} />
    </section>
  );
}

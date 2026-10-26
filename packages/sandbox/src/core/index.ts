/**
 * @fusorb/facet-sandbox/core — framework-agnostic artifact model.
 *
 * Pure types + functions only. No React, no runtime dependencies (L1). The
 * `/react` and `/live` subpaths build on top of these.
 *
 * @packageDocumentation
 */

/* ── Artifact / Example / Control model (ADR-001) ────────────── */

export type ViewportFit = "content" | "frame";
export type ViewportAspect = "16:9" | "4:3" | "1:1" | "9:16" | number;

export interface ViewportSpec {
  fit: ViewportFit;
  aspect?: ViewportAspect;
  minHeight?: number;
  resizable?: boolean;
  scroll: "none" | "inside";
}

export type ControlType =
  | "string"
  | "number"
  | "boolean"
  | "select"
  | "color"
  | "slot"
  | "code";

export type ControlGroup =
  | "appearance"
  | "content"
  | "state"
  | "behavior"
  | "layout";

export interface ControlField {
  name: string;
  type: ControlType;
  label?: string;
  group?: ControlGroup;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  hidden?: boolean;
  defaultValue?: unknown;
}

export interface ControlSchema {
  fields: ControlField[];
  groups?: { key: string; label: string; order: number }[];
  inferGroup?: (field: ControlField) => string;
}

export type ControlOverrides<P> = Partial<
  Record<
    keyof P & string,
    {
      label?: string;
      group?: string;
      hidden?: boolean;
      options?: string[];
      min?: number;
      max?: number;
      step?: number;
    }
  >
>;

export interface RenderContext {
  theme: Record<string, string>;
  reducedMotion: boolean;
}

export interface ArtifactKind<TValues = Record<string, unknown>> {
  id: string;
  label: string;
  defaultViewport: ViewportSpec;
  render(artifact: Artifact, values: TValues, ctx: RenderContext): unknown;
  inferControls?(artifact: Artifact): ControlSchema;
}

export type ExampleRef = string;

export interface Artifact {
  id: string;
  kind: string;
  title: string;
  package: string;
  summary?: string;
  viewport?: Partial<ViewportSpec>;
  examples: ExampleRef[];
}

export interface Example<P = Record<string, unknown>> {
  id: string;
  artifact: string;
  title: string;
  description?: string;
  render: (props: P) => unknown;
  defaults?: Partial<P>;
  controls?: ControlOverrides<P>;
  code?: (props: P) => string;
  tags?: string[];
}

/* ── Kind registry (ADR-002) ─────────────────────────────────── */

const ARTIFACT_KINDS = new Map<string, ArtifactKind>();

/**
 * Register an artifact kind (e.g. "component", "layout", "motion"). Throws if
 * `id` is already registered by a different kind, guarding accidental
 * overrides across packages.
 */
export function registerArtifactKind<TValues = Record<string, unknown>>(
  kind: ArtifactKind<TValues>,
): void {
  const existing = ARTIFACT_KINDS.get(kind.id);
  if (existing && existing !== kind) {
    throw new Error(
      `[@fusorb/facet-sandbox] artifact kind "${kind.id}" is already registered.`,
    );
  }
  ARTIFACT_KINDS.set(kind.id, kind as ArtifactKind);
}

/** Resolve a registered artifact kind by id. */
export function getArtifactKind(id: string): ArtifactKind | undefined {
  return ARTIFACT_KINDS.get(id);
}

/** List all registered artifact kinds. */
export function listArtifactKinds(): ArtifactKind[] {
  return Array.from(ARTIFACT_KINDS.values());
}

/* ── Control inference helpers (ADR-001 §5.3) ────────────────── */

/** Map a runtime value to its control type (string/number/boolean/select). */
export function inferControlType(value: unknown): ControlType {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (Array.isArray(value)) return "select";
  return "string";
}

/**
 * Infer a {@link ControlSchema} from runtime values (tier-1 inference). This
 * is the zero-dep runtime fallback; build-time TS-prop inference layers on
 * top in the registry pipeline.
 */
export function inferControls(values: Record<string, unknown>): ControlSchema {
  const fields: ControlField[] = Object.entries(values).map(
    ([name, value]) => ({
      name,
      type: inferControlType(value),
      options: Array.isArray(value) ? value.map(String) : undefined,
      defaultValue: value,
    }),
  );
  return { fields };
}

/* ── Code generation (ADR-001 §5.2) ──────────────────────────── */

/**
 * Generate a JSX snippet from control values. `string` values become quoted
 * props, `true` becomes a boolean shorthand, and everything else is
 * serialized as a JSON expression. `false`/`null`/`undefined` are omitted as
 * defaults. Examples that need richer code generation supply their own
 * `Example.code` function.
 */
export function toCode(values: Record<string, unknown>): string {
  const props = Object.entries(values)
    .filter(([, value]) => value != null && value !== false)
    .map(([name, value]) => {
      if (typeof value === "string") return `${name}="${value}"`;
      if (value === true) return name;
      return `${name}={${JSON.stringify(value)}}`;
    });
  return props.length ? `<Component ${props.join(" ")} />` : "<Component />";
}

/* ── URL-state encode/decode (shareable permalinks) ──────────── */

/** Encode control values into a URL-safe string for shareable permalinks. */
export function encodeState(values: Record<string, unknown>): string {
  return encodeURIComponent(JSON.stringify(values));
}

/** Decode a URL-state string back into control values (never throws). */
export function decodeState(encoded: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(encoded));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // malformed or non-URI input -> empty state
  }
  return {};
}

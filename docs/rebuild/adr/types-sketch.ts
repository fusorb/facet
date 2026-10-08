/**
 * Phase 2 type sketch — verifies that all ADR type signatures are internally
 * consistent and compile under strict mode.
 *
 * This file is NOT imported by any package. It exists to validate the type
 * shapes before Phase 3 implementation.
 *
 * Run: npx tsc --strict --noEmit --jsx react-jsx --moduleResolution bundler --module esnext docs/rebuild/adr/types-sketch.ts
 */

// Avoid external React import for standalone compilation.
type ReactNode = unknown;

// ── ADR-001: Artifact / Example / Control Model ──────────────────

type ViewportSpec = {
  fit: "content" | "frame";
  aspect?: "16:9" | "4:3" | "1:1" | "9:16" | number;
  minHeight?: number;
  resizable?: boolean;
  scroll: "none" | "inside";
};

type ControlType =
  | "string"
  | "number"
  | "boolean"
  | "select"
  | "color"
  | "slot"
  | "code";

type ControlGroup =
  | "appearance"
  | "content"
  | "state"
  | "behavior"
  | "layout";

interface ControlField {
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

interface ControlSchema {
  fields: ControlField[];
  groups?: { key: string; label: string; order: number }[];
  inferGroup?: (field: ControlField) => string;
}

type ControlOverrides<P> = Partial<Record<keyof P & string, {
  label?: string;
  group?: string;
  hidden?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}>>;

interface RenderContext {
  theme: Record<string, string>;
  reducedMotion: boolean;
}

interface ArtifactKind<TValues = Record<string, unknown>> {
  id: string;
  label: string;
  defaultViewport: ViewportSpec;
  render(
    artifact: Artifact,
    values: TValues,
    ctx: RenderContext
  ): unknown;
  inferControls?(artifact: Artifact): ControlSchema;
}

type ExampleRef = string;

interface Artifact {
  id: string;
  kind: string;
  title: string;
  package: string;
  summary?: string;
  viewport?: Partial<ViewportSpec>;
  examples: ExampleRef[];
}

interface Example<P = Record<string, unknown>> {
  id: string;
  artifact: string;
  title: string;
  description?: string;
  render: (props: P) => ReactNode;
  defaults?: Partial<P>;
  controls?: ControlOverrides<P>;
  code?: (props: P) => string;
  tags?: string[];
}

// ── ADR-002: Sandbox v3 subpath exports ──────────────────────────

// /core — zero deps
interface SandboxCore {
  registerArtifactKind(kind: ArtifactKind): void;
  listArtifactKinds(): ArtifactKind[];
  toCode(values: Record<string, unknown>): string;
  encodeState(values: Record<string, unknown>): string;
  decodeState(encoded: string): Record<string, unknown>;
}

// /live — JSX runtime + sanitizer
interface LivePlaygroundProps {
  code: string;
  onError?: (err: Error) => void;
  maxHeight?: number;
}

interface SanitizerAPI {
  isSafeUrl(url: string): boolean;
  sanitizeUrlProps(props: Record<string, unknown>): Record<string, unknown>;
}

// /react — Stage, Inspector, Catalog
interface StageProps {
  artifact: Artifact;
  example: Example;
  viewportConfig?: Partial<ViewportSpec>;
  theme?: Record<string, string>;
  reducedMotion?: boolean;
}

interface InspectorProps {
  schema: ControlSchema;
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  controlRenderers?: Record<string, (field: ControlField) => ReactNode>;
}

interface CatalogProps {
  artifacts: Artifact[];
  selected?: string;
  onSelect?: (id: string) => void;
}

// ── ADR-003: Docs Engine Split ───────────────────────────────────

interface ReferenceEntry {
  id: string;
  title: string;
  kind: "package" | "component" | "layout" | "motion" | "token";
}

interface ApiDoc {
  props: Array<{ name: string; type: string; description?: string }>;
  slots: Array<{ name: string; description?: string }>;
}

interface DocsDataSource {
  entries(): ReferenceEntry[];
  examples(slug: string): Example[];
  api?(slug: string): ApiDoc | undefined;
}

type BlockType =
  | "p"
  | "code"
  | "table"
  | "ul"
  | "ol"
  | "install"
  | "demo"
  | "example"
  | "playground"
  | "changelog"
  | "callout"
  | "reference"
  | "heading";

interface DocsBlock {
  type: BlockType;
  children?: DocsBlock[];
  // content specific to block type
  [key: string]: unknown;
}

interface DocsPage {
  title: string;
  section: string;
  order: number;
  blocks: DocsBlock[];
  load?: () => Promise<DocsBlock[]>; // code-split per page
}

interface DocsConfig {
  sections: { id: string; label: string; order: number; icon?: string }[];
  brand: {
    name: string;
    url: string;
    github: string;
    npmScope: string;
  };
}

type RouterKind = "browser" | "hash";

interface RouterAdapter {
  navigate(path: string): void;
  subscribe(fn: (path: string) => void): () => void;
  readPath(): string;
}

interface DocsAppProps {
  config: DocsConfig;
  dataSource?: DocsDataSource;
  routerKind?: RouterKind;
  router?: RouterAdapter;
}

// ── ADR-004: Layout / Auth Decoupling ────────────────────────────

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface LayoutSession {
  user: User;
  signOut: () => void;
}

interface LayoutConfig {
  mode: "full" | "rail" | "collapsed" | "compact";
  preset: "default" | "fintech" | "med" | "edu" | "enterprise";
  nav: { items: Array<{ label: string; href: string }> };
}

interface LayoutProviderProps {
  config: LayoutConfig;
  session?: LayoutSession;
  router?: RouterAdapter;
  children: ReactNode;
}

// /skeleton subpath
type SkeletonKind =
  | "console"
  | "auth"
  | "landing"
  | "docs"
  | "chat";

interface LayoutSkeletonSpec {
  kind: SkeletonKind;
  nav?: "full" | "rail" | "collapsed" | "hidden";
  header?: boolean;
  aside?: "none" | "left" | "right";
  density?: "compact" | "default" | "spacious";
}

// ── ADR-005: Content Format ─────────────────────────────────────

interface Frontmatter {
  title: string;
  section: string;
  order: number;
  summary: string;
  tags?: string[];
}

type DirectiveName =
  | "example"
  | "install"
  | "reference"
  | "callout"
  | "code"
  | "table"
  | "ul"
  | "p"
  | "heading";

interface Directive {
  name: DirectiveName;
  props: Record<string, string>;
  children: string; // raw markdown/text body
}

interface CalloutTone {
  tone: "note" | "warning" | "error" | "success";
}

// ── ADR-006: Registry Schema + Package Metadata ──────────────────

type PackageCategory =
  | "foundation"
  | "primitives"
  | "components"
  | "data"
  | "ui"
  | "tooling"
  | "app";

interface FacetPackageMeta {
  category: PackageCategory;
  icon: string;
  order: number;
  summary: string;
}

interface PackageEntry {
  name: string;
  version: string;
  summary: string;
  category: PackageCategory;
  icon: string;
  order: number;
  deps: string[];
  peers: string[];
  exports: string[];
  install: string;
}

interface ComponentProps {
  name: string;
  type: string;
  description?: string;
  optional: boolean;
}

interface ComponentEntry {
  slug: string;
  name: string;
  package: string;
  category: string;
  summary?: string;
  props: ComponentProps[];
  examples: ExampleEntry[];
}

interface LayoutEntry {
  id: string;
  name: string;
  package: string;
  props: ComponentProps[];
  modes: string[];
  regions: string[];
  presets: string[];
  summary?: string;
}

interface MotionEntry {
  id: string;
  family: string;
  domain: string;
  authored: boolean;
  tokens: string[];
  summary?: string;
}

interface TokenGroup {
  name: string;
  vars: string[];
}

interface ExampleEntry {
  id: string;
  artifact: string;
  title: string;
  description?: string;
  tags?: string[];
}

interface PresetEntry {
  id: string;
  label: string;
  category: "domain" | "viewport" | "theme";
  values: Record<string, unknown>;
}

interface SurfaceMap {
  landing: { dev: string; prod: string };
  playground: { dev: string; prod: string };
  docs: { dev: string; prod: string };
}

interface FacetRegistry {
  schemaVersion: 1;
  generatedFrom: { commit: string; at: string };
  packages: PackageEntry[];
  components: ComponentEntry[];
  layouts: LayoutEntry[];
  motion: {
    families: MotionEntry[];
    authored: MotionEntry[];
    domains: string[];
  };
  tokens: { groups: TokenGroup[]; vars: string[] };
  presets: PresetEntry[];
  examples: ExampleEntry[];
  facts: Record<string, string | number>;
  surfaces: SurfaceMap;
}

// ── ADR-007: Surface Config ─────────────────────────────────────

interface ViewportPreset {
  id: string;
  label: string;
  spec: Partial<ViewportSpec>;
}

interface SurfaceConfig {
  surfaces: {
    landing: { originDev: string; originProd: string };
    playground: { originDev: string; originProd: string };
    docs: { originDev: string; originProd: string };
  };
  github: string;
  npmScope: string;
  domains: PresetEntry[];
  viewports: ViewportPreset[];
  themes: { light: string; dark: string };
}

// ── Compile-time validation: all interfaces are structurally valid ─
// This function is never called; it exists to force the compiler to
// check that all type references resolve.

function _compileCheck_(): void {
  const registry: FacetRegistry = {} as never;
  const config: SurfaceConfig = {} as never;
  const docsConfig: DocsConfig = {} as never;
  const providerProps: LayoutProviderProps = {} as never;
  const appProps: DocsAppProps = {} as never;
  const artifactKind: ArtifactKind = {} as never;
  const example: Example = {} as never;
  const controlSchema: ControlSchema = {} as never;

  // Verify cross-references between types
  const ref: ExampleRef = "" as never;
  const entries: ReferenceEntry[] = ref as unknown as ReferenceEntry[];
  const blocks: DocsBlock[] = entries as unknown as DocsBlock[];

  // Verify FacetPackageMeta is assignable to PackageEntry's fields
  const meta: FacetPackageMeta = {
    category: "foundation",
    icon: "cube",
    order: 1,
    summary: "test",
  };
  const pkg: PackageEntry = {
    name: "@test/pkg",
    version: "0.1.0",
    summary: meta.summary,
    category: meta.category,
    icon: meta.icon,
    order: meta.order,
    deps: [],
    peers: [],
    exports: [],
    install: "",
  };

  void registry;
  void config;
  void docsConfig;
  void providerProps;
  void appProps;
  void artifactKind;
  void example;
  void controlSchema;
  void pkg;
  void blocks;
}

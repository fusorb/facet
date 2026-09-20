/**
 * @fusorb/facet-sandbox - framework-agnostic live-preview host.
 *
 * The host ships NO framework code. Each runtime supplies a `SandboxAdapter`
 * (see {@link SandboxAdapter}) that turns consumer source into preview content.
 * The data-driven {@link SandboxBlock} registry and {@link SandboxConfig}
 * mirror the config-first shape used by `@fusorb/facet-docs`.
 *
 * @packageDocumentation
 */

/*  ── Block registry (data-driven, like DocsPage) ── */

/** Stable string id for a sandbox block, e.g. "motion-preset". */
export type SandboxBlockKind = string;

/**
 * A composable, data-driven UI block inside a sandbox session. Blocks are
 * registered by `kind` and wired into a {@SandboxConfig} so consumers can
 * reconfigure the playground without forking - matching the
 * tone/language-configurability the system is built around.
 */
export interface SandboxBlock<T = unknown> {
  readonly kind: SandboxBlockKind;
  readonly title: string;
  readonly description?: string;
  /** Render the block. Receives the block's section props. */
  render: (props: T) => unknown;
}

const SANDBOX_BLOCKS = new Map<SandboxBlockKind, SandboxBlock>();

/**
 * Register a sandbox block. Throws if `kind` is already registered by a
 * different block (guards accidental overrides across packages).
 */
export function registerSandboxBlock<T>(block: SandboxBlock<T>): void {
  const existing = SANDBOX_BLOCKS.get(block.kind);
  if (existing && existing !== block) {
    throw new Error(
      `[@fusorb/facet-sandbox] block "${block.kind}" is already registered.`,
    );
  }
  SANDBOX_BLOCKS.set(block.kind, block as SandboxBlock);
}

export function getSandboxBlock(
  kind: SandboxBlockKind,
): SandboxBlock | undefined {
  return SANDBOX_BLOCKS.get(kind);
}

export function listSandboxBlocks(): readonly SandboxBlock[] {
  return Array.from(SANDBOX_BLOCKS.values());
}

/*  ── Adapter seam (framework bridge) ── */

/**
 * Serialized preview output. `node` = inline-rendered framework nodes; `html`
 * = an iframe-ready blob (framework-agnostic, safe to mount isolated).
 */
export type PreviewContent =
  | { readonly kind: "node"; readonly node: unknown }
  | {
    readonly kind: "html";
    readonly html: string;
    readonly css?: string;
    readonly js?: string;
  };

/**
 * Bridge interface a runtime adapter implements. The host never calls into a
 * framework directly - it only speaks `SandboxAdapter`. The React adapter
 * (`@fusorb/facet-sandbox/react`) ships a `reactAdapter` implementation.
 */
export interface SandboxAdapter {
  readonly name: string;
  /**
   * Transform consumer `code` + `components` into preview content. Must not
   * throw on malformed input - surface a readable error via `PreviewContent`
   * instead so one bad snippet can't crash the host.
   */
  renderPreview(
    code: string,
    components: Record<string, unknown>,
  ): PreviewContent;
}

const ADAPTERS = new Map<string, SandboxAdapter>();

/** Register a runtime adapter (e.g. the `reactAdapter`). */
export function registerAdapter(adapter: SandboxAdapter): void {
  ADAPTERS.set(adapter.name, adapter);
}

export function getAdapter(name: string): SandboxAdapter | undefined {
  return ADAPTERS.get(name);
}

export function listAdapters(): readonly SandboxAdapter[] {
  return Array.from(ADAPTERS.values());
}

/*  ── Sandbox config (top-level data model) ── */

export interface SandboxSection {
  readonly title: string;
  readonly blocks: readonly SandboxBlockKind[];
}

export interface SandboxConfig {
  readonly title?: string;
  /** Source shown in the editor on first render. */
  readonly defaultCode: string;
  /** Adapter name to resolve from the registry (defaults to "react"). */
  readonly adapter?: string;
  /** Optional ordered tabs/sections of registered blocks. */
  readonly sections?: readonly SandboxSection[];
  /** Initial theme (the host applies a neutral baseline; consumers brand it). */
  readonly theme?: "light" | "dark" | "system";
}

/*  ── Security helpers (port of the docs live playground sanitizer) ── */

/** URL-valued attributes that must be scheme-checked on rendered HTML. */
const URL_ATTRS = new Set([
  "href",
  "src",
  "action",
  "formaction",
  "background",
  "poster",
  "cite",
  "data",
  "codebase",
  "manifest",
]);

/** Whitelisted URL protocols for sandbox-rendered HTML. */
const SAFE_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:", ""]);

/**
 * Return `true` when `url` uses a safe scheme or is relative/anchor-only.
 * Rejects `javascript:`, `data:`, `vbscript:`, `file:`, `blob:`, and other
 * potentially executable schemes.
 */
export function isSafeUrl(url: unknown): boolean {
  if (typeof url !== "string") return true; // non-string props are inert
  const trimmed = url.trim();
  if (!trimmed) return true;
  // Relative URLs, anchors, query strings - no colon-based scheme
  if (
    !trimmed.includes(":") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("?")
  ) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return SAFE_URL_PROTOCOLS.has(parsed.protocol);
  } catch {
    return true; // not a parseable URL - leave as-is (likely relative)
  }
}

/**
 * Sanitize URL-valued props on an HTML element props object. Unsafe URLs are
 * replaced with `#` so the element renders but does nothing malicious when
 * clicked.
 */
export function sanitizeUrlProps(
  props: Record<string, unknown>,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(props)) {
    if (URL_ATTRS.has(key) && typeof val === "string" && !isSafeUrl(val)) {
      sanitized[key] = "#";
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

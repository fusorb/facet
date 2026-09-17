/**
 * React adapter for `@fusorb/facet-sandbox`.
 *
 * The parser here is a faithful port of the docs live playground: it hand-parses
 * JSX into a `React.createElement` tree (no `eval`, no `Function` constructor,
 * no sandbox escape) and reuses {@link sanitizeUrlProps} (and therefore the
 * scheme whitelist) from the host so `href`/`src` are sanitized. Prettier
 * formatting is optional and gracefully degrades when `prettier` isn't
 * installed (the package does not hard-depend on it).
 *
 * The host (`@fusorb/facet-sandbox`) stays framework-agnostic; this adapter
 * only implements the {@link SandboxAdapter} contract.
 *
 * @packageDocumentation
 */

import * as React from "react";
import {
  getAdapter,
  sanitizeUrlProps,
  type PreviewContent,
  type SandboxAdapter,
  type SandboxConfig,
} from "../index.js";

/*  ────────────────────────────────────────────────────────── */
/*  Recursive JSX parser (no eval, no Function constructor)      */
/*  ────────────────────────────────────────────────────────── */

interface ParsedElement {
  type: "element" | "text";
  tag?: string;
  props?: Record<string, unknown>;
  children?: ParsedElement[];
  text?: string;
  selfClosing?: boolean;
}

/** Skip past a `{...}` expression. `i` points at the opening `{`. */
function skipBrace(code: string, i: number): number {
  let depth = 0;
  while (i < code.length) {
    const ch = code[i]!;
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return i + 1;
    }
    i++;
  }
  return code.length;
}

/** Skip past a string literal. `i` points at `"` or `'`. */
function skipString(code: string, i: number): number {
  const quote = code[i]!;
  i++;
  while (i < code.length) {
    if (code[i] === "\\") {
      i += 2;
      continue;
    }
    if (code[i] === quote) return i + 1;
    i++;
  }
  return code.length;
}

/** Split a string on top-level commas, respecting () [] {} and strings. */
function splitTopLevel(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let i = 0;
  let start = 0;
  while (i < s.length) {
    const ch = s[i]!;
    if (ch === '"' || ch === "'") {
      i = skipString(s, i);
      continue;
    }
    if (ch === "{" || ch === "[" || ch === "(") {
      depth++;
      i++;
      continue;
    }
    if (ch === "}" || ch === "]" || ch === ")") {
      depth--;
      i++;
      continue;
    }
    if (ch === "," && depth === 0) {
      parts.push(s.slice(start, i));
      start = i + 1;
      i++;
      continue;
    }
    i++;
  }
  parts.push(s.slice(start));
  return parts;
}

/** Index of the first `:` at depth 0 (key separator inside an object literal). */
function findTopLevelColon(s: string): number {
  let depth = 0;
  let i = 0;
  while (i < s.length) {
    const ch = s[i]!;
    if (ch === '"' || ch === "'") {
      i = skipString(s, i);
      continue;
    }
    if (ch === "{" || ch === "[" || ch === "(") {
      depth++;
      i++;
      continue;
    }
    if (ch === "}" || ch === "]" || ch === ")") {
      depth--;
      i++;
      continue;
    }
    if (ch === ":" && depth === 0) return i;
    i++;
  }
  return -1;
}

function parseArrayLiteral(
  t: string,
  components: Record<string, React.ComponentType<any>>,
): unknown[] {
  const inner = t.slice(1, -1).trim();
  if (!inner) return [];
  return splitTopLevel(inner).map((p) =>
    p.trim() ? parseLiteral(p, components) : undefined,
  );
}

function parseObjectLiteral(
  t: string,
  components: Record<string, React.ComponentType<any>>,
): Record<string, unknown> {
  const inner = t.slice(1, -1).trim();
  const obj: Record<string, unknown> = {};
  if (!inner) return obj;
  for (const part of splitTopLevel(inner)) {
    const p = part.trim();
    if (!p || p.startsWith("...")) continue; // spread -> skip
    const colon = findTopLevelColon(p);
    if (colon === -1) continue;
    let key = p.slice(0, colon).trim();
    const val = p.slice(colon + 1).trim();
    key = key.replace(/^["']|["']$/g, ""); // strip quotes from key
    if (!key) continue;
    obj[key] = parseLiteral(val, components);
  }
  return obj;
}

/**
 * Find the matching `</tagName>` for an opening tag, tracking:
 * - same-name nesting depth
 * - string literals (which may contain `<` or `>`)
 * - brace expressions (which may contain JSX)
 */
function findMatchingClose(
  code: string,
  start: number,
  tagName: string,
): number {
  let depth = 1;
  let i = start;

  while (i < code.length) {
    const ch = code[i]!;

    // Skip strings
    if (ch === '"' || ch === "'") {
      i = skipString(code, i);
      continue;
    }

    // Skip braces
    if (ch === "{") {
      i = skipBrace(code, i);
      continue;
    }

    if (ch === "<") {
      if (code[i + 1] === "/") {
        // Closing tag
        const closeMatch = code.slice(i).match(/^<\/([A-Za-z_][\w-]*)/);
        if (closeMatch && closeMatch[1] === tagName) {
          depth--;
          if (depth === 0) return i;
        }
      } else {
        // Same-name opening tag (nested)
        const openMatch = code.slice(i + 1).match(/^([A-Za-z_][\w-]*)/);
        if (openMatch && openMatch[1] === tagName) {
          depth++;
        }
      }
    }
    i++;
  }

  return -1;
}

/** Parse a single JSX element starting at `pos` (points at `<`). */
function parseElement(
  code: string,
  pos: number,
  components: Record<string, React.ComponentType<any>>,
): [ParsedElement | null, number] {
  let i = pos;

  // Skip whitespace
  while (i < code.length && /\s/.test(code[i]!)) i++;
  if (i >= code.length || code[i] !== "<") return [null, pos];

  // Closing tag - not an element start
  if (code[i + 1] === "/") return [null, i];

  // Fragment shorthand: <>
  if (code[i + 1] === ">") {
    const closeIdx = code.indexOf("</>", i + 2);
    if (closeIdx === -1) return [null, i];
    const children = parseChildren(code.slice(i + 2, closeIdx), components);
    return [
      { type: "element", tag: "fragment", children, selfClosing: false },
      closeIdx + 3,
    ];
  }

  // Read tag name
  const nameStart = i + 1;
  let j = nameStart;
  while (j < code.length && /[A-Za-z_][\w-]*/.test(code[j]!)) j++;
  const tagName = code.slice(nameStart, j);
  if (!tagName) return [null, i];
  i = j;

  // Parse attributes
  const props: Record<string, unknown> = {};
  let selfClosing = false;

  while (i < code.length) {
    // Skip whitespace
    while (i < code.length && /\s/.test(code[i]!)) i++;
    if (i >= code.length) break;

    if (code[i] === ">") {
      i++;
      break;
    }
    if (code[i] === "/" && code[i + 1] === ">") {
      selfClosing = true;
      i += 2;
      break;
    }

    // Read attribute name
    const nameStartAttr = i;
    while (i < code.length && /[\w-]/.test(code[i]!)) i++;
    const attrName = code.slice(nameStartAttr, i);
    if (!attrName) {
      i++;
      continue;
    }

    // Skip whitespace before =
    while (i < code.length && /\s/.test(code[i]!)) i++;

    if (i < code.length && code[i] === "=") {
      i++; // skip =
      while (i < code.length && /\s/.test(code[i]!)) i++;
      if (i >= code.length) break;

      if (code[i] === '"' || code[i] === "'") {
        const end = code.indexOf(code[i]!, i + 1);
        if (end === -1) break;
        props[attrName] = code.slice(i + 1, end);
        i = end + 1;
      } else if (code[i] === "{") {
        // Brace expression - track brace depth
        const exprStart = i + 1;
        const exprEnd = skipBrace(code, i);
        const expr = code.slice(exprStart, exprEnd - 1);
        const trimmed = expr.trim();

        if (trimmed.startsWith("<")) {
          // JSX element inside braces, e.g. icon={<Navbar/>}
          const [child] = parseElement(expr, 0, components);
          if (child) props[attrName] = toReactNode(child, components);
        } else {
          props[attrName] = parseLiteral(expr, components);
        }
        i = exprEnd;
      }
    } else {
      // Boolean shorthand: <Foo disabled />
      props[attrName] = true;
    }
  }

  if (selfClosing) {
    return [
      { type: "element", tag: tagName, props, children: [], selfClosing: true },
      i,
    ];
  }

  // Find matching closing tag </tagName>
  const closeIdx = findMatchingClose(code, i, tagName);
  if (closeIdx === -1) {
    // Malformed JSX - treat as self-closing
    return [
      { type: "element", tag: tagName, props, children: [], selfClosing: true },
      i,
    ];
  }

  // Parse children
  const childrenCode = code.slice(i, closeIdx);
  const children = parseChildren(childrenCode, components);
  const closeTagLen = tagName.length + 3; // </tagName>

  return [
    { type: "element", tag: tagName, props, children, selfClosing: false },
    closeIdx + closeTagLen,
  ];
}

/** Parse all children (text + elements) between an opening and closing tag. */
function parseChildren(
  code: string,
  components: Record<string, React.ComponentType<any>>,
): ParsedElement[] {
  const children: ParsedElement[] = [];
  let i = 0;

  while (i < code.length) {
    // Skip whitespace
    while (i < code.length && /\s/.test(code[i]!)) i++;
    if (i >= code.length) break;

    // Stop at closing tag
    if (code.startsWith("</", i)) break;

    // Fragment shorthand <>
    if (code.startsWith("<>", i)) {
      const closeIdx = code.indexOf("</>", i + 2);
      if (closeIdx === -1) break;
      const fragmentChildren = parseChildren(
        code.slice(i + 2, closeIdx),
        components,
      );
      children.push({
        type: "element",
        tag: "fragment",
        children: fragmentChildren,
      });
      i = closeIdx + 3;
      continue;
    }

    // Element
    if (code[i] === "<" && /[A-Za-z]/.test(code[i + 1]!)) {
      const [element, nextPos] = parseElement(code, i, components);
      if (element) {
        children.push(element);
        i = nextPos;
      } else {
        i++;
      }
      continue;
    }

    // Brace expression child: {expr}
    if (code[i] === "{") {
      const exprEnd = skipBrace(code, i);
      const expr = code.slice(i + 1, exprEnd - 1).trim();
      i = exprEnd;
      if (expr.startsWith("<")) {
        const [child] = parseElement(expr, 0, components);
        if (child) children.push(child);
      }
      // bare identifiers / expressions -> render nothing (defaults fill in)
      continue;
    }

    // Text content
    let textEnd = code.indexOf("<", i);
    if (textEnd === -1) textEnd = code.length;
    const text = code.slice(i, textEnd).trim();
    if (text) children.push({ type: "text", text });
    i = textEnd;
  }

  return children;
}

/**
 * Resolve a single literal expression. String / number / boolean / null,
 * array / object, JSX element, or a noop for arrow/function expressions and
 * bare identifiers (ambient demo data).
 */
function parseLiteral(
  expr: string,
  components: Record<string, React.ComponentType<any>>,
): unknown {
  const t = expr.trim();
  if (t === "") return undefined;
  if (t === "true") return true;
  if (t === "false") return false;
  if (t === "null") return null;
  if (t === "undefined") return undefined;
  // Number (incl. negative, float, scientific notation)
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(t)) return Number(t);
  // String literal (double / single quoted)
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1);
  }
  // JSX element(s) inside the expression, e.g. nav={<Navbar .../>}
  if (t.startsWith("<")) {
    const [node] = parseElement(t, 0, components);
    return node ? toReactNode(node, components) : undefined;
  }
  // Array literal
  if (t.startsWith("[")) return parseArrayLiteral(t, components);
  // Object literal
  if (t.startsWith("{")) return parseObjectLiteral(t, components);
  // Arrow / function expressions -> noop (cannot safely evaluate)
  if (t.includes("=>") || t.startsWith("function")) return () => {};
  // Bare identifier (ambient variable: columns, items, fintechPreset, ...).
  // The playground registry supplies demo data / defaults for these.
  if (/^[A-Za-z_$][\w$]*$/.test(t)) return undefined;
  // Member expressions, calls, spreads, anything else -> undefined
  return undefined;
}

/** Convert a ParsedElement tree into React nodes. */
function toReactNode(
  node: ParsedElement,
  components: Record<string, React.ComponentType<any>>,
): React.ReactNode {
  if (node.type === "text") {
    return node.text;
  }

  const tagName = node.tag;
  if (!tagName) return null;

  const isFragment = tagName === "fragment";
  const isHtml = /^[a-z]/.test(tagName) && !isFragment;

  let C: React.ComponentType<any> | undefined;
  if (isFragment) {
    C = React.Fragment;
  } else if (isHtml) {
    C = tagName as unknown as React.ComponentType<any>;
  } else {
    C = components[tagName];
  }

  if (!isFragment && !isHtml && !C) {
    return (
      <span className="text-sm text-muted-foreground">
        Unknown component: <code className="font-mono">{tagName}</code>. Add it
        to the <code>components</code> prop.
      </span>
    );
  }

  const childNodes = (node.children || []).map((c) =>
    toReactNode(c, components),
  );
  const props = isHtml ? sanitizeUrlProps(node.props || {}) : node.props || {};

  if (isFragment) {
    return <React.Fragment {...props}>{childNodes}</React.Fragment>;
  }

  if (childNodes.length > 0) {
    return React.createElement(C!, props, ...childNodes);
  }
  return React.createElement(C!, props);
}

/**
 * Main parser entry point. Strips imports, finds the `return` expression, and
 * recursively parses all JSX — handling fragments, nested components, JSX inside
 * brace expressions, HTML elements, and multiple roots.
 */
export function renderFromCode(
  code: string,
  components: Record<string, React.ComponentType<any>>,
): React.ReactNode {
  const cleaned = stripImports(code);

  // Find the return expression: return [<expr>] [;] [}] [EOF].
  // When there is no `return` (e.g. the user pasted bare JSX), fall back to the
  // full cleaned snippet so the preview renders instead of going blank.
  const returnMatch = cleaned.match(
    /return\s*\(?\s*([\s\S]*?)\s*\)?\s*;?\s*}?\s*$/,
  );
  const raw = (returnMatch?.[1] ?? cleaned).trim();

  if (!raw) {
    return (
      <span className="text-sm text-muted-foreground">
        Type JSX code to see a live preview.
      </span>
    );
  }

  // Parse all top-level elements (handles <>, <Component/>, multiple roots)
  const children = parseChildren(raw, components);
  if (children.length === 0) {
    return (
      <span className="text-sm text-muted-foreground">
        Type JSX code to see a live preview.
      </span>
    );
  }
  return children.length === 1 ? (
    toReactNode(children[0]!, components)
  ) : (
    <React.Fragment>
      {children.map((c) => toReactNode(c, components))}
    </React.Fragment>
  );
}

/*  ── Utilities ── */

function stripImports(code: string): string {
  return code
    .split("\n")
    .filter(
      (line) =>
        !line.trim().startsWith("import") && !line.trim().startsWith("//"),
    )
    .join("\n");
}

let _formatter: unknown = null;

async function loadFormatter(): Promise<unknown> {
  if (!_formatter) {
    const prettier = await import("prettier/standalone");
    const tsPlugin = await import("prettier/plugins/typescript");
    const estreePlugin = await import("prettier/plugins/estree");
    _formatter = { prettier, plugins: [tsPlugin, estreePlugin] };
  }
  return _formatter;
}

/**
 * Format playground code with Prettier. Gracefully returns the original code
 * when `prettier` isn't installed (the package doesn't hard-depend on it), so
 * the Format button degrades to a no-op instead of crashing.
 */
export async function formatCode(code: string): Promise<string> {
  try {
    const loaded = await loadFormatter();
    if (!loaded) return code;
    const { prettier, plugins } = loaded as {
      prettier: { format: (s: string, o: unknown) => Promise<string> };
      plugins: unknown[];
    };
    return prettier.format(code, {
      parser: "typescript",
      plugins,
      tabWidth: 2,
      printWidth: 80,
      semi: true,
      singleQuote: false,
    });
  } catch {
    return code;
  }
}

/*  ── Error boundary ── */

/**
 * Catches render-time errors from playground components so a single crashing
 * demo can't tear down the host or spin a Suspense fallback into an infinite
 * loading loop. Shows a readable message instead.
 */
export class PlaygroundErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }
  override componentDidCatch(error: Error, info: { componentStack?: string }) {
    if ((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV) {
      // eslint-disable-next-line no-console
      console.error("[Sandbox] preview error:", error, info.componentStack);
    }
  }
  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[160px] items-center justify-center">
          <div className="text-center text-sm">
            <code className="block font-mono text-destructive">
              {this.state.message}
            </code>
            <p className="mt-2 text-muted-foreground">
              This snippet isn't supported in the live sandbox.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/*  ── Adapter + components ── */

/** Convenience alias for a component map used by the parser. */
export type ComponentMap = Record<string, React.ComponentType<any>>;

/**
 * Default adapter. Turns consumer source into React nodes via the parser and
 * hands them back as `{ kind: "node", node }` for the host to render. Per the
 * `SandboxAdapter` contract it never throws — a parse failure becomes a readable
 * error node instead.
 */
export const reactAdapter: SandboxAdapter = {
  name: "react",
  renderPreview: (
    code: string,
    components: Record<string, unknown>,
  ): PreviewContent => {
    try {
      const tree = renderFromCode(code, components as unknown as ComponentMap);
      return { kind: "node", node: tree };
    } catch (e) {
      return {
        kind: "node",
        node: (
          <span className="text-sm text-muted-foreground">
            Could not parse: {(e as Error).message}
          </span>
        ),
      };
    }
  },
};

/** Scoped baseline style for the sandbox chrome. Override via className. */
const SANDBOX_STYLES = `
.facet-sandbox { display: grid; grid-template-rows: auto 1fr; border: 1px solid var(--facet-border, #e5e7eb); border-radius: calc(var(--facet-radius, 0.5rem)); overflow: hidden; background: var(--facet-surface, #ffffff); font: var(--facet-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace); }
.facet-sandbox__toolbar { display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.75rem; border-bottom: 1px solid var(--facet-border, #e5e7eb); background: var(--facet-panel, #f9fafb); backdrop-filter: blur(4px); }
.facet-sandbox__title { font-size: 0.8125rem; font-weight: 600; color: var(--facet-fg, #111827); }
.facet-sandbox__theme { width: 0.875rem; height: 0.875rem; border-radius: 50%; background: var(--facet-accent, #3b82f6); }
.facet-sandbox__body { display: flex; height: 100%; }
.facet-sandbox__editor { flex: 1 1 40%; min-width: 0; resize: none; border: none; outline: none; padding: 0.75rem; font-size: 0.8125rem; line-height: 1.25; background: var(--facet-editor-bg, #0f172a); color: var(--facet-editor-fg, #e2e8f0); tab-size: 2; }
.facet-sandbox__preview { flex: 1 1 60%; min-width: 0; padding: 1rem; overflow: auto; background: var(--facet-surface, #ffffff); }
.facet-sandbox__frame { width: 100%; height: 100%; border: 0; }
.facet-sandbox__error { padding: 0.5rem 0.75rem; font-size: 0.8125rem; color: var(--facet-error, #dc2626); background: var(--facet-error-bg, #fef2f2); border-top: 1px solid var(--facet-border, #e5e7eb); }
.facet-sandbox__placeholder { color: var(--facet-muted, #94a3b8); }
`;

interface SandboxContextValue {
  config: SandboxConfig;
  code: string;
  setCode: (code: string) => void;
  components: ComponentMap;
  adapter: SandboxAdapter;
}

const SandboxContext = React.createContext<SandboxContextValue | null>(null);

/**
 * Provide a sandbox session to nested blocks. Lets the host app compose
 * arbitrary {@link SandboxBlock}s into the editor/preview surface.
 */
export interface SandboxProviderProps {
  config: SandboxConfig;
  components: ComponentMap;
  adapter?: SandboxAdapter;
  children: React.ReactNode;
}

export function SandboxProvider({
  config,
  components,
  adapter,
  children,
}: SandboxProviderProps) {
  const [code, setCode] = React.useState(config.defaultCode);
  const resolvedAdapter = React.useMemo(
    () => adapter ?? getAdapter(config.adapter ?? "react") ?? reactAdapter,
    [adapter, config.adapter],
  );
  const value = React.useMemo<SandboxContextValue>(
    () => ({ config, code, setCode, components, adapter: resolvedAdapter }),
    [config, code, components, resolvedAdapter],
  );
  return (
    <SandboxContext.Provider value={value}>{children}</SandboxContext.Provider>
  );
}

/** Consume the current sandbox session. Throws outside a `<SandboxProvider>`. */
export function useSandbox(): SandboxContextValue {
  const ctx = React.useContext(SandboxContext);
  if (!ctx) {
    throw new Error(
      "[Sandbox] useSandbox must be used within a <SandboxProvider>.",
    );
  }
  return ctx;
}

/** Self-contained live sandbox: editor + isolated preview, wired to a config. */
export interface SandboxProps {
  config: SandboxConfig;
  components: ComponentMap;
  adapter?: SandboxAdapter;
  className?: string;
  classNames?: { root?: string; editor?: string; preview?: string };
}

export function Sandbox({
  config,
  components,
  adapter,
  className,
  classNames,
}: SandboxProps) {
  const resolvedAdapter = React.useMemo(
    () => adapter ?? getAdapter(config.adapter ?? "react") ?? reactAdapter,
    [adapter, config.adapter],
  );
  const [code, setCode] = React.useState(config.defaultCode);
  const [copied, setCopied] = React.useState(false);
  const [formatting, setFormatting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const content = React.useMemo<PreviewContent | null>(() => {
    try {
      return resolvedAdapter.renderPreview(code, components);
    } catch (e) {
      setError((e as Error).message ?? "Preview error");
      return null;
    }
  }, [code, resolvedAdapter, components]);

  const nodeContent = content?.kind === "node" ? content.node : null;
  const htmlContent = content?.kind === "html" ? content : null;
  const theme = (config.theme ?? "system") as "light" | "dark" | "system";

  const onCopy = () => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const onFormat = () => {
    setFormatting(true);
    void formatCode(code).then((next) => {
      setCode(next);
      setFormatting(false);
    });
  };

  return (
    <section
      className={[
        "facet-sandbox",
        className,
        `facet-sandbox--${theme}`,
      ].filter(Boolean).join(" ")}
    >
      <style>{SANDBOX_STYLES}</style>
      <header className="facet-sandbox__toolbar">
        {config.title && <span className="facet-sandbox__title">{config.title}</span>}
        <span
          className={`facet-sandbox__theme facet-sandbox__theme--${theme}`}
          aria-label={`theme: ${theme}`}
        />
        <button
          type="button"
          onClick={onFormat}
          disabled={formatting}
          aria-label="Format code"
        >
          {formatting ? "Formatting…" : "Format"}
        </button>
        <button type="button" onClick={onCopy} aria-label="Copy code">
          {copied ? "Copied" : "Copy"}
        </button>
      </header>
      <div className="facet-sandbox__body">
        <textarea
          className={[
            "facet-sandbox__editor",
            classNames?.editor,
          ].filter(Boolean).join(" ")}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          aria-label="Code editor"
        />
        {error && <div className="facet-sandbox__error">{error}</div>}
        <div
          className={[
            "facet-sandbox__preview",
            classNames?.preview,
          ].filter(Boolean).join(" ")}
        >
          {htmlContent ? (
            <PreviewFrame
              html={htmlContent.html}
              css={htmlContent.css}
              js={htmlContent.js}
            />
          ) : nodeContent !== null ? (
            <PlaygroundErrorBoundary>
              {nodeContent as React.ReactNode}
            </PlaygroundErrorBoundary>
          ) : (
            <span className="facet-sandbox__placeholder">No preview</span>
          )}
        </div>
      </div>
    </section>
  );
}

/** Isolated preview for adapters that return serialized HTML. */
export interface PreviewFrameProps {
  html: string;
  css?: string;
  js?: string;
  className?: string;
  title?: string;
}

export function PreviewFrame({
  html,
  css,
  js,
  className,
  title = "sandbox preview",
}: PreviewFrameProps) {
  const srcDoc = React.useMemo(() => {
    const style = css ? `<style>${css}</style>` : "";
    const script = js ? `<script>${js}</script>` : "";
    return `<!doctype html><html><head>${style}</head><body>${html}${script}</body></html>`;
  }, [html, css, js]);
  return (
    <iframe
      className={["facet-sandbox__frame", className].filter(Boolean).join(" ")}
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      srcDoc={srcDoc}
      title={title}
    />
  );
}

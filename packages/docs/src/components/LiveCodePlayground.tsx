import * as React from "react";
import { Icon } from "@arcevo/facet-components";

/**
 * Props for {@link LiveCodePlayground}.
 */
let _formatter: any = null;

async function loadFormatter(): Promise<any> {
  if (!_formatter) {
    const prettier = await import("prettier/standalone");
    const tsPlugin = await import("prettier/plugins/typescript");
    const estreePlugin = await import("prettier/plugins/estree");
    _formatter = { prettier, plugins: [tsPlugin, estreePlugin] };
  }
  return _formatter;
}

export interface LiveCodePlaygroundProps {
  /** Default usage code shown in the editor. */
  defaultCode: string;
  /** Component registry for live rendering (name -> React component). */
  components: Record<string, React.ComponentType<any>>;
  /** Called on every keystroke. */
  onCodeChange?: (code: string) => void;
  className?: string;
}

/**
 * Catches render-time errors from playground components so a single crashing
 * demo doesn't tear down the entire docs page (or spin the Suspense fallback
 * into an infinite loading loop). Shows a readable message instead.
 */
class PlaygroundErrorBoundary extends React.Component<
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
    if (process.env.NODE_ENV !== "production") {
      console.error("[Playground] preview error:", error, info.componentStack);
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
              This component's demo snippet isn't supported in the live playground.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/*  ────────────────────────────────────────────────────────── */
/*  Utilities                                                  */
/*  ────────────────────────────────────────────────────────── */

/**
 * URL-valued attributes on HTML elements that must be scheme-checked to
 * prevent javascript: / data: / vbscript: injection via <a href=…>,
 * <iframe src=…>, <img src=…>, etc.
 */
const URL_ATTRS = new Set([
  "href", "src", "action", "formaction",
  "background", "poster", "cite", "data", "codebase", "manifest",
]);

/** Whitelisted URL protocols for sandbox-rendered HTML. */
const SAFE_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:", ""]);

/**
 * Return `true` when `url` uses a safe scheme or is relative/anchor-only.
 * Rejects javascript:, data:, vbscript:, file:, blob:, and other
 * potentially executable schemes.
 */
function isSafeUrl(url: unknown): boolean {
  if (typeof url !== "string") return true; // non-string props are inert
  const trimmed = url.trim();
  if (!trimmed) return true;
  // Relative URLs, anchors, query strings - no colon-based scheme
  if (!trimmed.includes(":") || trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("?")) {
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
 * Sanitize URL-valued props on an HTML element props object. Unsafe
 * URLs are replaced with `#` so the element renders but does nothing
 * malicious when clicked.
 */
function sanitizeUrlProps(
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

function stripImports(code: string): string {
  return code
    .split("\n")
    .filter((line) => !line.trim().startsWith("import") && !line.trim().startsWith("//"))
    .join("\n");
}

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
 * Skip past a `{...}` expression. `i` points at the opening `{`.
 * Returns the index right after the matching `}`.
 */
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

/**
 * Skip past a string literal. `i` points at `"` or `'`.
 * Returns the index right after the closing quote.
 */
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

/*  ────────────────────────────────────────────────────────── */
/*  Recursive JSX parser (no eval, no Function constructor)    */
/*  ────────────────────────────────────────────────────────── */

interface ParsedElement {
  type: "element" | "text";
  tag?: string;
  props?: Record<string, unknown>;
  children?: ParsedElement[];
  text?: string;
  selfClosing?: boolean;
}

/**
 * Parse a single JSX element starting at `pos` (points at `<`).
 * Returns [element, nextPos] or [null, pos] if no element found.
 */
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
          // JSX element inside braces: {[<Icon />]}
          const [child] = parseElement(expr, 0, components);
          if (child) props[attrName] = child;
        } else {
          // Literal, array, object, or function expression
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
    return [{ type: "element", tag: tagName, props, children: [], selfClosing: true }, i];
  }

  // Find matching closing tag </tagName>
  const closeIdx = findMatchingClose(code, i, tagName);
  if (closeIdx === -1) {
    // Malformed JSX - treat as self-closing
    return [{ type: "element", tag: tagName, props, children: [], selfClosing: true }, i];
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

/**
 * Find the matching `</tagName>` for an opening tag, tracking:
 * - Same-name nesting depth
 * - String literals (which may contain < or >)
 * - Brace expressions (which may contain JSX)
 */
function findMatchingClose(code: string, start: number, tagName: string): number {
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
        // Opening tag with same name (nested)
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

/**
 * Parse all children (text + elements) between an opening and closing tag.
 */
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
      const fragmentChildren = parseChildren(code.slice(i + 2, closeIdx), components);
      children.push({ type: "element", tag: "fragment", children: fragmentChildren });
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

    // Brace expression child: {expr} - render JSX, ignore identifiers/expressions
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
 * Convert a ParsedElement tree into React nodes.
 */
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

  let C: any;
  if (isFragment) {
    C = React.Fragment;
  } else if (isHtml) {
    C = tagName;
  } else {
    C = components[tagName];
  }

  if (!isFragment && !isHtml && !C) {
    return (
      <span className="text-sm text-muted-foreground">
        Unknown component: <code className="font-mono">{tagName}</code>. Add it to the{" "}
        <code>components</code> prop.
      </span>
    );
  }

  const childNodes = (node.children || []).map((c) => toReactNode(c, components));
  const props = isHtml ? sanitizeUrlProps(node.props || {}) : node.props || {};

  if (isFragment) {
    return <React.Fragment {...props}>{childNodes}</React.Fragment>;
  }

  if (childNodes.length > 0) {
    return React.createElement(C, props, ...childNodes);
  }
  return React.createElement(C, props);
}

/**
 * Main parser entry point. Strips imports, finds the `return` expression,
 * and recursively parses all JSX - handling fragments, nested components,
 * JSX inside brace expressions, HTML elements, and multiple roots.
 */
function renderFromCode(
  code: string,
  components: Record<string, React.ComponentType<any>>,
): React.ReactNode {
  const cleaned = stripImports(code);

  // Find the return expression: return [<expr>] [;] [}] [EOF].
  // When there is no `return` (e.g. the user pasted bare JSX), fall back to the
  // full cleaned snippet so the preview renders instead of going blank.
  const returnMatch = cleaned.match(/return\s*\(?\s*([\s\S]*?)\s*\)?\s*;?\s*}?\s*$/);
  const raw = (returnMatch?.[1] ?? cleaned).trim();

  if (!raw) {
    return (
      <span className="text-sm text-muted-foreground">Type JSX code to see a live preview.</span>
    );
  }

  // Parse the first element (handles <>, <Component/>, <Component>...</Component>)
  const [firstElement] = parseElement(raw, 0, components);

  if (firstElement) {
    return toReactNode(firstElement, components);
  }

  // Fallback: parse all top-level elements (multiple roots or bare text)
  const children = parseChildren(raw, components);
  if (children.length === 0) {
    return (
      <span className="text-sm text-muted-foreground">Type JSX code to see a live preview.</span>
    );
  }
  return children.length === 1
    ? toReactNode(children[0]!, components)
    : <React.Fragment>{children.map((c) => toReactNode(c, components))}</React.Fragment>;
}

/*  ────────────────────────────────────────────────────────── */
/*  Component                                                  */
/*  ────────────────────────────────────────────────────────── */

/**
 * LiveCodePlayground - a split-pane "code <-> preview" sandbox.
 *
 * This is the seed for the second preview box on component pages:
 * the default-usage code block becomes editable and the preview updates
 * in real-time as the user types.
 *
 * Integration sketch:
 *
 * ```tsx
 * import { LiveCodePlayground } from "@arcevo/facet-docs";
 * import * as Facet from "@arcevo/facet-components";
 *
 * <LiveCodePlayground
 *   defaultCode={usageCode(slug)}
 *   components={Facet}
 *   onCodeChange={(code) => setMyCode(code)}
 * />
 * ```
 *
 * The parser is intentionally minimal - it finds JSX elements,
 * extracts string / literal / boolean props, supports JSX inside
 * brace expressions, and renders via `React.createElement`.
 * No `eval`, no Function constructor, no sandbox escape.
 */
export function LiveCodePlayground({
  defaultCode,
  components,
  onCodeChange,
  className,
}: LiveCodePlaygroundProps) {
  const [code, setCode] = React.useState(defaultCode);
  const [copied, setCopied] = React.useState(false);
  const [isFormatting, setFormatting] = React.useState(false);

  React.useEffect(() => {
    setCode(defaultCode);
  }, [defaultCode]);

  const preview = React.useMemo(() => {
    try {
      return renderFromCode(code, components);
    } catch (e) {
      return <span className="text-sm text-destructive">{(e as Error).message}</span>;
    }
  }, [code, components]);

  return (
    <div className={`grid gap-3 sm:gap-4 md:grid-cols-2 ${className ?? ""}`}>
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            onCodeChange?.(e.target.value);
          }}
          spellCheck={false}
          placeholder="// Edit the code and see it render live"
          className="w-full min-h-[160px] pl-12 pr-14 max-h-[600px] resize-y rounded-md border bg-muted/30 p-3 font-mono text-sm leading-relaxed text-foreground outline-none ring-1 ring-border placeholder:text-muted-foreground focus-within:ring-2 focus-within:ring-ring md:min-h-[240px]"
        />
        <button
          type="button"
          onClick={async () => {
            setFormatting(true);
            try {
              const { prettier, plugins } = await loadFormatter();
              const formatted = await prettier.format(code, {
                parser: "typescript",
                plugins,
                tabWidth: 2,
                printWidth: 80,
                semi: true,
                singleQuote: false,
              });
              setCode(formatted);
              onCodeChange?.(formatted);
            } catch {
              // leave code as-is on format errors
            } finally {
              setFormatting(false);
            }
          }}
          className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md border border-transparent bg-muted px-1.5 py-1 font-mono text-xs text-muted-foreground hover:bg-muted/50"
          aria-label="Format code"
          title="Format code (Prettier)"
          disabled={isFormatting}
        >
          {isFormatting ? "Fmt…" : "Fmt"}
        </button>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
            } catch {
              const el = document.createElement("textarea");
              el.value = code;
              document.body.appendChild(el);
              el.select();
              document.execCommand("copy");
              document.body.removeChild(el);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md border border-transparent bg-muted px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50"
          aria-label="Copy code"
        >
          {copied ? <Icon name="check" className="h-3.5 w-3.5" /> : <Icon name="copy" className="h-3.5 w-3.5" />}
        </button>
      </div>
      <div className="overflow-auto rounded-md border bg-background p-4 max-h-[600px]">
        <PlaygroundErrorBoundary>
          <div className="flex min-h-[160px] items-center justify-center">{preview}</div>
        </PlaygroundErrorBoundary>
      </div>
    </div>
  );
}

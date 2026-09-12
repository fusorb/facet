/**
 * @fusorb/facet-emails: framework-agnostic email renderer
 *
 * The core accepts a plain, serializable "template tree" and renders it to
 * email-safe HTML and plain text. No React, no react-email, no runtime
 * dependencies: any host (React, plain JS, a Python-generated JSON tree,
 * a Node backend) can build the same tree and render it.
 *
 * A template tree node is `{ tag, props, children }` where `children` are
 * more nodes or strings. The optional React bridge (`./react.tsx`) lets
 * React users write JSX that compiles down to these trees.
 */

/* ── Types ────────────────────────────────────────────────── */

export interface TemplateNode {
  tag: string;
  props?: Record<string, unknown>;
  children?: (TemplateNode | string)[];
}

export interface RenderOptions {
  /** Brand tokens injected as a `<style>` block + per-element defaults. */
  brand?: EmailBrand;
  /** Whether to emit a full `<!DOCTYPE html>` document. Default: true. */
  fullDocument?: boolean;
}

export interface EmailBrand {
  /** Primary brand color (buttons, links). Default: "#6366f1". */
  primary?: string;
  /** Background color of the email body. Default: "#f6f6f6". */
  background?: string;
  /** Card/surface background. Default: "#ffffff". */
  surface?: string;
  /** Text color. Default: "#1f2937". */
  text?: string;
  /** Muted text color. Default: "#6b7280". */
  muted?: string;
  /** Font family stack. Default: system UI stack. */
  fontFamily?: string;
  /** Accent radius in px. Default: 8. */
  radius?: number;
  /** Brand name shown in the layout header. */
  brandName?: string;
}

/* ── Escaping ─────────────────────────────────────────────── */

const ESCAPE: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeText(value: unknown): string {
  return String(value).replace(/[&<>"']/g, (c) => ESCAPE[c] ?? c);
}

function escapeAttr(value: unknown): string {
  return escapeText(value).replace(/`/g, "&#96;");
}

/* ── Style objects → inline CSS ───────────────────────────── */

const STYLE_PROP_RE = /[A-Z]/g;

function styleToCss(style: Record<string, unknown>): string {
  return Object.entries(style)
    .map(([key, value]) => {
      const cssKey = key.replace(STYLE_PROP_RE, (c) => `-${c.toLowerCase()}`);
      return `${cssKey}:${String(value)}`;
    })
    .join(";");
}

/* ── Hyperscript helper ───────────────────────────────────── */

export type TemplateChild = TemplateNode | string | number | bigint | null | undefined | false;

export function createElement(
  tag: string,
  props?: Record<string, unknown> | null,
  ...children: TemplateChild[]
): TemplateNode {
  const flat: (TemplateNode | string)[] = [];
  const push = (c: TemplateChild) => {
    if (c == null || c === false) return;
    if (Array.isArray(c)) {
      for (const item of c) push(item as TemplateChild);
      return;
    }
    flat.push(typeof c === "number" || typeof c === "bigint" ? String(c) : c);
  };
  for (const c of children) push(c);
  return { tag, props: props ?? {}, children: flat };
}

/* ── HTML rendering ───────────────────────────────────────── */

const VOID_TAGS = new Set(["img", "br", "hr", "meta", "link", "input", "wbr"]);
const BOOLEAN_ATTRS = new Set(["checked", "disabled", "selected", "readonly", "multiple", "required"]);

function renderAttrs(props: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === "style" && typeof value === "object" && value !== null) {
      const css = styleToCss(value as Record<string, unknown>);
      if (css) parts.push(`style="${escapeAttr(css)}"`);
      continue;
    }
    if (key === "className") {
      parts.push(`class="${escapeAttr(value)}"`);
      continue;
    }
    if (key === "htmlFor") {
      parts.push(`for="${escapeAttr(value)}"`);
      continue;
    }
    if (BOOLEAN_ATTRS.has(key)) {
      if (value === true) parts.push(key);
      continue;
    }
    if (value === true) {
      parts.push(key);
      continue;
    }
    parts.push(`${key}="${escapeAttr(value)}"`);
  }
  return parts.length ? ` ${parts.join(" ")}` : "";
}

function renderNode(node: TemplateNode, brand: EmailBrand, depth: number): string {
  const { tag, props = {}, children = [] } = node;
  const attrs = renderAttrs(props);
  if (VOID_TAGS.has(tag)) return `<${tag}${attrs}>`;

  const inner = children
    .map((c) =>
      typeof c === "string"
        ? escapeText(c)
        : renderNode(c, brand, depth + 1),
    )
    .join("");

  return `<${tag}${attrs}>${inner}</${tag}>`;
}

function brandStyleBlock(brand: EmailBrand): string {
  const primary = brand.primary ?? "#6366f1";
  const text = brand.text ?? "#1f2937";
  const muted = brand.muted ?? "#6b7280";
  const radius = brand.radius ?? 8;
  return [
    "body{margin:0;padding:0;-webkit-text-size-adjust:100%}",
    `a{color:${primary};text-decoration:none}`,
    `h1,h2,h3{color:${text}}`,
    `p{color:${text}}`,
    `code,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px}`,
    `hr{border:none;border-top:1px solid ${muted}22}`,
    `.facet-btn{border-radius:${radius}px;font-weight:600}`,
  ].join("\n");
}

/**
 * Render a template tree (or array of trees) to an email-safe HTML string.
 */
export function renderEmail(
  node: TemplateNode | TemplateNode[],
  options: RenderOptions = {},
): string {
  const brand = options.brand ?? {};
  const body = Array.isArray(node) ? node : [node];
  const inner = body.map((n) => renderNode(n, brand, 0)).join("\n");

  if (options.fullDocument === false) return inner;

  const fontFamily =
    brand.fontFamily ??
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  const background = brand.background ?? "#f6f6f6";

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${escapeText(brand.brandName ?? "Email")}</title>
    <style>
      ${brandStyleBlock(brand)}
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:${background};font-family:${fontFamily};color:${
    brand.text ?? "#1f2937"
  }">
    ${inner}
  </body>
</html>`;
}

/* ── Plain-text rendering ─────────────────────────────────── */

/** Structural text: block spacing, list bullets, links as [label](href). */
export function renderEmailText(node: TemplateNode | TemplateNode[]): string {
  const body = Array.isArray(node) ? node : [node];
  const parts: string[] = [];

  const walk = (n: TemplateNode, depth: number) => {
    const { tag, children = [] } = n;
    const blockish =
      tag === "p" || tag === "div" || tag === "section" || tag === "tr" || tag === "li" ||
      tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4" ||
      tag === "ul" || tag === "ol" || tag === "table" || tag === "br" || tag === "hr";

    for (const child of children) {
      if (typeof child === "string") {
        parts.push(child.trim());
        continue;
      }
      if (child.tag === "a" && typeof child.props?.href === "string") {
        const label = child.children?.map((c) => (typeof c === "string" ? c.trim() : "")).join("") || child.props.href;
        parts.push(`[${label}](${child.props.href})`);
        continue;
      }
      if (child.tag === "li") {
        walk(child, depth + 1);
        continue;
      }
      walk(child, depth + 1);
    }
    if (blockish) parts.push("\n");
  };

  for (const n of body) walk(n, 0);
  return parts
    .join("")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

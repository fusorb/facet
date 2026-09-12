/**
 * @fusorb/facet-emails: template primitives
 *
 * Every primitive exists in two forms:
 *   - A plain function returning a `TemplateNode` (framework-agnostic):
 *       emailButton({ href, children, variant })
 *   - A React component (JSX convenience layer):
 *       <EmailButton href="...">Go</EmailButton>
 *
 * Both share the same style-object API and inherit brand tokens from the
 * `brand` option passed to `renderEmail` / the layout.
 */

import * as React from "react";
import { createElement, type TemplateNode } from "./render.js";
import { toNodeValue } from "./react.js";

/* ── Style tokens ─────────────────────────────────────────── */

const PRIMARY = "var(--primary, #6366f1)";
const SURFACE = "var(--surface, #ffffff)";
const TEXT = "var(--text, #1f2937)";
const MUTED = "var(--muted, #6b7280)";

/** Merge props.children with variadic children (framework-agnostic API
 *  lets callers pass children either way: emailText({children}, "x") or
 *  emailText({}, "x", "y")). */
type AnyChild = TemplateNode | string | number | bigint | null | undefined | false;
function mergeChildren(
  propsChildren: React.ReactNode | undefined,
  variadic: AnyChild[],
): TemplateNode[] {
  const out: TemplateNode[] = [];
  const pushNode = (c: unknown) => {
    if (c == null || typeof c === "boolean" || typeof c === "bigint") return;
    // React nodes (elements, strings, numbers) are renderable through the
    // tree walker; this is the framework-agnostic boundary where React
    // elements are treated as opaque renderables (the React bridge
    // converts them to real TemplateNodes before rendering).
    out.push(c as TemplateNode);
  };
  if (propsChildren != null) {
    if (Array.isArray(propsChildren)) {
      for (const c of propsChildren) pushNode(c);
    } else {
      pushNode(propsChildren);
    }
  }
  for (const c of variadic) pushNode(c);
  return out;
}

/* ── EmailLayout ──────────────────────────────────────────── */

export interface EmailLayoutProps {
  previewText: string;
  heading?: string;
  brandName?: string;
  footerNote?: string;
  footerMeta?: string;
  children?: React.ReactNode;
}

export function emailLayout(props: EmailLayoutProps, ...extra: AnyChild[]): TemplateNode {
  const {
    previewText,
    heading,
    brandName = "facet",
    footerNote,
    footerMeta,
    children,
  } = props;
  const mergedChildren = mergeChildren(children, extra);
  const body = createElement(
    "table",
    { width: "100%", cellPadding: 0, cellSpacing: 0, role: "presentation", style: { backgroundColor: "var(--background, #f6f6f6)", margin: 0, padding: 0 } },
    createElement(
      "tr",
      {},
      createElement(
        "td",
        { align: "center", style: { padding: "32px 16px" } },
        createElement(
          "table",
          { width: "100%", cellPadding: 0, cellSpacing: 0, role: "presentation", style: { maxWidth: "600px", width: "100%", margin: "0 auto", backgroundColor: SURFACE, borderRadius: "12px", border: "1px solid #00000014", overflow: "hidden" } },
          // Preview text (hidden)
          createElement("div", { style: { display: "none", maxHeight: 0, overflow: "hidden" } }, previewText),
          // Header
          createElement(
            "tr",
            {},
            createElement(
              "td",
              { style: { padding: "24px 32px" } },
              createElement("h1", { style: { margin: 0, fontSize: "20px", fontWeight: 700, color: TEXT } }, brandName),
            ),
          ),
          // Divider
          createElement("tr", {}, createElement("td", { style: { borderTop: "1px solid #00000014" } })),
          // Heading + body
          createElement(
            "tr",
            {},
            createElement(
              "td",
              { style: { padding: "24px 32px" } },
              heading ? createElement("h2", { style: { margin: "0 0 16px", fontSize: "18px", fontWeight: 700, color: TEXT } }, heading) : null,
              ...mergedChildren,
            ),
          ),
          // Footer
          createElement(
            "tr",
            {},
            createElement(
              "td",
              { style: { padding: "24px 32px", borderTop: "1px solid #00000014" } },
              footerNote
                ? createElement("p", { style: { margin: "0 0 8px", fontSize: "13px", lineHeight: "20px", color: MUTED } }, footerNote)
                : null,
              createElement("p", { style: { margin: 0, fontSize: "12px", color: MUTED } }, footerMeta ?? "This is an automated message. Please do not reply."),
            ),
          ),
        ),
      ),
    ),
  );
  return body;
}

/* ── EmailButton ──────────────────────────────────────────── */

export type EmailButtonVariant = "primary" | "danger" | "outline";

export interface EmailButtonProps {
  href: string;
  children?: React.ReactNode;
  variant?: EmailButtonVariant;
  style?: React.CSSProperties;
}

export function emailButton(props: EmailButtonProps): TemplateNode {
  const { href, children = "Learn more", variant = "primary", style = {} } = props;
  const base: React.CSSProperties = {
    display: "inline-block",
    padding: "13px 24px",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "15px",
    textDecoration: "none",
    boxSizing: "border-box",
    margin: "8px 0",
    ...style,
  };
  if (variant === "primary") {
    base.backgroundColor = PRIMARY;
    base.color = "#ffffff";
  } else if (variant === "danger") {
    base.backgroundColor = "var(--danger, #dc2626)";
    base.color = "#ffffff";
  } else {
    base.border = `1px solid ${PRIMARY}`;
    base.color = PRIMARY;
    base.backgroundColor = "transparent";
  }
  return createElement("a", { href, className: "facet-btn", style: base }, ...mergeChildren(children, []));
}

/* ── EmailText ────────────────────────────────────────────── */

export type EmailTextVariant = "default" | "small" | "muted" | "code";

export interface EmailTextProps {
  children?: React.ReactNode;
  variant?: EmailTextVariant;
  style?: React.CSSProperties;
}

export function emailText(props: EmailTextProps, ...extra: AnyChild[]): TemplateNode {
  const { children, variant = "default", style = {} } = props;
  const mergedChildren = mergeChildren(children, extra);
  const base: React.CSSProperties = {
    margin: "0 0 12px",
    fontSize: "15px",
    lineHeight: "24px",
    color: TEXT,
    ...style,
  };
  if (variant === "small") base.fontSize = "13px";
  if (variant === "muted") {
    base.color = MUTED;
    base.fontSize = "13px";
  }
  if (variant === "code") {
    base.fontFamily = "ui-monospace,SFMono-Regular,Menlo,monospace";
    base.fontSize = "14px";
    base.backgroundColor = "#00000008";
    base.border = "1px solid #00000014";
    base.borderRadius = "6px";
    base.padding = "10px 14px";
  }
  return createElement("p", { style: base }, ...mergedChildren);
}

/* ── EmailCodeBlock ───────────────────────────────────────── */

export interface EmailCodeBlockProps {
  /** Single code (MFA code path). */
  code?: string;
  /** Multiple codes rendered as a grid (recovery-codes path). */
  codes?: string[];
  /** Number of grid columns when `codes` is provided. Default: 2. */
  columns?: 1 | 2;
  label?: string;
  style?: React.CSSProperties;
}

function codeCell(code: string): TemplateNode {
  return createElement(
    "td",
    {
      style: {
        fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace",
        fontSize: "14px",
        fontWeight: 600,
        letterSpacing: "0.1em",
        color: TEXT,
        margin: 0,
        padding: "8px 12px",
        backgroundColor: SURFACE,
        border: "1px solid #00000014",
        borderRadius: "6px",
      },
    },
    code,
  );
}

export function emailCodeBlock(props: EmailCodeBlockProps): TemplateNode {
  const { code, codes, columns = 2, label, style = {} } = props;

  // Single-code path: a dark monospace block.
  if (code != null && codes == null) {
    return createElement(
      "table",
      { width: "100%", cellPadding: 0, cellSpacing: 0, role: "presentation", style: { margin: "16px 0", ...style } },
      createElement(
        "tr",
        {},
        createElement(
          "td",
          { style: { backgroundColor: "#0f172a", borderRadius: "8px", padding: "16px 20px" } },
          label
            ? createElement("p", { style: { margin: "0 0 8px", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "#94a3b8" } }, label)
            : null,
          createElement(
            "pre",
            { style: { margin: 0, color: "#e2e8f0", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "15px", letterSpacing: "2px" } },
            code,
          ),
        ),
      ),
    );
  }

  // Multiple-codes path: a grid (2 columns by default, recovery-code style).
  const list = codes ?? [];
  const pairs: string[][] = [];
  if (columns === 2) {
    for (let i = 0; i < list.length; i += 2) {
      pairs.push([list[i] ?? "", list[i + 1] ?? ""]);
    }
  } else {
    list.forEach((c) => pairs.push([c]));
  }

  return createElement(
    "table",
    { width: "100%", cellPadding: 0, cellSpacing: 0, role: "presentation", style: { margin: "16px 0", ...style } },
    createElement(
      "tr",
      {},
      createElement(
        "td",
        { style: { backgroundColor: "#f9fafb", border: "1px solid #00000014", borderRadius: "8px", padding: "16px 20px" } },
        label
          ? createElement("p", { style: { margin: "0 0 12px", fontSize: "13px", color: MUTED } }, label)
          : null,
        ...pairs.map((pair, i) =>
          createElement(
            "table",
            { width: "100%", cellPadding: 0, cellSpacing: 0, role: "presentation", style: { marginBottom: i < pairs.length - 1 ? "8px" : 0 } },
            createElement(
              "tr",
              {},
              ...pair.map((c) => createElement("td", { style: { width: columns === 2 ? "50%" : "100%", padding: "2px" } }, c ? codeCell(c) : null)),
            ),
          ),
        ),
      ),
    ),
  );
}

/* ── EmailDivider ─────────────────────────────────────────── */

export function emailDivider(): TemplateNode {
  return createElement("hr", { style: { border: "none", borderTop: "1px solid #00000014", margin: "24px 0" } });
}

/* ── EmailLink ────────────────────────────────────────────── */

export interface EmailLinkProps {
  href: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function emailLink(props: EmailLinkProps, ...extra: AnyChild[]): TemplateNode {
  const { href, children, style = {} } = props;
  const merged = mergeChildren(children, extra);
  const kids: (TemplateNode | string)[] = merged.length ? merged : [href];
  return createElement("a", { href, style: { color: PRIMARY, textDecoration: "underline", ...style } }, ...kids);
}

/* ── EmailSecurityNotice ──────────────────────────────────── */

export type EmailSecurityNoticeVariant = "warning" | "danger" | "info";

export interface EmailSecurityNoticeProps {
  ip?: string;
  userAgent?: string;
  location?: string;
  /** Content override (when used as a callout, not an IP/device table). */
  children?: React.ReactNode;
  variant?: EmailSecurityNoticeVariant;
  style?: React.CSSProperties;
}

const NOTICE_STYLES: Record<
  EmailSecurityNoticeVariant,
  { bg: string; border: string; text: string }
> = {
  warning: { bg: "#fffbeb", border: "#d97706", text: "#b45309" },
  danger: { bg: "#fef2f2", border: "#dc2626", text: "#b91c1c" },
  info: { bg: "#f9fafb", border: "#e5e7eb", text: "#4b5563" },
};

export function emailSecurityNotice(props: EmailSecurityNoticeProps): TemplateNode {
  const { ip, userAgent, location, children, variant = "info", style = {} } = props;
  const s = NOTICE_STYLES[variant];

  // Callout form: arbitrary children with variant styling.
  if (children != null) {
    const merged = mergeChildren(children, []);
    return createElement(
      "table",
      { width: "100%", cellPadding: 0, cellSpacing: 0, role: "presentation", style: { margin: "16px 0", ...style } },
      createElement(
        "tr",
        {},
        createElement(
          "td",
          { style: { backgroundColor: s.bg, border: `1px solid ${s.border}`, borderRadius: "8px", padding: "12px 20px" } },
          createElement("p", { style: { margin: 0, color: s.text, fontSize: "14px", lineHeight: "20px", fontWeight: 500 } }, ...merged),
        ),
      ),
    );
  }

  // Table form: IP / location / device rows.
  const rows = [
    ...(ip ? [{ k: "IP address", v: ip }] : []),
    ...(location ? [{ k: "Location", v: location }] : []),
    ...(userAgent ? [{ k: "Device", v: userAgent }] : []),
  ];
  return createElement(
    "table",
    { width: "100%", cellPadding: 0, cellSpacing: 0, role: "presentation", style: { margin: "16px 0", border: "1px solid #00000014", borderRadius: "8px", ...style } },
    ...rows.map((r) =>
      createElement(
        "tr",
        {},
        createElement("td", { style: { padding: "8px 16px", width: "120px", fontSize: "13px", color: MUTED } }, r.k),
        createElement("td", { style: { padding: "8px 16px", fontSize: "13px", color: TEXT } }, r.v),
      ),
    ),
  );
}

/* ── EmailSection / EmailRow / EmailColumn ────────────────── */

export interface EmailSectionProps {
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/** A table-based container for grouped email content (react-email Section equivalent). */
export function emailSection(props: EmailSectionProps, ...extra: AnyChild[]): TemplateNode {
  const { style = {}, children } = props;
  const merged = mergeChildren(children, extra);
  return createElement(
    "table",
    { width: "100%", cellPadding: 0, cellSpacing: 0, role: "presentation", style },
    createElement("tr", {}, createElement("td", { style: { padding: "0" } }, ...merged)),
  );
}

export interface EmailRowProps {
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/** A table row for grid layouts (react-email Row equivalent). */
export function emailRow(props: EmailRowProps, ...extra: AnyChild[]): TemplateNode {
  const { style = {}, children } = props;
  const merged = mergeChildren(children, extra);
  return createElement("tr", { style }, ...merged);
}

export interface EmailColumnProps {
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/** A table cell (react-email Column equivalent). */
export function emailColumn(props: EmailColumnProps, ...extra: AnyChild[]): TemplateNode {
  const { style = {}, children } = props;
  const merged = mergeChildren(children, extra);
  return createElement("td", { style }, ...merged);
}

/* ── EmailList ────────────────────────────────────────────── */

export interface EmailListProps {
  items: string[];
  style?: React.CSSProperties;
}

export function emailList(props: EmailListProps): TemplateNode {
  const { items, style = {} } = props;
  return createElement(
    "ul",
    { style: { margin: "16px 0", paddingLeft: "20px", ...style } },
    ...items.map((item) =>
      createElement("li", { style: { margin: "0 0 8px", fontSize: "15px", lineHeight: "24px", color: TEXT } }, item),
    ),
  );
}

/* ── React wrappers ───────────────────────────────────────── */

function wrap<T extends object>(fn: (props: T) => TemplateNode) {
  return function EmailComponent(props: T) {
    return toReactNode(fn(props));
  };
}

/** Convert a TemplateNode or React element to a React element (for JSX
 *  composition). React elements (from composed children) are converted
 *  through toNodeValue first so they survive the round-trip. */
function toReactNode(node: TemplateNode): React.ReactElement {
  const { tag, props = {}, children = [] } = node;
  return React.createElement(
    tag,
    props as React.HTMLAttributes<HTMLElement>,
    ...children.map((c) => {
      if (typeof c === "string") return c;
      // A child that is itself a React element (e.g. <EmailText> passed
      // into <EmailLayout>) has no `tag`; convert it to a template node
      // so it renders instead of being dropped.
      if (typeof (c as { tag?: unknown }).tag !== "string") {
        const converted = toNodeValue(c as never);
        if (converted == null) return null;
        return typeof converted === "string" ? converted : toReactNode(converted);
      }
      return toReactNode(c);
    }),
  );
}

export const EmailLayout = wrap<EmailLayoutProps & { children?: React.ReactNode }>((props) => {
  const { children, ...rest } = props;
  return emailLayout({ ...rest, children });
});
export const EmailButton = wrap<EmailButtonProps>(emailButton);
export const EmailText = wrap<EmailTextProps>(emailText);
export const EmailCodeBlock = wrap<EmailCodeBlockProps>(emailCodeBlock);
export const EmailDivider = wrap<{}>(() => emailDivider());
export const EmailLink = wrap<EmailLinkProps>(emailLink);
export const EmailSecurityNotice = wrap<EmailSecurityNoticeProps>(emailSecurityNotice);
export const EmailList = wrap<EmailListProps>(emailList);
export const EmailSection = wrap<EmailSectionProps>(emailSection);
export const EmailRow = wrap<EmailRowProps>(emailRow);
export const EmailColumn = wrap<EmailColumnProps>(emailColumn);

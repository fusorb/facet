/**
 * @fusorb/facet-components: RichTextEditor
 *
 * A lightweight rich text editor: bold / italic / underline / lists /
 * links / headings. Built on a `contenteditable` div + the standard
 * `document.execCommand` API (which is still supported in every
 * evergreen browser for form input use cases). For most product-
 * surface needs (descriptions, notes, comments) this is enough.
 *
 * Why: pulling in tiptap / slate / lexical is overkill for a 90% case.
 * Hand-rolling formatting toolbar takes an afternoon; this is one
 * component, one onChange handler.
 */

import * as React from "react";
import DOMPurify from "dompurify";
import { cn } from "../utils.js";
import { Icon, type IconName } from "../icon/index.js";
import { Button } from "./button.js";

/* ── Types ─────────────────────────────────────────────────── */

export interface RichTextEditorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** HTML value. */
  value: string;
  /** Called with the new HTML on every change. */
  onChange: (next: string) => void;
  /** Placeholder when the editor is empty. */
  placeholder?: string;
  /** Disable the editor. */
  disabled?: boolean;
  /** Optional className for the editor surface (the editable area). */
  contentClassName?: string;
  /** ARIA label. */
  ariaLabel?: string;
  /** Min content height in px. Default: 160. */
  minHeight?: number;
  /** Override user-visible text strings (toolbar aria-labels, dialog buttons). */
  copy?: Partial<RichTextEditorCopy>;
}

export interface RichTextEditorCopy {
  /** Override individual toolbar button aria-labels / titles (keyed by tool id). */
  toolLabels: Partial<Record<string, string>>;
  /** Link-dialog URL input placeholder. */
  linkPlaceholder: string;
  /** Link-dialog "Insert" button label. */
  insertLabel: string;
  /** Link-dialog "Cancel" button label. */
  cancelLabel: string;
}

const defaultRichTextEditorCopy: RichTextEditorCopy = {
  toolLabels: {},
  linkPlaceholder: "https://",
  insertLabel: "Insert",
  cancelLabel: "Cancel",
};

/* ── Helpers ───────────────────────────────────────────────── */

interface ToolDef {
  id: string;
  label: string;
  icon: IconName;
  command: string;
  value?: string;
}

const TOOLS: ToolDef[] = [
  { id: "bold", label: "Bold", icon: "bold", command: "bold" },
  { id: "italic", label: "Italic", icon: "italic", command: "italic" },
  { id: "underline", label: "Underline", icon: "underline", command: "underline" },
  { id: "h2", label: "Heading", icon: "heading-2", command: "formatBlock", value: "h2" },
  { id: "h3", label: "Subheading", icon: "heading-3", command: "formatBlock", value: "h3" },
  { id: "p", label: "Paragraph", icon: "pilcrow", command: "formatBlock", value: "p" },
  { id: "ul", label: "Bulleted list", icon: "list", command: "insertUnorderedList" },
  { id: "ol", label: "Numbered list", icon: "list-ordered", command: "insertOrderedList" },
  { id: "quote", label: "Quote", icon: "quote", command: "formatBlock", value: "blockquote" },
  { id: "code", label: "Inline code", icon: "code", command: "formatBlock", value: "pre" },
  { id: "link", label: "Link", icon: "link", command: "createLink" },
];

/**
 * URL schemes that may be used in `href` / `src` attributes. Everything else
 * (javascript:, data:, vbscript:, file:, …) is rejected so that
 * `document.execCommand("createLink")` cannot inject a XSS payload.
 */
const SAFE_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Return `true` when `url` is a safe URI for an `<a href>` or similar.
 * Relative URLs (no scheme) and same-page anchors (`#…`) are allowed.
 */
function isSafeUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true; // empty is fine (createLink with empty = no-op)
  // Relative URLs, anchors, query strings - no colon-based scheme
  if (!trimmed.includes(":") || trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("?")) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return SAFE_URL_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false; // not a parseable URL - reject
  }
}

/**
 * Sanitize HTML for the contenteditable surface using DOMPurify.
 * Strips <script> tags, event-handler attributes, and other active content.
 */
function sanitizeHtml(html: string): string {
  // DOMPurify is browser-only; it no-ops (returns input) when window is absent.
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "b", "i", "em", "strong", "u", "s", "strike",
      "span", "p", "br", "div",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "blockquote", "pre", "code",
      "a",
      "img", "table", "thead", "tbody", "tr", "th", "td",
      "hr", "sub", "sup",
    ],
    ALLOWED_ATTR: [
      "href", "src", "alt", "title",
      "width", "height",
      "start",
      "cellpadding", "cellspacing", "colspan", "rowspan",
    ],
    FORBID_ATTR: ["on*", "style", "class"],
  });
}

/* ── Component ─────────────────────────────────────────────── */

/**
 * A drop-in lightweight rich text editor.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something…",
  disabled,
  className,
  contentClassName,
  ariaLabel = "Rich text editor",
  minHeight = 160,
  copy,
  ...props
}: RichTextEditorProps) {
  const c = { ...defaultRichTextEditorCopy, ...copy };
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [linkPromptOpen, setLinkPromptOpen] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");

  // Sync external `value` into the contenteditable only when it diverges
  // from the current DOM (controlled -> uncontrolled boundary).
  React.useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    // Sanitize before injecting HTML - prevents stored XSS if the consumer
    // passes unsanitized content (e.g. from a database or paste).
    const safe = sanitizeHtml(value);
    if (el.innerHTML !== safe) el.innerHTML = safe;
  }, [value]);

  const runCommand = (tool: ToolDef) => {
    if (disabled) return;
    if (tool.command === "createLink") {
      setLinkPromptOpen(true);
      return;
    }
    editorRef.current?.focus();
    document.execCommand(tool.command, false, tool.value);
    // Sync DOM back into React state.
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const submitLink = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    if (linkUrl) {
      // Guard against javascript: / data: / vbscript: URLs that would
      // execute script when the link is clicked.
      if (!isSafeUrl(linkUrl)) {
        setLinkUrl("");
        setLinkPromptOpen(false);
        return;
      }
      document.execCommand("createLink", false, linkUrl);
      onChange(editorRef.current.innerHTML);
    }
    setLinkUrl("");
    setLinkPromptOpen(false);
  };

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  return (
    <div
      {...props}
      className={cn(
        "w-full overflow-hidden rounded-md border border-border bg-background transition focus-within:ring-2 focus-within:ring-ring/30",
        disabled && "opacity-60",
        className,
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary/30 p-1.5">
        {TOOLS.map((tool) => (
          <Button
            key={tool.id}
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            aria-label={c.toolLabels[tool.id] ?? tool.label}
            title={c.toolLabels[tool.id] ?? tool.label}
            onClick={() => runCommand(tool)}
          >
            <Icon name={tool.icon} className="size-4" />
          </Button>
        ))}
      </div>

      {/* Editor surface */}
      <div
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        aria-label={ariaLabel}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        className={cn(
          "prose prose-sm max-w-none px-4 py-3 outline-none",
          "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground/60",
          contentClassName,
        )}
        style={{ minHeight }}
      />

      {/* Link dialog */}
      {linkPromptOpen && (
        <div className="flex items-center gap-2 border-t border-border bg-secondary/20 p-2 text-sm">
          <input
            type="url"
            placeholder={c.linkPlaceholder}
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 rounded-md border border-border bg-background px-2 py-1 outline-none focus:border-primary"
            autoFocus
          />
          <Button size="sm" onClick={submitLink}>
            {c.insertLabel}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setLinkUrl("");
              setLinkPromptOpen(false);
            }}
          >
            {c.cancelLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

RichTextEditor.displayName = "RichTextEditor";
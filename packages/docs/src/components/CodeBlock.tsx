import * as React from "react";
// Facet Button/LightIcon replaced with native elements (engine stays facet-agnostic, L3).

export interface CodeBlockProps {
  /** Optional heading above the code block. */
  title?: string;
  /** Source code to display. */
  code: string;
}

/** Plain code block with a copy-to-clipboard button. */
export function CodeBlock({ title, code }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable (e.g. non-secure context); ignore.
    }
  }, [code]);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        {title ? (
          <span className="text-sm font-semibold text-foreground">{title}</span>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={handleCopy}
          className="h-7 gap-1.5 rounded-md border px-2 text-xs"
        >
          {copied ? "✓" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 font-mono text-[13px] leading-6 text-foreground">
        {code}
      </pre>
    </div>
  );
}

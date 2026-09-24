import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  LightIcon,
} from "@fusorb/facet-components/light";

export interface PageActionItem {
  /** Display label. */
  label: string;
  /** Short description shown as secondary text. */
  description?: string;
  /** Icon name from the facet icon registry. */
  icon?: string;
  /** Click handler. */
  onClick?: () => void;
  /** Render in red (destructive). Default: false */
  destructive?: boolean;
  /** Show a separator above this item. Default: false */
  separatorBefore?: boolean;
}

/**
 * Pill-shaped action bar with a prominent Copy page button and a chevron
 * dropdown for additional page-level actions.
 *
 * Always includes the default Copy page + Download actions. Pass `actions`
 * to append any developer-defined items — e.g. "Ask question" when an
 * AI agent is integrated into the docs, "Share", "Edit on GitHub", etc.
 *
 * For full control, skip this component and pass a custom `pageActions`
 * node to <GuidePage /> directly.
 */
export function PageActionBar({ actions = [] }: { actions?: PageActionItem[] }) {
  const articleRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    articleRef.current =
      document.querySelector("article.prose-docs") ??
      document.querySelector("article");
  }, []);

  const getText = () => {
    const node = articleRef.current ?? document.querySelector("article");
    return node?.textContent ?? "";
  };

  const copyPage = React.useCallback(async () => {
    const text = getText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  }, []);

  const downloadPage = React.useCallback(() => {
    const text = getText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "page-notes.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const allActions: PageActionItem[] = [
    {
      label: "Copy page",
      description: "Copy the page text to your clipboard",
      icon: "copy",
      onClick: copyPage,
    },
    {
      label: "Download page as PDF",
      description: "Export the page as a file (PDF via jsPDF coming soon)",
      icon: "download",
      onClick: downloadPage,
    },
    ...actions,
  ];

  return (
    <div className="inline-flex items-center overflow-hidden rounded-md border border-border bg-background/80 text-sm">
      <button
        type="button"
        onClick={copyPage}
        className="flex items-center gap-1.5 px-3 py-1.5 font-medium text-foreground hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <LightIcon name="copy" className="size-4" />
        Copy page
      </button>
      <div className="h-5 w-px bg-border" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center rounded-r-md px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:rotate-180 transition-transform duration-200"
          >
            <LightIcon name="chevron-down" className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {allActions.map((item) => (
            <React.Fragment key={item.label}>
              {item.separatorBefore && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onSelect={item.onClick}
                className={`flex flex-col items-start gap-0.5 ${
                  item.destructive
                    ? "text-destructive focus:text-destructive"
                    : ""
                }`}
              >
                {item.icon && (
                  <LightIcon name={item.icon as any} className="size-4" />
                )}
                <span className="font-medium">{item.label}</span>
                {item.description && (
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                )}
              </DropdownMenuItem>
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

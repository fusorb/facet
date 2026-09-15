import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { docsManifest } from "../manifest.js";
import { useDocsApp } from "../context.js";

/** One entry in the unified prev/next navigation sequence. */
export interface DocsNavEntry {
  /** Route path, e.g. "/auth/sign-in" or "/components/button". */
  path: string;
  /** Human label shown in prev/next. */
  label: string;
}

/**
 * The full docs navigation sequence: every content page (in registry
 * order) followed by every component page (in manifest order). This is
 * the same reading order a user gets from the sidebar, so Alt+Up/Down
 * moves through the whole site regardless of which sidebar sections are
 * currently collapsed.
 */
export function useDocsNavigation(): {
  entries: DocsNavEntry[];
  index: number;
  prev?: DocsNavEntry;
  next?: DocsNavEntry;
} {
  const { pages, showComponents } = useDocsApp();
  const { pathname } = useLocation();

  const entries = React.useMemo(() => {
    const list: DocsNavEntry[] = pages.map((page) => ({
      path: page.path,
      label: page.title,
    }));
    if (showComponents) {
      for (const entry of docsManifest) {
        list.push({
          path: `/components/${entry.slug}`,
          label: entry.name,
        });
      }
    }
    return list;
  }, [pages, showComponents]);

  const index = entries.findIndex((entry) => entry.path === pathname);
  return {
    entries,
    index,
    prev: index > 0 ? entries[index - 1] : undefined,
    next:
      index >= 0 && index < entries.length - 1 ? entries[index + 1] : undefined,
  };
}

/**
 * Alt+Up / Alt+Down move to the previous / next docs page in the unified
 * navigation sequence (content pages + component pages). Works even when
 * the sidebar section is collapsed; ignored while typing in a field.
 */
export function useDocsKeyboardNav(): void {
  const navigate = useNavigate();
  const { prev, next } = useDocsNavigation();

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      if (event.key === "ArrowUp" && prev) navigate(prev.path);
      if (event.key === "ArrowDown" && next) navigate(next.path);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [prev, next, navigate]);
}

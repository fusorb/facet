import * as React from "react";
import { Kbd } from "@fusorb/facet-components/light";

/** A single shortcut row: what it does + the keys. */
export interface KeyboardShortcut {
  /** Short description of what the shortcut does. */
  label: string;
  /** Key tokens, e.g. ["Alt", "←"] or ["mod", "K"]. Use "mod" for ⌘/Ctrl. */
  keys: string[];
}

export interface KeyboardShortcutsProps {
  /** Optional heading above the table. Default: "Keyboard shortcuts". */
  title?: string;
  /** The shortcuts to render. */
  shortcuts: KeyboardShortcut[];
}

function Key({ token }: { token: string }) {
  if (token === "mod") return <Kbd mod />;
  return <Kbd>{token}</Kbd>;
}

/**
 * A small "Keyboard shortcuts" table rendered with Kbd chips. The `mod`
 * token renders the platform modifier (⌘ on macOS, Ctrl elsewhere), so
 * the same data works on every OS.
 */
export function KeyboardShortcuts({ title = "Keyboard shortcuts", shortcuts }: KeyboardShortcutsProps) {
  return (
    <div className="not-prose overflow-hidden rounded-lg border border-border">
      <div className="border-b border-border bg-muted/30 px-4 py-2 text-sm font-medium text-foreground">
        {title}
      </div>
      <div className="divide-y divide-border">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.label}
            className="flex items-center justify-between gap-4 px-4 py-2.5"
          >
            <span className="text-sm text-foreground/90">{shortcut.label}</span>
            <span className="flex shrink-0 items-center gap-1">
              {shortcut.keys.map((token, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-muted-foreground">+</span>}
                  <Key token={token} />
                </React.Fragment>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

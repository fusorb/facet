import * as React from "react";
import { ThemePreviewFrame } from "./ThemePreviewFrame.js";

export interface Control {
  /** Control label */
  label: string;
  /** Option values */
  options: string[];
  /** Current value */
  value: string;
  /** Set the value */
  onChange: (value: string) => void;
}

export interface PlaygroundProps {
  /** Control rows rendered above the preview. */
  controls?: Control[];
  children: React.ReactNode;
  /** Optional note under the preview. */
  note?: string;
}

/**
 * Lightweight Storybook-Control replacement: renders facet components
 * in a bordered preview with optional variant/size toggle chips.
 */
export function Playground({ controls, children, note }: PlaygroundProps) {
  return (
    <div className="my-6 overflow-visible rounded-lg border border-border">
      {controls && controls.length > 0 && (
        <div className="flex flex-wrap gap-4 border-b border-border bg-muted/30 px-4 py-3">
          {controls.map((control) => (
            <div key={control.label} className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {control.label}
              </span>
              <div className="flex flex-wrap gap-1">
                {control.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => control.onChange(option)}
                    aria-pressed={control.value === option}
                    className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                      control.value === option
                        ? "bg-foreground/10 text-foreground"
                        : "bg-background text-muted-foreground hover:bg-foreground/5"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <ThemePreviewFrame>{children}</ThemePreviewFrame>
      {note && (
        <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          {note}
        </p>
      )}
    </div>
  );
}

/** Convenience hook for a single-select control. */
export function useControl(options: string[], initial: string) {
  const [value, setValue] = React.useState(initial);
  return {
    value,
    control: {
      label: "Variant",
      options,
      value,
      onChange: setValue,
    },
  };
}

/**
 * Dropzone: click or drag-and-drop file upload area with keyboard support
 * and clipboard paste (Ctrl/Cmd+V) handling.
 */
import * as React from "react";
import { cn } from "../utils.js";
import { Icon } from "../icon/index.js";

export interface DropzoneProps {
  /** Called with the selected files when a drop or browse completes. */
  onFiles?: (files: File[]) => void;
  /** Accepted MIME types or extensions (e.g. "image/*", ".pdf"). */
  accept?: string;
  /** Allow selecting more than one file. Default: true */
  multiple?: boolean;
  /** Label shown in the center of the zone. */
  label?: string;
  /** Secondary hint shown under the label. */
  hint?: string;
  /** Disable interaction. */
  disabled?: boolean;
  /**
   * Enable clipboard paste (Ctrl/Cmd+V). Pasted files are validated
   * against `accept`; pasted text is wrapped in a File named
   * `paste-<timestamp>.txt`. Default: false
   */
  allowPaste?: boolean;
  className?: string;
}

/**
 * A click-to-browse, drag-and-drop file input. Visually signals an active
 * drag, forwards the dropped files via `onFiles`, and stays keyboard
 * accessible via a hidden <input type="file">.
 */
const Dropzone = React.forwardRef<HTMLDivElement, DropzoneProps>(
  (
    {
      onFiles,
      accept,
      multiple = true,
      label = "Drag files here or click to browse",
      hint,
      disabled,
      allowPaste = false,
      className,
    },
    ref,
  ) => {
    const [dragging, setDragging] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleFiles = React.useCallback(
      (list: FileList | null) => {
        if (!list) return;
        onFiles?.(Array.from(list));
      },
      [onFiles],
    );

    const matchesAccept = React.useCallback(
      (file: File): boolean => {
        if (!accept) return true;
        const rules = accept
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean);
        return rules.some((rule) => {
          if (rule.startsWith(".")) {
            return file.name.toLowerCase().endsWith(rule.toLowerCase());
          }
          if (rule.endsWith("/*")) {
            const [type] = rule.split("/");
            return file.type.startsWith(`${type}/`);
          }
          return file.type === rule;
        });
      },
      [accept],
    );

    const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
      if (disabled || !allowPaste) return;
      const items = Array.from(event.clipboardData?.items ?? []);
      const files: File[] = [];
      for (const item of items) {
        if (item.kind !== "file") continue;
        const file = item.getAsFile();
        if (file && matchesAccept(file)) files.push(file);
      }
      if (files.length > 0) {
        event.preventDefault();
        onFiles?.(files);
        return;
      }
      // No files on the clipboard (e.g. copied text) -> wrap it as a text file.
      const text = event.clipboardData?.getData("text/plain");
      if (text) {
        event.preventDefault();
        onFiles?.([
          new File([text], `paste-${Date.now()}.txt`, { type: "text/plain" }),
        ]);
      }
    };

    return (
      <div
        ref={ref}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-label={label}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border bg-background px-6 py-10 text-center transition-colors",
          "hover:border-primary/50 hover:bg-accent/30",
          dragging && "border-primary bg-primary/10",
          disabled && "pointer-events-none opacity-50",
          className,
        )}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (disabled) return;
          handleFiles(event.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onPaste={handlePaste}
      >
        <Icon name="upload" className="size-8 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
    );
  },
);
Dropzone.displayName = "Dropzone";

export { Dropzone };

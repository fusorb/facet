import * as React from "react";
import { cn } from "../utils.js";
import { Icon } from "../icon/index.js";
import {
  Group as RrpGroup,
  Panel as RrpPanel,
  Separator as RrpSeparator,
  useDefaultLayout as useRrpDefaultLayout,
  useGroupRef,
  usePanelRef,
} from "react-resizable-panels";
import type {
  GroupImperativeHandle,
  GroupProps as RrpGroupProps,
  Layout as RrpLayout,
  PanelImperativeHandle,
  PanelProps as RrpPanelProps,
  PanelSize as RrpPanelSize,
  SeparatorProps as RrpSeparatorProps,
} from "react-resizable-panels";

/* ── orientation context ────────────────────────────────────── */

/**
 * Lets <ResizableHandle> auto-infer the orientation from its parent
 * <ResizablePanelGroup>, so consumers never have to pass `orientation` on
 * both the group and the handle. The handle's prop still wins if supplied.
 */
const OrientationContext = React.createContext<"horizontal" | "vertical">(
  "horizontal",
);

/* ── helpers ─────────────────────────────────────────────── */

/**
 * Normalise a panel-size value for react-resizable-panels v4.
 *
 * v4 treats bare **numbers** as pixels (e.g. `defaultSize={200}` → 200 px)
 * and unit-less **strings** as percentages (e.g. `defaultSize="50"` → 50 %).
 *
 * The facet API lets consumers write ergonomic 0–100 numbers that mean
 * "percent of the parent group". This converts those numbers to `%` strings
 * so `<ResizablePanel defaultSize={50} />` really means 50 %, not 50 px.
 *
 * String values (`"30%"`, `"200px"`, `"1rem"`, …) pass through untouched so
 * callers that need pixel / font / viewport units still work verbatim.
 */
function normalizeSize(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}%` : value;
}

/* ── public types ─────────────────────────────────────────── */

export interface ResizablePanelGroupProps extends Omit<
  RrpGroupProps,
  "elementRef" | "orientation"
> {
  orientation?: "horizontal" | "vertical";
}

export interface ResizablePanelProps extends Omit<
  RrpPanelProps,
  "elementRef" | "defaultSize" | "minSize" | "maxSize" | "collapsedSize"
> {
  /**
   * Preferred size of the panel.
   *
   * - **Number** (0–100): percentage of the parent group
   *   (e.g. `defaultSize={50}` → 50 %).
   * - **String**: any v4 size expression - `"50"`, `"30%"`, `"200px"`, `"1rem"`.
   */
  defaultSize?: number | string;
  /**
   * Minimum size (same interpretation rules as `defaultSize`).
   * Defaults to 0 % in react-resizable-panels.
   */
  minSize?: number | string;
  /**
   * Maximum size (same interpretation rules as `defaultSize`).
   * Defaults to 100 % in react-resizable-panels.
   */
  maxSize?: number | string;
  /** Size the panel shrinks to when `collapsible` is true (same rules). */
  collapsedSize?: number | string;
}

export interface ResizableHandleProps extends Omit<
  RrpSeparatorProps,
  "elementRef"
> {
  /** Render a visible grip icon on the separator. */
  withHandle?: boolean;
  /**
   * Layout direction of the enclosing group - controls the handle's cursor
   * and the orientation of the grip icon.
   */
  orientation?: "horizontal" | "vertical";
}

/**
 * Imperative handle returned by {@link useResizable}.
 * Lets consumers read and drive the layout of a {@link ResizablePanelGroup}.
 */
export interface ResizableImperativeHandle {
  /** Ref to pass to `<ResizablePanelGroup groupRef={...} />`. */
  groupRef: React.RefObject<GroupImperativeHandle | null>;
  /** Ref to pass to `<ResizablePanel panelRef={...} />` - controls one panel. */
  panelRef: React.RefObject<PanelImperativeHandle | null>;
  /** Current layout: map of panel id → size percentage (0–100). */
  getLayout: () => RrpLayout;
  /** Apply a layout imperatively. */
  setLayout: (layout: RrpLayout) => void;
  /** Collapse the panel targeted by `panelRef`. No-op if not collapsible. */
  collapse: () => void;
  /** Expand a collapsed panel. No-op if not collapsed. */
  expand: () => void;
  /** Whether the target panel is currently collapsed. */
  isCollapsed: () => boolean;
  /** Resize the target panel (number = pixels, string = v4 size expression). */
  resize: (size: number | string) => void;
  /** Current size of the target panel (percentage + pixels). */
  getSize: () => RrpPanelSize | undefined;
}

/**
 * Result of {@link useResizableLayout} - spread directly onto a
 * `<ResizablePanelGroup>`.
 */
export type ResizableLayoutResult = ReturnType<typeof useRrpDefaultLayout>;

/* ── hooks ──────────────────────────────────────────────── */

/**
 * Imperative control for a {@link ResizablePanelGroup} and a single
 * {@link ResizablePanel} within it.
 *
 * Attach `groupRef` to the Group and `panelRef` to the Panel you want to
 * control. Ideal for sidebar toggle buttons, programmatic layout changes,
 * or reading the current sizes:
 *
 * @example
 * const r = useResizable();
 * <ResizablePanelGroup groupRef={r.groupRef}>
 *   <ResizablePanel panelRef={r.panelRef} collapsible defaultSize={20}>
 *     <Sidebar />
 *   </ResizablePanel>
 *   <ResizableHandle withHandle />
 *   <ResizablePanel defaultSize={80}><Main /></ResizablePanel>
 * </ResizablePanelGroup>
 *
 * // outside: r.isCollapsed() ? r.expand() : r.collapse();
 */
export function useResizable(): ResizableImperativeHandle {
  const groupRef = useGroupRef();
  const panelRef = usePanelRef();

  return {
    groupRef,
    panelRef,
    getLayout: () => groupRef.current?.getLayout() ?? {},
    setLayout: (layout) => groupRef.current?.setLayout(layout),
    collapse: () => panelRef.current?.collapse(),
    expand: () => panelRef.current?.expand(),
    isCollapsed: () => panelRef.current?.isCollapsed() ?? false,
    resize: (size) => panelRef.current?.resize(size),
    getSize: () => panelRef.current?.getSize(),
  };
}

/**
 * Persist-and-restore hook for a {@link ResizablePanelGroup} layout.
 *
 * Wraps react-resizable-panels' `useDefaultLayout` so panel sizes survive a
 * page reload (stored in `localStorage` under `storageKey`). Spread the result
 * directly onto the Group:
 *
 * @example
 * const { defaultLayout, onLayoutChanged } = useResizableLayout("sidebar");
 * <ResizablePanelGroup defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged}>
 *   ...
 * </ResizablePanelGroup>
 */
export function useResizableLayout(storageKey: string): ResizableLayoutResult {
  return useRrpDefaultLayout({ id: storageKey });
}

/* ── components ──────────────────────────────────────────── */

/**
 * ResizablePanelGroup
 *
 * A composable split-pane layout built on `react-resizable-panels` v4.
 * Combine with any number of {@link ResizablePanel} children and optional
 * {@link ResizableHandle} separators.
 *
 * Use `orientation="vertical"` for top/bottom panels, or keep the default
 * `"horizontal"` for side-by-side panels.
 *
 * @example
 * <ResizablePanelGroup orientation="horizontal" onLayoutChanged={saveLayout}>
 *   <ResizablePanel defaultSize={50}>
 *     <Sidebar />
 *   </ResizablePanel>
 *   <ResizableHandle withHandle />
 *   <ResizablePanel defaultSize={50}>
 *     <MainContent />
 *   </ResizablePanel>
 * </ResizablePanelGroup>
 */
const ResizablePanelGroup = React.forwardRef<
  HTMLDivElement,
  ResizablePanelGroupProps
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <OrientationContext.Provider value={orientation}>
    <RrpGroup
      elementRef={ref}
      orientation={orientation}
      className={cn(
        "flex h-full w-full",
        orientation === "vertical" ? "flex-col" : "flex-row",
        className,
      )}
      {...props}
    />
  </OrientationContext.Provider>
));
ResizablePanelGroup.displayName = "ResizablePanelGroup";

/**
 * ResizableHandle
 *
 * Optional gutter between two {@link ResizablePanel} children. Dragging it
 * resizes the adjacent panels. Pass `withHandle` for a visible grip icon.
 *
 * The separator orientation is inferred from the parent group, but pass
 * `orientation` to pick the correct grip icon and cursor.
 */
const ResizableHandle = React.forwardRef<HTMLDivElement, ResizableHandleProps>(
  ({ className, withHandle, orientation: orientationProp, ...props }, ref) => {
    const contextOrientation = React.useContext(OrientationContext);
    const orientation = orientationProp ?? contextOrientation;
    return (
      <RrpSeparator
        elementRef={ref}
        className={cn(
          "relative flex items-center justify-center rounded-sm bg-border hover:bg-accent",
          orientation === "vertical"
            ? "h-1.5 w-full cursor-row-resize"
            : "w-1.5 h-full cursor-col-resize",
          className,
        )}
        {...props}
      >
        {withHandle &&
          (orientation === "vertical" ? (
            <Icon
              name="grip-horizontal"
              className="h-4 w-4 text-muted-foreground"
            />
          ) : (
            <Icon
              name="grip-vertical"
              className="h-4 w-4 text-muted-foreground"
            />
          ))}
      </RrpSeparator>
    );
  },
);
ResizableHandle.displayName = "ResizableHandle";

/**
 * ResizablePanel
 *
 * A single panel inside a {@link ResizablePanelGroup}. Use `defaultSize`
 * (0–100 as a percentage) and `minSize` / `maxSize` to control flexible
 * layouts - numbers are normalised to `%` strings for v4 compatibility.
 *
 * Panels can be **collapsible**: set `collapsible` and `collapsedSize`, then
 * toggle via {@link useResizable} or the Panel's `panelRef`.
 */
const ResizablePanel = React.forwardRef<HTMLDivElement, ResizablePanelProps>(
  (
    { className, defaultSize, minSize, maxSize, collapsedSize, ...props },
    ref,
  ) => (
    <RrpPanel
      elementRef={ref}
      className={cn("h-full w-full", className)}
      defaultSize={normalizeSize(defaultSize)}
      minSize={normalizeSize(minSize)}
      maxSize={normalizeSize(maxSize)}
      collapsedSize={normalizeSize(collapsedSize)}
      {...props}
    />
  ),
);
ResizablePanel.displayName = "ResizablePanel";

export { ResizablePanelGroup, ResizableHandle, ResizablePanel };

/**
 * @fusorb/facet-components: Chart
 *
 * An SVG-based chart primitive supporting line, bar, area, pie, donut,
 * and composed (mixed-type) charts. Pure-SVG, no heavy deps, and
 * integrates with the facet design-tokens via CSS variables.
 *
 * Inspired by recharts patterns:
 *  - Per-series `type` → composed charts (e.g. line + bar on same axes)
 *  - Crosshair cursor line that follows the mouse (point markers are opt-in via `crosshairPoints`)
 *  - Floating tooltip positioned at the cursor
 *  - Smooth / step / linear curve interpolation
 *  - Stacking for bars and areas
 *  - Interactive legend with per-series toggle
 *  - Fade-in entry animation
 *  - Line / area draw-from-origin animation (stroke-dashdraw)
 *  - Pie / donut spin-open animation (0 → 360°)
 *
 *  Usage:
 *   import { Chart } from "@fusorb/facet-components";
 *   <Chart x={["Mon", "Tue"]} series={[{ id: "a", label: "A", data: [30, 80] }]} />
 */

import * as React from "react";
import { cn } from "../utils.js";
import {
  ChartRangeSelector,
  type ChartRangeSelectorProps,
} from "./chart-range-selector.js";

/* ── Types ─────────────────────────────────────────────────── */

export type ChartType =
  "line" | "bar" | "area" | "pie" | "donut" | "composed" | "histogram";
export type ChartSeriesType = "line" | "bar" | "area";
export type CurveType = "linear" | "smooth" | "step";
export type ChartLegendPosition = "top" | "bottom";

export interface ChartTooltipProps {
  active: boolean;
  series: ChartSeries;
  /** All visible series at the hovered data index (for multi-series tooltips). */
  seriesList: ChartSeries[];
  dataIndex: number;
  x: string | number;
  value: number;
  color: string;
}

export interface ChartSeries {
  id: string;
  /** Series label (legend + tooltip). */
  label: string;
  /** y values, in the same order as `x` on the parent Chart. */
  data: number[];
  /** Series color (CSS). Defaults to a slot from the theme palette. */
  color?: string;
  /** Per-series chart type - enables composed (mixed-type) charts. */
  type?: ChartSeriesType;
  /** Hide this series. */
  hidden?: boolean;
}

/** Theme color overrides. Any omitted field falls back to the corresponding
 *  CSS custom property from the active design-token theme. */
export interface ChartColors {
  /** Overrides `var(--foreground)`. */
  foreground?: string;
  /** Overrides `var(--background)`. */
  background?: string;
  /** Overrides `var(--border)`. */
  border?: string;
  /** Overrides `var(--muted-foreground)`. */
  muted?: string;
  /** Overrides the default chart palette (chart-1 through chart-5). */
  chart?: string[];
}

export interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Shared x-axis labels (one per data point). */
  x: (string | number)[];
  /** Series to render. */
  series: ChartSeries[];
  /** Chart type. Default: "line". */
  type?: ChartType;
  /** Show the legend row. Default: true. */
  showLegend?: boolean;
  /** Show the y-axis grid + labels. Default: true (cartesian only). */
  showAxes?: boolean;
  /** Show a tooltip on hover. Default: true. */
  showTooltip?: boolean;
  /** Show a crosshair cursor that follows the mouse. Default: equals showTooltip. */
  showCrosshair?: boolean;
  /** Chart height in pixels. Default: 240 (cartesian), 480 (radial). */
  height?: number;
  /** Format a y value (e.g. abbreviate 1000 → "1k"). */
  formatY?: (n: number) => string;
  /** Format an x value (e.g. "Jan", "Q1"). */
  formatX?: (v: string | number) => string;
  /** Number of ticks drawn on the value axis. Default: 4. */
  tickCount?: number;
  /** Minimum value of the value axis; overrides the auto-computed range. */
  yMin?: number;
  /** Maximum value of the value axis; overrides the auto-computed range. */
  yMax?: number;
  /** Override a tooltip value. */
  formatTooltipValue?: (
    value: number,
    series: ChartSeries,
    dataIndex: number,
  ) => string;
  /** Custom tooltip renderer. */
  renderTooltip?: (props: ChartTooltipProps) => React.ReactNode;
  /** Theme color slot for the default series color. */
  defaultColor?: string;
  /** Curve style for line / area: "linear" | "smooth" | "step". Default: "linear". */
  curve?: CurveType;
  /** Stack bars / areas. Default: false (grouped instead). */
  stacked?: boolean;
  /** Connect null / undefined values instead of breaking the path. Default: false. */
  connectNulls?: boolean;
  /** Bar orientation: "vertical" (default) or "horizontal". */
  layout?: "vertical" | "horizontal";
  /** Gap between bars within a group (px). Set to 0 for histogram style. */
  barGap?: number;
  /** Fade-in animation on mount. Default: true. */
  animate?: boolean;
  /** Donut chart inner radius (px). Default: auto (~40% of radius). */
  innerRadius?: number;
  /** Legend position: "top" or "bottom". Default: "bottom". */
  legendPosition?: ChartLegendPosition;
  /** Called when a legend item is toggled. */
  onLegendToggle?: (seriesId: string, visible: boolean) => void;
  /** Called when hover state changes. */
  onHover?: (state: { seriesIndex: number; dataIndex: number } | null) => void;
  /** Wrap the chart in a vertically scrollable container when its natural
   *  height exceeds this pixel value. Ideal for horizontal bar charts with many
   *  categories. */
  maxHeight?: number;
  /** Row height (px) per category for horizontal bar charts; drives the
   *  auto-grown chart height so bars/labels don't crowd. Default: 36. */
  rowHeight?: number;
  /** Render colored point markers that track the crosshair cursor.
   *  Default: false — points stay fixed at their data positions and only the
   *  crosshair line follows the mouse. */
  crosshairPoints?: boolean;
  /** Chart viewBox width in pixels. Default: 800. Set to match your container
   *  for crisp text at any rendered size. */
  width?: number;
  /** Font size (px) for axis tick labels and category labels. Default: 11. */
  axisFontSize?: number;
  /** Font size (px) for pie/donut slice labels (primary line). Default: 12. */
  pieLabelFontSize?: number;
  /** Custom renderer for pie/donut slice labels. Receives the slice index,
   *  value, percentage (0–100), x-axis label, and the source series. When
   *  omitted the default rich label (bold category + muted value) is used. */
  renderSliceLabel?: (
    index: number,
    value: number,
    percent: number,
    xLabel: string | number,
    series: ChartSeries,
  ) => React.ReactNode;
  /** Position the floating tooltip relative to the cursor (px), clamped to the
   *  chart bounds so it never overlaps content. Accepts a uniform number or
   *  { x, y }. Default: 16. */
  tooltipOffset?: number | { x: number; y: number };
  /** Hide pie/donut slice labels whose share of the total falls below this
   *  fraction (0–1). Default 0 = render every label. */
  sliceLabelThreshold?: number;
  /** Custom centered content for a donut chart (e.g. a total + subtext). When
   *  omitted, a centered total plus slice count is rendered. */
  renderCenter?: () => React.ReactNode;
  /** Corner radius (px) for bar charts. Use 0 for sharp bars. Default: 4. */
  barRadius?: number;
  /** Plot-area padding (px). Pass a partial object to override individual sides
   * for full control of chart spacing. Default: { top: 20, right: 24, bottom: 40, left: 56 }. */
  padding?: Partial<Record<"top" | "right" | "bottom" | "left", number>>;
  /** Spacing between bar groups (px) — i.e. the gap between category slots.
   * Increase for more breathing room between bars. Default: 8. */
  barCategoryGap?: number;
  /** Animation duration in milliseconds. Default: 500. */
  animationDuration?: number;
  /** Opacity for *inactive* (non-hovered) bars to make the hovered bar pop.
   * Default: 0.45. Set to 1 to disable dimming. */
  barInactiveOpacity?: number;
  /** Stroke width (px) for line and area paths. Default: 2. */
  lineWidth?: number;
  /** Radius (px) of data-point dots on line/area charts.
   *  The active (hovered) dot is dotRadius + 2. Default: 3. */
  dotRadius?: number;
  /** Opacity (0–1) for non-hovered data-point dots and pie slices.
   *  Default: 0.45 (matches barInactiveOpacity). */
  dotInactiveOpacity?: number;
  /** Stroke width (px) of the crosshair vertical guide line. Default: 1. */
  crosshairWidth?: number;
  /** Stroke-dasharray of the crosshair line. Default: "4 2". */
  crosshairDasharray?: string;
  /** Stroke opacity (0–1) of the crosshair line. Default: 0.25. */
  crosshairOpacity?: number;
  /** Radius (px) of the crosshair intersection dot. Default: 4. */
  crosshairDotRadius?: number;
  /** Stroke width (px) of the crosshair dot outline. Default: 1.5. */
  crosshairDotWidth?: number;
  /** Stroke width (px) of axis spines. Default: 1. */
  axisWidth?: number;
  /** Stroke width (px) of gridlines. Default: 1. */
  gridlineWidth?: number;
  /** Stroke-dasharray of gridlines. Default: "2 4". */
  gridlineDasharray?: string;
  /** Stroke width (px) of pie/donut slice outlines.
   *  The active slice is sliceWidth + 0.5. Default: 1.5. */
  sliceWidth?: number;
  /** Opacity (0–1) for dimmed legend items. Default: 0.3. */
  legendInactiveOpacity?: number;
  /** Tension (0–1) for smooth (cardinal-spline) curves. Higher = tighter.
   *  Default: 0.3. */
  curveTension?: number;
  /** Override theme colors (foreground, background, border, muted, palette).
   *  Every visual element that uses a CSS variable can be customized here. */
  colors?: ChartColors;
  /** Duration (ms) for hover and crosshair entry/exit transitions.
   *  The draw-animation duration is controlled separately by `animationDuration`.
   *  Default: 150. */
  transitionDuration?: number;
  /** Whether the crosshair intersection dot snaps to the nearest data point.
   *  The crosshair line ALWAYS follows the raw cursor (Recharts pattern).
   *  When `true` (default for line/area/composed), the dot is hidden — the
   *  active data-point dot already marks the position, so rendering both
   *  would create a visual duplicate. When `false` (default for
   *  bar/histogram), the dot follows the cursor and shows the interpolated
   *  value at the hover point. Override with an explicit boolean. */
  crosshairSnap?: boolean;
  /** Optional range selector rendered inside the chart container.
   *  Fully opt-in — only rendered when provided. Accepts position, size,
   *  and minimizable props; see {@link ChartRangeSelectorProps}. */
  rangeSelector?: Pick<
    ChartRangeSelectorProps,
    | "presets"
    | "active"
    | "onChange"
    | "position"
    | "size"
    | "minimizable"
    | "defaultMinimized"
    | "minimized"
    | "onMinimizedChange"
  >;
}

/* ── Constants ─────────────────────────────────────────────── */

const DEFAULT_HEIGHT = 240;
const DEFAULT_HEIGHT_RADIAL = 480;
const DEFAULT_COLOR = "var(--primary)";
const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const DEFAULT_PADDING = { top: 20, right: 24, bottom: 40, left: 56 };
const DEFAULT_BAR_GAP = 4;
const DEFAULT_BAR_CATEGORY_GAP = 8;
const DEFAULT_ANIMATION_DURATION = 500;
const DEFAULT_BAR_INACTIVE_OPACITY = 0.45;
const DEFAULT_LINE_WIDTH = 2;
const DEFAULT_DOT_RADIUS = 3;
const DEFAULT_DOT_INACTIVE_OPACITY = 0.45;
const DEFAULT_CROSSHAIR_WIDTH = 1;
const DEFAULT_CROSSHAIR_DASHARRAY = "4 2";
const DEFAULT_CROSSHAIR_OPACITY = 0.25;
const DEFAULT_CROSSHAIR_DOT_RADIUS = 4;
const DEFAULT_CROSSHAIR_DOT_WIDTH = 1.5;
const DEFAULT_AXIS_WIDTH = 1;
const DEFAULT_GRIDLINE_WIDTH = 1;
const DEFAULT_GRIDLINE_DASHARRAY = "2 4";
const DEFAULT_TICK_COUNT = 4;
const DEFAULT_SLICE_WIDTH = 1.5;
const DEFAULT_LEGEND_INACTIVE_OPACITY = 0.3;
const DEFAULT_DOT_HOVER_SCALE = 1.15;
const DEFAULT_SLICE_HOVER_SCALE = 1.05;
const DEFAULT_BAR_HOVER_SCALE = 1.02;
const DEFAULT_CURVE_TENSION = 0.3;
const DEFAULT_RADIAL_MARGIN = 32;
const DEFAULT_CARTESIAN_MARGIN = 16;
const DEFAULT_TIP_WIDTH = 192;
const DEFAULT_TIP_HEIGHT = 56;
const DEFAULT_RADIAL_LABEL_GAP = 24;
const DEFAULT_DONUT_INNER_RADIUS_RATIO = 0.4;
const DONUT_TOTAL_SCALE = 1.5;
const DONUT_SUBTITLE_SCALE = 1.3;
const PIE_SECONDARY_LABEL_SCALE = 0.8;
const DEFAULT_TRANSITION_DURATION = 150;

/** Falls-back chart colors. Individual entries can be overridden via the
 *  `colors` prop — omitted keys inherit from the design-token theme. */
const DEFAULT_CHART_COLORS: Required<ChartColors> = {
  foreground: "var(--foreground)",
  background: "var(--background)",
  border: "var(--border)",
  muted: "var(--muted-foreground)",
  chart: [...PALETTE],
};

/* CSS keyframes injected once for the entry animation. */
const ANIMATION_ID = "facet-chart-anim";

function injectKeyframes() {
  if (typeof document === "undefined" || document.getElementById(ANIMATION_ID))
    return;
  const style = document.createElement("style");
  style.id = ANIMATION_ID;
  style.textContent = `
@keyframes facet-chart-fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes facet-chart-draw {
  from { stroke-dashoffset: var(--facet-path-len); }
  to { stroke-dashoffset: 0; }
}
`;
  document.head.appendChild(style);
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/* ── Path helpers ──────────────────────────────────────────── */

/** Linear polyline path from [x,y] pairs. */
function linearPath(pts: Array<[number, number]>): string {
  if (pts.length === 0) return "";
  return `M ${pts.map((p) => p.join(",")).join(" L ")}`;
}

/** Step (Monotone-X) path — step-after: horizontal to the next x, then vertical.
 * The last step extends to `endX` (the plot's right edge) so the staircase
 * is visually complete and the line touches the last marker. */
function stepPath(pts: Array<[number, number]>, endX?: number): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0]!.join(",")}`;
  let d = `M ${pts[0]!.join(",")}`;
  for (let i = 1; i < pts.length; i++) {
    const [cx, cy] = pts[i]!;
    d += ` H ${cx.toFixed(2)} V ${cy.toFixed(2)}`;
  }
  if (endX !== undefined && endX > pts[pts.length - 1]![0]) {
    d += ` H ${endX.toFixed(2)}`;
  }
  return d;
}

/** Cardinal-spline (Catmull-Rom → Bézier) for smooth curves. */
function smoothPath(
  pts: Array<[number, number]>,
  tension = DEFAULT_CURVE_TENSION,
): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0]!.join(",")}`;
  if (pts.length === 2) return linearPath(pts);

  const get = (i: number) => pts[Math.max(0, Math.min(i, pts.length - 1))]!;
  let d = `M ${pts[0]!.join(",")}`;

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = get(i - 1);
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = get(i + 2);

    const cp1x = p1[0] + (p2[0] - p0[0]) * tension;
    const cp1y = p1[1] + (p2[1] - p0[1]) * tension;
    const cp2x = p2[0] - (p3[0] - p1[0]) * tension;
    const cp2y = p2[1] - (p3[1] - p1[1]) * tension;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

/** Build a line path honoring `curve` and `connectNulls`.
 * @param endX  X coordinate of the plot's right edge — used by `step` to
 *   extend the last stair tread so the line reaches the edge. */
function buildLinePath(
  pts: Array<[number, number] | null>,
  curve: CurveType,
  connectNulls: boolean,
  endX?: number,
  tension: number = DEFAULT_CURVE_TENSION,
): string {
  const valid = connectNulls
    ? (pts.filter((p) => p != null) as Array<[number, number]>)
    : (pts as Array<[number, number]>);
  if (curve === "smooth") return smoothPath(valid, tension);
  if (curve === "step") return stepPath(valid, endX);
  return linearPath(valid);
}

/** Build an area path (line + baseline closure).
 * @param endX  X for the closing baseline edge — defaults to `lastX` but when
 *   set (e.g. for `step`), the fill extends the full plot width. */
function buildAreaPath(
  pts: Array<[number, number]>,
  baselineY: number,
  curve: CurveType,
  firstX: number,
  lastX: number,
  endX?: number,
  tension: number = DEFAULT_CURVE_TENSION,
): string {
  const line = buildLinePath(pts, curve, false, endX, tension);
  if (!line) return "";
  const closeX = endX ?? lastX;
  return `${line} L ${closeX.toFixed(2)} ${baselineY.toFixed(2)} L ${firstX.toFixed(2)} ${baselineY.toFixed(2)} Z`;
}

/** SVG bar path with rounded corners only at the *value* (extending) end.
 * The end anchored at the zero-baseline stays sharp, so the bar looks like it
 * "grows" from a solid root — a detail recharts does well.
 *
 * @param x  top-left x of the bar's bounding rect
 * @param y  top-left y of the bar's bounding rect
 * @param w  bar width
 * @param h  bar height
 * @param radius  corner radius (px)
 * @param end  which side holds the value (the rounded end): "top" | "bottom" | "left" | "right"
 */
function barPath(
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  end: "top" | "bottom" | "left" | "right",
): string {
  if (radius <= 0 || w <= 0 || h <= 0) {
    return `M${x} ${y} L${x + w} ${y} L${x + w} ${y + h} L${x} ${y + h} Z`;
  }
  const r = Math.min(radius, w / 2, h / 2);
  const paths: Record<"top" | "bottom" | "left" | "right", string> = {
    top: [
      `M${x} ${y + r}`,
      `Q${x} ${y} ${x + r} ${y}`,
      `L${x + w - r} ${y}`,
      `Q${x + w} ${y} ${x + w} ${y + r}`,
      `L${x + w} ${y + h}`,
      `L${x} ${y + h}`,
      `Z`,
    ].join(" "),
    bottom: [
      `M${x} ${y}`,
      `L${x + w} ${y}`,
      `L${x + w} ${y + h - r}`,
      `Q${x + w} ${y + h} ${x + w - r} ${y + h}`,
      `L${x + r} ${y + h}`,
      `Q${x} ${y + h} ${x} ${y + h - r}`,
      `Z`,
    ].join(" "),
    right: [
      `M${x} ${y}`,
      `L${x + w - r} ${y}`,
      `Q${x + w} ${y} ${x + w} ${y + r}`,
      `L${x + w} ${y + h - r}`,
      `Q${x + w} ${y + h} ${x + w - r} ${y + h}`,
      `L${x} ${y + h}`,
      `Z`,
    ].join(" "),
    left: [
      `M${x + r} ${y}`,
      `Q${x} ${y} ${x} ${y + r}`,
      `L${x} ${y + h - r}`,
      `Q${x} ${y + h} ${x + r} ${y + h}`,
      `L${x + w} ${y + h}`,
      `L${x + w} ${y}`,
      `Z`,
    ].join(" "),
  };
  return (
    paths[end] ??
    `M${x} ${y} L${x + w} ${y} L${x + w} ${y + h} L${x} ${y + h} Z`
  );
}

/* Pie / donut arc helpers */

/** Returns slice path + label position for each value.
 * @param openProgress  0 → 1, scales every slice fraction so the pie
 *   "spins" open from 0° (nothing visible) to 360° (full). */
function pieSlices(
  cx: number,
  cy: number,
  radius: number,
  values: number[],
  openProgress = 1,
  labelGap = DEFAULT_RADIAL_LABEL_GAP,
): Array<{ path: string; midAngle: number; labelX: number; labelY: number }> {
  const total = values.reduce((a, b) => a + b, 0);
  if (total === 0) return [];

  const slices: Array<{
    path: string;
    midAngle: number;
    labelX: number;
    labelY: number;
  }> = [];
  let startAngle = -Math.PI / 2; // 12 o'clock, clockwise

  for (let i = 0; i < values.length; i++) {
    const v = values[i]!;
    const fraction = (v / total) * openProgress;
    const endAngle = startAngle + fraction * 2 * Math.PI;
    const midAngle = (startAngle + endAngle) / 2;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = fraction > 0.5 ? 1 : 0;

    const path = `M ${cx.toFixed(2)} ${cy.toFixed(2)} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

    const labelR = radius + labelGap;
    slices.push({
      path,
      midAngle,
      labelX: cx + labelR * Math.cos(midAngle),
      labelY: cy + labelR * Math.sin(midAngle),
    });
    startAngle = endAngle;
  }
  return slices;
}

/** Donut path: outer arc + inner arc (counter-clockwise inner). */
function donutSlicePath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const ox1 = cx + outerR * Math.cos(startAngle);
  const oy1 = cy + outerR * Math.sin(startAngle);
  const ox2 = cx + outerR * Math.cos(endAngle);
  const oy2 = cy + outerR * Math.sin(endAngle);
  const ix1 = cx + innerR * Math.cos(endAngle);
  const iy1 = cy + innerR * Math.sin(endAngle);
  const ix2 = cx + innerR * Math.cos(startAngle);
  const iy2 = cy + innerR * Math.sin(startAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return `M ${ox1.toFixed(2)} ${oy1.toFixed(2)} A ${outerR} ${outerR} 0 ${largeArc} 1 ${ox2.toFixed(2)} ${oy2.toFixed(2)} L ${ix1.toFixed(2)} ${iy1.toFixed(2)} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2.toFixed(2)} ${iy2.toFixed(2)} Z`;
}

/* ── Other helpers ─────────────────────────────────────────── */

function niceTicks(min: number, max: number, count = 4): number[] {
  if (min === max) return [min];
  const step = (max - min) / count;
  return Array.from({ length: count + 1 }, (_, i) => min + step * i);
}

function defaultFormatY(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

/** Find the Y value on a data series at a given viewBox X position, by
 *  linearly interpolating between the two surrounding data points.  When X
 *  falls outside the data range the nearest endpoint Y is returned. */
function interpolateAtX(
  x: number,
  data: (number | null)[],
  xOf: (i: number) => number,
  yOf: (v: number) => number,
): number {
  if (data.length === 0) return 0;
  if (data.length === 1) return yOf(data[0] ?? 0);
  for (let i = 0; i < data.length - 1; i++) {
    const x1 = xOf(i);
    const x2 = xOf(i + 1);
    if (x <= x1) return yOf(data[i] ?? 0);
    if (x >= x2) continue;
    const y1 = yOf(data[i] ?? 0);
    const y2 = yOf(data[i + 1] ?? 0);
    if (x2 === x1) return y1;
    const t = (x - x1) / (x2 - x1);
    return y1 + (y2 - y1) * t;
  }
  return yOf(data[data.length - 1] ?? 0);
}

function colorFor(
  i: number,
  s: ChartSeries,
  fallback = DEFAULT_COLOR,
  palette: readonly string[] = PALETTE,
): string {
  return s.color ?? palette[i % palette.length] ?? fallback;
}

/** Resolve the effective series type given the chart type. */
function effectiveSeriesType(
  s: ChartSeries,
  chartType: ChartType,
): ChartSeriesType {
  if (s.type) return s.type;
  if (chartType === "area") return "area";
  if (chartType === "bar") return "bar";
  return "line";
}

/* ── Component ─────────────────────────────────────────────── */

/**
 * Multi-type SVG chart: line / bar / area / pie / donut / composed.
 *
 * Features: crosshair cursor, floating tooltip, smooth/step curves,
 * stacked mode, legend toggle, fade-in animation.
 */
export function Chart({
  x,
  series,
  type = "line",
  showLegend = true,
  showAxes = true,
  showTooltip = true,
  showCrosshair,
  height,
  formatY = defaultFormatY,
  formatX,
  tickCount = DEFAULT_TICK_COUNT,
  yMin,
  yMax,
  formatTooltipValue,
  renderTooltip,
  defaultColor = DEFAULT_COLOR,
  curve = "linear",
  stacked = false,
  connectNulls = false,
  layout = "vertical",
  barGap = DEFAULT_BAR_GAP,
  animate = true,
  innerRadius,
  legendPosition = "bottom",
  onLegendToggle,
  onHover,
  maxHeight,
  rowHeight,
  crosshairPoints = false,
  width = 800,
  axisFontSize = 11,
  pieLabelFontSize = 12,
  renderSliceLabel,
  tooltipOffset = 16,
  sliceLabelThreshold = 0,
  renderCenter,
  barRadius = 4,
  padding: paddingProp,
  barCategoryGap = DEFAULT_BAR_CATEGORY_GAP,
  animationDuration = DEFAULT_ANIMATION_DURATION,
  barInactiveOpacity = DEFAULT_BAR_INACTIVE_OPACITY,
  lineWidth = DEFAULT_LINE_WIDTH,
  dotRadius = DEFAULT_DOT_RADIUS,
  dotInactiveOpacity = DEFAULT_DOT_INACTIVE_OPACITY,
  crosshairWidth = DEFAULT_CROSSHAIR_WIDTH,
  crosshairDasharray = DEFAULT_CROSSHAIR_DASHARRAY,
  crosshairOpacity = DEFAULT_CROSSHAIR_OPACITY,
  crosshairDotRadius = DEFAULT_CROSSHAIR_DOT_RADIUS,
  crosshairDotWidth = DEFAULT_CROSSHAIR_DOT_WIDTH,
  axisWidth = DEFAULT_AXIS_WIDTH,
  gridlineWidth = DEFAULT_GRIDLINE_WIDTH,
  gridlineDasharray = DEFAULT_GRIDLINE_DASHARRAY,
  sliceWidth = DEFAULT_SLICE_WIDTH,
  legendInactiveOpacity = DEFAULT_LEGEND_INACTIVE_OPACITY,
  curveTension = DEFAULT_CURVE_TENSION,
  colors: chartColors = {},
  transitionDuration = DEFAULT_TRANSITION_DURATION,
  // Crosshair line always follows cursor; dot hidden (snaps) for line/area/composed, dot follows for bar/histogram
  crosshairSnap = type !== "bar" && type !== "histogram",
  rangeSelector,
  style,
  className,
  ...rest
}: ChartProps) {
  const isRadial = type === "pie" || type === "donut";
  const isHorizontal = type === "bar" && layout === "horizontal";
  const effectiveHeight =
    height ?? (isRadial ? DEFAULT_HEIGHT_RADIAL : DEFAULT_HEIGHT);
  const crosshair = showCrosshair ?? showTooltip;
  const n = x.length;
  const resolvedColors = {
    foreground: chartColors.foreground ?? DEFAULT_CHART_COLORS.foreground,
    background: chartColors.background ?? DEFAULT_CHART_COLORS.background,
    border: chartColors.border ?? DEFAULT_CHART_COLORS.border,
    muted: chartColors.muted ?? DEFAULT_CHART_COLORS.muted,
  };
  const palette: string[] =
    chartColors.chart && chartColors.chart.length > 0
      ? chartColors.chart
      : PALETTE;
  const scaleRef = React.useRef(1);

  const [hover, setHover] = React.useState<{
    seriesIndex: number;
    dataIndex: number;
  } | null>(null);
  const [mousePos, setMousePos] = React.useState<{
    x: number;
    y: number;
  } | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [drawProgress, setDrawProgress] = React.useState(0);
  const [openProgress, setOpenProgress] = React.useState(0);
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (animate) injectKeyframes();
  }, [animate]);

  // Animate line / area paths from origin (draw) and pie / donut slices from 0°→360°.
  React.useEffect(() => {
    if (!animate || !mounted) {
      setDrawProgress(1);
      setOpenProgress(1);
      return;
    }
    const duration = animationDuration;
    const start = performance.now();
    let raf: number;

    const step = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(t);
      setDrawProgress(eased);
      setOpenProgress(eased);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [animate, mounted, animationDuration]);

  // Keep scaleRef in sync with the SVG's rendered width so mouse coordinates
  // (in container pixels) map correctly to the viewBox coordinate space. This
  // is what makes the crosshair line align perfectly at any rendered width.
  React.useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const computeScale = () => {
      const rect = svgEl.getBoundingClientRect();
      scaleRef.current = rect.width > 0 ? width / rect.width : 1;
    };
    computeScale();
    const ro = new ResizeObserver(computeScale);
    ro.observe(svgEl);
    return () => ro.disconnect();
  }, [width]);

  React.useEffect(() => {
    onHover?.(hover);
  }, [hover, onHover]);

  // Track hidden series via local state derived from props
  const [hiddenMap, setHiddenMap] = React.useState<Record<string, boolean>>({});
  React.useEffect(() => {
    const init: Record<string, boolean> = {};
    for (const s of series) if (s.hidden) init[s.id] = true;
    setHiddenMap(init);
  }, [series]);

  const visibleSeries = series.filter((s) => !hiddenMap[s.id]);

  const handleLegendToggle = (sId: string) => {
    const nowHidden = !hiddenMap[sId];
    setHiddenMap((prev) => ({ ...prev, [sId]: nowHidden }));
    onLegendToggle?.(sId, !nowHidden);
  };

  /* ── Cartesian layout math ──────────────────────────────── */
  const padding = {
    top: paddingProp?.top ?? DEFAULT_PADDING.top,
    right: paddingProp?.right ?? DEFAULT_PADDING.right,
    bottom: paddingProp?.bottom ?? (showAxes ? DEFAULT_PADDING.bottom : 8),
    left: paddingProp?.left ?? (showAxes ? DEFAULT_PADDING.left : 8),
  };
  const plotW = width - padding.left - padding.right;

  // Horizontal bar charts auto-grow in height so each category gets at least
  // `rowHeight` px of vertical room (unless the consumer pinned `height`).
  const rowH = rowHeight ?? 36;
  const chartHeight =
    type === "bar" && layout === "horizontal" && height === undefined
      ? Math.max(effectiveHeight, n * rowH + padding.top + padding.bottom)
      : effectiveHeight;
  const plotH = chartHeight - padding.top - padding.bottom;

  const allValues = visibleSeries.flatMap((s) => s.data);
  const nums = allValues.map((v) => (v == null ? 0 : v));
  const minY = yMin ?? Math.min(0, ...nums);
  const maxY = yMax ?? Math.max(0, ...nums);
  const range = maxY - minY || 1;

  const yTicks = niceTicks(minY, maxY, tickCount);
  // Category positions are band-centered so the first/last category (and its
  // axis label) sits fully inside the plot instead of touching the y-axis spine
  // / "0" tick or running to the right edge — the cause of the first x-axis
  // label overlapping the y-axis origin.
  const xOf = (i: number) =>
    n === 1 ? padding.left + plotW / 2 : padding.left + (i + 0.5) * (plotW / n);
  const yOf = (v: number) => padding.top + plotH - ((v - minY) / range) * plotH;
  // Maps a value to an x-coordinate — used for horizontal-bar charts where the
  // value axis runs horizontally (left = minY, right = maxY).
  const xOfVal = (v: number) => padding.left + ((v - minY) / range) * plotW;
  const catY = (i: number) =>
    n === 1 ? padding.top + plotH / 2 : padding.top + (i + 0.5) * (plotH / n);

  /* ── Radial layout math ──────────────────────────────────── */
  const cx = width / 2;
  const cy = chartHeight / 2;
  const maxRadius = isRadial
    ? Math.min(width, chartHeight) / 2 - DEFAULT_RADIAL_MARGIN
    : Math.min(plotW, plotH) / 2 - DEFAULT_CARTESIAN_MARGIN;
  const innerR =
    type === "donut"
      ? (innerRadius ?? maxRadius * DEFAULT_DONUT_INNER_RADIUS_RATIO)
      : 0;

  /* ── Hover handlers ───────────────────────────────────────── */

  const handlePointerMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current ?? containerRef.current;
    const rect = svg?.getBoundingClientRect();
    if (!rect) return;
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    scaleRef.current = rect.width > 0 ? width / rect.width : 1;
    // Store position in SVG logical-coordinate space so SVG attributes (crosshair,
    // axis ticks, data-point markers) align perfectly regardless of rendered size.
    setMousePos({ x: relX * scaleRef.current, y: relY * scaleRef.current });

    // For radial charts the slice <path> onMouseEnter/onMouseLeave handlers own
    // the hover state — a mousemove-based cartesian "snap" would override the
    // actual slice under the cursor, so the highlighted slice diverges from the
    // data shown in the tooltip / opacity dimming.
    if (crosshair && n > 0 && !isRadial) {
      // For horizontal bar charts the category axis is Y (catY) — scan cursor
      // Y against catY(i). For vertical charts scan cursor X against xOf(i).
      const axisPos = (isHorizontal ? relY : relX) * scaleRef.current;
      const posOf = isHorizontal ? catY : xOf;
      let bestI = 0;
      let bestDist = Infinity;
      for (let i = 0; i < n; i++) {
        const d = Math.abs(posOf(i) - axisPos);
        if (d < bestDist) {
          bestDist = d;
          bestI = i;
        }
      }
      setHover({ dataIndex: bestI, seriesIndex: 0 });
    }
  };

  const handlePointerLeave = () => {
    setHover(null);
    setMousePos(null);
  };

  /* ── Precompute stacked baselines (cartesian) ────────────── */

  /** Cumulative baseline for series `si` at data index `i` (only same-type). */
  function stackedBaseline(si: number, i: number, t: ChartSeriesType): number {
    let base = 0;
    for (let j = 0; j < si; j++) {
      if (effectiveSeriesType(visibleSeries[j]!, type) === t) {
        base += Math.max(0, visibleSeries[j]!.data[i] ?? 0);
      }
    }
    return base;
  }

  /* ── Render: Cartesian (line / bar / area / composed) ────── */

  function renderCartesian() {
    return (
      <>
        {/* Axis spines — visible borders that "ground" the chart.
             For horizontal layout the spine is on the left (categories) and
             the bottom spine carries the value ticks. */}
        {showAxes && (
          <>
            <line
              x1={padding.left}
              x2={padding.left}
              y1={padding.top}
              y2={padding.top + plotH}
              stroke={resolvedColors.border}
              strokeWidth={axisWidth}
            />
            {layout === "horizontal" ? (
              <line
                x1={padding.left}
                x2={padding.left + plotW}
                y1={padding.top}
                y2={padding.top}
                stroke={resolvedColors.border}
                strokeWidth={axisWidth}
              />
            ) : (
              <line
                x1={padding.left}
                x2={padding.left + plotW}
                y1={padding.top + plotH}
                y2={padding.top + plotH}
                stroke={resolvedColors.border}
                strokeWidth={axisWidth}
              />
            )}
          </>
        )}

        {/* Y-axis (left): value ticks + horizontal gridlines for vertical layout;
            category labels for horizontal layout. */}
        {showAxes &&
          layout !== "horizontal" &&
          yTicks.map((tick, i) => (
            <g key={`ygrid-${i}`}>
              <line
                x1={padding.left}
                x2={padding.left + plotW}
                y1={yOf(tick)}
                y2={yOf(tick)}
                stroke={resolvedColors.border}
                strokeDasharray={gridlineDasharray}
                strokeWidth={gridlineWidth}
              />
              <text
                x={padding.left - 8}
                y={yOf(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={axisFontSize}
                fill={resolvedColors.muted}
              >
                {formatY(tick)}
              </text>
            </g>
          ))}

        {/* For horizontal layout: left axis shows categories, bottom axis shows values */}
        {showAxes &&
          layout === "horizontal" &&
          x.map((v, i) => (
            <text
              key={`yaxis-${i}`}
              x={padding.left - 8}
              y={catY(i)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={axisFontSize}
              fill={resolvedColors.muted}
            >
              {formatX ? formatX(v) : String(v)}
            </text>
          ))}

        {/* X-axis (bottom): category labels for vertical layout;
            value ticks + vertical gridlines for horizontal layout. */}
        {showAxes &&
          layout !== "horizontal" &&
          x.map((v, i) => (
            <text
              key={`xaxis-${i}`}
              x={xOf(i)}
              y={padding.top + plotH + 18}
              textAnchor="middle"
              fontSize={axisFontSize}
              fill={resolvedColors.muted}
            >
              {formatX ? formatX(v) : String(v)}
            </text>
          ))}

        {showAxes &&
          layout === "horizontal" &&
          yTicks.map((tick, i) => (
            <g key={`xgrid-${i}`}>
              <line
                x1={xOfVal(tick)}
                x2={xOfVal(tick)}
                y1={padding.top}
                y2={padding.top + plotH}
                stroke={resolvedColors.border}
                strokeDasharray={gridlineDasharray}
                strokeWidth={gridlineWidth}
              />
              <text
                x={xOfVal(tick)}
                y={padding.top + plotH + 18}
                textAnchor="middle"
                fontSize={axisFontSize}
                fill={resolvedColors.muted}
              >
                {formatY(tick)}
              </text>
            </g>
          ))}

        {/* Crosshair — guide line + intersection dot on cursor hover.
            The guide line ALWAYS follows the raw cursor (Recharts pattern),
            giving a stable reference at the exact hover x/y. The intersection
            dot snaps to the nearest data point when `crosshairSnap` is true and
            is HIDDEN (the active data-point dot already marks the position —
            rendering both would create a visual duplicate). When `crosshairSnap`
            is false (default for bar/histogram), the dot follows the cursor and
            shows the interpolated value at the hover point. Per-series colored
            markers are opt-in via `crosshairPoints` (off by default). Only
            rendered for cartesian charts. */}
        {crosshair &&
          hover &&
          !isRadial &&
          (() => {
            // Horizontal bar charts swap the axes: category axis is Y (catY),
            // value axis is X (xOfVal). Vertical charts use X for category (xOf),
            // Y for value (yOf).
            const catPosOf = isHorizontal ? catY : xOf;
            const valPosOf = isHorizontal ? xOfVal : yOf;
            const firstData = visibleSeries[0]?.data ?? [];
            const snapCat = catPosOf(hover.dataIndex);
            const trackCat = mousePos
              ? isHorizontal
                ? mousePos.y
                : mousePos.x
              : snapCat;
            // Snap to the data point only when `crosshairSnap` is on; otherwise the
            // guide line and dot track the raw cursor (interpolateAtX pins the dot's
            // value to a bar as the cursor passes its column). No fixed pixel
            // threshold — bar/histogram crosshairs follow the cursor smoothly.
            const isSnapped = crosshairSnap;
            const catPos = isSnapped ? snapCat : trackCat;
            const valPos = crosshairSnap
              ? valPosOf(firstData[hover.dataIndex] ?? 0)
              : isHorizontal
                ? mousePos
                  ? mousePos.x
                  : valPosOf(firstData[hover.dataIndex] ?? 0)
                : interpolateAtX(trackCat, firstData, xOf, yOf);
            // Line spans the full plot dimension perpendicular to the category axis
            const lineProps = isHorizontal
              ? {
                  x1: padding.left,
                  x2: padding.left + plotW,
                  y1: catPos,
                  y2: catPos,
                }
              : {
                  x1: catPos,
                  x2: catPos,
                  y1: padding.top,
                  y2: padding.top + plotH,
                };
            const dotCx = isHorizontal ? valPos : catPos;
            const dotCy = isHorizontal ? catPos : valPos;
            return (
              <>
                <line
                  x1={lineProps.x1}
                  x2={lineProps.x2}
                  y1={lineProps.y1}
                  y2={lineProps.y2}
                  stroke={resolvedColors.foreground}
                  strokeOpacity={crosshairOpacity}
                  strokeDasharray={crosshairDasharray}
                  strokeWidth={crosshairWidth}
                  style={{
                    transition: `opacity ${transitionDuration / 1000}s ease, stroke-opacity ${transitionDuration / 1000}s ease`,
                  }}
                />
                {!isSnapped && (
                  <circle
                    cx={dotCx}
                    cy={dotCy}
                    r={crosshairDotRadius}
                    fill={resolvedColors.background}
                    stroke={resolvedColors.background}
                    strokeWidth={crosshairDotWidth}
                    style={{
                      transition: `opacity ${transitionDuration / 1000}s ease`,
                    }}
                  />
                )}
                {crosshairPoints &&
                  visibleSeries.map((s, si) => {
                    const val = s.data[hover.dataIndex];
                    if (val == null) return null;
                    return (
                      <circle
                        key={`cross-${s.id}`}
                        data-crosshair-point="true"
                        cx={isHorizontal ? xOfVal(val) : xOf(hover.dataIndex)}
                        cy={isHorizontal ? catY(hover.dataIndex) : yOf(val)}
                        r={dotRadius}
                        fill={colorFor(si, s, defaultColor, palette)}
                        stroke={resolvedColors.background}
                        strokeWidth={crosshairDotWidth}
                        style={{
                          transition: `cx ${transitionDuration / 3 / 1000}s ease-out, cy ${transitionDuration / 3 / 1000}s ease-out`,
                        }}
                      />
                    );
                  })}
              </>
            );
          })()}

        {/* Series */}
        {visibleSeries.map((s, si) => {
          const color = colorFor(si, s, defaultColor, palette);
          const sType = effectiveSeriesType(s, type);
          const isBar = sType === "bar";
          const isArea = sType === "area";
          const isStacked = stacked && (isBar || isArea);
          const animDelay = si * 80;
          const animStyle: React.CSSProperties =
            animate && mounted
              ? {
                  animation: `facet-chart-fadeIn ${animationDuration / 1000}s ease-out forwards`,
                  animationDelay: `${animDelay}ms`,
                  clipPath: `url(#facet-draw-${s.id})`,
                }
              : {};

          // Index of this series among all visible bar-type series (for grouped layout)
          const barIdx = visibleSeries
            .slice(0, si)
            .filter((ss) => effectiveSeriesType(ss, type) === "bar").length;
          const barSeriesCount = visibleSeries.filter(
            (ss) => effectiveSeriesType(ss, type) === "bar",
          ).length;

          if (isBar) {
            const groupW = plotW / Math.max(n, 1);
            const groupH = plotH / Math.max(n, 1);
            // Reserve barCategoryGap between category bands so grouped bars breathe
            const effectiveGroupW = n > 1 ? groupW - barCategoryGap : groupW;
            const effectiveGroupH = n > 1 ? groupH - barCategoryGap : groupH;
            const slotW = effectiveGroupW / Math.max(barSeriesCount, 1);
            const slotH = effectiveGroupH / Math.max(barSeriesCount, 1);
            const barW = Math.max(slotW - barGap, 1);
            const barH = Math.max(slotH - barGap, 1);
            const zeroX = layout === "horizontal" ? xOfVal(0) : yOf(0);

            if (layout === "horizontal") {
              if (isStacked) {
                const thick = effectiveGroupH * 0.6;
                return (
                  <g key={s.id} style={animStyle}>
                    {animate && mounted && (
                      <clipPath id={`facet-draw-${s.id}`}>
                        <rect
                          x={padding.left}
                          y={padding.top}
                          width={plotW * drawProgress}
                          height={plotH}
                        />
                      </clipPath>
                    )}
                    {s.data.map((v, i) => {
                      const baseline = stackedBaseline(si, i, "bar");
                      const vTop = v + baseline;
                      const startX = xOfVal(vTop);
                      const baseX = xOfVal(baseline);
                      const barEnd: "left" | "right" =
                        vTop >= baseline ? "right" : "left";
                      return (
                        <path
                          key={`bar-${i}`}
                          d={barPath(
                            Math.min(startX, baseX),
                            catY(i) - thick / 2,
                            Math.abs(startX - baseX),
                            thick,
                            barRadius,
                            barEnd,
                          )}
                          fill={color}
                          opacity={
                            hover && hover.dataIndex !== i
                              ? barInactiveOpacity
                              : 1
                          }
                          style={{
                            transition: `opacity ${transitionDuration / 1000}s ease, transform ${transitionDuration / 1000}s ease`,
                            transform:
                              hover?.dataIndex === i
                                ? `scaleX(${DEFAULT_BAR_HOVER_SCALE})`
                                : "scaleX(1)",
                            transformOrigin: `${baseX}px ${catY(i)}px`,
                          }}
                        />
                      );
                    })}
                  </g>
                );
              }
              // Grouped horizontal bars
              return (
                <g key={s.id} style={animStyle}>
                  {animate && mounted && (
                    <clipPath id={`facet-draw-${s.id}`}>
                      <rect
                        x={padding.left}
                        y={padding.top}
                        width={plotW * drawProgress}
                        height={plotH}
                      />
                    </clipPath>
                  )}
                  {s.data.map((v, i) => {
                    const barY =
                      catY(i) -
                      groupH / 2 +
                      barIdx * slotH +
                      (slotH - barH) / 2;
                    const valX = xOfVal(v);
                    const barEnd: "left" | "right" =
                      valX >= zeroX ? "right" : "left";
                    return (
                      <path
                        key={`bar-${i}`}
                        d={barPath(
                          Math.min(valX, zeroX),
                          barY,
                          Math.abs(valX - zeroX),
                          barH,
                          barRadius,
                          barEnd,
                        )}
                        fill={color}
                        opacity={
                          hover && hover.dataIndex !== i
                            ? barInactiveOpacity
                            : 1
                        }
                        style={{
                          transition: `opacity ${transitionDuration / 1000}s ease, transform ${transitionDuration / 1000}s ease`,
                          transform:
                            hover?.dataIndex === i
                              ? `scaleX(${DEFAULT_BAR_HOVER_SCALE})`
                              : "scaleX(1)",
                          transformOrigin: `${zeroX}px ${barY + barH / 2}px`,
                        }}
                      />
                    );
                  })}
                </g>
              );
            }

            // Vertical bars
            if (isStacked) {
              const barWidth = effectiveGroupW * 0.7;
              return (
                <g key={s.id} style={animStyle}>
                  {animate && mounted && (
                    <clipPath id={`facet-draw-${s.id}`}>
                      <rect
                        x={padding.left}
                        y={padding.top}
                        width={plotW * drawProgress}
                        height={plotH}
                      />
                    </clipPath>
                  )}
                  {s.data.map((v, i) => {
                    const baseline = stackedBaseline(si, i, "bar");
                    const vTop = v + baseline;
                    const barEnd: "top" | "bottom" =
                      vTop >= baseline ? "top" : "bottom";
                    return (
                      <path
                        key={`bar-${i}`}
                        d={barPath(
                          xOf(i) - barWidth / 2,
                          yOf(vTop),
                          barWidth,
                          Math.abs(yOf(vTop) - yOf(baseline)),
                          barRadius,
                          barEnd,
                        )}
                        fill={color}
                        opacity={
                          hover && hover.dataIndex !== i
                            ? barInactiveOpacity
                            : 1
                        }
                        style={{
                          transition: `opacity ${transitionDuration / 1000}s ease, transform ${transitionDuration / 1000}s ease`,
                          transform:
                            hover?.dataIndex === i
                              ? `scaleY(${DEFAULT_BAR_HOVER_SCALE})`
                              : "scaleY(1)",
                          transformOrigin: `${xOf(i)}px ${yOf(baseline)}px`,
                        }}
                      />
                    );
                  })}
                </g>
              );
            }
            // Grouped vertical bars (non-stacked)
            return (
              <g key={s.id} style={animStyle}>
                {animate && mounted && (
                  <clipPath id={`facet-draw-${s.id}`}>
                    <rect
                      x={padding.left}
                      y={padding.top}
                      width={plotW * drawProgress}
                      height={plotH}
                    />
                  </clipPath>
                )}
                {s.data.map((v, i) => {
                  const barX =
                    xOf(i) - groupW / 2 + barIdx * slotW + (slotW - barW) / 2;
                  const valY = yOf(Math.max(0, v));
                  const barEnd: "top" | "bottom" = v >= 0 ? "top" : "bottom";
                  return (
                    <path
                      key={`bar-${i}`}
                      d={barPath(
                        barX,
                        valY,
                        barW,
                        Math.abs(yOf(v) - yOf(0)),
                        barRadius,
                        barEnd,
                      )}
                      fill={color}
                      opacity={
                        hover && hover.dataIndex !== i ? barInactiveOpacity : 1
                      }
                      style={{
                        transition: `opacity ${transitionDuration / 1000}s ease, transform ${transitionDuration / 1000}s ease`,
                        transform:
                          hover?.dataIndex === i
                            ? `scaleY(${DEFAULT_BAR_HOVER_SCALE})`
                            : "scaleY(1)",
                        transformOrigin: `${barX + barW / 2}px ${yOf(0)}px`,
                      }}
                    />
                  );
                })}
              </g>
            );
          }

          // line / area
          const pts: Array<[number, number]> = s.data.map((v, i2) => {
            const off =
              isStacked && isArea ? stackedBaseline(si, i2, "area") : 0;
            return [xOf(i2), yOf(v + off)];
          });

          // Prepend an origin segment (from the y=0 baseline at the plot's
          // left edge to the first data point) so animated lines and areas
          // "grow" from the origin (0,0) rather than just appearing.
          const originPt: [number, number] = [padding.left, yOf(0)];
          const linePts =
            animate && pts.length > 0
              ? ([originPt, ...pts] as Array<[number, number]>)
              : pts;
          const firstX = padding.left;
          const lastX = pts[pts.length - 1]?.[0] ?? padding.left + plotW;
          const endX = padding.left + plotW;

          return (
            <g key={s.id} style={animStyle}>
              {animate && mounted && (
                <clipPath id={`facet-draw-${s.id}`}>
                  <rect
                    x={padding.left}
                    y={padding.top}
                    width={plotW * drawProgress}
                    height={plotH}
                  />
                </clipPath>
              )}
              {isArea && (
                <path
                  d={buildAreaPath(
                    linePts,
                    yOf(0),
                    curve,
                    firstX,
                    lastX,
                    endX,
                    curveTension,
                  )}
                  fill={color}
                  fillOpacity={0.15}
                />
              )}
              <path
                d={buildLinePath(
                  linePts,
                  curve,
                  connectNulls,
                  endX,
                  curveTension,
                )}
                fill="none"
                stroke={color}
                strokeWidth={lineWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {s.data.map((v, i2) => {
                const off =
                  isStacked && isArea ? stackedBaseline(si, i2, "area") : 0;
                const isActive = hover?.dataIndex === i2;
                const dotCx = xOf(i2);
                const dotCy = yOf(v + off);
                return (
                  <circle
                    key={`dot-${i2}`}
                    cx={dotCx}
                    cy={dotCy}
                    r={isActive ? dotRadius + 2 : dotRadius}
                    fill={color}
                    stroke={isActive ? resolvedColors.background : undefined}
                    strokeWidth={isActive ? lineWidth : 0}
                    opacity={
                      hover && hover.dataIndex !== i2 ? dotInactiveOpacity : 1
                    }
                    style={{
                      transition: `r ${transitionDuration / 1000}s ease-out, opacity ${transitionDuration / 1000}s ease, stroke-width ${transitionDuration / 1000}s ease, transform ${transitionDuration / 1000}s ease-out`,
                      transform: isActive
                        ? `scale(${DEFAULT_DOT_HOVER_SCALE})`
                        : "scale(1)",
                      transformOrigin: `${dotCx}px ${dotCy}px`,
                    }}
                  />
                );
              })}
            </g>
          );
        })}
      </>
    );
  }

  /* ── Render: Pie / Donut ──────────────────────────────────── */

  function renderRadial() {
    const first = visibleSeries[0];
    if (!first) return null;

    const values = first.data;
    const total = values.reduce((a, b) => a + b, 0);
    if (type === "donut") {
      let startAngle = -Math.PI / 2;
      const donutSlices: Array<{
        path: string;
        midAngle: number;
        labelX: number;
        labelY: number;
      }> = [];
      for (let i = 0; i < values.length; i++) {
        const v = values[i]!;
        const fraction = (total > 0 ? v / total : 0) * openProgress;
        const endAngle = startAngle + fraction * 2 * Math.PI;
        const path = donutSlicePath(
          cx,
          cy,
          maxRadius,
          innerR,
          startAngle,
          endAngle,
        );
        const midAngle = (startAngle + endAngle) / 2;
        const labelR = maxRadius + DEFAULT_RADIAL_LABEL_GAP;
        donutSlices.push({
          path,
          midAngle,
          labelX: cx + labelR * Math.cos(midAngle),
          labelY: cy + labelR * Math.sin(midAngle),
        });
        startAngle = endAngle;
      }

      return (
        <>
          {donutSlices.map((sl, i) => (
            <path
              key={`slice-${i}`}
              d={sl.path}
              fill={colorFor(i, first, defaultColor, palette)}
              stroke={resolvedColors.background}
              strokeWidth={
                hover?.dataIndex === i ? sliceWidth + 0.5 : sliceWidth
              }
              style={{
                opacity:
                  hover && hover.dataIndex !== i ? dotInactiveOpacity : 1,
                cursor: "pointer",
                transform:
                  hover?.dataIndex === i
                    ? `scale(${DEFAULT_SLICE_HOVER_SCALE})`
                    : "scale(1)",
                transition: `opacity ${transitionDuration / 1000}s ease, stroke-width ${transitionDuration / 1000}s ease, transform ${transitionDuration / 1000}s ease`,
                transformOrigin: `${cx}px ${cy}px`,
              }}
              onMouseEnter={() => setHover({ seriesIndex: 0, dataIndex: i })}
              onMouseLeave={() => setHover(null)}
            />
          ))}

          {/* Center total for donut */}
          {renderCenter ? (
            <g transform={`translate(${cx},${cy})`}>{renderCenter()}</g>
          ) : (
            <>
              <text
                x={cx}
                y={cy - 6}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={pieLabelFontSize * DONUT_TOTAL_SCALE}
                fontWeight={600}
                fill={resolvedColors.foreground}
              >
                {total > 0 ? formatY(total) : "–"}
              </text>
              <text
                x={cx}
                y={cy + 9}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={pieLabelFontSize * DONUT_SUBTITLE_SCALE}
                fill={resolvedColors.muted}
              >
                {x.length} {x.length === 1 ? "slice" : "slices"}
              </text>
            </>
          )}

          {/* Donut slice labels */}
          {showAxes &&
            donutSlices.map((sl, i) => {
              if (
                sliceLabelThreshold > 0 &&
                total > 0 &&
                values[i]! / total < sliceLabelThreshold
              ) {
                return null;
              }
              const pct =
                total > 0 ? ((values[i]! / total) * 100).toFixed(1) : "0";
              const slicedX = x[i]!;
              const labelText = formatX ? formatX(slicedX) : String(slicedX);
              const isHovered = hover?.dataIndex === i;
              const cos = Math.cos(sl.midAngle);
              const anchor: "start" | "end" | "middle" =
                cos > 0.05 ? "start" : cos < -0.05 ? "end" : "middle";
              const xOffset = cos > 0.05 ? 6 : cos < -0.05 ? -6 : 0;
              const textX = sl.labelX + xOffset;
              const edgeX = cx + maxRadius * Math.cos(sl.midAngle);
              const edgeY = cy + maxRadius * Math.sin(sl.midAngle);

              return (
                <g key={`label-${i}`}>
                  <line
                    x1={edgeX}
                    y1={edgeY}
                    x2={sl.labelX}
                    y2={sl.labelY}
                    stroke={resolvedColors.muted}
                    strokeWidth={gridlineWidth}
                    strokeOpacity={dotInactiveOpacity}
                  />
                  {renderSliceLabel ? (
                    <g transform={`translate(${sl.labelX}, ${sl.labelY})`}>
                      {renderSliceLabel(
                        i,
                        values[i]!,
                        Number(pct),
                        slicedX,
                        first,
                      )}
                    </g>
                  ) : (
                    <text
                      x={textX}
                      y={sl.labelY}
                      textAnchor={anchor}
                      dominantBaseline="central"
                      fontSize={pieLabelFontSize}
                      fill={
                        isHovered
                          ? resolvedColors.foreground
                          : resolvedColors.muted
                      }
                    >
                      <tspan fontWeight={600}>{labelText}</tspan>
                      <tspan
                        x={textX}
                        dy="1.3em"
                        fontSize={pieLabelFontSize * PIE_SECONDARY_LABEL_SCALE}
                        fill={
                          isHovered
                            ? resolvedColors.foreground
                            : resolvedColors.muted
                        }
                      >
                        {` (${pct}%)`}
                      </tspan>
                    </text>
                  )}
                </g>
              );
            })}
        </>
      );
    }

    // pie
    const slices = pieSlices(cx, cy, maxRadius, values, openProgress);

    return (
      <>
        {slices.map((sl, i) => {
          const isHovered = hover?.dataIndex === i;
          const slicedX = x[i]!;
          const labelText = formatX ? formatX(slicedX) : String(slicedX);
          const pct = total > 0 ? ((values[i]! / total) * 100).toFixed(1) : "0";
          const skipSliceLabel =
            sliceLabelThreshold > 0 &&
            total > 0 &&
            values[i]! / total < sliceLabelThreshold;
          const cos = Math.cos(sl.midAngle);
          const anchor: "start" | "end" | "middle" =
            cos > 0.05 ? "start" : cos < -0.05 ? "end" : "middle";
          const xOffset = cos > 0.05 ? 6 : cos < -0.05 ? -6 : 0;
          const textX = sl.labelX + xOffset;
          const edgeX = cx + maxRadius * Math.cos(sl.midAngle);
          const edgeY = cy + maxRadius * Math.sin(sl.midAngle);

          return (
            <g key={`slice-${i}`}>
              <path
                d={sl.path}
                fill={colorFor(i, first, defaultColor, palette)}
                stroke={resolvedColors.background}
                strokeWidth={
                  hover?.dataIndex === i ? sliceWidth + 0.5 : sliceWidth
                }
                style={{
                  opacity:
                    hover && hover.dataIndex !== i ? dotInactiveOpacity : 1,
                  cursor: "pointer",
                  transform:
                    hover?.dataIndex === i
                      ? `scale(${DEFAULT_SLICE_HOVER_SCALE})`
                      : "scale(1)",
                  transition: `opacity ${transitionDuration / 1000}s ease, stroke-width ${transitionDuration / 1000}s ease, transform ${transitionDuration / 1000}s ease`,
                  transformOrigin: `${cx}px ${cy}px`,
                }}
                onMouseEnter={() => setHover({ seriesIndex: 0, dataIndex: i })}
                onMouseLeave={() => setHover(null)}
              />
              {showAxes && !skipSliceLabel && (
                <g>
                  <line
                    x1={edgeX}
                    y1={edgeY}
                    x2={sl.labelX}
                    y2={sl.labelY}
                    stroke={resolvedColors.muted}
                    strokeWidth={gridlineWidth}
                    strokeOpacity={dotInactiveOpacity}
                  />
                  {renderSliceLabel ? (
                    <g transform={`translate(${sl.labelX}, ${sl.labelY})`}>
                      {renderSliceLabel(
                        i,
                        values[i]!,
                        Number(pct),
                        slicedX,
                        first,
                      )}
                    </g>
                  ) : (
                    <text
                      x={textX}
                      y={sl.labelY}
                      textAnchor={anchor}
                      dominantBaseline="central"
                      fontSize={pieLabelFontSize}
                      fill={
                        isHovered
                          ? resolvedColors.foreground
                          : resolvedColors.muted
                      }
                    >
                      <tspan fontWeight={600}>{labelText}</tspan>
                      <tspan
                        x={textX}
                        dy="1.3em"
                        fontSize={pieLabelFontSize * PIE_SECONDARY_LABEL_SCALE}
                        fill={
                          isHovered
                            ? resolvedColors.foreground
                            : resolvedColors.muted
                        }
                      >
                        {` (${pct}%)`}
                      </tspan>
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        })}
      </>
    );
  }

  /* ── Tooltip ──────────────────────────────────────────────── */

  function renderTooltipContent() {
    if (!hover) return null;
    const xVal = x[hover.dataIndex];
    const isRadialHover = isRadial && visibleSeries[0];

    // For pie/donut, show the single hovered slice
    if (isRadial && isRadialHover) {
      const s = isRadialHover;
      const colorVal = colorFor(0, s, defaultColor, palette);
      const rawValue = s.data[hover.dataIndex] ?? 0;
      const displayValue = formatTooltipValue
        ? formatTooltipValue(rawValue, s, hover.dataIndex)
        : formatY(rawValue);

      if (renderTooltip) {
        return renderTooltip({
          active: true,
          series: s,
          seriesList: [s],
          dataIndex: hover.dataIndex,
          x: xVal!,
          value: rawValue,
          color: colorVal,
        });
      }

      return (
        <>
          <div className="font-medium">
            {formatX ? formatX(xVal!) : String(xVal)}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span
              className="size-2 rounded-full"
              style={{ background: colorVal }}
            />
            <span>{s.label}:</span>
            <span className="font-medium text-foreground">{displayValue}</span>
          </div>
        </>
      );
    }

    // Cartesian: show a row for each visible series
    if (renderTooltip) {
      const s = visibleSeries[hover.seriesIndex] ?? visibleSeries[0];
      if (!s) return null;
      const colorVal = colorFor(hover.seriesIndex, s, defaultColor, palette);
      const rawValue = s.data[hover.dataIndex] ?? 0;
      return renderTooltip({
        active: true,
        series: s,
        seriesList: visibleSeries,
        dataIndex: hover.dataIndex,
        x: xVal!,
        value: rawValue,
        color: colorVal,
      });
    }

    return (
      <>
        <div className="font-medium">
          {formatX ? formatX(xVal!) : String(xVal)}
        </div>
        {visibleSeries
          .filter((s) => s.data[hover.dataIndex] != null)
          .map((s, si) => {
            const colorVal = colorFor(si, s, defaultColor, palette);
            const rawValue = s.data[hover.dataIndex] ?? 0;
            const displayValue = formatTooltipValue
              ? formatTooltipValue(rawValue, s, hover.dataIndex)
              : formatY(rawValue);
            return (
              <div
                key={s.id}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ background: colorVal }}
                />
                <span>{s.label}:</span>
                <span className="font-medium text-foreground">
                  {displayValue}
                </span>
              </div>
            );
          })}
      </>
    );
  }

  function renderTooltipEl() {
    const content = renderTooltipContent();
    if (!content) return null;

    const offset =
      typeof tooltipOffset === "number"
        ? { x: tooltipOffset, y: tooltipOffset }
        : tooltipOffset;
    const ox = offset?.x ?? 16;
    const oy = offset?.y ?? 16;
    // mousePos is in SVG logical coords; convert to screen (CSS pixel) coords
    // for absolutely-positioned tooltip left/top.
    const sc = scaleRef.current;
    let left: number | string = mousePos ? mousePos.x / sc + ox : "50%";
    let top: number | string = mousePos ? mousePos.y / sc + oy : "50%";

    // Keep the tooltip inside the SVG viewport so it never overlaps chart
    // content near the edges.
    if (mousePos) {
      const svgRect = svgRef.current?.getBoundingClientRect();
      const ctrRect = containerRef.current?.getBoundingClientRect();
      if (svgRect && ctrRect && svgRect.width > 0 && svgRect.height > 0) {
        const svgLeft = svgRect.left - ctrRect.left;
        const svgTop = svgRect.top - ctrRect.top;
        const tipW = DEFAULT_TIP_WIDTH;
        const tipH = DEFAULT_TIP_HEIGHT;
        left = Math.max(
          svgLeft + 8,
          Math.min(left as number, svgLeft + svgRect.width - tipW - 8),
        );
        top = Math.max(
          svgTop + 8,
          Math.min(top as number, svgTop + svgRect.height - tipH - 8),
        );
      }
    }

    return (
      <div
        className="pointer-events-none absolute z-10 rounded-md border border-border bg-popover px-3 py-1.5 text-xs shadow-md"
        style={{
          left,
          top,
          opacity: mousePos ? 1 : 0,
          transition: `opacity ${transitionDuration / 1000}s ease`,
        }}
      >
        {content}
      </div>
    );
  }

  /* ── Legend ───────────────────────────────────────────────── */

  function renderLegend() {
    const first = visibleSeries[0];
    // For radial charts surface every slice (color + category) instead of a
    // single series swatch so the legend actually represents the pie/donut.
    const items = isRadial
      ? first
        ? first.data.map((_, i) => ({
            series: first,
            index: i,
            label: formatX ? String(formatX(x[i]!)) : String(x[i]!),
          }))
        : []
      : visibleSeries.map((s, i) => ({ series: s, index: i, label: s.label }));

    if (items.length === 0) return null;

    return (
      <div
        className={cn(
          "mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground",
          legendPosition === "top" && "mt-0 mb-3",
        )}
      >
        {items.map(({ series: s, index: i, label }) => {
          const isVisible = !hiddenMap[s.id];
          return (
            <button
              key={isRadial ? `slice-${i}` : s.id}
              type="button"
              onClick={() => handleLegendToggle(s.id)}
              className={cn(
                "flex items-center gap-2 transition-opacity",
                isVisible ? "opacity-100" : "opacity-40",
              )}
            >
              <span
                className="size-2.5 rounded-full"
                style={{
                  background: colorFor(i, s, defaultColor, palette),
                  opacity: isVisible ? 1 : DEFAULT_LEGEND_INACTIVE_OPACITY,
                }}
              />
              <span>{label ?? s.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  /* ── Final render ─────────────────────────────────────────── */

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full",
        maxHeight ? "overflow-y-auto" : undefined,
        className,
      )}
      style={maxHeight ? { maxHeight: `${maxHeight}px`, ...style } : style}
      {...rest}
    >
      {showLegend && legendPosition === "top" && renderLegend()}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${chartHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="block w-full"
        role="img"
        aria-label={
          type === "pie"
            ? "Pie chart"
            : type === "donut"
              ? "Donut chart"
              : "Chart"
        }
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
      >
        {isRadial ? renderRadial() : renderCartesian()}
      </svg>
      {showLegend && legendPosition === "bottom" && renderLegend()}
      {showTooltip && renderTooltipEl()}
      {rangeSelector && (
        <ChartRangeSelector
          presets={rangeSelector.presets}
          active={rangeSelector.active}
          onChange={rangeSelector.onChange}
          position={rangeSelector.position}
          size={rangeSelector.size}
          minimizable={rangeSelector.minimizable}
          defaultMinimized={rangeSelector.defaultMinimized}
          minimized={rangeSelector.minimized}
          onMinimizedChange={rangeSelector.onMinimizedChange}
        />
      )}
    </div>
  );
}

Chart.displayName = "Chart";

// Re-export for ecosystem consumers.
export { DEFAULT_COLOR as ChartDefaultColor, PALETTE as ChartPalette };

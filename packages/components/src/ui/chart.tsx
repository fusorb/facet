/**
 * @arcevo/facet-components: Chart
 *
 * An SVG-based chart primitive supporting line, bar, area, pie, donut,
 * and composed (mixed-type) charts. Pure-SVG, no heavy deps, and
 * integrates with the facet design-tokens via CSS variables.
 *
 * Inspired by recharts patterns:
 *  - Per-series `type` → composed charts (e.g. line + bar on same axes)
 *  - Crosshair cursor that follows the mouse
 *  - Floating tooltip positioned at the cursor
 *  - Smooth / step / linear curve interpolation
 *  - Stacking for bars and areas
 *  - Interactive legend with per-series toggle
 *  - Fade-in entry animation
 *
 * Usage:
 *   import { Chart } from "@arcevo/facet-components";
 *   <Chart x={["Mon", "Tue"]} series={[{ id: "a", label: "A", data: [30, 80] }]} />
 */

import * as React from "react";
import { cn } from "../utils.js";

/* ── Types ─────────────────────────────────────────────────── */

export type ChartType = "line" | "bar" | "area" | "pie" | "donut" | "composed";
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
  /** Chart height in pixels. Default: 240 (cartesian), 320 (radial). */
  height?: number;
  /** Format a y value (e.g. abbreviate 1000 → "1k"). */
  formatY?: (n: number) => string;
  /** Format an x value (e.g. "Jan", "Q1"). */
  formatX?: (v: string | number) => string;
  /** Override a tooltip value. */
  formatTooltipValue?: (value: number, series: ChartSeries, dataIndex: number) => string;
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
}

/* ── Constants ─────────────────────────────────────────────── */

const DEFAULT_HEIGHT = 240;
const DEFAULT_HEIGHT_RADIAL = 480;
const DEFAULT_COLOR = "hsl(var(--primary))";
const PALETTE = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2, 220 70% 50%))",
  "hsl(var(--chart-3, 160 60% 45%))",
  "hsl(var(--chart-4, 30 80% 55%))",
  "hsl(var(--chart-5, 280 65% 60%))",
];

/* CSS keyframes injected once for the entry animation. */
const ANIMATION_ID = "facet-chart-anim";

function injectKeyframes() {
  if (typeof document === "undefined" || document.getElementById(ANIMATION_ID)) return;
  const style = document.createElement("style");
  style.id = ANIMATION_ID;
  style.textContent = `
@keyframes facet-chart-fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
  document.head.appendChild(style);
}

/* ── Path helpers ──────────────────────────────────────────── */

/** Linear polyline path from [x,y] pairs. */
function linearPath(pts: Array<[number, number]>): string {
  if (pts.length === 0) return "";
  return `M ${pts.map((p) => p.join(",")).join(" L ")}`;
}

/** Step (Monotone-X) path - horizontal then vertical. */
function stepPath(pts: Array<[number, number]>): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0]!.join(",")}`;
  let d = `M ${pts[0]!.join(",")}`;
  for (let i = 1; i < pts.length; i++) {
    const midX = (pts[i - 1]![0] + pts[i]![0]) / 2;
    d += ` H ${midX.toFixed(2)} V ${pts[i]![1].toFixed(2)}`;
  }
  return d;
}

/** Cardinal-spline (Catmull-Rom → Bézier) for smooth curves. */
function smoothPath(pts: Array<[number, number]>, tension = 0.3): string {
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

/** Build a line path honoring `curve` and `connectNulls`. */
function buildLinePath(
  pts: Array<[number, number] | null>,
  curve: CurveType,
  connectNulls: boolean,
): string {
  const valid = connectNulls ? pts.filter((p) => p != null) as Array<[number, number]> : pts as Array<[number, number]>;
  if (curve === "smooth") return smoothPath(valid);
  if (curve === "step") return stepPath(valid);
  return linearPath(valid);
}

/** Build an area path (line + baseline closure). */
function buildAreaPath(
  pts: Array<[number, number]>,
  baselineY: number,
  curve: CurveType,
  firstX: number,
  lastX: number,
): string {
  const line = buildLinePath(pts, curve, false);
  if (!line) return "";
  return `${line} L ${lastX.toFixed(2)} ${baselineY.toFixed(2)} L ${firstX.toFixed(2)} ${baselineY.toFixed(2)} Z`;
}

/* Pie / donut arc helpers */

/** Returns slice path + label position for each value. */
function pieSlices(
  cx: number,
  cy: number,
  radius: number,
  values: number[],
): Array<{ path: string; midAngle: number; labelX: number; labelY: number }> {
  const total = values.reduce((a, b) => a + b, 0);
  if (total === 0) return [];

  const slices: Array<{ path: string; midAngle: number; labelX: number; labelY: number }> = [];
  let startAngle = -Math.PI / 2; // 12 o'clock, clockwise

  for (let i = 0; i < values.length; i++) {
    const v = values[i]!;
    const fraction = v / total;
    const endAngle = startAngle + fraction * 2 * Math.PI;
    const midAngle = (startAngle + endAngle) / 2;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = fraction > 0.5 ? 1 : 0;

    const path = `M ${cx.toFixed(2)} ${cy.toFixed(2)} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

    const labelR = radius + 16;
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

function colorFor(i: number, s: ChartSeries, fallback = DEFAULT_COLOR): string {
  return s.color ?? PALETTE[i % PALETTE.length] ?? fallback;
}

/** Resolve the effective series type given the chart type. */
function effectiveSeriesType(s: ChartSeries, chartType: ChartType): ChartSeriesType {
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
  formatTooltipValue,
  renderTooltip,
  defaultColor = DEFAULT_COLOR,
  curve = "linear",
  stacked = false,
  connectNulls = false,
  layout = "vertical",
  barGap = 2,
  animate = true,
  innerRadius,
  legendPosition = "bottom",
  onLegendToggle,
  onHover,
  className,
  ...rest
}: ChartProps) {
  const isRadial = type === "pie" || type === "donut";
  const effectiveHeight = height ?? (isRadial ? DEFAULT_HEIGHT_RADIAL : DEFAULT_HEIGHT);
  const crosshair = showCrosshair ?? showTooltip;

  const [hover, setHover] = React.useState<{
    seriesIndex: number;
    dataIndex: number;
  } | null>(null);
  const [mousePos, setMousePos] = React.useState<{ x: number; y: number } | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (animate) injectKeyframes();
  }, [animate]);

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
  const width = 800;
  const padding = {
    top: 16,
    right: 16,
    bottom: showAxes ? 32 : 8,
    left: showAxes ? 48 : 8,
  };
  const plotW = width - padding.left - padding.right;
  const plotH = effectiveHeight - padding.top - padding.bottom;

  const allValues = visibleSeries.flatMap((s) => s.data);
  const minY = Math.min(0, ...allValues);
  const maxY = Math.max(0, ...allValues);
  const range = maxY - minY || 1;

  const yTicks = niceTicks(minY, maxY, 4);
  const n = x.length;
  const xStep = n > 1 ? plotW / (n - 1) : plotW;
  const xOf = (i: number) =>
    n === 1 ? padding.left + plotW / 2 : padding.left + i * xStep;
  const yOf = (v: number) => padding.top + plotH - ((v - minY) / range) * plotH;

  /* ── Radial layout math ──────────────────────────────────── */
  const cx = width / 2;
  const cy = effectiveHeight / 2;
  const maxRadius = Math.min(plotW, plotH) / 2 - 16;
  const innerR = type === "donut"
    ? (innerRadius ?? maxRadius * 0.4)
    : 0;

  /* ── Hover handlers ───────────────────────────────────────── */

  const handlePointerMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect() ?? containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    setMousePos({ x: relX, y: relY });

    if (crosshair && n > 0) {
      let bestI = 0;
      let bestDist = Infinity;
      for (let i = 0; i < n; i++) {
        const d = Math.abs(xOf(i) - relX);
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
        {/* Y-axis grid + labels */}
        {showAxes &&
          yTicks.map((tick, i) => (
            <g key={`ygrid-${i}`}>
              <line
                x1={padding.left}
                x2={padding.left + plotW}
                y1={yOf(tick)}
                y2={yOf(tick)}
                stroke="hsl(var(--border))"
                strokeDasharray="2 4"
                strokeWidth={1}
              />
              <text
                x={padding.left - 8}
                y={yOf(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={11}
                fill="hsl(var(--muted-foreground))"
              >
                {formatY(tick)}
              </text>
            </g>
          ))}

        {/* X-axis labels */}
        {showAxes &&
          x.map((v, i) => (
            <text
              key={`xaxis-${i}`}
              x={xOf(i)}
              y={padding.top + plotH + 18}
              textAnchor="middle"
              fontSize={11}
              fill="hsl(var(--muted-foreground))"
            >
              {formatX ? formatX(v) : String(v)}
            </text>
          ))}

        {/* Crosshair */}
        {crosshair && hover && (
          <>
            <line
              x1={mousePos ? mousePos.x : xOf(hover.dataIndex)}
              x2={mousePos ? mousePos.x : xOf(hover.dataIndex)}
              y1={padding.top}
              y2={padding.top + plotH}
              stroke="hsl(var(--foreground))"
              strokeOpacity={0.15}
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            {visibleSeries.map((s, si) => {
              const val = s.data[hover.dataIndex];
              if (val == null) return null;
              return (
                <circle
                  key={`cross-${s.id}`}
                  cx={mousePos ? mousePos.x : xOf(hover.dataIndex)}
                  cy={yOf(val)}
                  r={3}
                  fill={colorFor(si, s, defaultColor)}
                  stroke="hsl(var(--background))"
                  strokeWidth={1.5}
                />
              );
            })}
          </>
        )}

        {/* Series */}
        {visibleSeries.map((s, si) => {
          const color = colorFor(si, s, defaultColor);
          const sType = effectiveSeriesType(s, type);
          const isBar = sType === "bar";
          const isArea = sType === "area";
          const isStacked = stacked && (isBar || isArea);
          const animDelay = si * 80;
          const animStyle: React.CSSProperties = animate && mounted
            ? { animation: `facet-chart-fadeIn 0.3s ease-out forwards`, animationDelay: `${animDelay}ms` }
            : {};

          // Index of this series among all visible bar-type series (for grouped layout)
          const barIdx = visibleSeries
            .slice(0, si)
            .filter((ss) => effectiveSeriesType(ss, type) === "bar").length;
          const barSeriesCount = visibleSeries.filter(
            (ss) => effectiveSeriesType(ss, type) === "bar"
          ).length;

          if (isBar) {
            const groupW = plotW / Math.max(n, 1);
            const groupH = plotH / Math.max(n, 1);
            const slotW = groupW / Math.max(barSeriesCount, 1);
            const slotH = groupH / Math.max(barSeriesCount, 1);
            const barW = Math.max(slotW - barGap, 1);
            const barH = Math.max(slotH - barGap, 1);
            const zeroX = yOf(0);

            if (layout === "horizontal") {
              if (isStacked) {
                const thick = groupH * 0.6;
                return (
                  <g key={s.id} style={animStyle}>
                    {s.data.map((v, i) => {
                      const baseline = stackedBaseline(si, i, "bar");
                      const vTop = v + baseline;
                      const startX = yOf(vTop);
                      const baseX = yOf(baseline);
                      return (
                        <rect
                          key={`bar-${i}`}
                          x={Math.min(startX, baseX)}
                          y={xOf(i) - thick / 2}
                          width={Math.abs(startX - baseX)}
                          height={thick}
                          fill={color}
                          rx={4}
                        />
                      );
                    })}
                  </g>
                );
              }
              // Grouped horizontal bars
              return (
                <g key={s.id} style={animStyle}>
                  {s.data.map((v, i) => {
                    const barY = xOf(i) - groupH / 2 + barIdx * slotH + (slotH - barH) / 2;
                    const valX = yOf(v);
                    return (
                      <rect
                        key={`bar-${i}`}
                        x={Math.min(valX, zeroX)}
                        y={barY}
                        width={Math.abs(valX - zeroX)}
                        height={barH}
                        fill={color}
                        rx={4}
                        opacity={hover && hover.dataIndex === i ? 1 : 0.85}
                      />
                    );
                  })}
                </g>
              );
            }

            // Vertical bars
            if (isStacked) {
              const barWidth = groupW * 0.7;
              return (
                <g key={s.id} style={animStyle}>
                  {s.data.map((v, i) => {
                    const baseline = stackedBaseline(si, i, "bar");
                    const vTop = v + baseline;
                    return (
                      <rect
                        key={`bar-${i}`}
                        x={xOf(i) - barWidth / 2}
                        y={yOf(vTop)}
                        width={barWidth}
                        height={Math.abs(yOf(vTop) - yOf(baseline))}
                        fill={color}
                        rx={4}
                        opacity={hover && hover.dataIndex === i ? 1 : 0.85}
                      />
                    );
                  })}
                </g>
              );
            }
            // Grouped vertical bars (non-stacked)
            return (
              <g key={s.id} style={animStyle}>
                {s.data.map((v, i) => {
                  const barX = xOf(i) - groupW / 2 + barIdx * slotW + (slotW - barW) / 2;
                  return (
                    <rect
                      key={`bar-${i}`}
                      x={barX}
                      y={yOf(Math.max(0, v))}
                      width={barW}
                      height={Math.abs(yOf(v) - yOf(0))}
                      fill={color}
                      rx={4}
                      opacity={hover && hover.dataIndex === i ? 1 : 0.85}
                    />
                  );
                })}
              </g>
            );
          }

          // line / area
          const pts: Array<[number, number]> = s.data.map((v, i2) => {
            const off = isStacked && isArea ? stackedBaseline(si, i2, "area") : 0;
            return [xOf(i2), yOf(v + off)];
          });

          const firstX = pts[0]?.[0] ?? padding.left;
          const lastX = pts[pts.length - 1]?.[0] ?? padding.left + plotW;

          return (
            <g key={s.id} style={animStyle}>
              {isArea && (
                <path
                  d={buildAreaPath(pts, yOf(0), curve, firstX, lastX)}
                  fill={color}
                  fillOpacity={0.15}
                />
              )}
              <path
                d={buildLinePath(pts, curve, connectNulls)}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {s.data.map((v, i2) => {
                const off = isStacked && isArea ? stackedBaseline(si, i2, "area") : 0;
                return (
                  <circle
                    key={`dot-${i2}`}
                    cx={xOf(i2)}
                    cy={yOf(v + off)}
                    r={hover?.dataIndex === i2 ? 5 : 3}
                    fill={color}
                    opacity={hover && hover.dataIndex !== i2 ? 0.4 : 1}
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
      const donutSlices: Array<{ path: string; midAngle: number; labelX: number; labelY: number }> = [];
      for (let i = 0; i < values.length; i++) {
        const v = values[i]!;
        const fraction = total > 0 ? v / total : 0;
        const endAngle = startAngle + fraction * 2 * Math.PI;
        const path = donutSlicePath(cx, cy, maxRadius, innerR, startAngle, endAngle);
        const midAngle = (startAngle + endAngle) / 2;
        const labelR = maxRadius + 16;
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
              fill={colorFor(i, first, defaultColor)}
              stroke="hsl(var(--background))"
              strokeWidth={1.5}
              style={{
                opacity: hover && hover.dataIndex !== i ? 0.4 : 1,
                cursor: "pointer",
              }}
              onMouseEnter={() => setHover({ seriesIndex: 0, dataIndex: i })}
            />
          ))}

          {/* Center total for donut */}
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={18}
            fontWeight={600}
            fill="hsl(var(--foreground))"
          >
            {total > 0 ? formatY(total) : "–"}
          </text>
          <text
            x={cx}
            y={cy + 8}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fill="hsl(var(--muted-foreground))"
          >
            {x.length} {x.length === 1 ? "slice" : "slices"}
          </text>

          {/* Slice labels */}
          {showAxes &&
            donutSlices.map((sl, i) => {
              const pct = total > 0 ? ((values[i]! / total) * 100).toFixed(1) : "0";
              const label = formatX ? formatX(x[i]!) : String(x[i]);
              const isHovered = hover?.dataIndex === i;
              return (
                <text
                  key={`label-${i}`}
                  x={sl.labelX}
                  y={sl.labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={10}
                  fill={isHovered ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))"}
                >
                  {`${label} (${pct}%)`}
                </text>
              );
            })}
        </>
      );
    }

    // pie
    const slices = pieSlices(cx, cy, maxRadius, values);

    return (
      <>
        {slices.map((sl, i) => {
          const isHovered = hover?.dataIndex === i;
          return (
            <g key={`slice-${i}`}>
              <path
                d={sl.path}
                fill={colorFor(i, first, defaultColor)}
                stroke="hsl(var(--background))"
                strokeWidth={1.5}
                style={{
                  opacity: hover && hover.dataIndex !== i ? 0.4 : 1,
                  cursor: "pointer",
                  transform: isHovered ? "scale(1.03)" : "scale(1)",
                  transformOrigin: `${sl.labelX}px ${sl.labelY}px`,
                }}
                onMouseEnter={() => setHover({ seriesIndex: 0, dataIndex: i })}
              />
              {showAxes && (
                <text
                  x={sl.labelX}
                  y={sl.labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={10}
                  fill={isHovered ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))"}
                >
                  {formatX ? formatX(x[i]!) : String(x[i])}
                </text>
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
      const colorVal = colorFor(0, s, defaultColor);
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
            <span className="size-2 rounded-full" style={{ background: colorVal }} />
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
      const colorVal = colorFor(hover.seriesIndex, s, defaultColor);
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
            const colorVal = colorFor(si, s, defaultColor);
            const rawValue = s.data[hover.dataIndex] ?? 0;
            const displayValue = formatTooltipValue
              ? formatTooltipValue(rawValue, s, hover.dataIndex)
              : formatY(rawValue);
            return (
              <div key={s.id} className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2 rounded-full" style={{ background: colorVal }} />
                <span>{s.label}:</span>
                <span className="font-medium text-foreground">{displayValue}</span>
              </div>
            );
          })}
      </>
    );
  }

  function renderTooltipEl() {
    const content = renderTooltipContent();
    if (!content) return null;

    return (
      <div
        className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-border bg-popover px-3 py-1.5 text-xs shadow-md"
        style={{
          left: mousePos ? mousePos.x : "50%",
          top: mousePos ? mousePos.y : "50%",
        }}
      >
        {content}
      </div>
    );
  }

  /* ── Legend ───────────────────────────────────────────────── */

  function renderLegend() {
    const items = isRadial
      ? [{ series: visibleSeries[0]!, index: 0 }]
      : visibleSeries.map((s, i) => ({ series: s, index: i }));

    if (items.length === 0) return null;

    return (
      <div
        className={cn(
          "mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground",
          legendPosition === "top" && "mt-0 mb-3",
        )}
      >
        {items.map(({ series: s, index: i }) => {
          const isVisible = !hiddenMap[s.id];
          return (
            <button
              key={s.id}
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
                  background: colorFor(i, s, defaultColor),
                  opacity: isVisible ? 1 : 0.3,
                }}
              />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  /* ── Final render ─────────────────────────────────────────── */

  const chartHeight = effectiveHeight;

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
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
          type === "pie" ? "Pie chart"
          : type === "donut" ? "Donut chart"
          : "Chart"
        }
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
      >
        {isRadial ? renderRadial() : renderCartesian()}
      </svg>
      {showLegend && legendPosition === "bottom" && renderLegend()}
      {showTooltip && renderTooltipEl()}
    </div>
  );
}

Chart.displayName = "Chart";

// Re-export for ecosystem consumers.
export { DEFAULT_COLOR as ChartDefaultColor, PALETTE as ChartPalette };

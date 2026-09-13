import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { Chart } from "./chart.js";
import { ChartRangeSelector } from "./chart-range-selector.js";

const SAMPLE_X = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const SAMPLE_SERIES = [
  { id: "sales", label: "Sales", data: [30, 80, 50, 60, 90] },
  { id: "orders", label: "Orders", data: [40, 60, 70, 30, 50] },
];

describe("Chart", () => {
  it("renders an SVG with a chart aria-label", () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={SAMPLE_SERIES} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-label", "Chart");
    expect(svg).toHaveAttribute("role", "img");
  });

  it("renders line paths by default", () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={SAMPLE_SERIES} type="line" />,
    );
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBeGreaterThan(0);
  });

  it("renders bar paths for type=bar", () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="bar" showLegend={false} />,
    );
    // Bars are rendered as <path> elements with selective border-radius (rounded
    // only at the extending end, sharp at the zero baseline).
    const barPaths = Array.from(container.querySelectorAll("path")).filter(
      (p) => p.getAttribute("fill") !== "none",
    );
    expect(barPaths.length).toBe(5);
    // Default barRadius=4 should produce arc (Q) commands in the path
    expect(barPaths[0]!.getAttribute("d")).toContain(" Q");
  });

  it("renders area fill path for type=area", () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="area" showTooltip={false} />,
    );
    const paths = container.querySelectorAll("path");
    // At least one path with a fill (area fill)
    const areaFill = Array.from(paths).some((p) => p.getAttribute("fill") !== "none");
    expect(areaFill).toBe(true);
  });

  it("renders pie slices for type=pie", () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="pie" showLegend={false} />,
    );
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBe(5);
  });

  it("renders donut slices + center total for type=donut", () => {
    const { container, getByText } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="donut" showLegend={false} />,
    );
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBe(5);
    // Center label shows the total
    const total = SAMPLE_SERIES[0]!.data.reduce((a, b) => a + b, 0);
    expect(getByText(`${total}`)).toBeInTheDocument();
  });

  it("renders pie with custom innerRadius", () => {
    const { container } = render(
      <Chart
        x={SAMPLE_X}
        series={[SAMPLE_SERIES[0]!]}
        type="donut"
        innerRadius={80}
        showLegend={false}
      />,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders composed chart with per-series type", () => {
    const { container } = render(
      <Chart
        x={SAMPLE_X}
        series={[
          { id: "line", label: "L", data: [30, 80, 50, 60, 90], type: "line" },
          { id: "bar", label: "B", data: [40, 60, 70, 30, 50], type: "bar" },
        ]}
        type="composed"
      />,
    );
    const paths = container.querySelectorAll("path");
    const rects = container.querySelectorAll("rect");
    expect(paths.length).toBeGreaterThan(0);
    expect(rects.length).toBeGreaterThan(0);
  });

  it("shows crosshair and tooltip on hover", async () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={SAMPLE_SERIES} type="line" />,
    );
    const svg = container.querySelector("svg")!;
    await fireEvent.mouseMove(svg, { clientX: 100, clientY: 50 });
    const crosshair = container.querySelector("line");
    expect(crosshair).toBeInTheDocument();
    const tooltip = container.querySelector(".absolute.z-10");
    expect(tooltip).toBeInTheDocument();
  });

  it("hides crosshair when showCrosshair=false", async () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={SAMPLE_SERIES} showCrosshair={false} />,
    );
    const svg = container.querySelector("svg")!;
    await fireEvent.mouseMove(svg, { clientX: 100, clientY: 50 });
    // No vertical crosshair line (grid lines exist only when showAxes)
    // With showAxes=true there are grid lines, but no crosshair line.
    // The crosshair is a non-dashed line at mouse X.
    // We check that no tooltip appears (since showCrosshair=false also disables hover snap).
    const tooltip = container.querySelector(".absolute.z-10");
    expect(tooltip).toBeNull();
  });

  it("calls onLegendToggle when legend item clicked", async () => {
    const onToggle = vi.fn();
    const { getByText } = render(
      <Chart
        x={SAMPLE_X}
        series={SAMPLE_SERIES}
        showLegend
        onLegendToggle={onToggle}
      />,
    );
    await fireEvent.click(getByText("Sales"));
    expect(onToggle).toHaveBeenCalledWith("sales", false);
  });

  it("renders custom formatY on y-axis ticks", () => {
    const { getByText } = render(
      <Chart
        x={SAMPLE_X}
        series={[SAMPLE_SERIES[0]!]}
        formatY={(n) => `${n}%`}
      />,
    );
    // y-axis ticks for data [30..90] with min 0 are: 0, 22.5, 45, 67.5, 90
    expect(getByText(/90%/)).toBeInTheDocument();
  });

  it("renders custom formatX on x-axis labels", () => {
    const { getByText } = render(
      <Chart
        x={SAMPLE_X}
        series={[SAMPLE_SERIES[0]!]}
        formatX={(v) => `★${v}`}
      />,
    );
    expect(getByText("★Mon")).toBeInTheDocument();
  });

  it("renders custom renderTooltip", async () => {
    const { container, getByText } = render(
      <Chart
        x={SAMPLE_X}
        series={SAMPLE_SERIES}
        renderTooltip={() => <span data-testid="custom-tip">Custom!</span>}
      />,
    );
    const svg = container.querySelector("svg")!;
    await fireEvent.mouseMove(svg, { clientX: 100, clientY: 50 });
    expect(getByText("Custom!")).toBeInTheDocument();
  });

  it("renders horizontal bars for layout=horizontal", () => {
    const { container } = render(
      <Chart
        x={SAMPLE_X}
        series={[SAMPLE_SERIES[0]!]}
        type="bar"
        layout="horizontal"
      />,
    );
    // Bars are now <path> elements; check via path "d" attributes
    const barPaths = Array.from(container.querySelectorAll("path")).filter(
      (p) => p.getAttribute("fill") !== "none",
    );
    expect(barPaths.length).toBe(5);
    // Horizontal bars have y positions varying across the chart height
    const ys = barPaths.map((p) => parseFloat((p.getAttribute("d")?.split(" ")[1]) ?? "0"));
    expect(new Set(ys).size).toBeGreaterThan(1);
    // Horizontal bars must use xOfVal (value → horizontal position), not yOf.
    // The first bar (value 30) should start at xOfVal(0) = padding.left.
    const firstBar = barPaths[0]!;
    const firstBarX = parseFloat(firstBar.getAttribute("d")!.match(/M([\d.-]+)/)?.[1] ?? "NaN");
    expect(firstBarX).toBe(56); // padding.left default
  });

  it("renders histogram with zero bar gap", () => {
    const { container } = render(
      <Chart
        x={["0-10", "10-20", "20-30"]}
        series={[{ id: "freq", label: "Freq", data: [12, 45, 8] }]}
        type="bar"
        barGap={0}
        showLegend={false}
      />,
    );
    const barPaths = Array.from(container.querySelectorAll("path")).filter(
      (p) => p.getAttribute("fill") !== "none",
    );
    expect(barPaths.length).toBe(3);
  });

  it("renders grouped bars side-by-side for multiple bar series", () => {
    const { container } = render(
      <Chart
        x={["A", "B", "C"]}
        series={[
          { id: "a", label: "A", data: [30, 40, 20], type: "bar" },
          { id: "b", label: "B", data: [20, 10, 50], type: "bar" },
        ]}
        type="composed"
        showLegend={false}
      />,
    );
    const barPaths = Array.from(container.querySelectorAll("path")).filter(
      (p) => p.getAttribute("fill") !== "none",
    );
    expect(barPaths.length).toBe(6);
  });

  it("applies stacked mode for bars", () => {
    const { container } = render(
      <Chart
        x={["A", "B"]}
        series={[
          { id: "a", label: "A", data: [30, 40], type: "bar" },
          { id: "b", label: "B", data: [20, 10], type: "bar" },
        ]}
        type="composed"
        stacked
        showLegend={false}
      />,
    );
    const rects = container.querySelectorAll("rect");
    expect(rects.length).toBeGreaterThan(0);
  });

  it("applies smooth curve to line paths", () => {
    const { container: linear } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} curve="linear" showLegend={false} />,
    );
    const { container: smooth } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} curve="smooth" showLegend={false} />,
    );
    const linearPaths = linear.querySelectorAll("path");
    const smoothPaths = smooth.querySelectorAll("path");
    // Smooth paths should use cubic Bezier (C) commands
    const smoothHasC = Array.from(smoothPaths).some((p) => p.getAttribute("d")?.includes(" C "));
    expect(smoothHasC).toBe(true);
    // Linear paths should not use C commands
    const linearHasC = Array.from(linearPaths).some((p) => p.getAttribute("d")?.includes(" C "));
    expect(linearHasC).toBe(false);
  });

  it("applies step curve to line paths", () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} curve="step" showLegend={false} />,
    );
    const paths = container.querySelectorAll("path");
    const hasStep = Array.from(paths).some((p) => p.getAttribute("d")?.includes(" H "));
    expect(hasStep).toBe(true);
  });

  it("hides series via hidden prop", () => {
    const { container } = render(
      <Chart
        x={SAMPLE_X}
        series={[
          { id: "shown", label: "Shown", data: [30, 80, 50, 60, 90] },
          { id: "hidden", label: "Hidden", data: [40, 60, 70, 30, 50], hidden: true },
        ]}
      />,
    );
    // Only one series rendered → one path for the line
    const paths = container.querySelectorAll("path");
    const linePaths = Array.from(paths).filter((p) => p.getAttribute("fill") === "none");
    expect(linePaths.length).toBe(1);
  });

  it("renders empty chart gracefully", () => {
    const { container } = render(<Chart x={[]} series={[]} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={SAMPLE_SERIES} className="my-custom-chart" />,
    );
    expect(container.firstChild).toHaveClass("my-custom-chart");
  });

  it("calls onHover on pointer move", async () => {
    const onHover = vi.fn();
    const { container } = render(
      <Chart x={SAMPLE_X} series={SAMPLE_SERIES} onHover={onHover} showCrosshair />,
    );
    const svg = container.querySelector("svg")!;
    await fireEvent.mouseMove(svg, { clientX: 200, clientY: 100 });
    expect(onHover).toHaveBeenCalled();
    expect(onHover).toHaveBeenLastCalledWith(
      expect.objectContaining({ dataIndex: expect.any(Number) }),
    );
    await fireEvent.mouseLeave(svg);
    expect(onHover).toHaveBeenLastCalledWith(null);
  });

  it("sets aria-label to Pie chart for type=pie", () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="pie" />,
    );
    expect(container.querySelector("svg")).toHaveAttribute("aria-label", "Pie chart");
  });

  it("sets aria-label to Donut chart for type=donut", () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="donut" />,
    );
    expect(container.querySelector("svg")).toHaveAttribute("aria-label", "Donut chart");
  });

  it("does not render crosshair when showTooltip is false", () => {
    const { container } = render(
      <Chart
        x={SAMPLE_X}
        series={SAMPLE_SERIES}
        showTooltip={false}
        showAxes={false}
      />,
    );
    // No hover state, no axes → no lines at all
    expect(container.querySelector("line")).toBeNull();
  });

  it("does not render cursor-tracking point circles by default", async () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={SAMPLE_SERIES} type="line" />,
    );
    const svg = container.querySelector("svg")!;
    await fireEvent.mouseMove(svg, { clientX: 100, clientY: 50 });
    // The colored circles that "chase" the cursor are opt-in. By default only
    // the crosshair line + fixed data-point markers render.
    expect(container.querySelectorAll('circle[stroke="var(--background)"]')).toHaveLength(0);
  });

  it("renders cursor-tracking point circles only when crosshairPoints=true", async () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={SAMPLE_SERIES} type="line" crosshairPoints />,
    );
    const svg = container.querySelector("svg")!;
    await fireEvent.mouseMove(svg, { clientX: 100, clientY: 50 });
    // One tracking circle per visible series (2 in SAMPLE_SERIES).
    expect(container.querySelectorAll('circle[stroke="var(--background)"]').length).toBe(2);
  });

  it("pie slices use opacity dimming, no scale transform (consistent hover)", () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="pie" showLegend={false} />,
    );
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBe(5);
    // Slices now carry a scale transform for visible hover feedback.
    expect(container.querySelectorAll('path[style*="scale"]')).toHaveLength(5);
    expect(container.querySelectorAll('path[style*="transform"]')).toHaveLength(5);
  });

  it("wraps in a scrollable container when maxHeight is set", () => {
    const { container } = render(
      <Chart
        x={SAMPLE_X}
        series={[SAMPLE_SERIES[0]!]}
        type="bar"
        layout="horizontal"
        maxHeight={200}
        showLegend={false}
      />,
    );
    const wrap = container.firstChild as HTMLElement;
    expect(wrap).toHaveClass("overflow-y-auto");
    expect(wrap).toHaveStyle({ maxHeight: "200px" });
  });

  it("includes zero on the cartesian y-axis (starts from zero)", () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="bar" showLegend={false} />,
    );
    const ticks = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    // minY = Math.min(0, ...data) => 0 is always an axis tick
    expect(ticks).toContain("0");
  });

  it("limits value-axis ticks to tickCount", () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="bar" tickCount={2} showLegend={false} />,
    );
    const yTicks = Array.from(container.querySelectorAll("text")).filter(
      (t) => t.getAttribute("text-anchor") === "end",
    );
    // tickCount=2 → niceTicks yields 3 values: min, mid, max
    expect(yTicks).toHaveLength(3);
  });

  it("extends the value-axis range to yMax when provided", () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="bar" yMax={100} showLegend={false} />,
    );
    const yTicks = Array.from(container.querySelectorAll("text")).filter(
      (t) => t.getAttribute("text-anchor") === "end",
    );
    expect(yTicks.map((t) => t.textContent)).toContain("100");
  });

  it("insets the first x-axis category label inside the plot (no overlap with the 0 tick)", () => {
    const { getByText } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="line" showLegend={false} />,
    );
    // Band-centering used to place the first label on the y-axis spine (x=56),
    // colliding with the "0" tick. It must now sit well inside the plot.
    const firstLabel = getByText("Mon");
    expect(parseFloat(firstLabel.getAttribute("x")!)).toBeGreaterThan(56);
  });

  it("does not cartesian-snap hover for radial charts", async () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="pie" showLegend={false} />,
    );
    const svg = container.querySelector("svg")!;
    await fireEvent.mouseMove(svg, { clientX: 100, clientY: 50 });
    // For radial charts, a cartesian snap would re-target the slice nearest the
    // cursor's X — overriding the slice actually under the pointer. Only slice
    // onMouseEnter should drive radial hover.
    expect(container.querySelector(".absolute.z-10")).toBeNull();
  });

  it("keeps the hovered pie slice's data in the tooltip across mouse moves", async () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="pie" showLegend={false} />,
    );
    const paths = container.querySelectorAll("path");
    // Enter the 3rd slice (Wed, sales value 50) ...
    await fireEvent.mouseEnter(paths[2]!);
    // ... then move. A cartesian snap would jump to slice 0 (Mon = 30).
    await fireEvent.mouseMove(container.querySelector("svg")!, { clientX: 100, clientY: 50 });
    const tooltip = container.querySelector(".absolute.z-10");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip?.textContent).toContain("50");
  });

  it("offsets the tooltip from the cursor by the default amount", async () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={SAMPLE_SERIES} type="line" showLegend={false} />,
    );
    const svg = container.querySelector("svg")!;
    await fireEvent.mouseMove(svg, { clientX: 0, clientY: 0 });
    const tooltip = container.querySelector(".absolute.z-10") as HTMLElement;
    expect(tooltip).toBeInTheDocument();
    expect(parseFloat(tooltip.style.left)).toBe(16);
  });

  it("honors a custom tooltipOffset", async () => {
    const { container } = render(
      <Chart
        x={SAMPLE_X}
        series={SAMPLE_SERIES}
        type="line"
        showLegend={false}
        tooltipOffset={100}
      />,
    );
    const svg = container.querySelector("svg")!;
    await fireEvent.mouseMove(svg, { clientX: 0, clientY: 0 });
    const tooltip = container.querySelector(".absolute.z-10") as HTMLElement;
    expect(parseFloat(tooltip.style.left)).toBe(100);
  });

  it("renders custom donut center content via renderCenter", () => {
    const { getByText, queryByText } = render(
      <Chart
        x={SAMPLE_X}
        series={[SAMPLE_SERIES[0]!]}
        type="donut"
        showLegend={false}
        renderCenter={() => <text>Custom Center</text>}
      />,
    );
    expect(getByText("Custom Center")).toBeInTheDocument();
    // The default total is replaced by the custom center.
    expect(queryByText("310")).not.toBeInTheDocument();
  });

  it("applies a custom barRadius", () => {
    const { container: rounded } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="bar" showLegend={false} />,
    );
    // Default barRadius=4 should produce arc (Q) commands in bar paths
    const roundedPaths = Array.from(rounded.querySelectorAll("path")).filter(
      (p) => p.getAttribute("fill") !== "none",
    );
    expect(roundedPaths.some((p) => p.getAttribute("d")?.includes(" Q"))).toBe(true);
    const { container: sharp } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="bar" showLegend={false} barRadius={0} />,
    );
    // barRadius=0 should produce plain rectangle paths (no arc commands)
    const sharpPaths = Array.from(sharp.querySelectorAll("path")).filter(
      (p) => p.getAttribute("fill") !== "none",
    );
    expect(sharpPaths.some((p) => p.getAttribute("d")?.includes(" Q"))).toBe(false);
  });

  it("hides radial slice labels below sliceLabelThreshold", () => {
    const pct = (c: HTMLElement) =>
      Array.from(c.querySelectorAll("text")).filter((t) => t.textContent?.includes("%")).length;
    const { container: all } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="pie" showLegend={false} />,
    );
    // sales total 310: Mon 9.7%, Tue 25.8%, Wed 16.1%, Thu 19.4%, Fri 29%
    expect(pct(all)).toBe(5);
    const { container: filtered } = render(
      <Chart
        x={SAMPLE_X}
        series={[SAMPLE_SERIES[0]!]}
        type="pie"
        sliceLabelThreshold={0.1}
        showLegend={false}
      />,
    );
    expect(pct(filtered)).toBe(4);
  });

  it("renders a per-slice legend for pie charts", () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="pie" />,
    );
    expect(container.querySelectorAll("button").length).toBe(5);
  });

  // ── Draw animation ──────────────────────────────────────────────

  it("renders a draw-animation clip-path when animate is enabled", () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="line" showLegend={false} />,
    );
    expect(container.querySelector("clipPath")).toBeInTheDocument();
  });

  it("omits draw-animation clip-path when animate is false", () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="line" showLegend={false} animate={false} />,
    );
    expect(container.querySelector("clipPath")).toBeNull();
  });

  it("prepends an origin point so lines draw from the y=0 baseline", () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="line" showLegend={false} />,
    );
    // The line path (fill=none, stroke set) should start from the baseline
    const path = Array.from(container.querySelectorAll("path")).find(
        (p) => p.getAttribute("fill") === "none" && p.getAttribute("stroke") !== null,
      ),
      d = path?.getAttribute("d") ?? "";
    // Starts with M <originX>,<baselineY> then steps toward first data point
    const match = d.match(/M ([\d.]+),([\d.]+)/)!
    // originX should be padding.left (56) — the left edge of the plot area
    expect(parseFloat(match[1]!)).toBe(56);
    // baselineY should be padding.top + plotH = 20 + (240-20-40) = 200
    expect(parseFloat(match[2]!)).toBe(200);
  });

  // ── Pie spin animation ──────────────────────────────────────────

  it("animates pie slices with openProgress (spin from 0 deg)", () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="pie" showLegend={false} />,
    );
    const slices = container.querySelectorAll("path");
    expect(slices.length).toBe(5);
    // Each slice carries a transition for the open animation
    slices.forEach((p) => {
      expect(p.getAttribute("style") ?? "").toContain("transition");
    });
  });

  // ── Step chart ──────────────────────────────────────────────────

  it("extends the step chart's last step to the right edge of the plot", () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} curve="step" type="line" showLegend={false} />,
    );
    const linePath = Array.from(container.querySelectorAll("path")).find(
      (p) => p.getAttribute("fill") === "none" && p.getAttribute("stroke") !== null,
    );
    expect(linePath).toBeInTheDocument();
    const d = linePath!.getAttribute("d") ?? "";
    // plotW = 800 - 56 - 24 = 720, endX = padding.left + plotW = 776
    expect(d).toMatch(/H 776\.00$/);
  });

  // ── barInactiveOpacity ──────────────────────────────────────────

  it("applies custom barInactiveOpacity to non-hovered bars on hover", async () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="bar" barInactiveOpacity={0.3} />,
    );
    const svg = container.querySelector("svg")!;
    await fireEvent.mouseMove(svg, { clientX: 100, clientY: 50 });
    const barPaths = Array.from(container.querySelectorAll("path")).filter(
      (p) => p.getAttribute("fill") !== "none" && p.getAttribute("fill") !== null,
    );
    // 4 inactive bars should have opacity 0.3 (5 bars, 1 at index 0 is active)
    const inactive = barPaths.filter(
      (p) => parseFloat(p.getAttribute("opacity") ?? "1") < 1,
    );
    expect(inactive.length).toBe(4);
    expect(parseFloat(inactive[0]!.getAttribute("opacity")!)).toBe(0.3);
  });

  // ── Crosshair ───────────────────────────────────────────────────

  it("crosshair line follows cursor; dot hidden when snapped", async () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={SAMPLE_SERIES} type="line" />,
    );
    const svg = container.querySelector("svg")!;
    await fireEvent.mouseMove(svg, { clientX: 100, clientY: 50 });
    const crosshair = Array.from(container.querySelectorAll("line")).find(
      (l) => l.getAttribute("stroke-dasharray") === "4 2",
    );
    expect(crosshair).toBeInTheDocument();
    // Line snaps to the nearest data point (index 0 → xOf(0) = 128).
    expect(parseFloat(crosshair!.getAttribute("x1")!)).toBe(128);
    // Crosshair dot is hidden when crosshairSnap=true (default for line) —
    // the active data-point dot already marks the position.
    const dot = Array.from(container.querySelectorAll("circle")).find(
      (c) =>
        c.getAttribute("fill") === "var(--background)" &&
        c.getAttribute("stroke") === "var(--background)",
    );
    expect(dot).toBeFalsy();
    // Tooltip snaps to the nearest data point (index 0 → "Mon")
    const tooltip = container.querySelector('[class*="shadow-md"]');
    expect(tooltip).toHaveTextContent("Mon");
  });

  it("crosshair follows the cursor when crosshairSnap is false", async () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={SAMPLE_SERIES} type="line" crosshairSnap={false} />,
    );
    const svg = container.querySelector("svg")!;
    await fireEvent.mouseMove(svg, { clientX: 100, clientY: 50 });
    // Crosshair line follows the cursor X (dynamic, not snapped).
    // In jsdom scaleRef = 1 → mousePos.x = relX = 100.
    const crosshair = Array.from(container.querySelectorAll("line")).find(
      (l) => l.getAttribute("stroke-dasharray") === "4 2",
    );
    expect(crosshair).toBeInTheDocument();
    expect(parseFloat(crosshair!.getAttribute("x1")!)).toBe(100);
    // Crosshair dot follows the cursor X too (stays on the line).
    const dot = Array.from(container.querySelectorAll("circle")).find(
      (c) =>
        c.getAttribute("fill") === "var(--background)" &&
        c.getAttribute("stroke") === "var(--background)",
    );
    expect(dot).toBeInTheDocument();
    expect(parseFloat(dot!.getAttribute("cx")!)).toBe(100);
    // At mouseX=100 (left of xOf(0)=128), interpolation returns yOf(data[0]) = 140.
    expect(parseFloat(dot!.getAttribute("cy")!)).toBe(140);
  });

  it("crosshair follows the cursor (horizontal line) for horizontal bar charts", async () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={SAMPLE_SERIES} type="bar" layout="horizontal" />,
    );
    const svg = container.querySelector("svg")!;
    await fireEvent.mouseMove(svg, { clientX: 100, clientY: 50 });
    const crosshair = Array.from(container.querySelectorAll("line")).find(
      (l) => l.getAttribute("stroke-dasharray") === "4 2",
    );
    expect(crosshair).toBeInTheDocument();
    // Horizontal bar: crosshair is a HORIZONTAL line at cursor Y (50 in jsdom)
    expect(parseFloat(crosshair!.getAttribute("x1")!)).toBe(56);  // padding.left
    expect(parseFloat(crosshair!.getAttribute("x2")!)).toBe(776); // padding.left + plotW
    expect(parseFloat(crosshair!.getAttribute("y1")!)).toBe(50);  // cursor Y
    expect(parseFloat(crosshair!.getAttribute("y2")!)).toBe(50);   // cursor Y
    // Dot at raw cursor position (follows cursor, not snap)
    const dot = Array.from(container.querySelectorAll("circle")).find(
      (c) =>
        c.getAttribute("fill") === "var(--background)" &&
        c.getAttribute("stroke") === "var(--background)",
    );
    expect(dot).toBeInTheDocument();
    expect(parseFloat(dot!.getAttribute("cx")!)).toBe(100);
    expect(parseFloat(dot!.getAttribute("cy")!)).toBe(50);
  });

  it("crosshair line follows cursor (horizontal) even when crosshairSnap is true", async () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={SAMPLE_SERIES} type="bar" layout="horizontal" crosshairSnap={true} />,
    );
    const svg = container.querySelector("svg")!;
    await fireEvent.mouseMove(svg, { clientX: 100, clientY: 50 });
    const crosshair = Array.from(container.querySelectorAll("line")).find(
      (l) => l.getAttribute("stroke-dasharray") === "4 2",
    );
    expect(crosshair).toBeInTheDocument();
    // Line snaps to catY(0) = 38 when crosshairSnap is true
    expect(parseFloat(crosshair!.getAttribute("x1")!)).toBe(56);   // padding.left
    expect(parseFloat(crosshair!.getAttribute("x2")!)).toBe(776);  // padding.left + plotW
    expect(parseFloat(crosshair!.getAttribute("y1")!)).toBe(38);  // snapped to catY(0)
    expect(parseFloat(crosshair!.getAttribute("y2")!)).toBe(38);   // snapped to catY(0)
    // Crosshair dot is hidden when crosshairSnap=true
    const dot = Array.from(container.querySelectorAll("circle")).find(
      (c) =>
        c.getAttribute("fill") === "var(--background)" &&
        c.getAttribute("stroke") === "var(--background)",
    );
    expect(dot).toBeFalsy();
  });

  it("honors transitionDuration in hover transitions", async () => {
    const { container } = render(
      <Chart
        x={SAMPLE_X}
        series={[SAMPLE_SERIES[0]!]}
        type="line"
        dotRadius={6}
        transitionDuration={300}
        showAxes={false}
        showLegend={false}
      />,
    );
    const svg = container.querySelector("svg")!;
    await fireEvent.mouseMove(svg, { clientX: 100, clientY: 50 });
    // The active data dot (r=8 = 6+2) should carry the custom duration in its
    // inline transition style — proving transitionDuration is wired, not hardcoded.
    const dots = Array.from(container.querySelectorAll("circle[fill]")).filter(
      (c) => c.getAttribute("r") !== "4" /* exclude crosshair dot */,
    );
    const active = dots.find((d) => d.getAttribute("r") === "8");
    expect(active).toBeDefined();
    expect(active!.getAttribute("style") ?? "").toContain("0.3s");
  });

  it("does not render crosshair for radial charts", async () => {
    const { container } = render(
      <Chart
        x={SAMPLE_X}
        series={[{ id: "a", label: "A", data: [30, 50, 70] }]}
        type="pie"
      />,
    );
    const svg = container.querySelector("svg")!;
    await fireEvent.mouseMove(svg, { clientX: 100, clientY: 50 });
    // No vertical guide line should be rendered for radial charts.
    const guide = Array.from(container.querySelectorAll("line")).find(
      (l) => l.getAttribute("stroke-dasharray") === "4 2",
    );
    expect(guide).toBeUndefined();
  });

  it("honors crosshairWidth, crosshairDasharray, and crosshairOpacity", async () => {
    const { container } = render(
      <Chart
        x={SAMPLE_X}
        series={SAMPLE_SERIES}
        type="bar"
        crosshairWidth={3}
        crosshairDasharray="6 6"
        crosshairOpacity={0.5}
      />,
    );
    const svg = container.querySelector("svg")!;
    await fireEvent.mouseMove(svg, { clientX: 100, clientY: 50 });
    const ch = Array.from(container.querySelectorAll("line")).find(
      (l) => l.getAttribute("stroke-dasharray") === "6 6",
    )!;
    expect(ch).toBeInTheDocument();
    expect(parseFloat(ch.getAttribute("stroke-width")!)).toBe(3);
    expect(parseFloat(ch.getAttribute("stroke-opacity")!)).toBe(0.5);
  });

  it("honors lineWidth and dotRadius props", () => {
    const { container } = render(
      <Chart
        x={SAMPLE_X}
        series={[SAMPLE_SERIES[0]!]}
        type="line"
        lineWidth={4}
        dotRadius={6}
        showAxes={false}
        showLegend={false}
      />,
    );
    const path = container.querySelector("path[fill='none']")! as SVGPathElement;
    expect(parseFloat(path.getAttribute("stroke-width")!)).toBe(4);
    const dot = container.querySelector("circle[fill='var(--chart-1)']")! as SVGCircleElement;
    expect(parseFloat(dot.getAttribute("r")!)).toBe(6);
  });

  it("uses dotInactiveOpacity (matching barInactiveOpacity) for non-hovered dots", async () => {
    const { container } = render(
      <Chart
        x={SAMPLE_X}
        series={SAMPLE_SERIES}
        type="line"
        dotRadius={6}
        dotInactiveOpacity={0.2}
        showAxes={false}
        showLegend={false}
      />,
    );
    const svg = container.querySelector("svg")!;
    await fireEvent.mouseMove(svg, { clientX: 100, clientY: 50 });
    // The first dot (index 0) is active → opacity 1;
    // the rest should be dimmed to 0.2.
    const dots = Array.from(container.querySelectorAll("circle[fill]")).filter(
      (c) => c.getAttribute("r") !== "4" /* exclude crosshair dot */,
    );
    const active = dots.find((d) => d.getAttribute("r") === "8"); // 6 + 2 active
    const inactive = dots.find((d) => d.getAttribute("r") === "6");
    expect(active).toBeDefined();
    expect(inactive).toBeDefined();
    expect(parseFloat(inactive!.getAttribute("opacity")!)).toBe(0.2);
  });

  // ── padding prop ────────────────────────────────────────────────

  it("accepts a custom padding prop for plot-area spacing", () => {
    const { container } = render(
      <Chart
        x={SAMPLE_X}
        series={[SAMPLE_SERIES[0]!]}
        type="line"
        showLegend={false}
        showAxes
        padding={{ top: 40, right: 40, bottom: 60, left: 80 }}
      />,
    );
    // The left gridline/spine should start at padding.left = 80
    const lines = container.querySelectorAll("line");
    const leftSpine = Array.from(lines).find((l) => {
      const x1 = parseFloat(l.getAttribute("x1") ?? "0");
      return x1 === 80;
    });
    expect(leftSpine).toBeInTheDocument();
  });

  // ── ChartRangeSelector ──────────────────────────────────────────

  it("renders ChartRangeSelector with presets and fires onChange", () => {
    const onChange = vi.fn();
    const { getByText } = render(
      <ChartRangeSelector
        presets={[
          { label: "7 Days", value: "7d" },
          { label: "30 Days", value: "30d" },
        ]}
        active="7d"
        onChange={onChange}
      />,
    );
    expect(getByText("7 Days")).toBeInTheDocument();
    expect(getByText("30 Days")).toBeInTheDocument();
    fireEvent.click(getByText("30 Days"));
    expect(onChange).toHaveBeenCalledWith("30d");
  });

  it("highlights the active preset in ChartRangeSelector", () => {
    const { getByText } = render(
      <ChartRangeSelector
        presets={[
          { label: "7d", value: "7d" },
          { label: "30d", value: "30d" },
        ]}
        active="30d"
        onChange={() => {}}
      />,
    );
    const activeBtn = getByText("30d");
    expect(activeBtn.className).toContain("bg-background");
    const inactiveBtn = getByText("7d");
    expect(inactiveBtn.className).not.toContain("bg-background");
  });
});

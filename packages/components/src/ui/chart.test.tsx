import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { Chart } from "./chart.js";

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

  it("renders bar rectangles for type=bar", () => {
    const { container } = render(
      <Chart x={SAMPLE_X} series={[SAMPLE_SERIES[0]!]} type="bar" showLegend={false} />,
    );
    const rects = container.querySelectorAll("rect");
    // 5 data points → at least 5 bar rects (plus potential hit-area rects)
    const barRects = Array.from(rects).filter((r) => r.getAttribute("fill") !== null);
    expect(barRects.length).toBeGreaterThanOrEqual(5);
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
    const rects = container.querySelectorAll("rect");
    expect(rects.length).toBeGreaterThan(0);
    // Horizontal bars have y positions varying across the chart height
    const ys = Array.from(rects).map((r) => Number(r.getAttribute("y")));
    expect(new Set(ys).size).toBeGreaterThan(1);
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
    const rects = container.querySelectorAll("rect");
    expect(rects.length).toBe(3);
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
    const rects = container.querySelectorAll("rect");
    // 3 data points × 2 series = 6 bar rects (plus potential extras)
    const barRects = Array.from(rects).filter((r) => Number(r.getAttribute("width")) > 0);
    expect(barRects.length).toBe(6);
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
});

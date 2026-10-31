import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { LayoutSkeleton } from "./index";

describe("LayoutSkeleton", () => {
  it("renders each kind without crashing", () => {
    const { container } = render(
      <LayoutSkeleton kind="console" density="comfortable" />,
    );
    expect(container.querySelector(".flex.min-h-screen")).not.toBeNull();
  });

  it("renders auth kind centered", () => {
    const { container } = render(<LayoutSkeleton kind="auth" />);
    expect(container.querySelector(".items-center.justify-center")).not.toBeNull();
  });

  it("renders landing kind with topbar", () => {
    const { container } = render(<LayoutSkeleton kind="landing" />);
    // Topbar: h-16 with border-b
    expect(container.querySelector(".h-16.border-b")).not.toBeNull();
  });

  it("renders chat kind with sidebar rail", () => {
    const { container } = render(<LayoutSkeleton kind="chat" />);
    expect(container.querySelector(".w-\\[68px\\]")).not.toBeNull();
  });

  it("renders docs kind with sidebar and content", () => {
    const { container } = render(
      <LayoutSkeleton kind="docs" aside={true} />,
    );
    // Sidebar: w-[240px]
    expect(container.querySelector(".w-\\[240px\\]")).not.toBeNull();
      // Aside: w-[260px] when aside=true
    expect(container.querySelector(".w-\\[260px\\]")).not.toBeNull();
  });

  it("hides header when header=false (console)", () => {
    const { container } = render(
      <LayoutSkeleton kind="console" header={false} />,
    );
    // Topbar has h-14 with border-b; should not be present
    expect(container.querySelector(".h-14.border-b")).toBeNull();
  });

  it("renders header when header=true (default)", () => {
    const { container } = render(
      <LayoutSkeleton kind="console" header={true} />,
    );
    expect(container.querySelector(".h-14.border-b")).not.toBeNull();
  });

  it("respects nav.itemCount for sections", () => {
    const { container } = render(
      <LayoutSkeleton
        kind="console"
        nav={{ items: 12, sections: 4 }}
      />,
    );
    // 4 sections → 4 section headers (h-3 w-20)
    const sectionHeaders = container.querySelectorAll(".h-3.w-20");
    expect(sectionHeaders.length).toBe(4);
  });

  it("applies density correctly", () => {
    const { container: compact } = render(
      <LayoutSkeleton kind="console" density="compact" />,
    );
    expect(compact.querySelector(".gap-3")).not.toBeNull();

    const { container: spacious } = render(
      <LayoutSkeleton kind="console" density="spacious" />,
    );
    expect(spacious.querySelector(".gap-4.md\\:gap-8")).not.toBeNull();
  });

  it("density adjusts main content padding (compact vs spacious)", () => {
    const { container: compact } = render(
      <LayoutSkeleton kind="console" density="compact" />,
    );
    expect(compact.querySelector("main")?.className).toContain("p-3");

    const { container: spacious } = render(
      <LayoutSkeleton kind="console" density="spacious" />,
    );
    expect(spacious.querySelector(".p-6.md\\:p-8")).not.toBeNull();
  });

  it("merges className onto root", () => {
    const { container } = render(
      <LayoutSkeleton kind="auth" className="custom-skel" />,
    );
    expect(container.querySelector(".custom-skel")).not.toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Marquee } from "./marquee.js";

describe("Marquee", () => {
  it("renders each item twice to form a seamless loop", () => {
    render(
      <Marquee
        items={[
          <span key="a">Alpha</span>,
          <span key="b">Beta</span>,
          <span key="c">Gamma</span>,
        ]}
      />,
    );
    // The track duplicates children: each appears twice.
    expect(screen.getAllByText("Alpha")).toHaveLength(2);
    expect(screen.getAllByText("Beta")).toHaveLength(2);
    expect(screen.getAllByText("Gamma")).toHaveLength(2);
  });

  it("applies a custom duration via inline animation style", () => {
    const { container } = render(
      <Marquee items={[<span key="x">X</span>]} duration={8} />,
    );
    const track = container.querySelector("[role=marquee] > div");
    expect(track?.getAttribute("style")).toContain("8s linear infinite");
  });

  it("pauses on mouse enter and resumes on leave", () => {
    const { container } = render(
      <Marquee items={[<span key="x">X</span>]} pauseOnHover />,
    );
    const outer = container.querySelector("[role=marquee]");
    const track = container.querySelector("[role=marquee] > div");
    expect(track?.getAttribute("style")).toContain(
      "animation-play-state: running",
    );
    fireEvent.mouseEnter(outer!);
    expect(track?.getAttribute("style")).toContain(
      "animation-play-state: paused",
    );
    fireEvent.mouseLeave(outer!);
    expect(track?.getAttribute("style")).toContain(
      "animation-play-state: running",
    );
  });

  it("defaults the gap to 16px", () => {
    const { container } = render(<Marquee items={[<span key="x">X</span>]} />);
    const track = container.querySelector("[role=marquee] > div");
    expect(track?.getAttribute("style")).toContain("gap: 16px");
  });

  it("clamps a numeric gap into the 4-32px safe band", () => {
    const { container } = render(
      <Marquee items={[<span key="x">X</span>]} gap={96} />,
    );
    const track = container.querySelector("[role=marquee] > div");
    expect(track?.getAttribute("style")).toContain("gap: 32px");

    const tiny = render(<Marquee items={[<span key="y">Y</span>]} gap={1} />);
    const tinyTrack = tiny.container.querySelector("[role=marquee] > div");
    expect(tinyTrack?.getAttribute("style")).toContain("gap: 4px");
  });

  it("passes a CSS length string gap through untouched", () => {
    const { container } = render(
      <Marquee items={[<span key="x">X</span>]} gap="1.5rem" />,
    );
    const track = container.querySelector("[role=marquee] > div");
    expect(track?.getAttribute("style")).toContain("gap: 1.5rem");
  });

  it("defaults pauseOnHover to true for the loop variant", () => {
    const { container } = render(
      <Marquee items={[<span key="x">X</span>]} variant="loop" />,
    );
    const track = container.querySelector("[role=marquee] > div");
    expect(track?.getAttribute("style")).toContain(
      "animation-play-state: running",
    );
    fireEvent.mouseEnter(container.querySelector("[role=marquee]")!);
    expect(track?.getAttribute("style")).toContain(
      "animation-play-state: paused",
    );
  });

  it("strip variant does not pause on hover by default", () => {
    const { container } = render(
      <Marquee items={[<span key="x">X</span>]} variant="strip" />,
    );
    const track = container.querySelector("[role=marquee] > div");
    // No pause on hover: animation-play-state stays "running".
    fireEvent.mouseEnter(container.querySelector("[role=marquee]")!);
    fireEvent.mouseLeave(container.querySelector("[role=marquee]")!);
    expect(track?.getAttribute("style")).toContain(
      "animation-play-state: running",
    );
  });

  it("strip variant applies the facet-marquee--strip class", () => {
    const { container } = render(
      <Marquee items={[<span key="x">X</span>]} variant="strip" />,
    );
    const outer = container.querySelector("[role=marquee]");
    expect(outer?.className).toContain("facet-marquee--strip");
  });

  it("strip variant respects an explicit pauseOnHover override", () => {
    const { container } = render(
      <Marquee
        items={[<span key="x">X</span>]}
        variant="strip"
        pauseOnHover={true}
      />,
    );
    const track = container.querySelector("[role=marquee] > div");
    fireEvent.mouseEnter(container.querySelector("[role=marquee]")!);
    expect(track?.getAttribute("style")).toContain(
      "animation-play-state: paused",
    );
  });

  it("loop variant does not apply the strip class", () => {
    const { container } = render(<Marquee items={[<span key="x">X</span>]} />);
    const outer = container.querySelector("[role=marquee]");
    expect(outer?.className).not.toContain("facet-marquee--strip");
  });
});

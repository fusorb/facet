import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stagger, useStagger } from "./stagger.js";

describe("Stagger", () => {
  it("renders children", () => {
    render(
      <Stagger delay={50}>
        <span>A</span>
        <span>B</span>
      </Stagger>,
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("provides stagger delay via context", () => {
    let value: number | undefined;
    function Probe() {
      const delay = useStagger();
      value = delay;
      return null;
    }
    render(
      <Stagger delay={100}>
        <Probe />
      </Stagger>,
    );
    expect(value).toBe(100);
  });

  it("defaults to 100ms", () => {
    let value: number | undefined;
    function Probe() {
      const delay = useStagger();
      value = delay;
      return null;
    }
    render(
      <Stagger>
        <Probe />
      </Stagger>,
    );
    expect(value).toBe(100);
  });

  it("returns 100 outside Stagger", () => {
    let value: number | undefined;
    function Probe() {
      const delay = useStagger();
      value = delay;
      return null;
    }
    render(<Probe />);
    expect(value).toBe(100);
  });
});

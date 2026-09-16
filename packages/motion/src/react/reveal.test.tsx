import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Reveal } from "./reveal.js";

describe("Reveal", () => {
  it("renders children", () => {
    render(<Reveal>Hello</Reveal>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders a div wrapper", () => {
    const { container } = render(<Reveal>Content</Reveal>);
    const wrapper = container.querySelector("div");
    expect(wrapper).not.toBeNull();
  });
});

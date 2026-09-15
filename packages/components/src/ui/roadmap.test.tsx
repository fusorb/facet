import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Roadmap } from "./roadmap.js";

const items = [
  {
    title: "Ship v1",
    description: "Core auth flows",
    status: "done" as const,
    date: "Q1",
  },
  {
    title: "Passkeys",
    description: "WebAuthn sign-in",
    status: "in-progress" as const,
  },
  { title: "SSO", status: "planned" as const },
];

describe("Roadmap", () => {
  it("renders item titles and descriptions", () => {
    render(<Roadmap items={items} />);
    expect(screen.getByText("Ship v1")).toBeInTheDocument();
    expect(screen.getByText("Core auth flows")).toBeInTheDocument();
    expect(screen.getByText("SSO")).toBeInTheDocument();
  });

  it("renders status badges", () => {
    render(<Roadmap items={items} />);
    expect(screen.getByText("Done · Q1")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("Planned")).toBeInTheDocument();
  });

  it("hides the connector line when showLine is false", () => {
    const { container } = render(<Roadmap items={items} showLine={false} />);
    expect(container.querySelector(".bg-border")).toBeNull();
  });

  it("renders the timeline variant with the date as a phase label", () => {
    render(<Roadmap items={items} variant="timeline" />);
    expect(screen.getByText("Ship v1")).toBeInTheDocument();
    expect(screen.getByText("Q1")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("Planned")).toBeInTheDocument();
  });
});

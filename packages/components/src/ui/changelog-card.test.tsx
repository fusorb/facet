import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChangelogCard, type ChangelogItem } from "./changelog-card.js";

const item: ChangelogItem = {
  id: "1",
  version: "v2.5.0",
  date: "August 2026",
  status: "Current",
  category: "FEATURE",
  title: "A new console surface with auth preview.",
  description: "Rebuilt the hero with a domain-customizable auth preview.",
  highlights: [
    "Added auth-console preview",
    "Removed domain-cycling card",
  ],
  codeDiff: {
    language: "tsx",
    code: "const x = 1;",
  },
};

describe("ChangelogCard", () => {
  it("renders version, date, title, description and highlights", () => {
    render(<ChangelogCard item={item} />);
    expect(screen.getByText("v2.5.0")).toBeInTheDocument();
    expect(screen.getByText("August 2026")).toBeInTheDocument();
    expect(screen.getByText(item.title)).toBeInTheDocument();
    expect(screen.getByText(item.description)).toBeInTheDocument();
    expect(screen.getByText("Added auth-console preview")).toBeInTheDocument();
    expect(screen.getByText("Removed domain-cycling card")).toBeInTheDocument();
  });

  it("renders the category badge", () => {
    render(<ChangelogCard item={item} />);
    expect(screen.getByText("Feature")).toBeInTheDocument();
  });

  it("omits the in-card dot and status badge by default", () => {
    const { container } = render(<ChangelogCard item={item} />);
    expect(screen.queryByText("Current")).not.toBeInTheDocument();
    expect(container.querySelector(".h-2.w-2")).toBeNull();
  });

  it("renders the dot and status badge when opted in", () => {
    const { container } = render(
      <ChangelogCard item={item} showCategoryDot showStatus />,
    );
    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(container.querySelector(".h-2.w-2")).not.toBeNull();
  });

  it("accepts category presentation overrides", () => {
    render(
      <ChangelogCard
        item={item}
        categoryConfig={{ FEATURE: { label: "New" } }}
      />,
    );
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.queryByText("Feature")).not.toBeInTheDocument();
  });

  it("accepts copy overrides", () => {
    render(
      <ChangelogCard
        item={item}
        labels={{ showDiff: "View patch", hideDiff: "Hide patch" }}
      />,
    );
    expect(screen.getByRole("button", { name: /view patch/i })).toBeInTheDocument();
  });

  it("reveals the diff panel on toggle", () => {
    render(<ChangelogCard item={item} />);
    expect(screen.queryByText("const x = 1;")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /show diff/i }));
    expect(screen.getByRole("button", { name: /hide diff/i })).toBeInTheDocument();
    expect(screen.getByText("const x = 1;")).toBeInTheDocument();
  });

  it("omits the status badge when status is null", () => {
    render(<ChangelogCard item={{ ...item, status: null }} showStatus />);
    expect(screen.queryByText("Current")).not.toBeInTheDocument();
  });

  it("omits the diff toggle when codeDiff is absent", () => {
    render(<ChangelogCard item={{ ...item, codeDiff: undefined }} />);
    expect(screen.queryByText(/show diff/i)).not.toBeInTheDocument();
  });
});

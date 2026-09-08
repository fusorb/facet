import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Pill, PillGroup, PillTrigger } from "./pill.js";

describe("Pill", () => {
  it("renders as a span by default", () => {
    const { container } = render(<Pill>Label</Pill>);
    const pill = container.firstChild as HTMLElement;
    expect(pill.tagName).toBe("SPAN");
    expect(pill).toHaveAttribute("class");
  });

  it("renders as an anchor when href is provided", () => {
    const { container } = render(<Pill href="https://example.com">Link</Pill>);
    const anchor = container.firstChild as HTMLElement;
    expect(anchor.tagName).toBe("A");
    expect(anchor).toHaveAttribute("href", "https://example.com");
  });

  it("renders as a button when selected", () => {
    const { container } = render(<Pill selected>Toggle</Pill>);
    const btn = container.firstChild as HTMLElement;
    expect(btn.tagName).toBe("BUTTON");
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it("renders as a button when onClick is provided", () => {
    const onClick = vi.fn();
    const { container } = render(<Pill onClick={onClick}>Click</Pill>);
    const btn = container.firstChild as HTMLElement;
    expect(btn.tagName).toBe("BUTTON");
    expect(btn).toHaveAttribute("type", "button");
  });

  it("renders a dot indicator by default", () => {
    const { container } = render(<Pill>Label</Pill>);
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveClass("rounded-full");
  });

  it("hides the dot when indicator is none", () => {
    const { container } = render(<Pill indicator="none">Label</Pill>);
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).not.toBeInTheDocument();
  });

  it("renders a custom icon when indicator is icon", () => {
    render(
      <Pill indicator="icon" icon={<span data-testid="myicon" />}>
        Label
      </Pill>,
    );
    expect(screen.getByTestId("myicon")).toBeInTheDocument();
    expect(screen.getByText("Label")).toBeInTheDocument();
  });

  it("renders custom leading content and skips the dot", () => {
    const { container } = render(
      <Pill leading={<span data-testid="leading" />}>Label</Pill>,
    );
    expect(screen.getByTestId("leading")).toBeInTheDocument();
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).not.toBeInTheDocument();
  });

  it("applies the default variant and rounded-full radius", () => {
    const { container } = render(<Pill>Label</Pill>);
    const pill = container.firstChild as HTMLElement;
    expect(pill.className).toContain("bg-background");
    expect(pill.className).toContain("rounded-full");
  });

  it("applies outline variant classes", () => {
    const { container } = render(<Pill variant="outline">Label</Pill>);
    const pill = container.firstChild as HTMLElement;
    expect(pill.className).toContain("bg-transparent");
  });

  it("applies filled variant with color", () => {
    const { container } = render(
      <Pill variant="filled" color="primary">
        Label
      </Pill>,
    );
    const pill = container.firstChild as HTMLElement;
    expect(pill.className).toContain("bg-primary");
    expect(pill.className).toContain("text-primary-foreground");
  });

  it("applies success color classes", () => {
    const { container } = render(<Pill color="success">Label</Pill>);
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot?.className).toContain("bg-green-600");
  });

  it("applies selected ring classes", () => {
    const { container } = render(<Pill selected>Label</Pill>);
    const pill = container.firstChild as HTMLElement;
    expect(pill.className).toContain("ring-2");
    expect(pill.className).toContain("ring-offset-2");
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<Pill onClick={onClick}>Click</Pill>);
    fireEvent.click(screen.getByText("Click"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("forwards extra props to the rendered element", () => {
    render(
      <Pill data-testid="custom" aria-label="pill-label">
        Label
      </Pill>,
    );
    const pill = screen.getByTestId("custom");
    expect(pill).toHaveAttribute("aria-label", "pill-label");
  });

  it("renders a remove button when removable is true", () => {
    const onRemove = vi.fn();
    render(<Pill removable onRemove={onRemove}>Tag</Pill>);
    const removeBtn = screen.getByLabelText("Remove");
    expect(removeBtn).toBeInTheDocument();
    fireEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("does not render a remove button when removable is false", () => {
    render(<Pill>Tag</Pill>);
    expect(screen.queryByLabelText("Remove")).not.toBeInTheDocument();
  });

  it("does not forward removable/onRemove to the underlying element", () => {
    const { container } = render(
      <Pill removable onRemove={() => {}}>
        Tag
      </Pill>,
    );
    const pill = container.firstChild as HTMLElement;
    expect(pill).not.toHaveAttribute("removable");
  });

  it("applies small and large size classes", () => {
    const { container } = render(<Pill size="sm">S</Pill>);
    expect((container.firstChild as HTMLElement).className).toContain("h-5");

    const { container: large } = render(<Pill size="lg">L</Pill>);
    expect((large.firstChild as HTMLElement).className).toContain("h-7");
  });
});

describe("PillGroup", () => {
  it("renders a tablist with children", () => {
    render(
      <PillGroup>
        <PillTrigger value="a">A</PillTrigger>
        <PillTrigger value="b">B</PillTrigger>
      </PillGroup>,
    );
    const tablist = screen.getByRole("tablist");
    expect(tablist).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("PillTrigger throws when used outside PillGroup", () => {
    expect(() =>
      render(
        <PillTrigger value="x">
          <span />
        </PillTrigger>,
      ),
    ).toThrow("must be used inside <PillGroup>");
  });

  it("marks the trigger matching value as selected", () => {
    render(
      <PillGroup value="b">
        <PillTrigger value="a">A</PillTrigger>
        <PillTrigger value="b">B</PillTrigger>
      </PillGroup>,
    );
    const b = screen.getByText("B").closest('[role="tab"]');
    expect(b).toHaveAttribute("aria-selected", "true");
  });

  it("calls onValueChange when a trigger is clicked", () => {
    const onValueChange = vi.fn();
    render(
      <PillGroup onValueChange={onValueChange}>
        <PillTrigger value="a">A</PillTrigger>
        <PillTrigger value="b">B</PillTrigger>
      </PillGroup>,
    );
    fireEvent.click(screen.getByText("B"));
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("moves focus with arrow keys", () => {
    render(
      <PillGroup>
        <PillTrigger value="a">A</PillTrigger>
        <PillTrigger value="b">B</PillTrigger>
        <PillTrigger value="c">C</PillTrigger>
      </PillGroup>,
    );
    const a = screen.getByText("A").closest('[role="tab"]') as HTMLElement;
    a.focus();
    fireEvent.keyDown(a, { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByText("B").closest('[role="tab"]'));
  });
});

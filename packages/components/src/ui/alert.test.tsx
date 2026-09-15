import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert, AlertDescription, AlertTitle } from "./alert.js";

describe("Alert", () => {
  it("renders the default variant", () => {
    render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Default alert.</AlertDescription>
      </Alert>,
    );
    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("Default alert.")).toBeInTheDocument();
  });

  it("applies the success text color", () => {
    const { container } = render(<Alert variant="success">Saved</Alert>);
    expect(container.firstChild?.textContent).toBe("Saved");
    expect((container.firstChild as HTMLElement).className).toContain(
      "text-success",
    );
  });

  it("applies the warning text color", () => {
    const { container } = render(<Alert variant="warning">Careful</Alert>);
    expect((container.firstChild as HTMLElement).className).toContain(
      "text-warning",
    );
  });

  it("applies the destructive text color", () => {
    const { container } = render(<Alert variant="destructive">Error</Alert>);
    expect((container.firstChild as HTMLElement).className).toContain(
      "text-destructive",
    );
  });
});

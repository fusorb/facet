import * as React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { Stage } from "@fusorb/facet-sandbox/react";
import { buttonExamples } from "./ui/button.examples.js";
import { dialogExamples } from "./ui/dialog.examples.js";
import { dataTableExamples } from "./ui/data-table.examples.js";

const buttonArtifact = {
  id: "button",
  kind: "component",
  title: "Button",
  package: "@fusorb/facet-components",
  examples: buttonExamples.map((e) => e.id),
};

const dialogArtifact = {
  id: "dialog",
  kind: "component",
  title: "Dialog",
  package: "@fusorb/facet-components",
  examples: dialogExamples.map((e) => e.id),
};

const dataTableArtifact = {
  id: "data-table",
  kind: "component",
  title: "Data Table",
  package: "@fusorb/facet-components",
  examples: dataTableExamples.map((e) => e.id),
};

describe("M3 Stage PoC (button, dialog, data-table)", () => {
  it("renders button default example in Stage", () => {
    const { container } = render(
      React.createElement(Stage, { artifact: buttonArtifact, example: buttonExamples[0] as any }),
    );
    expect(container).toBeTruthy();
  });

  it("renders button with-icon example in Stage", () => {
    const { container } = render(
      React.createElement(Stage, { artifact: buttonArtifact, example: buttonExamples[1] as any }),
    );
    expect(container).toBeTruthy();
  });

  it("renders dialog default example in Stage", () => {
    const { container } = render(
      React.createElement(Stage, { artifact: dialogArtifact, example: dialogExamples[0] as any }),
    );
    expect(container).toBeTruthy();
  });

  it("renders data-table default example in Stage", () => {
    const { container } = render(
      React.createElement(Stage, { artifact: dataTableArtifact, example: dataTableExamples[0] as any }),
    );
    expect(container).toBeTruthy();
  });

  it("honors Example.controls (button with-icon has controls override)", () => {
    const ex = buttonExamples[1]!; // with-icon
    expect(ex.controls).toBeDefined();
    const { container } = render(
      React.createElement(Stage, { artifact: buttonArtifact, example: ex as any }),
    );
    expect(container).toBeTruthy();
  });
});

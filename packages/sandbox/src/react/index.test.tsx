import * as React from "react";
import { describe, it, expect } from "vitest";

import {
  ArtifactRenderer,
  Catalog,
  CodeView,
} from "./index.js";
import {
  registerArtifactKind,
  type Artifact,
} from "../core/index.js";

const artifact: Artifact = {
  id: "btn",
  kind: "react-test",
  title: "Button",
  package: "@fusorb/facet-components",
  examples: [],
};

describe("ArtifactRenderer", () => {
  it("renders through a registered kind", () => {
    registerArtifactKind({
      id: "react-test",
      label: "Test",
      defaultViewport: { fit: "content", scroll: "none" } as const,
      render: () => "rendered",
    });
    expect(ArtifactRenderer({ artifact, values: {} })).toBe("rendered");
  });

  it("falls back to a placeholder for unknown kinds", () => {
    const unknown = { ...artifact, kind: "missing" };
    const node = ArtifactRenderer({ artifact: unknown, values: {} });
    expect(React.isValidElement(node)).toBe(true);
  });
});

describe("CodeView", () => {
  it("renders code", () => {
    expect(React.isValidElement(CodeView({ code: "<X />" }))).toBe(true);
  });
});

describe("Catalog", () => {
  it("renders the artifact list", () => {
    expect(React.isValidElement(Catalog({ artifacts: [artifact] }))).toBe(
      true,
    );
  });
});

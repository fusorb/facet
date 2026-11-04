/**
 * Register the "component" artifact kind (ADR-009) at module load of the
 * `./examples` subpath. Keeps `@fusorb/facet-sandbox` facet-agnostic: the kit
 * owns the kind, the components package owns the registration.
 */
import { registerArtifactKind } from "@fusorb/facet-sandbox/core";

registerArtifactKind({
  id: "component",
  label: "Component",
  defaultViewport: { fit: "content", scroll: "inside" },
  render: () => null,
});

/**
 * Colocated component examples (ADR-001).
 *
 * Each `src/ui/<slug>.examples.tsx` exports a `<slug>Examples` array of
 * sandbox `Example` objects. This barrel is published as the `./examples`
 * subpath so consumers (playground, docs, landing) can render live examples
 * without reaching into `ui/` internals. The main barrel stays lean: examples
 * are opt-in content, not runtime surface.
 */
export { buttonExamples, type ButtonExampleProps } from "./ui/button.examples.js";
export { dialogExamples, type DialogExampleProps } from "./ui/dialog.examples.js";
export { dataTableExamples, type DataTableExampleProps } from "./ui/data-table.examples.js";
export type { Example } from "@fusorb/facet-sandbox/core";

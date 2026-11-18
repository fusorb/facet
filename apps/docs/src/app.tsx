import { DocsApp } from "@fusorb/facet-docs";
import { docsConfig } from "./demo-config.js";
import { facetDocsDataSource, docsPages } from "./data/facet-data-source.js";

export function App() {
  return <DocsApp config={docsConfig} pages={docsPages} dataSource={facetDocsDataSource} />;
}

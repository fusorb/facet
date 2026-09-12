import { existsSync } from "node:fs";
import path from "node:path";
import type { DocsAnswers, GeneratedFile } from "./types.js";
import { mergePackageJson, readExistingPackageJson } from "./writer.js";
import { starterPages } from "./starter-pages.js";

/** Extension for the consumer's language (.ts vs .js). */
function ext(language: "typescript" | "javascript"): string {
  return language === "typescript" ? "ts" : "js";
}

/**
 * Generate the thin-consumer files for a React + Vite app (like apps/docs).
 * Produces: package.json, vite.config, index.html, src/main, src/app,
 * src/pages (content), and the styling entry. The consumer's content lives
 * in their own pages file: never facet's docs.
 */
export function generateReactVite(answers: DocsAnswers, cwd: string): GeneratedFile[] {
  const e = ext(answers.language);
  const base = path.join(cwd, answers.location === "." ? "" : answers.location);
  const tsx = answers.language === "typescript" ? "tsx" : "jsx";

  const appEntry = `import { DocsApp } from "@fusorb/facet-docs";
import { docsConfig } from "./config.${e}";
import { docsPages } from "./pages.${e}";

export default function App() {
  return <DocsApp config={docsConfig} pages={docsPages} />;
}
`;

  const mainEntry = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./app.css";
import App from "./app.${tsx}";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;

  const configFile = `import type { DocsSiteConfig } from "@fusorb/facet-docs";

/** Docs site configuration for ${answers.name}. */
export const docsConfig: DocsSiteConfig = {
  brand: { name: "${answers.name}", tagline: "Docs for ${answers.name}" },
  navigation: [],
  // Point these at your other products' docs, e.g. arc-id.
  ecosystem: [],
};
`;

  const pagesFile = `import type { DocsPage } from "@fusorb/facet-docs";

/**
 * Your docs pages registry. A page is data: path + title + section +
 * content blocks. The sidebar and search derive from this array, so adding
 * a page here gives you a route, nav entry, and search hit automatically.
 */
export const docsPages: DocsPage[] = ${JSON.stringify(starterPages(answers.template, answers.name), null, 2).replace(/"([a-z]+)":/g, "$1:")};
`;

  const packageJson = mergePackageJson(
    readExistingPackageJson(base),
    {
      facetDocs: answers.facetVersions["@fusorb/facet-docs"] ?? "^1.0.0",
      facetTokens: answers.facetVersions["@fusorb/facet-tokens"] ?? "^1.0.0",
      facetComponents: answers.facetVersions["@fusorb/facet-components"] ?? "^1.0.0",
      facetLayout: answers.facetVersions["@fusorb/facet-layout"] ?? "^1.0.0",
      framework: answers.framework,
      language: answers.language,
    },
  );
  // The merged package.json is only written if a file didn't already exist.
  // If it existed, we patch it in place (mergePackageJson handles that); the
  // GeneratedFile list below writes the merged content to disk.

  const viteConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
});
`;

  const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${answers.name} docs</title>
  </head>
  <body class="bg-background text-foreground antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.${tsx}"></script>
  </body>
</html>
`;

  const tokensCss = `/* facet Alpha Palette design tokens (CSS variables) */
@import "@fusorb/facet-tokens/tokens.css";

/* Map the tokens onto Tailwind v4 utilities (bg-background, text-foreground, ...) */
@import "@fusorb/facet-tokens/tailwind.css";

/* Tell Tailwind v4 to crawl the facet packages for utility classes */
@source "../../node_modules/@fusorb/facet-components/src";
@source "../../node_modules/@fusorb/facet-layout/src";
`;

  const plainCss = `/* Your own styling entry point */
`;

  const files: GeneratedFile[] = [
    { path: path.join(base, "package.json"), content: packageJson.content },
    { path: path.join(base, "vite.config.ts"), content: viteConfig },
    { path: path.join(base, "index.html"), content: indexHtml },
    { path: path.join(base, "src", `main.${tsx}`), content: mainEntry },
    { path: path.join(base, "src", `app.${tsx}`), content: appEntry },
    { path: path.join(base, "src", `config.${e}`), content: configFile },
    { path: path.join(base, "src", `pages.${e}`), content: pagesFile },
    {
      path: path.join(base, "src", "app.css"),
      content: answers.useFacetTokens ? tokensCss : plainCss,
    },
  ];

  // Barrel: a single entry that re-exports the docs site pieces so the
  // consumer can import them as one module. "auto" creates it for a
  // fresh scaffold; true always; false never.
  const wantsBarrel =
    answers.barrel === true ||
    (answers.barrel !== false && !existsSync(path.join(base, "src", `index.${e}`)));
  if (wantsBarrel) {
    files.push({
      path: path.join(base, "src", `index.${e}`),
      content: `/** Docs site entry. Import the docs app, config, or pages from here. */
export { default as App } from "./app.${tsx}";
export { docsConfig } from "./config.${e}";
export { docsPages } from "./pages.${e}";
`,
    });
  }

  return files;
}

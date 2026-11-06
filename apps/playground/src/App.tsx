import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import { ThemeProvider } from "@fusorb/facet-components";
import { ConsoleLayout, PageHeader } from "@fusorb/facet-layout";
import { Stage } from "@fusorb/facet-sandbox/react";
import { getComponent, listComponents } from "@fusorb/facet-registry";
import * as examplesNs from "@fusorb/facet-components/examples";
import { surfaces } from "../../../surfaces.config.mjs";

import "./app.css";

// Build a slug -> Example[] map from the components examples barrel.
function buildExampleMap(): Record<string, any[]> {
  const map: Record<string, any[]> = {};
  for (const [, val] of Object.entries(examplesNs)) {
    if (Array.isArray(val) && val.length > 0 && val[0]?.artifact) {
      const slug = val[0].artifact;
      map[slug] = val;
    }
  }
  return map;
}

const exampleMap = buildExampleMap();

const DOCS_URL = import.meta.env.DEV ? surfaces.docs.dev : surfaces.docs.prod;

export default function App() {
  const components = listComponents();
  const [selectedSlug, setSelectedSlug] = useState<string>(components[0]?.slug ?? "");
  const [selectedExample, setSelectedExample] = useState<string>("");

  const comp = getComponent(selectedSlug);
  const examples = exampleMap[selectedSlug] ?? [];
  const example = examples.find((e: any) => e.id === selectedExample) ?? examples[0];

  useEffect(() => {
    if (examples.length && !selectedExample) {
      setSelectedExample(examples[0].id);
    }
  }, [examples, selectedExample]);

  // Permalink: hash = #/<slug>/<example>
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const [slug, ex] = hash.split("/");
    if (slug && components.some((c) => c.slug === slug)) {
      setSelectedSlug(slug);
      if (ex) setSelectedExample(ex);
    }
  }, []);

  useEffect(() => {
    if (selectedSlug) {
      window.location.hash = `/${selectedSlug}/${selectedExample || ""}`;
    }
  }, [selectedSlug, selectedExample]);

  const artifact = useMemo(
    () => ({
      id: selectedSlug,
      kind: "component",
      title: comp?.name ?? selectedSlug,
      package: comp?.package ?? "@fusorb/facet-components",
      examples: examples.map((e: any) => e.id),
    }),
    [selectedSlug, comp, examples],
  );

  return (
    <ThemeProvider themes={[]} overrideVars={{}}>
      <ConsoleLayout
        config={{
          brand: { name: "facet", tagline: "Playground" },
          navigation: [
            {
              id: "components",
              title: "Components",
              items: components.map((c: any) => ({
                href: `#${c.slug}`,
                label: c.name,
              })),
            },
          ],
          features: { tenantSwitcher: false, themeToggle: true },
        }}
      >
        <PageHeader title={comp?.name ?? "Playground"} description={comp?.summary} />
        <div style={{ display: "flex", gap: 16, padding: 16 }}>
          <aside style={{ width: 240, maxHeight: "80vh", overflow: "auto" }}>
            <input
              placeholder="Search components..."
              onChange={(e) => {
                const q = e.target.value.toLowerCase();
                const match = components.find((c) => c.slug.includes(q) || c.name.toLowerCase().includes(q));
                if (match) setSelectedSlug(match.slug);
              }}
              style={{ width: "100%", marginBottom: 8 }}
            />
            <ul style={{ listStyle: "none", padding: 0 }}>
              {components.map((c: any) => (
                <li key={c.slug}>
                  <button
                    onClick={() => setSelectedSlug(c.slug)}
                    style={{ fontWeight: c.slug === selectedSlug ? "bold" : "normal", display: "block", width: "100%", textAlign: "left" }}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <main style={{ flex: 1 }}>
            {examples.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                {examples.map((e: any) => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedExample(e.id)}
                    style={{ marginRight: 4, fontWeight: e.id === (example?.id ?? "") ? "bold" : "normal" }}
                  >
                    {e.title}
                  </button>
                ))}
              </div>
            )}
            {example && <Stage artifact={artifact} example={example} />}
            <p style={{ marginTop: 16, fontSize: 12, color: "#888" }}>
              Permalink: <code>{window.location.origin}{window.location.pathname}#{selectedSlug}/{selectedExample}</code>
            </p>
            <p style={{ fontSize: 12, color: "#888" }}>
              <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">Docs</a>
            </p>
          </main>
        </div>
      </ConsoleLayout>
    </ThemeProvider>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

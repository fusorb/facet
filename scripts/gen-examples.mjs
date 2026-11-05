import fs from "node:fs";
import path from "node:path";

const root = "C:/Users/HP/Desktop/fusorb/facet";
const uiDir = path.join(root, "packages/components/src/ui");
const barrelPath = path.join(root, "packages/components/src/examples.ts");

const files = fs.readdirSync(uiDir).filter(f => f.endsWith(".tsx") && !f.endsWith(".test.tsx") && !f.endsWith(".examples.tsx"));

function firstExport(src, slug) {
  const pascal = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
  const exports = src.match(/export\s*\{\s*([^}]+)\}/g) || [];
  // 1. Exact PascalCase match in export blocks
  for (const e of exports) {
    const names = e.replace(/export\s*\{/, "").replace(/\}/, "").split(",").map(s => s.trim().replace(/^type\s+/, ""));
    for (const n of names) {
      const clean = n.split(/\s+as\s+/).pop().trim();
      if (clean === pascal) return clean;
    }
  }
  // 2. export function/const PascalCase
  const m = src.match(new RegExp("export\\\\s+(?:function|const)\\\\s+(" + pascal + ")"));
  if (m) return m[1];
  const m2 = src.match(/export\s+(?:function|const)\s+([A-Z][a-z][A-Za-z0-9_$]*)/);
  if (m2) return m2[1];
  // 3. PascalCase export (second char lowercase) in export blocks
  for (const e of exports) {
    const names = e.replace(/export\s*\{/, "").replace(/\}/, "").split(",").map(s => s.trim().replace(/^type\s+/, ""));
    for (const n of names) {
      const clean = n.split(/\s+as\s+/).pop().trim();
      if (/^[A-Z][a-z][A-Za-z0-9_$]*$/.test(clean)) return clean;
    }
  }
  // 4. Fallback: any export name (including all-caps like QRCode)
  for (const e of exports) {
    const names = e.replace(/export\s*\{/, "").replace(/\}/, "").split(",").map(s => s.trim().replace(/^type\s+/, ""));
    for (const n of names) {
      const clean = n.split(/\s+as\s+/).pop().trim();
      if (/^[A-Z][A-Za-z0-9_$]*$/.test(clean)) return clean;
    }
  }
  // export default
  const d = src.match(/export\s+default\s+([A-Za-z0-9_$]+)/);
  if (d) return d[1];
  return null;
}

function kebabToCamel(s) {
  const pascal = s.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function kebabToPascal(s) {
  return s.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}

let created = 0;
let skipped = 0;
const slugs = [];

for (const f of files) {
  const slug = f.replace(".tsx", "");
  const exampleFile = path.join(uiDir, slug + ".examples.tsx");
  if (fs.existsSync(exampleFile)) { skipped++; continue; }
  const src = fs.readFileSync(path.join(uiDir, f), "utf8");
  const comp = firstExport(src, slug);
  if (!comp) { console.log("SKIP (no export):", slug); continue; }
  const pascal = kebabToPascal(slug);
  const camel = kebabToCamel(slug);
  const content = `import { ${comp} } from "./${slug}.js";

export const ${camel}Examples = [
  {
    id: "default",
    title: "Default",
    artifact: "${slug}",
    render: () => <${comp} {...({} as any)} />,
  },
];
`;
  fs.writeFileSync(exampleFile, content);
  slugs.push(slug);
  created++;
}

console.log("created:", created, "skipped:", skipped);

let barrel = fs.readFileSync(barrelPath, "utf8");
for (const slug of slugs) {
  const camel = kebabToCamel(slug);
  const line = `export * from "./ui/${slug}.examples.js";`;
  if (!barrel.includes(line)) {
    barrel = barrel.trimEnd() + "\n" + line + "\n";
  }
}
fs.writeFileSync(barrelPath, barrel);
console.log("barrel updated with", slugs.length, "new entries");

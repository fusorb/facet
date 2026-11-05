import fs from "node:fs";

const files = ["AuthDemo.tsx", "AuthPreviews.tsx", "LayoutPreviews.tsx"];
for (const f of files) {
  const p = "apps/docs/src/facet/" + f;
  let s = fs.readFileSync(p, "utf8");
  s = s.replace(/from ['"]\.\/CodeBlock\.js['"]/g, 'from "@fusorb/facet-docs"');
  fs.writeFileSync(p, s);
  console.log("fixed", f);
}

let s = fs.readFileSync("apps/docs/src/facet/ComponentDemoCard.tsx", "utf8");
s = s.replace(/from ['"]\.\/Playground\.js['"]/g, 'from "@fusorb/facet-docs"');
s = s.replace(/from ['"]\.\/ThemePreviewFrame\.js['"]/g, 'from "@fusorb/facet-docs"');
fs.writeFileSync("apps/docs/src/facet/ComponentDemoCard.tsx", s);
console.log("fixed ComponentDemoCard.tsx");

s = fs.readFileSync("apps/docs/src/facet/manifest.ts", "utf8");
s = s.replace(/from ['"]\.\.\/manifest\.js['"]/g, 'from "./docs-manifest.js"');
fs.writeFileSync("apps/docs/src/facet/manifest.ts", s);
console.log("fixed manifest.ts");

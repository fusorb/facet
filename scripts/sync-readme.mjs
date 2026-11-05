import fs from "node:fs";
const f = "README.md";
let s = fs.readFileSync(f, "utf8");
const versions = {
  "@fusorb/facet-sdk": "2.1.1",
  "@fusorb/facet-components": "3.2.1",
  "@fusorb/facet-auth": "2.1.0",
  "@fusorb/facet-layout": "1.7.2",
  "@fusorb/facet-store": "1.0.4",
  "@fusorb/facet-docs": "1.5.12",
  "@fusorb/facet-sandbox": "3.0.1",
  "@fusorb/facet-tokens": "1.5.1",
  "@fusorb/facet-motion": "1.2.2",
  "@fusorb/facet-native": "1.2.2",
  "@fusorb/facet-cli": "1.1.4",
  "@fusorb/facet-emails": "1.1.4",
  "@fusorb/facet-utils": "0.1.1",
};
const lines = s.split("\n");
let n = 0;
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^\| `(@fusorb\/facet-[\w-]+)`/);
  if (!m) continue;
  const pkg = m[1];
  if (!versions[pkg]) continue;
  const before = lines[i];
  lines[i] = lines[i].replace(/✅ \d+\.\d+\.\d+/, `✅ ${versions[pkg]}`);
  if (lines[i] !== before) n++;
}
s = lines.join("\n");
// forms count
s = s.replace(/7 standalone forms/g, "8 standalone forms");
// current versions line
s = s.replace(
  /Current versions: tokens [\d.]+, sdk [\d.]+, motion [\d.]+, native [\d.]+, components [\d.]+, auth [\d.]+, layout [\d.]+, store [\d.]+, docs [\d.]+, cli [\d.]+, emails [\d.]+, sandbox [\d.]+, utils [\d.]+/,
  "Current versions: tokens 1.5.1, sdk 2.1.1, motion 1.2.2, native 1.2.2, components 3.2.1, auth 2.1.0, layout 1.7.2, store 1.0.4, docs 1.5.12, cli 1.1.4, emails 1.1.4, sandbox 3.0.1, utils 0.1.1"
);
// pill claim
s = s.replace(
  "Pair it with the `Navbar` `pill` variant for a floating frosted-glass bar.",
  "Pair it with the `Navbar` for a floating frosted-glass bar."
);
// sandbox description
s = s.replace(
  "Framework-agnostic live-preview host: block registry, adapter seam + React JSX adapter (no eval)",
  "Framework-agnostic artifact model + live-JSX runtime: /core (types + pure fns), /react (lab kit), /live (no-eval JSX interpreter + URL sanitizer)"
);
fs.writeFileSync(f, s);
console.log("version rows updated:", n);

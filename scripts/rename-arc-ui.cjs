const fs = require("fs");
const cp = require("child_process");

const files = cp.execFileSync("git", ["ls-files"], { encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
const exts = [".ts", ".tsx", ".js", ".json", ".md", ".mdx", ".yml", ".yaml", ".css", ".html", ".mjs", ".cjs"];
const targets = files.filter(
  (f) => !f.includes("/dist/") && !f.includes("node_modules") && exts.some((e) => f.endsWith(e)),
);

let changed = 0;
for (const f of targets) {
  const orig = fs.readFileSync(f, "utf8");
  const s = orig.replace(/@arc-ui\//g, "@fusorb/facet-").replace(/\barc-ui\b/g, "facet");
  if (s !== orig) {
    fs.writeFileSync(f, s);
    changed++;
    console.log("updated:", f);
  }
}
console.log("TOTAL_CHANGED:", changed);

import fs from "node:fs";
const d = fs.readdirSync("apps/docs/src/facet");
for (const f of d) {
  const s = fs.readFileSync("apps/docs/src/facet/" + f, "utf8");
  const lines = s.split("\n");
  const imps = lines.filter((l) => /from ['"]/.test(l) && /\.\//.test(l));
  if (imps.length) {
    console.log("=== " + f + " ===");
    for (const l of imps) console.log("  " + l.trim());
  }
}

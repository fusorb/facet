const esbuild = require("esbuild");
const fs = require("fs");
const files = [
  "tokens.css",
  "tailwind.css",
  "index.css",
  "palettes/alpha.css",
  "palettes/ember.css",
];
for (const f of files) {
  const path = `dist/${f}`;
  if (!fs.existsSync(path)) continue;
  const out = esbuild.transformSync(fs.readFileSync(path, "utf8"), {
    loader: "css",
    minify: true,
    target: ["chrome90", "firefox90", "safari14"],
  });
  fs.writeFileSync(path, out.code);
}

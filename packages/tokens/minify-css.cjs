const esbuild = require("esbuild");
const fs = require("fs");
for (const f of ["tokens.css", "tailwind.css", "index.css"]) {
  const out = esbuild.transformSync(fs.readFileSync(`dist/${f}`, "utf8"), {
    loader: "css",
    minify: true,
    target: ["chrome90", "firefox90", "safari14"],
  });
  fs.writeFileSync(`dist/${f}`, out.code);
}

#!/usr/bin/env node
/**
 * Gate: no hard-coded origins/URLs in apps/** outside surfaces.config.mjs (L6).
 *
 * Scans apps/** (ts, tsx, js, jsx, css, html, json, md) for origin/localhost/
 * facet.so/GitHub URLs. Any hit outside surfaces.config.mjs fails.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appsDir = path.join(root, "apps");
const ALLOWED = path.join(root, "surfaces.config.mjs");

const URL_RE = /https?:\/\/[^\s"'`<>)]+|localhost:\d+/g;
const FACET_HOSTS = /facet\.so|localhost:\d+|github\.com\/fusorb/i;

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === "dist") continue;
      walk(full, acc);
    } else {
      acc.push(full);
    }
  }
}

const files = [];
walk(appsDir, files);

let failures = 0;
for (const f of files) {
  if (path.resolve(f) === path.resolve(ALLOWED)) continue;
  // Generated data files are owned by gen-* scripts; their URLs are data, not
  // hand-coded origins. Exclude them from the L6 origin gate.
  const base = path.basename(f);
  if (base.endsWith(".generated.ts") || base === "changelog.ts") continue;
  // Demo/example code under apps/docs/src/facet/ legitimately contains example
  // URLs (QRCode values, socials hrefs, usage snippets). Those are illustrative
  // content, not app config; L6 origin config lives in surfaces.config.mjs.
  if (f.includes(path.join("apps", "docs", "src", "facet"))) continue;
  const content = fs.readFileSync(f, "utf-8");
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    const matches = line.match(URL_RE);
    if (!matches) return;
    for (const m of matches) {
      if (FACET_HOSTS.test(m)) {
        console.error(`FAIL: ${path.relative(root, f)}:${i + 1}: ${m}`);
        failures++;
      }
    }
  });
}

if (failures > 0) {
  console.error(`\ncheck:surfaces: ${failures} hard-coded origin/URL(s) in apps/.`);
  console.error("Fix: read from surfaces.config.mjs (see L6).");
  process.exit(1);
}
console.log("check:surfaces: OK - no hard-coded origins/URLs in apps/.");

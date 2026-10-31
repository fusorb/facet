#!/usr/bin/env node
/**
 * Content compiler (ADR-005): Markdown + directives -> DocsPage[].
 *
 * Usage:
 *   node scripts/compile-docs.mjs --input <dir> --out <file> [--facts <json>]
 */
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
}
const inputDir = getArg("--input");
const outFile = getArg("--out");
const factsFile = getArg("--facts");

if (!inputDir || !outFile) {
  console.error("Usage: node scripts/compile-docs.mjs --input <dir> --out <file> [--facts <json>]");
  process.exit(2);
}

const facts = factsFile && fs.existsSync(factsFile)
  ? JSON.parse(fs.readFileSync(factsFile, "utf-8"))
  : {};

function walk(dir, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith(".md")) acc.push(full);
  }
}

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { fm: null, body: text };
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!mm) continue;
    const key = mm[1];
    let val = mm[2].trim();
    if (val.startsWith("[") && val.endsWith("]")) {
      try { fm[key] = JSON.parse(val); } catch { fm[key] = val; }
    } else if (/^\d+$/.test(val)) {
      fm[key] = Number(val);
    } else {
      fm[key] = val.replace(/^"|"$/g, "");
    }
  }
  return { fm, body: m[2] };
}

function interpolate(s) {
  return s.replace(/\{\{facts\.([\w.]+)\}\}/g, (_, key) => {
    const parts = key.split(".");
    let cur = facts;
    for (const p of parts) cur = cur?.[p];
    if (cur === undefined) throw new Error(`Unresolved fact: ${key}`);
    return String(cur);
  });
}

function parseProps(str) {
  const props = {};
  const re = /(\w+)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(str))) props[m[1]] = m[2];
  return props;
}

function compileBody(body) {
  const blocks = [];
  const lines = body.split(/\r?\n/);
  let i = 0;
  let para = [];
  function flushPara() {
    if (para.length) {
      blocks.push({ type: "p", text: interpolate(para.join(" ").trim()) });
      para = [];
    }
  }
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") { flushPara(); i++; continue; }
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      flushPara();
      const lang = fence[1] || undefined;
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].match(/^```\s*$/)) { codeLines.push(lines[i]); i++; }
      i++;
      const block = { type: "code", text: codeLines.join("\n") };
      if (lang) block.lang = lang;
      blocks.push(block);
      continue;
    }
    const hm = line.match(/^(#{1,3})\s+(.*)$/);
    if (hm) {
      flushPara();
      const level = hm[1].length;
      blocks.push({ type: level <= 2 ? "h2" : "h3", text: interpolate(hm[2].trim()) });
      i++;
      continue;
    }
    if (/^[-*]\s+/.test(line.trim())) {
      flushPara();
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(interpolate(lines[i].trim().replace(/^[-*]\s+/, "")));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    if (line.trim().startsWith("|")) {
      flushPara();
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i].trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        rows.push(cells);
        i++;
      }
      if (rows.length >= 2) {
        const headers = rows[0];
        const data = rows.slice(2).length ? rows.slice(2) : rows.slice(1);
        blocks.push({ type: "table", headers, rows: data });
      }
      continue;
    }
    const dm = line.trim().match(/^::(\w+)\{(.*)\}\s*$/);
    if (dm) {
      flushPara();
      const name = dm[1];
      const props = parseProps(dm[2]);
      if (name === "callout") {
        const tone = props.tone || "note";
        const bodyLines = [];
        i++;
        while (i < lines.length && lines[i].trim() !== ":::") { bodyLines.push(lines[i]); i++; }
        i++;
        blocks.push({ type: "callout", tone, text: interpolate(bodyLines.join(" ").trim()) });
        continue;
      }
      if (name === "example") {
        blocks.push({ type: "demo", slug: props.id, title: props.title, description: props.description });
        i++;
        continue;
      }
      if (name === "install") {
        blocks.push({ type: "install", pkg: props.pkg, extras: props.extras ? props.extras.split(/\s+/) : undefined });
        i++;
        continue;
      }
      if (name === "reference") {
        blocks.push({ type: "reference", kind: props.kind, id: props.id, text: props.text });
        i++;
        continue;
      }
      throw new Error(`Unknown directive: ${name}`);
    }
    para.push(line.trim());
    i++;
  }
  flushPara();
  return blocks;
}

const files = [];
walk(inputDir, files);
files.sort();

const errors = [];
const compiled = [];
const seenPaths = new Set();

for (const file of files) {
  let text;
  try { text = fs.readFileSync(file, "utf-8"); }
  catch (e) { errors.push(`${file}: ${e.message}`); continue; }
  const { fm, body } = parseFrontmatter(text);
  if (!fm) { errors.push(`${file}: missing frontmatter`); continue; }
  if (!fm.title) { errors.push(`${file}: missing title`); continue; }
  if (!fm.section) { errors.push(`${file}: missing section`); continue; }
  let blocks;
  try { blocks = compileBody(body); }
  catch (e) { errors.push(`${file}: ${e.message}`); continue; }
  const slug = path.basename(file, ".md").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const pagePath = fm.path || `/${fm.section}/${slug}`;
  if (seenPaths.has(pagePath)) { errors.push(`${file}: duplicate path ${pagePath}`); continue; }
  seenPaths.add(pagePath);
  compiled.push({
    path: pagePath,
    title: fm.title,
    section: fm.section,
    description: fm.summary || fm.description,
    order: fm.order,
    blocks,
  });
}

if (errors.length) {
  for (const e of errors) console.error(e);
  process.exit(1);
}

compiled.sort((a, b) => (a.section < b.section ? -1 : a.section > b.section ? 1 : (a.order ?? 0) - (b.order ?? 0)));

const out = `// AUTO-GENERATED by scripts/compile-docs.mjs — do not edit by hand.
import type { DocsPage, DocsBlock } from "@fusorb/facet-docs";

export const pages: DocsPage[] = [
${compiled.map((p) => `  {
    path: ${JSON.stringify(p.path)},
    title: ${JSON.stringify(p.title)},
    section: ${JSON.stringify(p.section)},
    ${p.description ? `description: ${JSON.stringify(p.description)},` : ""}
    ${p.order != null ? `order: ${p.order},` : ""}
    blocks: [],
    load: async (): Promise<DocsBlock[]> => ${JSON.stringify(p.blocks)},
  },`).join("\n")}
];

export default pages;
`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out, "utf-8");
console.log(`ok: compiled ${compiled.length} page(s) -> ${outFile}`);
#!/usr/bin/env node
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync, accessSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

function fileExists(p) {
  try { accessSync(p); return true; } catch { return false; }
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const SCOPE_TO_PKG = {
  tokens: "@fusorb/facet-tokens",
  cli: "@fusorb/facet-cli",
  sdk: "@fusorb/facet-sdk",
  components: "@fusorb/facet-components",
  sandbox: "@fusorb/facet-sandbox",
  store: "@fusorb/facet-store",
  motion: "@fusorb/facet-motion",
  native: "@fusorb/facet-native",
  auth: "@fusorb/facet-auth",
  layout: "@fusorb/facet-layout",
  docs: "@fusorb/facet-docs",
  emails: "@fusorb/facet-emails",
  landing: "@fusorb/facet-landing",
  playground: "@fusorb/facet-playground",
  cliud: "@fusorb/facet-cli",
  tracker: null,
};

const TYPE_EMOJI = {
  feat: "✨",
  fix: "🐛",
  perf: "⚡",
  refactor: "♻️",
  chore: "🔧",
  docs: "📚",
  test: "✅",
  ci: "🎡",
};

const TYPE_BUMP = {
  feat: "minor",
  fix: "patch",
  perf: "patch",
  refactor: "patch",
  chore: "patch",
  docs: "patch",
  test: "patch",
  ci: "patch",
};

const COMMIT_RE = /^(\w+)(\(.+?\))?!?:\s*(.*)$/;

function parseArgs(argv) {
  const args = { since: null, out: null, title: null };
  const tokens = argv.slice(2);
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.startsWith("--since=")) args.since = t.slice(8);
    else if (t === "--since" && tokens[i + 1]) args.since = tokens[++i];
    else if (t.startsWith("--out=")) args.out = t.slice(6);
    else if (t === "--out" && tokens[i + 1]) args.out = tokens[++i];
    else if (t.startsWith("--title=")) args.title = t.slice(8);
    else if (t === "--title" && tokens[i + 1]) args.title = tokens[++i];
  }
  return args;
}

function getSinceRef() {
  try {
    const lastTag = execSync("git -C " + ROOT + " describe --tags --abbrev=0", { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }).trim();
    if (lastTag) return lastTag;
  } catch {}
  try {
    const rev = execSync("git -C " + ROOT + " rev-list --count HEAD", { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }).trim();
    return "HEAD~" + Math.min(parseInt(rev || "10"), 10);
  } catch {
    return "HEAD~10";
  }
}

function getCommits(since) {
  const range = since ? `${since}..HEAD` : "HEAD~10..HEAD";
  const raw = execSync(`git -C ${ROOT} log --format="%x1f%s%x1f%B%x1e" ${range}`, { encoding: "utf8" });
  return raw.split("\x1e").filter(Boolean);
}

function parseRaw(raw) {
  const parts = raw.split("\x1f");
  if (parts.length < 3) return null;
  return { subject: parts[1], body: parts[2].trim() };
}

function parseCommit(subject, body) {
  const m = subject.match(COMMIT_RE);
  if (!m) return null;
  const [, type, scopeStr, desc] = m;
  const scope = scopeStr ? scopeStr.slice(1, -1) : null;
  const breaking = /BREAKING[ -]CHANGE/i.test(body || "");
  return { type, scope, desc, breaking };
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

function generateTitle(entries) {
  const types = new Set(entries.map((e) => e.type));
  if (types.has("feat")) {
    const first = entries.find((e) => e.type === "feat");
    if (first) return first.desc.replace(/\(.*?\)\s*/, "").trim();
  }
  if (types.has("fix")) {
    const first = entries.find((e) => e.type === "fix");
    if (first) return "Fixed: " + first.desc.replace(/\(.*?\)\s*/, "").trim();
  }
  const first = entries[0];
  return first ? first.desc.replace(/\(.*?\)\s*/, "").trim() : "changelog";
}

function main() {
  const { since: sinceArg, out, title } = parseArgs(process.argv);
  const since = sinceArg || getSinceRef();

  const rawCommits = getCommits(since);
  const commits = rawCommits
    .map((r) => parseRaw(r))
    .filter(Boolean)
    .map(({ subject, body }) => parseCommit(subject, body))
    .filter(Boolean);

  if (commits.length === 0) {
    console.log("No commits found in range. Exiting.");
    return;
  }

  const grouped = new Map();
  const rootChanges = [];

  for (const c of commits) {
    const pkg = c.scope ? SCOPE_TO_PKG[c.scope] || null : null;
    if (pkg) {
      if (!grouped.has(pkg)) grouped.set(pkg, []);
      grouped.get(pkg).push(c);
    } else {
      rootChanges.push(c);
    }
  }

  const frontmatter = {};
  const bullets = [];

  for (const [pkg, items] of grouped) {
    const bump = items.some((c) => c.breaking) ? "major" : TYPE_BUMP[items[0].type] || "patch";
    frontmatter[pkg] = bump;
    for (const c of items) {
      const emoji = TYPE_EMOJI[c.type] || "•";
      bullets.push(`- ${c.desc} — ${emoji} \`${pkg}\``);
    }
  }

  if (rootChanges.length > 0) {
    frontmatter["@fusorb/facet-components"] = "patch";
    for (const c of rootChanges) {
      const emoji = TYPE_EMOJI[c.type] || "•";
      bullets.push(`- ${emoji} ${c.desc}`);
    }
  }

  const fmLines = Object.entries(frontmatter)
    .map(([pkg, level]) => `"${pkg}": ${level}`)
    .join("\n");

  const autoTitle = title || generateTitle(commits);
  const body = [autoTitle, "", ...bullets].join("\n");
  const content = `---\n${fmLines}\n---\n\n${body}\n`;

  let outPath;
  if (out) {
    outPath = resolve(ROOT, out);
  } else {
    const dir = resolve(ROOT, ".changeset");
    const slug = slugify(autoTitle);
    mkdirSync(dir, { recursive: true });
    outPath = resolve(dir, `${slug}.md`);
    let counter = 1;
    while (fileExists(outPath)) {
      outPath = resolve(dir, `${slug}-${counter}.md`);
      counter++;
    }
  }

  writeFileSync(outPath, content, "utf8");
  console.log(`Generated changeset: ${outPath}`);
  console.log(content);
}

main();

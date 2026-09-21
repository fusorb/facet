import fs from "node:fs";

const file = "apps/docs/src/pages.ts";
let content = fs.readFileSync(file, "utf-8");

// First: fix any remaining multi-line double-quoted strings (newlines -> \n)
// This handles the case where template literals were converted to double quotes
content = content.replace(/"([^"\\]|\\.)*\n([^"\\]|\\.)*"/g, (match) => {
  return match.replace(/\n/g, "\\n").replace(/\r/g, "");
});

// Second: convert remaining backtick template literals to double-quoted strings
// Match backtick-delimited strings that don't contain nested backticks
content = content.replace(/`([^`]*)`/g, (match, inner) => {
  const escaped = inner
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
  return `"${escaped}"`;
});

fs.writeFileSync(file, content);
console.log("Fixed template literals and multi-line strings in pages.ts");

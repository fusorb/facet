/**
 * @fusorb/facet-emails: dev preview server
 *
 * A tiny, dependency-light preview server (plain node:http) that renders
 * registered templates to HTML and serves them with a small dev toolbar.
 * Framework-agnostic: templates can be plain `TemplateNode` trees or, via
 * the React bridge, React elements.
 *
 *   import { startEmailPreviewServer } from "@fusorb/facet-emails/server";
 *   import { emailLayout, emailButton } from "@fusorb/facet-emails";
 *
 *   startEmailPreviewServer({
 *     templates: {
 *       welcome: {
 *         title: "Welcome",
 *         tree: emailLayout({ previewText: "Welcome", heading: "Hi!" },
 *           emailButton({ href: "#", children: "Go" })),
 *       },
 *     },
 *     port: 3888,
 *   });
 */

import { createServer, type Server } from "node:http";
import {
  renderEmail,
  renderEmailText,
  type TemplateNode,
  type EmailBrand,
} from "../index.js";

export interface EmailPreviewTemplate {
  title: string;
  /** A template tree, or a function producing one (e.g. with sample data). */
  tree: TemplateNode | (() => TemplateNode);
}

export interface EmailPreviewServerOptions {
  /** name -> template. */
  templates: Record<string, EmailPreviewTemplate>;
  /** Brand tokens for the preview. */
  brand?: EmailBrand;
  port?: number;
  host?: string;
  /** Called once the server is listening. */
  onReady?: (port: number) => void;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function indexHtml(names: string[]): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>facet-emails preview</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 640px; margin: 48px auto; padding: 0 16px; color: #1f2937; }
      h1 { font-size: 22px; }
      ul { list-style: none; padding: 0; }
      li { margin: 8px 0; }
      a { color: #334155; text-decoration: none; font-weight: 600; }
      a:hover { text-decoration: underline; }
      code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    </style>
  </head>
  <body>
    <h1>facet-emails preview</h1>
    <ul>
      ${names.map((n) => `<li><a href="/preview/${esc(n)}">${esc(n)}</a></li>`).join("")}
    </ul>
  </body>
</html>`;
}

function previewHtml(title: string, html: string, text: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)} - facet-emails</title>
    <style>
      .toolbar { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; gap: 12px; padding: 8px 16px; background: #111827; color: #e5e7eb; font-family: system-ui, sans-serif; font-size: 13px; }
      .toolbar a { color: #93c5fd; text-decoration: none; }
      .toolbar a:hover { text-decoration: underline; }
      .toolbar .title { font-weight: 600; }
      .body { background: #e5e7eb; padding: 32px 16px; }
      .textview { display: none; background: #fff; padding: 32px; font-family: ui-monospace, monospace; font-size: 13px; white-space: pre-wrap; max-width: 600px; margin: 0 auto; }
      .toggle { cursor: pointer; }
    </style>
  </head>
  <body style="margin:0">
    <div class="toolbar">
      <a href="/">&#8592; All templates</a>
      <span class="title">${esc(title)}</span>
      <span class="toggle" id="toggle">View as text</span>
    </div>
    <div class="body" id="htmlview">${html}</div>
    <div class="textview" id="textview">${esc(text)}</div>
    <script>
      var t = document.getElementById("toggle");
      var h = document.getElementById("htmlview");
      var v = document.getElementById("textview");
      var textMode = false;
      t.addEventListener("click", function () {
        textMode = !textMode;
        h.style.display = textMode ? "none" : "block";
        v.style.display = textMode ? "block" : "none";
        t.textContent = textMode ? "View as HTML" : "View as text";
      });
    </script>
  </body>
</html>`;
}

export function startEmailPreviewServer(
  options: EmailPreviewServerOptions,
): Server {
  const {
    templates,
    brand,
    port = 3888,
    host = "127.0.0.1",
    onReady,
  } = options;
  const names = Object.keys(templates);

  const server = createServer((req, res) => {
    const url = new URL(
      req.url ?? "/",
      `http://${req.headers.host ?? "localhost"}`,
    );
    const path = url.pathname;

    res.setHeader("content-type", "text/html; charset=utf-8");

    if (path === "/" || path === "/index.html") {
      res.end(indexHtml(names));
      return;
    }

    const match = path.match(/^\/preview\/(.+)$/);
    if (match) {
      const name = decodeURIComponent(match[1] ?? "");
      const template = templates[name];
      if (!template) {
        res.statusCode = 404;
        res.end(
          `<h1>Unknown template: ${esc(name)}</h1><p><a href="/">Back</a></p>`,
        );
        return;
      }
      const tree =
        typeof template.tree === "function" ? template.tree() : template.tree;
      const html = renderEmail(tree, { brand, fullDocument: false });
      const text = renderEmailText(tree);
      res.end(previewHtml(template.title, html, text));
      return;
    }

    res.statusCode = 404;
    res.end('<h1>Not found</h1><p><a href="/">Back</a></p>');
  });

  server.listen(port, host, () => onReady?.(port));
  return server;
}

/** Stop a preview server. */
export function stopEmailPreviewServer(server: Server): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => resolve());
    // Force-close any open keep-alive sockets.
    server.closeAllConnections?.();
  });
}

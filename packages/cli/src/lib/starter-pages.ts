import type { TemplateKind } from "./types.js";

/** Build a starter `docsPages` array for a given template kind. */
export function starterPages(template: TemplateKind, name: string) {
  switch (template) {
    case "api-reference":
      return [
        {
          path: "/",
          title: "API Overview",
          section: "api",
          description: `${name} API reference.`,
          blocks: [
            { type: "p", text: `Welcome to the ${name} API reference.` },
            { type: "h2", text: "Endpoints" },
            {
              type: "ul",
              items: [
                "`GET /v1/resource` - list resources",
                "`POST /v1/resource` - create a resource",
                "`GET /v1/resource/:id` - fetch one",
              ],
            },
            { type: "h2", text: "Types" },
            { type: "p", text: "See the types page for the shared schemas." },
          ],
        },
        {
          path: "/endpoints",
          title: "Endpoints",
          section: "api",
          description: "Endpoint reference.",
          blocks: [
            { type: "h2", text: "Endpoints" },
            {
              type: "p",
              text: "Document each endpoint here: method, path, params, body, response.",
            },
          ],
        },
        {
          path: "/types",
          title: "Types",
          section: "api",
          description: "Shared types and schemas.",
          blocks: [
            { type: "h2", text: "Types" },
            {
              type: "p",
              text: "Document the shared request/response schemas here.",
            },
          ],
        },
      ];
    case "product-docs":
      return [
        {
          path: "/",
          title: "Getting started",
          section: "guides",
          description: `Welcome to ${name}.`,
          blocks: [
            { type: "p", text: `Welcome to ${name}.` },
            { type: "h2", text: "Quick start" },
            { type: "code", text: "npm install" },
          ],
        },
        {
          path: "/guides",
          title: "Guides",
          section: "guides",
          description: "In-depth guides.",
          blocks: [
            { type: "h2", text: "Guides" },
            { type: "p", text: "Write your guides here." },
          ],
        },
        {
          path: "/faq",
          title: "FAQ",
          section: "guides",
          description: "Frequently asked questions.",
          blocks: [
            { type: "h2", text: "FAQ" },
            { type: "ul", items: ["Question one?", "Question two?"] },
          ],
        },
        {
          path: "/changelog",
          title: "Changelog",
          section: "guides",
          description: "What shipped in each release.",
          blocks: [
            { type: "h2", text: "Release log" },
            {
              type: "p",
              text: `Recent releases of ${name}. Edit the releases array below to keep this in sync with your published versions.`,
            },
            {
              type: "changelog",
              showFilter: true,
              releases: [
                {
                  version: "0.1.0",
                  date: new Date().toISOString().slice(0, 10),
                  tag: "release",
                  changes: [
                    { kind: "added", text: `Initial release of ${name}.` },
                  ],
                },
              ],
            },
          ],
        },
      ];
    default:
      return [
        {
          path: "/",
          title: "Overview",
          section: "guides",
          description: `Welcome to ${name}.`,
          blocks: [
            { type: "p", text: `Welcome to ${name} docs.` },
            { type: "h2", text: "Quick start" },
            { type: "code", text: "npm install" },
          ],
        },
      ];
  }
}

import prompts from "prompts";
import {
  detectStyling,
  detectFramework,
  type DocsAnswers,
  type DocsLocation,
  type Framework,
  type Styling,
  type TemplateKind,
} from "./types.js";
import { resolveFacetVersions } from "./registry.js";

const FRAMEWORKS: { value: Framework; label: string; hint?: string }[] = [
  {
    value: "react-vite",
    label: "React + Vite",
    hint: "full docs app (recommended)",
  },
  {
    value: "next",
    label: "Next.js",
    hint: "app route at /docs (real Next scaffold)",
  },
  {
    value: "remix",
    label: "Remix",
    hint: "route at /docs (real Remix scaffold)",
  },
  {
    value: "plain-js",
    label: "Plain JS / Markdown",
    hint: "pages registry + content pipeline, no React shell",
  },
  {
    value: "python",
    label: "Python",
    hint: "markdown content pipeline -> pages.json",
  },
];

const TEMPLATES = [
  {
    value: "component-library",
    label: "Component library",
    hint: "pages per component (like facet's own docs)",
  },
  {
    value: "api-reference",
    label: "API reference",
    hint: "endpoints, types, and examples",
  },
  {
    value: "product-docs",
    label: "Product docs",
    hint: "getting started, guides, and FAQs",
  },
] as const;

/** Explicit choices a consumer can pass to `facet docs init` via flags.
 * Omitted fields are auto-detected or defaulted. */
export interface InitOptions {
  name?: string;
  location?: DocsLocation;
  language?: "typescript" | "javascript";
  framework?: Framework;
  styling?: Styling;
  useFacetTokens?: boolean;
  template?: TemplateKind;
  /** Optional: merge a consumer template directory into the scaffold. */
  useTemplate?: string;
  /** Whether to create a barrel export for the generated site. `"auto"`
   * (default) creates one when it fits the layout, `true` always creates,
   * `false` never touches a barrel. */
  barrel?: boolean | "auto";
  /** Skip the interactive wizard entirely: use detected defaults. */
  yes?: boolean;
}

/**
 * Interactive wizard for `facet docs init`. Detects the consumer's
 * frontend framework (ignoring backend stacks like Fastify/Express:
 * docs are a frontend concern), styling setup, and package manager, then
 * resolves the current facet package versions from the npm registry so
 * the scaffold never pins an outdated version.
 *
 * With `options.yes`, runs non-interactive ("decide for me"): every field
 * defaults to the detected best fit, and any explicit option wins.
 */
export async function runInitWizard(
  cwd: string,
  options: InitOptions = {},
): Promise<{ answers: DocsAnswers; decided: boolean }> {
  const detectedStyling = detectStyling(cwd);
  const detectedFramework = detectFramework(cwd);

  // Resolve current published versions up front (falls back to loose
  // ranges if offline). The wizard can show the resolved versions in the
  // final summary and the generator uses them for the package.json.
  const facetVersions = await resolveFacetVersions();

  const initial: DocsAnswers = {
    name: options.name ?? "Facet",
    location: options.location ?? ".",
    language: options.language ?? "typescript",
    framework: options.framework ?? detectedFramework,
    styling: options.styling ?? detectedStyling,
    useFacetTokens: options.useFacetTokens ?? true,
    template: options.template ?? "component-library",
    useTemplate: options.useTemplate,
    barrel: options.barrel ?? "auto",
    facetVersions,
  };

  // "Decide for me": no prompts, every field resolved from options +
  // detection above.
  if (options.yes) {
    return { answers: initial, decided: true };
  }

  // Ask the mode question FIRST. When the consumer picks "Decide for me",
  // skip every other prompt and use detected defaults (the whole point of
  // the mode is "don't make me answer questions"). When they pick "Walk me
  // through it", ask the tailored questions below.
  const mode = await prompts({
    type: "select",
    name: "decide",
    message: "How do you want to set up your docs site?",
    choices: [
      {
        title: "Decide for me",
        description: `Recommended: detect my stack (${detectedFramework} + ${detectedStyling}) and use the best defaults`,
        value: "decide",
      },
      {
        title: "Walk me through it",
        description:
          "Answer a few questions to tailor the scaffold to your needs",
        value: "walk",
      },
    ],
    initial: 0,
  });

  // "Decide for me": no further prompts, use detected defaults + any
  // explicit flags. The CLI prints a summary of what was chosen.
  if (mode.decide === "decide") {
    return {
      answers: {
        ...initial,
        name: (options.name ?? initial.name).trim() || "Facet",
        location: (options.location ?? initial.location) as DocsLocation,
        language: options.language ?? initial.language,
        framework: options.framework ?? initial.framework,
        styling: options.styling ?? initial.styling,
        useFacetTokens: options.useFacetTokens ?? initial.useFacetTokens,
        template: options.template ?? initial.template,
        useTemplate: options.useTemplate,
        barrel: options.barrel ?? initial.barrel ?? "auto",
      },
      decided: true,
    };
  }

  // "Walk me through it": ask the tailored questions. Explicit options win.
  const res = await prompts([
    {
      type: "text",
      name: "name",
      message:
        "What should your docs site be called? (leave empty for the default)",
      initial: initial.name,
    },
    {
      type: "select",
      name: "location",
      message: "Where should the docs scaffold live?",
      choices: [
        {
          title: "Root (.)",
          description:
            "Recommended: docs at the repo root, like Docusaurus/Mintlify: all content in one place",
          value: ".",
        },
        {
          title: "docs/",
          description: "A dedicated folder at the repo root",
          value: "docs",
        },
        {
          title: "src/docs/",
          description: "Docs under the source tree, next to your app code",
          value: "src/docs",
        },
      ],
    },
    {
      type: "toggle",
      name: "language",
      message: "TypeScript or JavaScript?",
      initial: initial.language === "typescript",
      active: "TypeScript",
      inactive: "JavaScript",
    },
    {
      type: "select",
      name: "framework",
      message: `What frontend framework are you on? (detected: ${detectedFramework})`,
      choices: FRAMEWORKS.map((f) => ({
        title: f.label,
        description: f.hint,
        value: f.value,
      })),
      initial: FRAMEWORKS.findIndex((f) => f.value === detectedFramework),
    },
    {
      type: "select",
      name: "styling",
      message: "How is your app styled today?",
      choices: [
        {
          title: "facet tokens (recommended)",
          description: "Already using @fusorb/facet-tokens",
          value: "facet-tokens",
        },
        {
          title: "Tailwind CSS",
          description: "Utility-first CSS with Tailwind",
          value: "tailwind",
        },
        {
          title: "Plain CSS",
          description: "Hand-written CSS files",
          value: "plain-css",
        },
        {
          title: "None / custom",
          description: "Bring your own styling setup",
          value: "none",
        },
      ],
      initial:
        initial.styling === "facet-tokens"
          ? 0
          : initial.styling === "tailwind"
            ? 1
            : initial.styling === "plain-css"
              ? 2
              : 3,
    },
    {
      type: "toggle",
      name: "useFacetTokens",
      message:
        "Wire up @fusorb/facet-tokens for theming? (recommended: saves restyling every component)",
      initial: true,
      active: "Yes, use facet tokens",
      inactive: "No, keep my styling",
    },
    {
      type: "select",
      name: "template",
      message: "What kind of docs are you publishing?",
      choices: TEMPLATES.map((t) => ({
        title: t.label,
        description: t.hint,
        value: t.value,
      })),
      initial: 0,
    },
    {
      type: "select",
      name: "barrel",
      message: "Create a barrel export (index.ts) for the generated site?",
      choices: [
        {
          title: "Let facet decide (recommended)",
          description:
            "Create one when it fits the layout, skip when it doesn't",
          value: "auto",
        },
        {
          title: "Always create",
          description: "Generate a barrel that re-exports the docs site",
          value: "always",
        },
        {
          title: "Never",
          description: "Do not create or touch any barrel",
          value: "never",
        },
      ],
      initial: 0,
    },
  ]);

  const language: "typescript" | "javascript" =
    options.language ?? (res.language ? "typescript" : "javascript");
  const framework: Framework = res.framework ?? initial.framework;
  const styling: Styling = res.styling ?? initial.styling;

  return {
    answers: {
      name:
        ((res.name as string) || "").trim() ||
        options.name?.trim() ||
        initial.name,
      location: (options.location ??
        res.location ??
        initial.location) as DocsLocation,
      language,
      framework,
      styling,
      useFacetTokens: res.useFacetTokens ?? initial.useFacetTokens,
      template: res.template ?? initial.template,
      useTemplate: options.useTemplate,
      barrel: (options.barrel ??
        (res.barrel === "never"
          ? false
          : res.barrel === "always"
            ? true
            : "auto")) as boolean | "auto",
      facetVersions,
    },
    decided: false,
  };
}

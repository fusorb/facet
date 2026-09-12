#!/usr/bin/env node
import { createRequire } from "node:module";
import path from "node:path";
import { Command } from "commander";
import { runInitWizard } from "./lib/wizard.js";
import { generateReactVite } from "./lib/generators.js";
import { generatePlainJs, generateNext, generatePython, generateRemix, generateComponentAdd, type AddPlacement } from "./lib/generators-plain.js";
import { writeFiles, readExistingPackageJson } from "./lib/writer.js";
import {
  detectPackageManager,
  installCommand,
  detectMonorepo,
  type DocsLocation,
  type Framework,
  type Styling,
  type TemplateKind,
} from "./lib/types.js";
import { facetInstallCommand, resolveLatestVersion, discoverFacetPackages } from "./lib/registry.js";
import {
  collectFacetPackageState,
  formatPackageTable,
  buildDoctorReport,
  planUpdates,
  updateCommand,
  installFacetPackages,
  globalInstallFacetPackages,
  resolveFacetPackageName,
} from "./lib/commands.js";
import {
  buildCleanPlan,
  rewriteImports,
  deleteIfUnused,
  removeCommand,
  globalRemoveCommand,
  removeBundledDeps,
  PRESET_SCRIPTS,
  mergeScripts,
  buildPrepPlan,
} from "./lib/deps.js";
import prompts from "prompts";
import {
  checkForCliUpdate,
  printUpdateNotification,
  currentCliVersion,
  globalInstallCommand,
  isCiEnvironment,
  npxRunCommand,
} from "./lib/update.js";

const program = new Command();
const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };

program
  .name("facet")
  .description("Scaffold docs, manage facet packages, add components, generate icons, and more. Framework/language-agnostic.")
  .version(version)
  .option("--log", "Verbose output: show internal steps and debug info")
  .option("--no-update-check", "Skip the startup check for facet-cli updates")
  .addHelpText(
    "after",
    "\nFull docs and examples: https://docs.facet.arcevocirqle.com.ng/cli\n",
  );

// `facet docs init` + `facet docs scan`: a `docs` group with subcommands.
// (Commander treats a two-word string as a command + required positional,
// so `docs` must be its own command with subcommands nested under it.)
const docsCommand = program.command("docs").description("Docs site commands");
docsCommand
  .command("init")
  .description("Scaffold a docs site in the current repo (interactive wizard)")
  .option("-y, --yes", "Non-interactive: decide the best setup for me (detected framework + styling)")
  .option("--name <name>", "Docs site name (default: docs)")
  .option("--location <location>", "Where the scaffold lives: . (root, recommended), docs, or src/docs (default: .)")
  .option("--language <language>", "TypeScript or JavaScript (default: TypeScript)")
  .option("--framework <framework>", "react-vite, next, remix, plain-js, or python (default: detected)")
  .option("--styling <styling>", "facet-tokens, tailwind, plain-css, or none (default: detected)")
  .option("--no-tokens", "Do not wire @fusorb/facet-tokens theming")
  .option("--template <template>", "component-library, api-reference, or product-docs (default: component-library)")
  .option("--use-template <name>", "Merge an existing template dir from ./templates into the scaffold")
  .option("--barrel <mode>", "Create a barrel export for the generated site: auto (create when it fits, default), always, or never")
  .action(async (opts: {
    yes?: boolean;
    name?: string;
    location?: string;
    language?: string;
    framework?: string;
    styling?: string;
    tokens?: boolean;
    template?: string;
    useTemplate?: string;
    barrel?: string;
  }) => {
    const cwd = process.cwd();
    const { answers, decided } = await runInitWizard(cwd, {
      yes: opts.yes,
      name: opts.name,
      location: opts.location as DocsLocation | undefined,
      language: opts.language as "typescript" | "javascript" | undefined,
      framework: opts.framework as Framework | undefined,
      styling: opts.styling as Styling | undefined,
      useFacetTokens: opts.tokens,
      template: opts.template as TemplateKind | undefined,
      useTemplate: opts.useTemplate,
      barrel:
        opts.barrel === "never" ? false : opts.barrel === "always" ? true : "auto",
    });
    const pm = detectPackageManager(cwd);

    if (decided) {
      console.log("Decide-for-me mode: chose the best setup for your repo.");
      console.log(`  framework: ${answers.framework} (detected)`);
      console.log(`  styling:   ${answers.styling} (detected)`);
      console.log(`  location:  ${answers.location}`);
      console.log(`  barrel:    ${answers.barrel === true ? "always" : answers.barrel === false ? "never" : "auto (create when it fits)"}`);
      console.log("Override any choice with the matching flag (e.g. --framework next).");
    }

    // Tailor the generator to the chosen stack.
    const files =
      answers.framework === "react-vite"
        ? generateReactVite(answers, cwd)
        : answers.framework === "next"
          ? generateNext(answers, cwd)
          : answers.framework === "remix"
            ? generateRemix(answers, cwd)
            : answers.framework === "python"
              ? generatePython(answers, cwd)
              : generatePlainJs(answers, cwd);

    const written = writeFiles(files);

    // Merge a consumer template over the scaffold (never clobbering).
    if (opts.useTemplate) {
      const { resolveTemplate } = await import("./lib/templates.js");
      const { mergeTemplateFiles } = await import("./lib/template-merge.js");
      const template = resolveTemplate(cwd, opts.useTemplate);
      if (!template) {
        console.error(`\nTemplate "${opts.useTemplate}" not found in ./templates. Run \`facet templates list\` to see what's available.`);
        process.exitCode = 2;
      } else {
        const target =
          answers.location === "." ? cwd : path.join(cwd, answers.location);
        const merge = mergeTemplateFiles(cwd, template.dir, target);
        if (merge.written.length)
          console.log(`\nMerged template "${template.name}" (${merge.written.length} new file(s), ${merge.merged.length} total):`);
        else if (merge.merged.length)
          console.log(`\nMerged template "${template.name}" (${merge.merged.length} file(s)):`);
        if (merge.written.length) {
          for (const f of merge.written) console.log(`  ${path.join(target, f).replace(cwd, ".")}`);
        }
        if (merge.merged.length) {
          for (const f of merge.merged) {
            if (!merge.written.includes(f)) console.log(`  ${path.join(target, f).replace(cwd, ".")} (merged)`);
          }
        }
        if (merge.conflicts.length) {
          console.log(`\nSkipped ${merge.conflicts.length} conflicting file(s) (existing content wins). Use --force to overwrite:`);
          for (const f of merge.conflicts) console.log(`  ${path.join(target, f).replace(cwd, ".")}`);
        }
      }
    }

    const where =
      answers.framework === "next"
        ? "src/app/docs (route) + src/lib/docs (config/pages)"
        : answers.framework === "remix"
          ? "app/routes/docs (route) + src/lib/docs (config/pages)"
          : `at ${answers.location}`;
    console.log(`\nScaffolded ${answers.name} docs (${answers.framework}) ${where}`);
    console.log("Wrote:");
    for (const f of written) console.log(`  ${f}`);

    // Install the facet deps automatically: they are the CLI's own
    // packages, resolved to the current safe published versions. The
    // consumer asked for a docs site, so wiring it up is the expected
    // outcome, not a suggestion. Fails soft (prints the command) when the
    // install can't run (offline, no package manager, etc.).
    const facetInstall = facetInstallCommand(pm, answers.facetVersions);
    console.log(`\nInstalling facet packages (${pm})...`);
    try {
      const { execSync } = await import("node:child_process");
      execSync(facetInstall, { cwd, stdio: "inherit" });
      console.log("Facet packages installed.");
    } catch (error) {
      console.log("Could not install automatically. Run:");
      console.log(`  ${facetInstall}`);
    }

    console.log(`\nNext steps:`);
    if (answers.framework === "react-vite") {
      console.log(`  ${installCommand(pm)} && pnpm dev   # open the docs site`);
    } else if (answers.framework === "next") {
      console.log(`  ${installCommand(pm)} && pnpm dev   # docs live at /docs`);
    } else if (answers.framework === "remix") {
      console.log(`  ${installCommand(pm)} && pnpm dev   # docs live at /docs`);
    } else if (answers.framework === "python") {
      console.log("  Add markdown under ./content and run: python docs_pipeline.py > pages.json");
    } else {
      console.log("  Add markdown under ./content and run the content pipeline.");
    }
    if (answers.useFacetTokens) {
      console.log("  Theming: @fusorb/facet-tokens is wired via ThemeProvider + overrideVars.");
    }
    console.log("\nFacet packages resolved from the npm registry at init time (no pinned versions):");
    for (const [name, range] of Object.entries(answers.facetVersions)) {
      console.log(`  ${name}@${range}`);
    }
  });
docsCommand
  .command("scan")
  .description("Read this repo and draft a documentation layer (pages + sidebar + API reference) for review")
  .option("--out <outDir>", "Where the draft lands (default: docs)", "docs")
  .option("-y, --yes", "Write the draft without confirmation")
  .action(async (opts: { out?: string; yes?: boolean }) => {
    const cwd = process.cwd();
    const { scanRepo, draftDocs } = await import("./lib/scan.js");
    const { writeFiles } = await import("./lib/writer.js");
    const scan = scanRepo(cwd);
    const outDir = opts.out ?? "docs";

    console.log("facet docs scan\n");
    for (const line of scan.summaryLines) console.log(`  ${line}`);
    console.log("");

    const files = draftDocs(scan, outDir);
    console.log(`Drafting ${files.length} file(s) into ${outDir}/:`);
    for (const f of files) console.log(`  ${f.path.replace(cwd, ".")}`);

    if (!opts.yes) {
      // Non-destructive: refuse to overwrite existing draft files.
      const { existsSync } = await import("node:fs");
      const existing = files.filter((f) => existsSync(f.path));
      if (existing.length > 0) {
        console.log(
          `\nRefusing to overwrite existing files (${existing.length}). Use a different --out or review the drafts.`,
        );
        process.exitCode = 2;
        return;
      }
    }

    await writeFiles(files);
    console.log("\nDraft written. Next:");
    console.log(`  - Review the drafted pages under ${outDir}/`);
    console.log(`  - Run \`facet docs init\` to mount the docs site, then point it at the drafted pages.`);
  });

// `facet icons generate`: scan the consumer's icon call sites and emit a
// slim generated registry (direct lucide imports for exactly the used set).
const iconsCommand = program.command("icons").description("Icon registry commands");
iconsCommand
  .command("generate")
  .description(
    "Scan this repo for icon usage and generate a slim lucide registry (exactly the icons you use, tree-shaken)",
  )
  .option("--path <path>", "Where to write icons.generated.tsx (default: detected from repo layout)")
  .option("-y, --yes", "Overwrite an existing generated registry without confirmation")
  .action(async (opts: { path?: string; yes?: boolean }) => {
    const cwd = process.cwd();
    const { scanIcons, buildLucideCatalog, resolveUsedIcons, generateIconRegistry } =
      await import("./lib/icons.js");
    const { writeFiles } = await import("./lib/writer.js");
    const scan = opts.path
      ? { ...scanIcons(cwd), targetDir: path.resolve(cwd, opts.path) }
      : scanIcons(cwd);
    const catalog = buildLucideCatalog(cwd);
    const resolved = resolveUsedIcons(scan.kebabNames, catalog);

    console.log("facet icons generate\n");
    console.log(`  Scanned ${scan.files.length} source file(s) for icon call sites.`);
    if (scan.names.length) {
      console.log(`  Icons referenced: ${scan.names.length} (${scan.kebabNames.length} unique)`);
    } else {
      console.log("  No icon call sites found - writing the default semantic set.");
    }
    if (resolved.renamed.length) {
      console.log(`  Legacy names mapped to current lucide icons: ${resolved.renamed.join(", ")}`);
    }
    if (resolved.unresolved.length) {
      console.log(
        `  Unresolved names (not in lucide v${resolved.version}, likely form-field props): ${resolved.unresolved.join(", ")}`,
      );
    }
    console.log(`  Resolving against lucide-react v${resolved.version}.`);
    console.log(`  Writing ${resolved.used.size} icon(s) into ${scan.targetDir.replace(cwd, ".")}/`);

    if (!opts.yes && scan.hasExisting) {
      console.log(
        `\n${scan.targetDir.replace(cwd, ".")}/icons.generated.tsx already exists. Re-run with -y to regenerate.`,
      );
      process.exitCode = 2;
      return;
    }

    const file = generateIconRegistry(scan, resolved);
    await writeFiles([file]);
    console.log("\nWrote:");
    console.log(`  ${file.path.replace(cwd, ".")}`);
    console.log("\nNext:");
    console.log("  - Import GeneratedIcon from that file anywhere you use icons.");
    console.log("  - Re-run `facet icons generate` after adding/removing icons to keep the set exact.");
  });

const emailsCommand = program.command("emails").description("Email template commands");
emailsCommand
  .command("init")
  .description(
    "Scaffold or migrate email templates wired to @fusorb/facet-emails (detects react-email/mjml/nodemailer/resend)",
  )
  .option("-y, --yes", "Use detected defaults without prompting")
  .option("--framework <framework>", "Override the detected frontend framework")
  .option("--migrate", "Force migration mode (build on an existing mail package)")
  .option("--fresh", "Force a fresh scaffold (ignore any existing mail package)")
  .option("--provider <provider>", "resend, nodemailer, or none (override detection)")
  .option("--location <location>", "Where the emails dir lands (default: emails)")
  .option("--name <name>", "Brand name used in the email layout header")
  .option("--use-template <name>", "Merge an existing email template dir from ./templates into the scaffold")
  .action(async (opts: {
    yes?: boolean;
    framework?: string;
    migrate?: boolean;
    fresh?: boolean;
    provider?: "resend" | "nodemailer" | "none";
    location?: string;
    name?: string;
    useTemplate?: string;
  }) => {
    const cwd = process.cwd();
    const { detectMailSetup, planEmailsInit, formatDetection } = await import("./lib/emails.js");
    const { generateEmailsScaffold, emailsPackageJsonAdditions } = await import("./lib/emails-generators.js");
    const { writeFiles, readExistingPackageJson } = await import("./lib/writer.js");
    const { detectPackageManager } = await import("./lib/types.js");

    const detection = detectMailSetup(cwd);
    console.log("facet emails init\n");
    for (const line of formatDetection(detection)) console.log(`  ${line}`);

    // Decide mode + provider (prompt unless -y).
    let answers = planEmailsInit(detection, {
      migrate: opts.migrate,
      fresh: opts.fresh,
      provider: opts.provider,
      location: opts.location,
    });

    if (!opts.yes) {
      const prompts = (await import("prompts")).default;
      const modeChoice = await prompts({
        type: "select",
        name: "mode",
        message: detection.hasExisting
          ? `Found ${detection.mailPackages.join(", ")}. How should we proceed?`
          : "No existing mail setup detected. How should we proceed?",
        choices: [
          { title: "Migrate / build on what exists", value: "migrate" },
          { title: "Fresh scaffold", value: "fresh" },
        ],
        initial: 0,
      });
      answers = { ...answers, mode: modeChoice.mode === "fresh" ? "fresh" : "migrate" };
    }

    const brandName = opts.name ?? path.basename(cwd);
    const facetEmailsRange = "latest"; // resolved at install time by the package manager
    const files = generateEmailsScaffold(cwd, { ...answers, brandName, facetEmailsRange });
    const { deps, scripts } = emailsPackageJsonAdditions({ ...answers, brandName, facetEmailsRange });

    // Merge into package.json (never clobber existing deps/scripts).
    const existing = readExistingPackageJson(cwd);
    const mergedPkg = {
      ...(existing ?? { name: path.basename(cwd), version: "0.1.0", private: true }),
      scripts: { ...(existing?.scripts ?? {}), ...scripts },
      dependencies: { ...(existing?.dependencies ?? {}), ...deps },
    };
    files.push({
      path: path.join(cwd, "package.json"),
      content: JSON.stringify(mergedPkg, null, 2) + "\n",
    });

    const written = writeFiles(files);
    console.log(`\n${answers.mode === "migrate" ? "Migrated" : "Scaffolded"} emails at ${answers.location}/`);
    console.log("Wrote:");
    for (const f of written) console.log(`  ${f.replace(cwd, ".")}`);

    // Merge a consumer email template over the scaffold (never clobbering).
    if (opts.useTemplate) {
      const { resolveTemplate } = await import("./lib/templates.js");
      const { mergeTemplateFiles } = await import("./lib/template-merge.js");
      const template = resolveTemplate(cwd, opts.useTemplate);
      if (!template) {
        console.error(`\nTemplate "${opts.useTemplate}" not found in ./templates. Run \`facet templates list\` to see what's available.`);
        process.exitCode = 2;
      } else {
        const target = path.join(cwd, answers.location ?? "emails");
        const merge = mergeTemplateFiles(cwd, template.dir, target);
        if (merge.written.length)
          console.log(`\nMerged template "${template.name}" (${merge.written.length} new file(s)):`);
        for (const f of merge.written) console.log(`  ${path.join(target, f).replace(cwd, ".")}`);
        if (merge.merged.length) {
          for (const f of merge.merged) {
            if (!merge.written.includes(f)) console.log(`  ${path.join(target, f).replace(cwd, ".")} (merged)`);
          }
        }
        if (merge.conflicts.length) {
          console.log(`\nSkipped ${merge.conflicts.length} conflicting file(s) (existing content wins). Use --force to overwrite:`);
          for (const f of merge.conflicts) console.log(`  ${path.join(target, f).replace(cwd, ".")}`);
        }
      }
    }

    // Install missing deps.
    const pm = detectPackageManager(cwd);
    const missing = Object.entries(deps).filter(([name]) => !detection.facetEmailsInstalled && name === "@fusorb/facet-emails");
    if (missing.length) {
      const installArgs = Object.keys(deps).join(" ");
      const cmd = `${pm} add ${installArgs}`;
      console.log(`\nInstalling: ${installArgs}`);
      try {
        const { execSync } = await import("node:child_process");
        execSync(cmd, { cwd, stdio: "inherit" });
        console.log("Dependencies installed.");
      } catch {
        console.log("Could not install automatically. Run:");
        console.log(`  ${cmd}`);
      }
    }

    const { emailSuggestionProvider } = await import("./lib/emails.js");
    const { buildRepoContext, generalRepoProvider, suggestRepoSteps } = await import("./lib/suggest.js");
    const ctx = buildRepoContext(cwd);
    console.log(`\nSuggested next steps (based on your repo):`);
    const steps = suggestRepoSteps(ctx, [emailSuggestionProvider(detection, answers), generalRepoProvider]);
    steps.forEach((step, i) => console.log(`  ${i + 1}. ${step}`));
  });

const templatesCommand = program.command("templates").description("Template directory commands (consumer templates merged by docs init / emails init)");
templatesCommand
  .command("list")
  .description("List template directories found in this repo (./templates, ./docs/templates, ./emails/templates)")
  .action(async () => {
    const cwd = process.cwd();
    const { discoverTemplates } = await import("./lib/templates.js");
    const templates = discoverTemplates(cwd);
    console.log("facet templates");
    console.log("");
    if (!templates.length) {
      console.log("No templates found. Create one under ./templates/<name>/ with an optional template.json manifest.");
      return;
    }
    for (const t of templates) {
      const kind = t.manifest?.kind ?? t.kinds.join("/");
      const desc = t.manifest?.description ? ` - ${t.manifest.description}` : "";
      console.log(`  ${t.name} (${kind})${desc}`);
      console.log(`    ${t.dir.replace(cwd, ".")}`);
    }
  });
templatesCommand
  .command("describe <name>")
  .description("Show a template's manifest and files")
  .action(async (name: string) => {
    const cwd = process.cwd();
    const { resolveTemplate } = await import("./lib/templates.js");
    const template = resolveTemplate(cwd, name);
    if (!template) {
      console.error(`Template "${name}" not found. Run \`facet templates list\` to see what's available.`);
      process.exitCode = 2;
      return;
    }
    console.log(`Template: ${template.name}`);
    console.log(`  dir: ${template.dir.replace(cwd, ".")}`);
    console.log(`  kind: ${template.manifest?.kind ?? "any"}`);
    if (template.manifest?.description) console.log(`  description: ${template.manifest.description}`);
    if (template.manifest?.include?.length) console.log(`  include: ${template.manifest.include.join(", ")}`);
    if (template.manifest?.exclude?.length) console.log(`  exclude: ${template.manifest.exclude.join(", ")}`);
    const { readdirSync, statSync } = await import("node:fs");
    const path = await import("node:path");
    const walk = (dir: string, base: string): string[] => {
      const out: string[] = [];
      for (const entry of readdirSync(dir)) {
        if (entry.startsWith(".")) continue;
        const abs = path.join(dir, entry);
        const rel = base ? `${base}/${entry}` : entry;
        if (statSync(abs).isDirectory()) out.push(...walk(abs, rel));
        else out.push(rel);
      }
      return out;
    };
    let files: string[] = [];
    try {
      files = walk(template.dir, "");
    } catch {
      // empty dir
    }
    console.log(files.length ? `  files:\n${files.map((f) => `    ${f}`).join("\n")}` : "  files: (empty)");
  });

/** Verbose log helper -- only prints when --log is active. */
function vlog(msg: string) {
  if (process.argv.includes("--log")) console.log(`  · ${msg}`);
}

program
  .command("copy <component>")
  .description("Copy a component into your source (shadcn-style)")
  .option("--js", "Generate JavaScript instead of TypeScript")
  .option("--dir <dir>", "Components directory (default: src/components)", "src/components")
  .option("--ui-dir <uiDir>", "Subdirectory that holds the copies (default: facet; ignored with --flat)", "facet")
  .option("--flat", "Place components directly in --dir instead of a subdirectory")
  .option("--no-barrel", "Do not create or update any barrel export")
  .option("--barrel", "Always create a barrel export (even when one does not exist yet)")
  .action(async (component: string, opts: { js?: boolean; dir?: string; uiDir?: string; flat?: boolean; barrel?: boolean }) => {
    const cwd = process.cwd();

    // If the user typed a facet package name, redirect them to `facet install`.
    const facetPkg = resolveFacetPackageName(component);
    if (facetPkg) {
      console.log(`\`facet copy\` copies components, but "${component}" resolves to ${facetPkg}.`);
      console.log(`To install the package, run: facet add ${component}  (or facet install ${component})`);
      process.exitCode = 1;
      return;
    }

    const answers = {
      language: (opts.js ? "javascript" : "typescript") as "typescript" | "javascript",
      target: opts.dir as string,
      placement: (opts.flat ? "flat" : "decide") as AddPlacement,
      dir: opts.uiDir as string,
      barrel: opts.barrel === undefined ? ("auto" as const) : opts.barrel,
    };
    const files = generateComponentAdd(component, cwd, answers);
    const written = writeFiles(files);
    console.log(`Copied ${component} to ${written[0]}`);
    const barrel = written.find((f) => f.endsWith(`/index.${answers.language === "javascript" ? "js" : "ts"}`));
    if (barrel) console.log(`Barrel: ${barrel}`);
    console.log("Note: importing from @fusorb/facet-components is recommended over copying source.");
  });

program
  .command("install <names...>")
  .alias("add")
  .description("Install one or more facet packages by shorthand (e.g. 'layout'), alias (e.g. 'facet-cli'), or full name (e.g. '@fusorb/facet-layout'). Alias: `facet add`. Pass multiple names to install them together in one go.")
  .option("-g, --global", "Install globally (e.g. `facet install -g facet-cli`) instead of locally")
  .action(async (names: string[], opts: { global?: boolean }) => {
    const cwd = process.cwd();

    // Resolve each name, separating known facet packages from unknown inputs.
    const resolved: { name: string; input: string }[] = [];
    const unknown: string[] = [];
    for (const input of names) {
      const r = resolveFacetPackageName(input);
      if (r) resolved.push({ name: r, input });
      else unknown.push(input);
    }

    if (unknown.length) {
      for (const input of unknown) {
        console.error(`"${input}" is not a known facet package.`);
      }
      console.error("Install by shorthand (e.g. 'layout', 'store', 'auth'), alias (e.g. 'facet-cli'), or full name (e.g. '@fusorb/facet-layout').");
      for (const input of unknown) {
        console.error(`To copy the "${input}" component instead, use: facet copy ${input}`);
      }
      process.exitCode = 1;
      return;
    }

    // Dedupe (e.g. `facet add layout @fusorb/facet-layout` -> one install).
    const unique = Array.from(new Map(resolved.map((r) => [r.name, r])).values());

    vlog(`Installing facet packages: ${unique.map((r) => r.name).join(", ")}`);
    const pm = detectPackageManager(cwd);
    const workspace = opts.global ? false : detectMonorepo(cwd) !== null;
    vlog(`Package manager: ${pm} (workspace: ${workspace}, global: ${Boolean(opts.global)})`);

    // Resolve latest published versions for all targets in parallel.
    const withVersions = await Promise.all(
      unique.map(async ({ name }) => ({ name, latest: await resolveLatestVersion(name) })),
    );
    const unresolved = withVersions.filter((v) => !v.latest);
    if (unresolved.length) {
      for (const v of unresolved) {
        console.error(`Could not resolve ${v.name} on the npm registry. Is the package name correct?`);
      }
      process.exitCode = 1;
      return;
    }

    const targets = withVersions as { name: string; latest: string }[];
    const installPkg = opts.global
      ? globalInstallFacetPackages(pm, targets)
      : installFacetPackages(pm, targets, workspace);

    if (opts.global) {
      console.log(`Installing ${targets.map((t) => `${t.name}@${t.latest}`).join(", ")} globally (${pm})...`);
    } else {
      console.log(`Installing ${targets.map((t) => `${t.name}@^${t.latest}`).join(", ")} (${pm})...`);
    }
    const { execSync } = await import("node:child_process");
    try {
      execSync(installPkg, { cwd, stdio: "inherit" });
      const label =
        targets.length === 1 ? unique[0]!.input : `${targets.length} facet packages`;
      console.log(`${label} installed${opts.global ? " globally" : ""}.`);
    } catch {
      console.log("Could not install automatically. Run:");
      console.log(`  ${installPkg}`);
      process.exitCode = 1;
    }
  });

program
  .command("remove <names...>")
  .aliases(["rm", "uninstall"])
  .description("Remove one or more installed facet packages by shorthand (e.g. 'layout'), alias (e.g. 'facet-cli'), or full name (e.g. '@fusorb/facet-layout'). Aliases: `facet rm`, `facet uninstall`.")
  .option("-g, --global", "Remove globally (e.g. `facet remove -g facet-cli`) instead of locally")
  .action(async (names: string[], opts: { global?: boolean }) => {
    const cwd = process.cwd();

    // Resolve each name, separating known facet packages from unknown inputs.
    const resolved: string[] = [];
    const unknown: string[] = [];
    for (const input of names) {
      const r = resolveFacetPackageName(input);
      if (r) resolved.push(r);
      else unknown.push(input);
    }

    if (unknown.length) {
      for (const input of unknown) {
        console.error(`"${input}" is not a known facet package.`);
      }
      console.error("Remove by shorthand (e.g. 'layout', 'store', 'auth'), alias (e.g. 'facet-cli'), or full name (e.g. '@fusorb/facet-layout').");
      process.exitCode = 1;
      return;
    }

    // Dedupe (e.g. `facet rm layout @fusorb/facet-layout` -> one removal).
    const unique = Array.from(new Set(resolved));

    vlog(`Removing facet packages: ${unique.join(", ")}`);
    const pm = detectPackageManager(cwd);
    const workspace = opts.global ? false : detectMonorepo(cwd) !== null;
    vlog(`Package manager: ${pm} (workspace: ${workspace}, global: ${Boolean(opts.global)})`);

    const removePkg = opts.global
      ? globalRemoveCommand(pm, unique)
      : removeCommand(pm, unique, workspace);

    console.log(`Removing ${unique.join(", ")}${opts.global ? " globally" : ""} (${pm})...`);
    const { execSync } = await import("node:child_process");
    try {
      execSync(removePkg, { cwd, stdio: "inherit" });
      const label = unique.length === 1 ? unique[0]! : `${unique.length} facet packages`;
      console.log(`${label} removed${opts.global ? " globally" : ""}.`);
    } catch {
      console.log("Could not remove automatically. Run:");
      console.log(`  ${removePkg}`);
      process.exitCode = 1;
    }
  });

program
  .command("pkg")
  .description("Show the latest published facet package versions and what this repo has installed")
  .action(async () => {
    const cwd = process.cwd();
    const infos = await collectFacetPackageState(cwd);
    console.log("facet packages");
    console.log("");
    console.log(formatPackageTable(infos));
    console.log("");
    const outdated = infos.filter((i) => i.outdated);
    if (outdated.length) {
      console.log(`${outdated.length} update(s) available. Run \`facet update\` to see how.`);
    } else {
      console.log("All installed facet packages are up to date (or not installed here).");
    }
  });

program
  .command("doctor")
  .description("Audit this repo: monorepo layout, facet deps, and best-practice suggestions")
  .action(async () => {
    const cwd = process.cwd();
    const infos = await collectFacetPackageState(cwd);
    const report = buildDoctorReport(cwd, infos);
    console.log("facet doctor");
    console.log("");
    for (const f of report.findings) console.log(`  ${f}`);
    console.log("");
    if (report.suggestions.length) {
      console.log("Suggestions:");
      for (const s of report.suggestions) console.log(`  - ${s}`);
    } else {
      console.log("No suggestions: your facet setup looks healthy.");
    }
    if (report.monorepo) {
      console.log("");
      console.log("Monorepo detected: run \`facet update\` from the workspace root to update all members.");
    }
  });

program
  .command("update")
  .description("Apply updates for installed facet packages (use --dry-run to only print)")
  .option("--dry-run", "Only print the update commands without running anything")
  .option("-y, --yes", "Apply updates without prompting")
  .action(async (opts: { dryRun?: boolean; yes?: boolean }) => {
    const cwd = process.cwd();
    const infos = await collectFacetPackageState(cwd);
    const outdated = planUpdates(infos);
    if (!outdated.length) {
      console.log("All installed facet packages are up to date.");
      return;
    }
    const pm = detectPackageManager(cwd);
    const workspace = detectMonorepo(cwd) !== null;
    vlog(`update: pm=${pm} workspace=${workspace} outdated=${outdated.length}`);
    const targets = outdated
      .filter((i): i is typeof i & { latest: string } => Boolean(i.latest))
      .map((i) => ({ name: i.name, latest: i.latest! }));
    console.log("Updates available:");
    for (const t of targets) {
      const info = infos.find((i) => i.name === t.name);
      console.log(`  ${t.name}: ${info?.installed ?? "not installed"} -> ^${t.latest}`);
    }
    console.log("");
    const cmd = updateCommand(pm, targets, workspace);
    if (opts.dryRun) {
      console.log("(dry run) Run the command above to apply the updates:");
      console.log(`  ${cmd}`);
      return;
    }
    // Confirm unless -y, then apply.
    if (!opts.yes) {
      const prompts = (await import("prompts")).default;
      const { ok } = await prompts({
        type: "toggle",
        name: "ok",
        message: `Apply ${targets.length} facet update(s)?`,
        initial: true,
        active: "yes",
        inactive: "no",
      });
      if (!ok) {
        console.log("Cancelled. Run again with -y to skip this prompt.");
        return;
      }
    }
    console.log(`Running: ${cmd}`);
    const { execSync } = await import("node:child_process");
    try {
      execSync(cmd, { cwd, stdio: "inherit" });
      console.log("facet packages updated.");
    } catch (error) {
      console.error("facet update failed. Run the command manually to see the error:");
      console.error(`  ${cmd}`);
      process.exitCode = 1;
    }
  });

// `facet up`: apply the facet package updates (non-dry-run sibling of update).
program
  .command("up")
  .description("Update installed @fusorb/facet-* packages to the latest published versions")
  .option("--dry-run", "Only print the update commands without running anything")
  .action(async (opts: { dryRun?: boolean }) => {
    const cwd = process.cwd();
    const infos = await collectFacetPackageState(cwd);
    const outdated = planUpdates(infos);
    const unverified = infos.filter((i) => i.unverified);
    if (!outdated.length) {
      if (unverified.length > 0) {
        console.log(
          `Could not verify the latest version for: ${unverified.map((i) => i.name).join(", ")}.`,
        );
        console.log("Run `facet update` once more, or check your network / registry access.");
        process.exitCode = 2;
        return;
      }
      console.log("All installed facet packages are up to date.");
      return;
    }
    const pm = detectPackageManager(cwd);
    const workspace = detectMonorepo(cwd) !== null;
    const targets = outdated
      .filter((i): i is typeof i & { latest: string } => Boolean(i.latest))
      .map((i) => ({ name: i.name, latest: i.latest! }));
    const cmd = updateCommand(pm, targets, workspace);
    if (opts.dryRun) {
      console.log("Would run:");
      console.log(`  ${cmd}`);
      return;
    }
    console.log(`Running: ${cmd}`);
    const { execSync } = await import("node:child_process");
    try {
      execSync(cmd, { cwd, stdio: "inherit" });
      console.log("facet packages updated.");
    } catch (error) {
      console.error("facet up failed. Run the command manually to see the error:");
      console.error(`  ${cmd}`);
      process.exitCode = 1;
    }
  });

// `facet clean`: remove deps bundled by facet-components + rewrite shadcn-style imports.
program
  .command("clean")
  .description("Remove deps bundled by @fusorb/facet-components and rewrite shadcn/ui-style imports to the facet package")
  .option("--dry-run", "Show what would change without touching files")
  .option("-y, --yes", "Skip confirmation prompts")
  .option("--delete-local", "Also delete dead local component files (destructive; not run by default)")
  .action(async (opts: { dryRun?: boolean; yes?: boolean; deleteLocal?: boolean }) => {
    const cwd = process.cwd();
    const plan = buildCleanPlan(cwd);
    const pm = detectPackageManager(cwd);
    const workspace = detectMonorepo(cwd) !== null;
    vlog(`clean: pm=${pm} workspace=${workspace} manifests=${plan.manifests.length} imports=${plan.imports.length} deletable=${plan.deletableFiles.length}`);

    if (plan.manifests.length === 0 && plan.imports.length === 0 && plan.deletableFiles.length === 0) {
      console.log("Nothing to clean: no bundled deps, no shadcn-style imports, no dead local components.");
      return;
    }

    if (opts.dryRun) {
      console.log("facet clean --dry-run");
      console.log("");
      for (const entry of plan.manifests) {
        console.log(`  ${entry.pkgName}: remove ${entry.deps.map((d) => d.name).join(", ")}`);
      }
      for (const imp of plan.imports) {
        console.log(`  rewrite ${imp.from} -> @fusorb/facet-components (${imp.kind})`);
      }
      if (plan.deletableFiles.length) {
        console.log(`  delete unused local components (requires --delete-local):`);
        for (const f of plan.deletableFiles) console.log(`    ${f}`);
      }
      const names = [...new Set(plan.manifests.flatMap((e) => e.deps.map((d) => d.name)))];
      if (names.length) console.log(`\n  Remove command: ${removeCommand(pm, names, workspace)}`);
      return;
    }

    let proceed = opts.yes ?? false;
    if (!proceed) {
      const res = await prompts({
        type: "confirm",
        name: "ok",
        message: `Remove ${plan.manifests.flatMap((e) => e.deps.map((d) => d.name)).length} bundled deps, rewrite ${plan.imports.length} imports${opts.deleteLocal ? `, delete ${plan.deletableFiles.length} dead local components` : " (pass --delete-local to also delete dead local components)"}?`,
        initial: false,
      });
      proceed = res.ok ?? false;
    }
    if (!proceed) {
      console.log("Skipped.");
      return;
    }

    // Remove bundled deps from manifests.
    const names = [...new Set(plan.manifests.flatMap((e) => e.deps.map((d) => d.name)))];
    let removed: string[] = [];
    for (const entry of plan.manifests) {
      const result = removeBundledDeps(entry.pkgPath, names);
      if (result.content) {
        const { writeFileSync } = await import("node:fs");
        writeFileSync(entry.pkgPath, result.content, "utf8");
        removed = [...removed, ...result.removed];
      }
    }

    // Rewrite imports to the facet package.
    const rewritten = rewriteImports(plan.imports);

    // Delete dead shadcn-style local components (only with --delete-local).
    let deleted = 0;
    if (opts.deleteLocal) {
      for (const f of plan.deletableFiles) {
        if (deleteIfUnused(f, cwd)) deleted++;
      }
    }

    console.log("facet clean done.");
    if (removed.length) console.log(`  Removed deps: ${removed.join(", ")}`);
    if (rewritten.length) console.log(`  Rewrote imports in ${rewritten.length} file(s)`);
    if (deleted) console.log(`  Deleted ${deleted} unused local component file(s)`);
    if (removed.length) {
      const removeCmd = removeCommand(pm, [...new Set(removed)], workspace);
      if (opts.yes) {
        console.log("");
        console.log(`Auto-running: ${removeCmd}`);
        const { execSync } = await import("node:child_process");
        try {
          execSync(removeCmd, { cwd, stdio: "inherit" });
          console.log("Dependencies removed from node_modules.");
        } catch (error) {
          console.error("Could not remove deps automatically. Run manually:");
          console.error(`  ${removeCmd}`);
          process.exitCode = 1;
        }
      } else {
        console.log("");
        console.log(`Finish by running: ${removeCmd}`);
      }
    }
  });

// `facet scripts`: write the npm scripts the consumer asks for.
program
  .command("scripts")
  .description("Add useful npm scripts (docs, quality, facet:action, prep) to your package.json")
  .option("-y, --yes", "Add all presets without prompting")
  .action(async (opts: { yes?: boolean }) => {
    const cwd = process.cwd();
    const presetIds = Object.keys(PRESET_SCRIPTS);
    let selected: string[] = opts.yes ? presetIds : [];
    if (!selected.length) {
      const res = await prompts({
        type: "multiselect",
        name: "ids",
        message: "Which script presets should I add? (existing scripts are never overwritten)",
        choices: presetIds.map((id) => ({ title: PRESET_SCRIPTS[id]!.label, value: id })),
        instructions: false,
      });
      selected = (res.ids ?? []) as string[];
    }
    if (!selected.length) {
      console.log("Nothing selected.");
      return;
    }
    const pkgPath = path.join(cwd, "package.json");
    const result = mergeScripts(pkgPath, selected);
    if (!result.content || result.added.length === 0) {
      console.log("No new scripts to add (all requested scripts already exist).");
      return;
    }
    const { writeFileSync } = await import("node:fs");
    writeFileSync(pkgPath, result.content, "utf8");
    console.log(`Added scripts: ${result.added.join(", ")}`);
    console.log("Run them with pnpm <script> (or npm/yarn/bun).");
  });

// `facet prep`: pre-go-live sync (read-only checks + the consumer's own gates).
program
  .command("prep")
  .description("Pre-go-live sync: check facet deps, doctor, and the consumer's build/typecheck/test")
  .action(async () => {
    const cwd = process.cwd();
    const { steps } = buildPrepPlan(cwd);
    console.log("facet prep");
    console.log("");
    let failed = false;
    for (const step of steps) {
      process.stdout.write(`  ${step} ... `);
      const label = step.split(" - ")[0]!;
      try {
        if (label === "facet pkg") {
          const infos = await collectFacetPackageState(cwd);
          const outdated = infos.filter((i) => i.outdated);
          if (outdated.length) {
            console.log("OUTDATED");
            console.log(`    ${outdated.map((i) => i.name).join(", ")} - run \`facet up\`.`);
            failed = true;
          } else {
            console.log("PASS");
          }
        } else if (label === "facet doctor") {
          const infos = await collectFacetPackageState(cwd);
          const report = buildDoctorReport(cwd, infos);
          const problematic = report.findings.filter((f) => f.includes("Unnecessary deps"));
          if (problematic.length) {
            console.log("WARN");
            console.log(`    ${problematic.join("\n    ")}`);
          } else {
            console.log("PASS");
          }
        } else {
          // Consumer's own build/typecheck/test script.
          const pm = detectPackageManager(cwd);
          const scriptName = label.split(" ")[0]!; // e.g. "typecheck" from "pnpm typecheck"
          const pkg = readExistingPackageJson(cwd);
          const scripts = pkg?.scripts ?? {};
          const cmd = scripts[scriptName];
          if (!cmd) {
            console.log("SKIP (no script)");
            continue;
          }
          const { execSync } = await import("node:child_process");
          execSync(`${pm} run ${scriptName}`, { cwd, stdio: "pipe" });
          console.log("PASS");
        }
      } catch (error) {
        console.log("FAIL");
        failed = true;
      }
    }
    console.log("");
    if (failed) {
      console.log("facet prep: fix the issues above before going live.");
      process.exitCode = 1;
    } else {
      console.log("facet prep: everything looks good to ship.");
    }
  });

// `facet self-update`: update the globally-installed facet-cli.
program
  .command("self-update")
  .description("Update the global facet-cli installation to the latest published version")
  .option("--dry-run", "Only print the command without running it")
  .action(async (opts: { dryRun?: boolean }) => {
    // In CI / restricted environments, global install is not appropriate.
    if (isCiEnvironment()) {
      console.log("CI environment detected: global self-update is skipped.");
      console.log("Run the latest version without installing:");
      console.log(`  ${npxRunCommand()} <command>`);
      return;
    }
    vlog(`Current version: ${currentCliVersion()}`);
    const latest = await resolveLatestVersion("@fusorb/facet-cli");
    if (!latest) {
      console.error("Could not resolve the latest facet-cli version from the npm registry.");
      process.exitCode = 1;
      return;
    }
    const cmd = globalInstallCommand();
    if (opts.dryRun) {
      console.log(`Would run: ${cmd}`);
      console.log(`Fallback (restricted env): ${npxRunCommand()} <command>`);
      return;
    }
    console.log(`facet-cli ${currentCliVersion()} -> ${latest}`);
    console.log(`Running: ${cmd}`);
    const { execSync } = await import("node:child_process");
    try {
      execSync(cmd, { stdio: "inherit" });
      console.log(`facet-cli updated to ${latest}.`);
    } catch {
      console.error("Could not update globally (restricted environment without global permissions).");
      console.log("");
      console.log("Trying ephemeral npx fallback...");
      try {
        execSync(`npx --yes @fusorb/facet-cli@latest --help`, { stdio: "inherit" });
        console.log("");
        console.log("Latest version verified via npx. Run without installing:");
        console.log(`  ${npxRunCommand()} <command>`);
      } catch {
        console.error("npx fallback also failed. Run one of these manually:");
        console.error(`  ${cmd}`);
        console.error(`  ${npxRunCommand()} <command>`);
        console.error("  pnpm add -g @fusorb/facet-cli@latest");
        process.exitCode = 1;
      }
    }
  });

// `facet latest`: show the latest published versions of all facet packages.
program
  .command("latest")
  .description("Show the latest published versions of all @fusorb/facet-* packages")
  .action(async () => {
    vlog("Resolving latest versions from npm registry...");
    const names = await discoverFacetPackages();
    const rows = await Promise.all(
      names.map(async (name) => {
        const latest = await resolveLatestVersion(name);
        return { name, latest: latest ?? "n/a" };
      }),
    );
    console.log("Latest facet package versions:");
    for (const row of rows) {
      console.log(`  ${row.name.padEnd(32)} ${row.latest}`);
    }
  });

// Startup: check for facet-cli updates (pnpm-style notification box).
// Skippable via --no-update-check. Best-effort: never blocks or throws.
// Runs before parse so the notification appears before command output.
if (!process.argv.includes("--no-update-check")) {
  checkForCliUpdate()
    .then((state) => {
      if (state && state.outdated) {
        if (process.argv.includes("--log")) vlog(`Update found: ${state.current} -> ${state.latest}`);
        printUpdateNotification(state);
      }
    })
    .catch(() => {
      // Network error or other hiccup: silently skip the notification.
    });
}

program.parse(process.argv);

# @fusorb/facet-cli

Scaffold and generate `@fusorb/facet-docs` sites. Framework and
language-agnostic: the init wizard asks for your stack and tailors what it
generates, so TypeScript, JavaScript, React+Vite, Next.js, Remix, plain JS,
and even Python repos all get a docs scaffold that fits.

## Install

```bash
pnpm add -g @fusorb/facet-cli
# or
npx @fusorb/facet-cli
# keep it current globally with the scoped-dropped short name:
facet install -g facet-cli   # -> npm i -g @fusorb/facet-cli@latest
```

## How it stays current

The scaffold never pins hardcoded versions. At `docs init` time the CLI:

1. **Detects your frontend stack** (Next.js, Remix, Vite, plain JS, Python).
   Backend frameworks (Fastify, Express, Nest, ...) are ignored: docs are a
   frontend concern, so a fullstack repo like arc-id (Next.js + Fastify)
   scaffolds for the frontend.
2. **Detects your package manager** from the lockfile (`pnpm` / `yarn` /
   `bun` / `npm`) and recommends the matching install command.
3. **Resolves the current published versions** of the facet packages from
   the npm registry, so your `package.json` always gets the latest
   compatible release, never a stale pinned guess.
4. **Patches your existing `package.json`** if one is present: your own
   scripts, deps, name, and metadata are preserved. The docs scripts are
   added under distinct names (`docs:dev`, `docs:build`, ...) so nothing
   you already have is overwritten. If no `package.json` exists, a fresh
   minimal one is created and your package manager generates the lockfile
   on first install.

## Commands

Run `facet --help` (or `facet -h`) to list the available commands and flags
from the terminal. For deeper guides, examples, and the full reference, visit
the CLI documentation at <https://docs.facet.arcevocirqle.com.ng/cli>.

### `facet pkg`

Show every published `@fusorb/facet-*` package: the latest registry version,
what your repo declares, and what is actually installed. Flags `(update
available)` when a newer version exists. Works in single packages and
monorepos (workspace members are scanned for facet deps).

### `facet doctor`

Audit the current repo: package manager, monorepo/workspace layout, which
facet packages are used, and best-practice suggestions (e.g. wire
`@fusorb/facet-tokens` when components are used without it, swap
`workspace:*` ranges for registry ranges before publishing, run
`facet update` when packages are outdated).

### `facet update`

Apply updates for the facet packages that have newer published versions:
installs the outdated `@fusorb/facet-*` packages at their latest published
versions using the detected package manager, with a confirmation prompt
(skip it with `-y`). Pass `--dry-run` to only print the exact install
command. In a monorepo it detects the workspace layout and includes the
root/workspace flag.

### `facet up`

Apply the facet package updates (the always-apply variant of `facet
update`): installs the outdated `@fusorb/facet-*` packages at their latest
published versions using the detected package manager without prompting.
Pass `--dry-run` to only print the command.

### `facet clean`

Consumer-safety cleanup for repos that use `@fusorb/facet-components`. It
finds dependencies the package already bundles (radix primitives,
`lucide-react`, `cmdk`, `input-otp`, `qrcode.react`, `react-hook-form`,
`sonner`, `class-variance-authority`, `clsx`, `tailwind-merge`), removes them
from your manifests, rewrites shadcn/ui-style imports (and direct
radix/lucide imports) to `@fusorb/facet-components`, and deletes dead local
`ui/` components.

Safe by default:

- `--dry-run` shows the full plan without touching anything.
- Without `--dry-run` it prompts for confirmation (or `-y`).
- It prints the exact remove command (`pnpm remove ...` / `npm uninstall ...`)
  instead of auto-running it, so you control the lockfile change.

### `facet install <name...>` (alias `facet add`)

Install one or more facet packages by shorthand (`layout`, `store`, `auth`),
alias (`facet-cli`), or full name (`@fusorb/facet-layout`). Pass several names
to install them together in a single add invocation (one lockfile write).

```bash
facet add layout tokens sdk        # installs @fusorb/facet-layout, -tokens, -sdk
facet install @fusorb/facet-auth   # full name works too
facet add layout layout            # deduped automatically
facet install -g facet-cli         # global install (alias of `pnpm add -g`)
```

Versions are resolved from the npm registry at install time, so you always get
the latest compatible release. In a monorepo the workspace `-w` flag is applied
automatically. If the install can't run (offline, no package manager), the exact
command is printed instead.

### `facet remove <name...>` (aliases `facet rm`, `facet uninstall`)

Remove one or more installed facet packages by the same shorthand/alias/full-name
syntax as install. Multiple names are removed in a single invocation.

```bash
facet remove layout tokens     # removes @fusorb/facet-layout, @fusorb/facet-tokens
facet rm -g facet-cli          # global uninstall (alias of `npm uninstall -g`)
```

Removal resolves the same way as install (no version pinning needed). If the
remove can't run (offline, no package manager), the exact command is printed
instead.

### `facet emails init`

Scaffold or migrate email templates wired to `@fusorb/facet-emails`. It
detects the consumer's mail setup from the manifests:

- **react-email / mjml / nodemailer** present -> offers to migrate (build the
  facet-emails `emails/` dir + preview server on top of what exists).
- **resend / sendgrid / SES / postmark** present -> wires the provider into
  the generated `send.ts`.
- **nothing** -> fresh scaffold: `emails/brand.ts` (theme tokens),
  `emails/layout.tsx`, `emails/template-registry.tsx`, `emails/preview-server.ts`,
  `emails/send.ts` (resend/nodemailer/no provider), and `.env.example`.

It auto-installs `@fusorb/facet-emails` (and the provider SDK) via the
detected package manager, fails soft printing the exact command when the
install can't run, and prints the setup guide (provider keys, preview URL,
how to send).

Flags: `-y` (no prompts), `--framework`, `--migrate` / `--fresh`,
`--provider resend|nodemailer|none`, `--location` (default `emails`),
`--name` (brand name).

### `facet templates`

Work with **consumer template directories**: your own starter files that
`docs init` and `emails init` can merge into the generated scaffold.

Templates live under `./templates/<name>/` (or `./docs/templates/`,
`./emails/templates/`), optionally with a `template.json` manifest:

```json
{
  "name": "saas-product",
  "kind": "docs",
  "description": "SaaS product docs",
  "include": ["**/*"],
  "exclude": ["**/node_modules/**"]
}
```

- **`facet templates list`**: discover template dirs in the repo.
- **`facet templates describe <name>`**: show a template's manifest + files.

### `facet docs init --use-template <name>`

After scaffolding the docs site, merge the named template directory over it.
The merge is **never destructive by default**:

- New paths → copied in.
- Existing identical files → skipped.
- `package.json` → merged (your fields always win).
- Code files containing a `// @facet-merge` marker → the marker's contents
  are appended before the file's final `}` (an opt-in way to merge the
  implementation in).
- Any other existing file → **skipped** (reported as a conflict; use
  `--force` to overwrite).

This lets you keep your own starter pages, layouts, or components in
`./templates` and have the scaffold build on top of them instead of
replacing them.

### `facet emails init --use-template <name>`

Same merge, applied to the email scaffold: after `emails init` generates
the `emails/` dir, the named template's files are merged in.

### `facet scripts`

Add useful npm scripts to your `package.json`, preserving anything you
already have:

- **Docs**: `docs:dev`, `docs:build`, `docs:preview`
- **Quality**: `lint`, `typecheck`, `test`, `build`
- **facet convenience**: `facet:doctor`, `facet:clean`, `facet:prep`
- **Pre-go-live**: `facet:prep`

Prompts for which presets to add (or `-y` to add all). Existing scripts are
never overwritten.

### `facet prep`

Pre-go-live sync. Runs read-only checks plus your own gates:

1. `facet pkg` - are your facet deps current?
2. `facet doctor` - is your setup healthy (tokens wired, no unnecessary
   bundled deps)?
3. Your own `typecheck` / `build` / `test` scripts, when they exist.
4. `pnpm changeset status` - in a monorepo, the pending release set.

Prints a PASS/FAIL summary per step; exits non-zero when something needs
fixing before go-live.

### `facet docs init`

Interactive wizard that scaffolds a docs site in the current repo. It opens
with a **"Decide for me"** option: detect my stack and use the best
defaults (also available non-interactively via `--yes` / `-y`), or walks
you through each choice:

- **Name**: leave blank to use the default `docs`
- **Location** (`.` recommended, or `docs/`, `src/docs/`)
- **Language** (TypeScript / JavaScript)
- **Framework** (React+Vite, Next.js, Remix, plain JS, Python)
- **Styling** (detected from your repo; facet tokens recommended)
- **Template kind** (component library / API reference / product docs)
- **Barrel export**: `auto` (recommended): create an `index.ts` when it
  fits the layout; `always`: force one; `never`: leave your tree untouched

Every prompt describes what the choice represents, so you know what each
step will generate before committing.

After scaffolding, the CLI **installs the facet packages automatically** at
their current published versions (the CLI resolves them from the npm
registry, so you always get the latest safe release - no pinned guesses).
If the install can't run (offline, no package manager), it prints the exact
command instead.

For **React+Vite** it generates a complete thin-consumer app (like facet's
own `apps/docs`): `package.json`, Vite config, `src/main`, `src/app`, and a
`src/pages` registry. For **Next.js** it scaffolds a real `src/app/docs`
route (`"use client"` rendering `DocsApp`) plus `src/lib/docs/config` and
`src/lib/docs/pages`, so the docs mount at `/docs` in your existing Next
app: with `next`/`react` deps and `docs:dev`/`docs:build` scripts added.
For **Remix** it scaffolds a real `app/routes/docs` route rendering
`DocsApp` plus the same `src/lib/docs` config + pages, with
`@remix-run/react` deps and `docs:dev`/`docs:build` scripts. For **plain
JS** it generates a framework-agnostic `pages` registry + a markdown
content pipeline with no React shell. For **Python** it generates a
`docs_pipeline.py` markdown → `pages.json` compiler plus a starter
registry, so a Python repo owns its docs in markdown and hands the JSON
to any React host for rendering.

**The scaffold never copies facet's own docs.** You get the engine
(`@fusorb/facet-docs`) and an empty `pages` registry to fill with your
content.

### `facet copy <component>`

Copy a component into your source (shadcn-style). **Recommended:** import
from `@fusorb/facet-components` instead: you get updates, tree-shaking,
and the token system. Copying source means you own every future fix. This
exists for consumers who prefer a copy-into-source workflow.

Placement is flexible and stays out of your way:

- By default (`decide`), the CLI detects what you already have and wires up
  the best layout: components go flat into your components root when it
  already has a barrel (so they're importable immediately), otherwise into
  a clean `facet/` subdirectory.
- `--dir <dir>` chooses the components directory (default `src/components`).
- `--ui-dir <name>` names the subdirectory that holds the copies (default
  `facet`, shadcn's `ui/` pattern). Ignored with `--flat`.
- `--flat` places components directly in the root instead of a subdirectory.
- `--no-barrel` skips creating or updating any barrel export.
- `--barrel` always creates a barrel (even when none exists yet).

When a barrel already exists, the CLI merges a single re-export into it:
your own exports are never overwritten. The generated subdirectory barrel
(`facet/index.ts`) is kept in sync as you add more components, so you can
import like:

```ts
import { Button, Badge } from "@/components/facet";
```

## Theming

When you choose facet tokens, the scaffold wires `@fusorb/facet-tokens`
(tokens.css + tailwind.css) and the `ThemeProvider` + `overrideVars` story,
so you get the whole Alpha Palette system (dark mode, frost/glass surfaces)
with one import instead of restyling every component.

## Development

```bash
pnpm build      # tsup -> dist
pnpm typecheck
```

## Why a CLI?

The `@fusorb/facet-docs` package is an engine: it ships the shell, gallery,
and block types, but no authored content. `facet docs init` gives consumers
a starting point without forking or cloning: the engine stays installable,
the content stays theirs.

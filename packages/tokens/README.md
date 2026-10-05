# @fusorb/facet-tokens

Design tokens — the Alpha Palette, typography, spacing, radius, and motion —
shipped as CSS custom properties plus a Tailwind v4 `@theme`, and as typed JS
maps (`alpha`, `typography`, `spacing`, `motion`).

Every facet component reads **semantic** tokens (`--primary`, `--background`,
`--ring`, …), never a raw colour. That is what makes the library re-themable:
point those variables at your brand and the whole system follows.

## Install

```bash
pnpm add @fusorb/facet-tokens
```

## Wire it up

Import once, in this order:

```css
@import "tailwindcss";
@import "@fusorb/facet-tokens/tokens.css";   /* :root { --primary, --background, … } */
@import "@fusorb/facet-tokens/tailwind.css"; /* @theme → bg-primary, text-foreground, … */
```

Or the all-in-one entry (chains the three for you):

```css
@import "@fusorb/facet-tokens/index.css";
```

## The semantic contract

| Variables | Used for |
| --- | --- |
| `--background`, `--foreground`, `--bg`, `--text` | page surface + text |
| `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent` | surfaces & brand (+ `-foreground` pairs) |
| `--border`, `--input`, `--ring`, `--border-focus` | lines, controls, focus ring |
| `--chart-1…5`, `--sidebar-*` | charts & console layout |
| `--motion-duration-*`, `--motion-ease-*`, `--facet-motion-*` | animation timing |
| `--sub-brand-accent` (+ `-foreground`) | per-tenant accent |

Both themes are covered: `:root` is the dark default, `[data-theme="light"]` the
light variant. Set `data-theme` on `<html>` and the tokens flip.

## Bring your own palette

Override the semantic variables in one stylesheet. Start from a shipped palette:

```css
@import "@fusorb/facet-tokens/palettes/alpha.css"; /* deep-space + electric-cyan */
```

…or write your own in ~20 lines:

```css
:root {
  --primary: #ff6b35;
  --primary-foreground: #1a0c03;
  --accent: #ff6b35;
  --accent-foreground: #1a0c03;
  --ring: #ff6b35;
  --background: #17100b;
  --foreground: #f6ece6;
  --card: #221711;
  --card-foreground: #f6ece6;
  --popover: #1c130d;
  --popover-foreground: #f6ece6;
  --border: rgba(255, 255, 255, 0.1);
  --input: rgba(255, 255, 255, 0.1);
}
[data-theme="light"] {
  --primary: #c2410c;
  --primary-foreground: #ffffff;
  --background: #fdf7f2;
  --foreground: #21130b;
  /* …the rest of the light variant… */
}
```

Import your file **after** `tokens.css` so it wins the cascade.

### Shipped palettes

| Palette | Import | Ships as | Used by |
| --- | --- | --- | --- |
| Alpha | `@fusorb/facet-tokens/palettes/alpha.css` | `dist/palettes/alpha.css` | facet landing + docs |
| Ember | `@fusorb/facet-tokens/palettes/ember.css` | `dist/palettes/ember.css` | facet playground |

Both are complete dark + light palettes — read them as copy-paste references.

### Several brands at once

Scope a palette to a subtree instead of `:root`; components pick up whatever is
nearest:

```css
[data-brand="acme"]   { --primary: #ff6b35; --ring: #ff6b35; }
[data-brand="globex"] { --primary: #8b5cf6; --ring: #8b5cf6; }
```

### From JavaScript

The values are plain custom properties — set them at runtime:

```ts
document.documentElement.style.setProperty("--primary", brand.accent);
```

Per-tenant accents have first-class support via `--sub-brand-accent` and the
`subBrands` map exported from the JS entry.

### Composing from other tokens

Palettes can be derived, not duplicated — compose with `color-mix` over the
Alpha Palette vars so one edit cascades:

```css
--primary: var(--alpha-electric-cyan);
--card: color-mix(in oklab, var(--alpha-deep-space) 84%, var(--alpha-base-white));
```

## JS tokens

```ts
import { alpha, typography, spacing, subBrands, motionValues } from "@fusorb/facet-tokens";
```

`motionValues.facetDuration` / `motionValues.facetEasing` are the same tables the
`@fusorb/facet-motion` engine resolves against; parity with the CSS
`--facet-motion-*` properties is enforced by `scripts/audit-motion-parity.mjs`.

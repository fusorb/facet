/**
 * Public FAQ for the landing page. Counts and versions are never
 * hardcoded here; they come from the generated site data.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ: FaqItem[] = [
  {
    q: "Is facet free and open source?",
    a: "Yes. Every package is MIT-licensed and published to npm under @fusorb: components, auth, layout, docs, tokens, sdk, emails, cli, and store.",
  },
  {
    q: "Which React version does facet require?",
    a: "React 18 or 19. All packages list `react` and `react-dom` as peer dependencies.",
  },
  {
    q: "Does facet work with Tailwind v4?",
    a: "Yes. @fusorb/facet-tokens ships a CSS-native Tailwind v4 theme extension plus tw-animate-css, so the animation keyframes (facet-shimmer, facet-flip, etc.) build out of the box.",
  },
  {
    q: "Can I use the packages with a non-React stack?",
    a: "Components, auth, layout and docs are React-only. The SovGrant SDK is framework-agnostic pure fetch (usable from any TS/JS host), and the tokens are plain CSS variables any stack can consume.",
  },
  {
    q: "Can I use facet without the SovGrant backend?",
    a: "Yes. Components, layout and tokens are backend-agnostic. The auth flow and SDK are optional and plug into any API via an injectable client adapter.",
  },
  {
    q: "Do the packages support server-side rendering (Next.js, Remix)?",
    a: "Yes. The docs engine and layout shells are SSR-safe, and the animation family renders its initial state on the server (one-shot animations like CountUp start from their `from` value).",
  },
  {
    q: "How do I theme facet for my brand?",
    a: "All colors and spacing are CSS variables from @fusorb/facet-tokens. Override them at runtime via ThemeProvider `overrideVars`, or swap `tokens.css` with your own values. Dark mode is built in.",
  },
  {
    q: "Does facet work in a monorepo?",
    a: "Yes. The CLI detects pnpm/yarn/npm workspaces, scans workspace members for facet deps, and prints workspace-aware update commands.",
  },
  {
    q: "How do I update my facet packages?",
    a: "Run `facet pkg` to see installed vs latest versions, then `facet update` applies the exact command for your package manager (`-y` skips the confirmation, `--dry-run` only prints it).",
  },
  {
    q: "Can I copy components into my source instead of installing the package?",
    a: "Yes - `facet copy <ComponentName>` (e.g. `facet copy Button`) copies the component source plus its imports into your tree. Installing from the package is recommended so you keep getting updates and tree-shaking.",
  },
  {
    q: "How do I use the icon registry, and can I override it?",
    a: "The <Icon> component resolves any lucide-style kebab name out of the box. To use your own icons (react-icons, heroicons, or your own SVG components), pass overrides via <IconProvider overrides={{ settings: MyIcon }}> per app/domain, or `registerIcon(\"name\", MyIcon)` globally.",
  },
  {
    q: "Where can I see a live example of each component?",
    a: "The docs site has a live preview and variant tabs for every component, with copyable code that matches the selected variant. One-shot animations (CountUp, Flip, etc.) have a Replay button so you can watch them run.",
  },
  {
    q: "What animations does facet ship?",
    a: "Ten text animations (Blur, Wave, Flip, Split, FadeUp, Shimmer, Gradient, LetterSpacing, CountUp, Dissolve), TypewriterText, seven micro-interactions, AnimatedButton (sparkle/shine/ripple/magnetic/dissolve), and the card animation family (DissolveCard, FlipCard, GlowCard, etc.). The keyframe tokens live in @fusorb/facet-tokens so the CSS classes always emit.",
  },
  {
    q: "How do I scaffold docs and emails?",
    a: "Run `facet docs init` or `facet emails init` to drop a starter into any project. Use `--use-template <name>` to merge a specific starter without overwriting your customizations, or `facet templates list` / `facet templates describe` to browse available starters.",
  },
  {
    q: "How do I reach the facet team?",
    a: "Use the Feedback page (linked in the nav) to drop a line, or join the Discord linked from the docs - the maintainers read everything.",
  },
  {
    q: "Is the auth flow customizable per domain?",
    a: "Yes. The same AuthConfig shape drives fintech, med, edu and enterprise deployments; swap a preset and the built-in auth forms, MFA steps, and copy adapt to that sector without touching the component sources.",
  },
];

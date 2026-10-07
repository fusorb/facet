# @fusorb/facet-motion

Declarative, domain-customizable animation engine with a layered architecture:
zero-DOM core, observable motion values, CSS/native drivers, a data-driven
effect registry, and thin React JSX bindings.

## Install

```bash
pnpm add @fusorb/facet-motion
```

## Usage

### React

```tsx
import { Motion, Stagger, Presence } from "@fusorb/facet-motion";

<Stagger>
  <Motion effect="fade" asChild>
    <div>Fade in staggered</div>
  </Motion>
</Stagger>
```

### Framework-agnostic

```ts
import { animate, sequence, stagger } from "@fusorb/facet-motion";

const ctrl = animate("#card", { opacity: 1 }, { duration: 300 });
sequence(async (next) => {
  await animate(".item", { y: -10 }, { duration: 200 });
  await next(100);
  await stagger(".item", { opacity: 1 });
});
```

## Architecture

| Layer | Exports | Description |
|-------|---------|-------------|
| **core** | `animate`, `sequence`, `stagger`, `tween`, `spring` | Framework-agnostic animation generators + orchestration scheduler. Pure logic, no DOM access. |
| **values** | `motionValue` | Observable motion value with `get()`/`set()`/`subscribe()`. |
| **drivers** | `cssDriver`, `preferReducedMotion`, `resolveDriver` | The only layer that touches real DOM/CSS. Auto-registers a CSS driver. |
| **registry** | `resolveMotion`, `registry`, `generativeFamilies`, `authoredRegistry` | Data-driven effect resolution. 15 generative families + 27 authored effects. |
| **react** | `Motion`, `Presence`, `Reveal`, `Stagger` | Thin JSX bindings — no animation logic. |

Duration and easing tokens resolve against `@fusorb/facet-tokens` CSS custom properties —
the registry never hardcodes a millisecond or bezier value.

## Domain Motion Presets

Five domain-specific motion configs are available for re-theming animations:

```
fintechMotion | medMotion | eduMotion | enterpriseMotion | defaultMotion
```

```ts
import { getDomainMotionConfig } from "@fusorb/facet-motion";
const cfg = getDomainMotionConfig("fintech");
```

## Accessibility

`preferReducedMotion` is automatically queried in `cssDriver`. Animations respect
`prefers-reduced-motion` and can be disabled globally via `setReduceMotion(true)`
(in `@fusorb/facet-native`).

## License

MIT © facet contributors. See [LICENSE](../../LICENSE) at the repository root.

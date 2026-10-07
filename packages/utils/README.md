# @fusorb/facet-utils

Shared utility functions consumed by `@fusorb/facet-components` and
`@fusorb/facet-motion`.

## Install

```bash
pnpm add @fusorb/facet-utils
```

## Usage

```ts
import { cn, isMac, getModSymbol } from "@fusorb/facet-utils";

// Merge class names with de-duplication (clsx + tailwind-merge).
const cls = cn("px-2", isActive && "px-4 bg-accent");

// Platform-aware shortcut labels
const shortcut = isMac() ? `${getModSymbol()}+K` : `Ctrl+K`;
```

## API

| Export | Type | Description |
|--------|------|-------------|
| `cn` | `function` | Merge class names with conditional + Tailwind de-dup (`clsx` + `tailwind-merge`). |
| `isMac` | `function(): boolean` | Returns `true` when running on macOS/iOS. |
| `getModSymbol` | `function(): "⌘" \| "Ctrl"` | Returns the correct modifier-key label for the current platform. |

### `cn`

```ts
cn(...inputs: ClassValue[]): string
```

A thin wrapper around `clsx` (conditional class composition) + `tailwind-merge` (Tailwind
de-duplication). Accepts strings, objects, arrays, and `undefined`/`false` values.

```ts
cn(
  "px-2 py-1",
  isActive && "px-4 bg-accent",
  size === "sm" && "text-sm",
);
// => "px-4 bg-accent text-sm" (when isActive && size === "sm")
```

## License

MIT © facet contributors. See [LICENSE](../../LICENSE) at the repository root.

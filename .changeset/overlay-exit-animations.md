---
"@fusorb/facet-components": patch
---

Overlay exit animations: drop the JS wrapper so the CSS exit actually runs.

Every popover-family component (dropdown-menu, context-menu, menubar, select,
popover, hover-card, tooltip, navigation-menu, dialog, alert-dialog, sheet)
wrapped its Radix content in `<Motion asChild effect="zoom">` for the enter
animation while relying on `data-[state=closed]:animate-facet-zoom-out` for the
exit. In this tree the wrapper stopped Radix's `Presence` from seeing the exit
animation: on close the node went `data-state="open" → "closed"` and was
detached in the same task, so **exit never animated** (verified live over CDP —
no `data-state="closed"` frame, no `facet-zoom-out`).

The content is now a plain Radix element with both halves driven by CSS, the
pattern shadcn/ui ships and Radix's Presence handles natively:

```
data-[state=open]:animate-facet-zoom-in data-[state=closed]:animate-facet-zoom-out
```

Enter is now a token-driven CSS spring zoom (was a JS spring with a translateY);
exit finally plays. The `@fusorb/facet-motion` dependency is no longer imported
by these overlays (`stepper` keeps its standalone `<Motion>` content transition).

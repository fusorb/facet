---
"@fusorb/facet-motion": patch
---

## motion: fix first-frame delta causing spring animations to snap

Fixed a bug in `defaultScheduler` (the browser `requestAnimationFrame`-based
scheduler) where the **first-frame delta** was the absolute DOMHighResTimeStamp
(e.g. 5432 ms since page load) instead of 0. In `animate.tick`, this was
accumulated into `elapsed`, causing the spring generator to receive a huge
elapsed value on the first frame and return its settled value (~1.0)
immediately — the animation snapped instead of playing.

This affected all JS-driven spring animations in the browser (e.g. the
opacity fade on popover enter animations). CSS-transition props (transform)
were unaffected. Tests passed because they run in Node with a `setInterval`
fallback where the first delta is ~16 ms.

Fix: initialize `last` to `null` and use `0` as the first delta
(`last === null ? 0 : now - last`).

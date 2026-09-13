---
"@fusorb/facet-components": minor
---

Chart crosshair + animation customization:

- Crosshair now snaps to the nearest data point by default (was "dynamic — follows cursor"), fixing the visual misalignment where the crosshair dot floated away from the data-point dots that grow on hover. Added `crosshairSnap` prop (default `true`); set `crosshairSnap={false}` to revert to cursor-following behavior.
- `transitionDuration` (default 150ms) and `animationDuration` (default 500ms) props are now wired to all CSS transitions and animations — previously declared but ignored (hardcoded 0.3s fade-in, 0.15s hover transitions, 0.05s crosshair-point tracking).

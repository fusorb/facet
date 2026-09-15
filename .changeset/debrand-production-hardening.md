---
"@fusorb/facet-tokens": minor
"@fusorb/facet-components": patch
"@fusorb/facet-sdk": patch
"@fusorb/facet-emails": patch
"@fusorb/facet-cli": patch
"@fusorb/facet-auth": patch
"@fusorb/facet-layout": patch
"@fusorb/facet-store": patch
---

De-brand and production hardening:

- tokens: brand color changed from indigo to Electric Cyan; new facet animation
  keyframes (overlay-in/out, fade-up, chart-fadeIn/draw); new CSS variables
  (elevation, hero-glow); dist CSS minified via esbuild (zero API change,
  smaller consumer payloads)
- components: changelog-list pre-release badge uses the semantic `warning` token instead of hardcoded amber classes
- sdk: docs and test fixtures neutralized (`auth.arcevo.dev` → `auth.example.dev`)
- emails: default brand color is now a neutral slate instead of indigo
- cli: emails generator default matches the new neutral emails default
- auth: package metadata neutralized (description, keywords, homepage removed "ArcevoCirqle")
- layout: package metadata neutralized (description, keywords, homepage)
- store: package keywords updated (`arc-id` → `SovGrant`); homepage neutralized

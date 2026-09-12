# facet: The Story So Far (Plain English)
## A living, non-technical history of how this repo learned to stop breaking

> Same story as `.agent/episodes.md`, but told so a PM, designer, manager, or
> newcomer can follow it without reading code.
>
> Mantra: evolution is the only option.
> Rule: manual → semi-automated → automated. If a fix is still manual after a
> release, it's not done.

--------------------------------------------------------------------------------

## Setup: We Thought It Was Done. Then Someone Tried to Use It.

That's the loop. Write it down, fix it, automate it so it can't happen again.
Then wait for the next one. This is that log.

--------------------------------------------------------------------------------

CHAPTER 1 -- Killing Storybook
------------------------------
We were trying to show off every component with fancy interactive stories.
That alone needed a whole build tool (Storybook) and a pile of example files.
It kept breaking CI in three ways at once:
  - a folder of example files pointed at a directory that no longer existed;
  - a key library wasn't actually installed;
  - the build config referenced project folders that had been deleted.

The fix: we stopped pretending we needed a story renderer. We wrote one tiny
script that checks the real contract: "is every component both exported AND
listed in the docs?" Yes = ship. No = fail. One script, three jobs done.

Takeaway: don't bolt on a showcase tool to a library that just needs to ship.
Check the promise, don't render the brochure.

--------------------------------------------------------------------------------

CHAPTER 2 -- The Number That Wouldn't Stay Right
-----------------------------------------------
We kept saying "85 components" in the docs, the README, and the package file --
but one docs page still said "68." A reader would have seen two different numbers
for the same library.

The catch: the number lived in prose (sentences people type by hand) in four
places. One always drifts.

The fix: a one-line patch that one time. The real cure was later: stop repeating
the count in prose at all. Let the drift-gate script (Chapter 1) own the number.

Takeaway: a number written in paragraphs is a bug that waits to happen. Derive
it, don't duplicate it.

--------------------------------------------------------------------------------

CHAPTER 3 -- The Missing-from-Docs Problem
-----------------------------------------
Components existed in the code but were silently missing from either the public
export list or the docs page. We had no way to know -- no test, just the hope
that people remembered to update both places.

The fix: our little drift-gate script (Chapter 1) now compares the source folder
against the export list AND the docs list. Missing from either = the build fails.

Takeaway: "is this component actually shipped and documented?" is now a build
rule, not a checklist someone has to remember.

--------------------------------------------------------------------------------

CHAPTER 4 -- The Billing Tab That Didn't Listen
----------------------------------------------
On the pricing page, clicking "Yearly" left "Monthly" looking active, and the
price never changed. The "Quarterly" tab the docs mentioned didn't even exist.

Root cause: the tab was reading its starting setting instead of the click. And
the price was typed in by hand instead of calculated.

The fix:
  - the tab now listens to the actual chosen value;
  - added the Quarterly option;
  - prices now calculate from data (custom price → discount % → default),
    never hardcoded;
  - mobile layout cleaned up so it doesn't scroll sideways.

Takeaway: if a button "looks right" but ignores what the user clicked, the
component is lying to you. Display from one source of truth, then test the math.

--------------------------------------------------------------------------------

CHAPTER 5 -- The Publish That Couldn't Push or Publish
-----------------------------------------------------
Our "auto-version" GitHub job died with a permission error, and the "publish to
npm" job published nothing because it never had the login token. Eight packages
landed at the wrong version with old build files.

Root cause:
  - the versioning job wasn't allowed to create a branch (missing write
    permission);
  - the publish job never received the npm secret.

The fix: added the write permission; passed the npm token into the job; made
publishing wait until tests pass; made it build everything from a clean copy
before publishing.

Takeaway: publishing that needs a human at the keyboard is a bug waiting to ship
stale code.

--------------------------------------------------------------------------------

CHAPTER 6 -- The Deploy That Built the Wrong Thing
-------------------------------------------------
The docs and landing sites deployed to Vercel with a build error: the app tried
to import our component packages, but those packages hadn't been built yet, so
Vercel's bundler exploded.

Root cause: the deploy only built the app -- not the packages the app depends on.

The fix: switched the deploy build command so it builds the app AND all the
packages it pulls in, in the right order, before the app starts.

Takeaway: "build my app" must mean "build my app and everything it imports."

--------------------------------------------------------------------------------

CHAPTER 7 -- We Almost Shipped an Unpublished Package
---------------------------------------------------
Our local tracker said the new store package was published at 0.1.0 and the
landing page said "9 packages." The truth: 64 files were uncommitted, the package
was brand new and never published, and nothing had shipped. The tracker had run
ahead of reality.

Root cause: a local version-bump tool had run and updated files on disk, but the
result was never committed or published. We updated our notes to match what was
on disk, not what was live.

The fix: committed everything, let CI open the version PR, merged it, let CI
publish the eight packages from a clean checkout.

Takeaway: the tracker is a claim, not a fact. After every release, sync notes to
the real published versions -- not the local bumps.

--------------------------------------------------------------------------------

CHAPTER 8 -- The Crash and the Half-Written File
-----------------------------------------------
Mid-session crash. When we came back, we were editing `mail-input.tsx`, and it
had four type errors. Was anything else corrupted?

The fix: checked all 24 edited files for truncation (none), fixed the four type
errors, wired the new component into the docs, fixed stale counts everywhere,
and committed. One clean recovery.

Takeaway: when the editor crashes mid-save, check the barrel+manifest. They are
the source of truth for "what ships" -- everything else is temporary.

--------------------------------------------------------------------------------

CHAPTER 9 -- One Dropdown, One Router
----------------------------------
The layout shell had copied its own dropdown menu (duplicating work) and was
hard-wired to one router (Next.js), so it couldn't be shared with Remix or React
Router.

The fix: use the shared library's dropdown (one dropdown, one build); introduce
a small "router adapter" so each consumer plugs in their own router. The shell
owns no router.

Takeaway: a shell that knows your router is a shell you can't move between apps.
Inject the router, don't import it.

--------------------------------------------------------------------------------

======================================================================
PART TWO -- THE CONSUMER LOOP
======================================================================
Chapters 1–9 were us finding our own bugs. Chapters 11 onward are how it really
ends: a consumer installs a published package, hits something we swore was done,
and the phone rings.

--------------------------------------------------------------------------------

CHAPTER 11 -- "Your Theme Is Missing Half Its Colors"
----------------------------------------------------
A consumer turned on the light theme and half the palette was blank. "Light theme
is incomplete," they said.

Root cause: the light-theme colors existed, but 28 tokens only lived in the dark
theme. We'd checked "is there a light file?" (yes) instead of "does every color
exist in both?" (no).

The fix: diffed color-by-color and filled in the missing 28.

Takeaway: "done" is a claim until a consumer proves it. A theme that's half
dark-only only shows up when someone actually uses the light side.

--------------------------------------------------------------------------------

CHAPTER 12 -- The Generator That Needed Hand-Editing
---------------------------------------------------
We shipped a CLI that auto-generates an icon file for consumers. arc-id ran it
and got a file with 8 icons missing -- they had to write them by hand. Our
"zero-maintenance" generator wasn't zero-maintenance.

Root cause: the scanner only recognized one way people reference icons in JSX.
It missed icons referenced inside config lists (nav menus, feature grids), and
it grabbed some false matches (HTML meta tags, property names).

The fix: taught the scanner every real pattern and every fake pattern. Verified
against the live consumer: zero hand-editing needed.

Takeaway: a code generator is only finished when a real consumer drops it into a
real repo and the output needs zero hand-editing.

--------------------------------------------------------------------------------

CHAPTER 13 -- The Social Icons That Disappeared
----------------------------------------------
Social/OAuth buttons (GitHub, LinkedIn, Instagram, Facebook) rendered nothing.

Root cause: the icon library we depend on deprecated those brand icons.

The fix: we remade them ourselves (matching the look) and made the generator
exclude every deprecated icon -- not just the brand ones.

Takeaway: when a dependency drops something consumers use, own the replacement
in-house.

--------------------------------------------------------------------------------

CHAPTER 14 -- The Search Bar That One Consumer Couldn't Use
----------------------------------------------------------
The LocationPicker had a nice type-to-search inside its dropdowns. Another
consumer wanted the same search -- but in a plain Select they were already
using. They had to re-implement it.

Root cause: the feature lived only inside one component's private code.

The fix: promoted it to a reusable feature on the shared Select -- anyone can
opt in now.

Takeaway: a feature proven in one component should become a feature of the
primitive underneath, so every consumer gets it.

--------------------------------------------------------------------------------

CHAPTER 15 -- The Live Preview That Wasn't Live
----------------------------------------------
Docs pages for three components said "Live preview -- not implemented yet," even
though all the wiring text was there.

Root cause: wiring the docs data is not the same as wiring the actual demo. The
page existed; the preview behind it did not.

The fix: built the real demos and connected them.

Takeaway: a doc entry is paperwork until a human clicks it and sees it work.

--------------------------------------------------------------------------------

CHAPTER 16 -- The Infinite Scroll That Never Scrolled
----------------------------------------------------
A consumer switched to a new phone and reported: "still the same for the infinite
scroll -- both on desktop and mobile." Our fix had only been tested on a green
typecheck.

Root cause: the fix was reasoned about in code, not proven in a real browser.

The fix: actually drove the page in a browser, watched items load
20→30→40→50→60, found the real constraint, fixed it, verified on both screens.

Takeaway: a green build proves the code compiles, not that it works. Trust the
running page.

--------------------------------------------------------------------------------

CHAPTER 17 -- The Marquee That Cut Off Its Own Text
--------------------------------------------------
A scrolling marquee with card surfaces clipped their text -- words ran off and
wrapped badly.

Root cause: one global CSS rule forced "no wrapping" on everything, including
cards that need to wrap.

The fix: text items stay nowrap; card items wrap naturally.

Takeaway: a global rule slapped onto different-shaped children is a bug factory.

--------------------------------------------------------------------------------

CHAPTER 18 -- The Sidebar That Ate Half the Components
-----------------------------------------------------
11 base components (Accordion, Breadcrumb, Tabs, Sheet…) vanished from the
sidebar, the command palette, AND the gallery.

Root cause: a filter meant to hide one group of pages accidentally hid an entire
category.

The fix: narrowed the filter to only the exact pages it was meant for.

Takeaway: an exclusion filter with a wide selector is a time bomb. Scope it
tight.

--------------------------------------------------------------------------------

CHAPTER 19 -- The CLI That Said "All Up to Date" When It Wasn't
--------------------------------------------------------------
A consumer ran the update tool and got "All up to date" -- while newer versions
sat on npm. And in another case, the tool "just printed the command" instead of
applying it.

Root cause: (1) one flaky network call returned "nothing" and the tool read that
as "you're current"; (2) the apply mode printed text instead of running it.

The fix: retry + a fallback source of truth; anything uncertain now shows a
warning with a failure code; the apply mode actually applies (prints only with
a dry-run flag).

Takeaway: automation that cheerfully reports success without proof is a bug, not
a feature.

--------------------------------------------------------------------------------

CHAPTER 20 -- The Email That Lost Its Body
-----------------------------------------
A consumer sent a templated email. The heading and footer rendered -- the body
was gone.

Root cause: a bridge between two React representations mishandled children that
looked slightly different than expected, silently dropping them.

The fix: translate children through the proper bridge before rendering.

Takeaway: a bridge between two models that only translates one direction will
silently eat data. Test the round trip.

--------------------------------------------------------------------------------

CHAPTER 21 -- The Tests That Passed But Never Ran
------------------------------------------------
A bug shipped that our test suite should have caught -- except the tests were
configured to only look for `.test.ts` files, and half our tests were `.test.tsx`.
Those tests were green forever because they never ran.

The fix: fixed the config to include the `.tsx` tests; the missing test now
fails → fix → passes.

Takeaway: "tests pass" is meaningless if the runner's config doesn't actually
match the files on disk.

--------------------------------------------------------------------------------

CHAPTER 22 -- The Stale Build We Nearly Published
------------------------------------------------
A consumer installed the latest layout package and hit a type error: the
types they got didn't match the code we shipped (a new mode existed in source but
not in the published build).

Root cause: source changed, but the build files weren't regenerated before
publish. Consumers get the package through its build output, so stale build =
stale package for everyone.

The fix: made "build then verify" a mandatory gate before any publish, enforced
in CI.

Takeaway: the build output is the product. Green source with a stale build is a
lie.

--------------------------------------------------------------------------------

CHAPTER 23 -- The Loop (How This Whole Story Works)
--------------------------------------------------
This isn't a story of steady progress. It's a loop:

1. THOUGHT IT WAS DONE -- green build, merged PR, published package, tracker
   says DONE.
2. CONSUMER BUG -- someone installs it, hits the crack, reports it.
3. ROOT CAUSE -- strip away "works on my machine"; find the real invariant we
   never actually asserted (colors only in one theme, a scanner that missed a
   reference pattern, a build that didn't rebuild, a test that never ran).
4. EVOLUTION -- push the fix up the ladder (manual → semi → auto) so the same
   class of bug can't come back.

Chapters 1–9 were us catching our own mistakes. Chapters 11–22 are consumers
catching our blind spots. Same machine.

The mantra is not "perfect first." It's: evolve fast, automate whatever hurts,
and let the consumer find the thing we missed. Every guardrail in this repo
exists because a consumer once reported a bug we swore couldn't happen.

State: still evolving. The next consumer bug becomes Chapter 24.

--------------------------------------------------------------------------------
CHAPTER 24 -- The Split Panel That Was 50 Pixels Instead of 50 Percent
----------------------------------------------------------------------
A consumer dropped in `<ResizablePanel defaultSize={50}>` and got a tiny 50-pixel
panel. The docs said "50%" but v4 treated the number as 50 pixels.

Root cause: the wrapper passed facet's ergonomic 0–100 numbers straight through
to react-resizable-panels v4, which changed its unit model. The v4 docs spell it
out: numbers = pixels, unit-less strings = percent. The wrapper never bridged
that gap.

The fix: added a `normalizeSize` helper that converts numbers to %-strings and
passes real units (`"200px"`, `"1rem"`) through untouched — applied to
`defaultSize`, `minSize`, `maxSize`, and `collapsedSize`. Also added
`useResizable` (imperative collapse/expand/resize via v4's `useGroupRef` /
`usePanelRef`), `useResizableLayout` (localStorage persistence via v4's
`useDefaultLayout`, which replaces the old `autoSaveKey` pattern), exported
TypeScript types, exposed collapsible panels, and added a collapsible variant to
the docs gallery. Also fixed a flaky lazy-load test by raising the
`findByTestId` timeout from 1 s to 5 s.

Takeaway: a pass-through wrapper that doesn't translate a dependency's breaking
unit change is a bug factory. Bridge the gap at the component boundary so the
consumer never has to know the underlying library switched from "number =
percent" to "number = pixels."

--------------------------------------------------------------------------------
CHAPTER 25 -- The Footer and Icons That Didn't Come From Home
---------------------------------------------------------------
The landing app had its own Footer and its own brand icons (GitHub, LinkedIn,
Instagram, Facebook, TikTok) -- the exact same SVGs that already lived in
@fusorb/facet-components. When the shared package gained a config-driven Footer
and registered brand icons in its icon registry, the landing was never updated
to use them. The local copies just lingered, silently duplicating work.

Meanwhile the About page hardcoded the docs URL instead of using the shared
`getDocsUrl()` helper -- the sort of little drift that compounds.

The fix:
  - Exported individual brand icon components from the facet-components
    barrel so any consumer can import them directly.
  - Turned the landing's BrandIcons.tsx into a thin re-export from
    @fusorb/facet-components (with a TiktokIcon→TikTokIcon alias to keep the
    local naming). Nav and FeedbackPage now pull icons from one source.
  - Rewrote the landing Footer.tsx to render @fusorb/facet-components'
    <Footer> -- configured with the landing's brand, legal line, socials,
    footer links, and contact info, all resolved through LightIcon (which
    already includes brand icons in its map) and the shared CONTACT data.
  - Fixed the hardcoded docs URL in AboutPage to use getDocsUrl().

Takeaway: a shared library ships pieces that are useless until a consumer
actually reaches for them. Every component that lands in the library should
come with a one-line check: "does any consumer still reimplement this?"

--------------------------------------------------------------------------------
CHAPTER 26 -- The Accordion That Wouldn't Close
---------------------------------------------------------------
The docs-site sidebar has an accordion mode (singleOpen): opening one section
should collapse the others. A staged change to NavSectionRenderer reordered
the `open` calculation so that `hasActive` took priority over `explicitlyCollapsed`.
That meant: if a section contained the active page, it was *always* open --
clicking the chevron did nothing because `open` recomputed to `true` on every
render. The accordion was effectively dead -- you could open section A, but
section B (the active one) would not budge.

Root cause: the `hasActive` flag was baked into the open-state formula itself.
When the user toggled a section, `toggleSection` updated `collapsedSections`,
but the formula ignored that update if the section was active. The collapsed
state and the visible state diverged.

The fix:
  - Removed `hasActive` from the `open` formula. Open state is now driven
    solely by the persisted `collapsedSections` map: `open = !explicitlyCollapsed`.
  - Added a `useEffect` keyed on `routeKey` (router.asPath ?? window.location)
    that auto-expands a collapsed section ONLY when the URL changes -- a
    one-shot side effect. It does not re-fire on state changes from chevron
    clicks or accordion toggling, so the user can still collapse the active
    section.
  - Added `asPath` to the `RouterAdapter` interface and `createDefaultAdapter`
    so the route-change effect works with framework routers.
  - Added tests for singleOpen accordion behavior and explicit-collapse of
    the active section.

Takeaway: deriving visual state directly from context (active route) instead of
from persisted user state creates a fight between "auto-open" and "let me close
this." Separate the concerns: auto-open via effect on route change; close via
explicit user action on the state that the effect respects.

--------------------------------------------------------------------------------
CHAPTER 27 -- The Handle That Wouldn't Stick
---------------------------------------------------------------
The Resizable handle didn't inherit its group's orientation. The doc comment
said "inferred from the parent group," but the code defaulted `orientation` to
"horizontal" and required the consumer to pass it explicitly on every handle.

In a vertical group (top/bottom panels), a handle with default horizontal styling
got `w-1.5 h-full cursor-col-resize` -- a thin full-height strip that looked
"stuck to the top" instead of a full-width separator with a row-resize cursor.
The collapsible variant looked identical to the horizontal one because the
handle rendering was wrong.

The fix:
  - Added an OrientationContext that ResizablePanelGroup provides with its
    orientation, consuming it in ResizableHandle as a fallback when the
    consumer doesn't pass `orientation` explicitly (explicit prop still wins).
  - Added chevrons-up and chevrons-down to the eagerly-loaded SEMANTIC_LUCIDE
    / SEMANTIC_ICONS maps so the sidebar toolbar icons render synchronously
    instead of after a lazy-import flash.
  - Added a "vertical-collapsible" preview variant in the docs (with a toggle
    button via useResizable) so the fix is visible and testable in the sandbox.
  - Added tests for auto-inference and explicit-orientation override.

Takeaway: a prop default that silently overrides context is a trap. When a
child component can read its parent's configuration, it should — explicit
override should be the exception, not the requirement.

--------------------------------------------------------------------------------

CHAPTER 28 -- The Tests That Hung on the Registry

Our CLI tests started failing with 5-second timeouts whenever the npm registry
was slow or unreachable. Six tests across two files just stopped responding.

Root cause: the CLI code that contacts the npm registry had no timeout at all
(resolveFacetVersions), and the one timeout it did have (discoverFacetPackages)
was set to 5 seconds — exactly the same as the test runner's default timeout.
So any slow registry response burned through the entire test budget, leaving
zero margin for setup and teardown.

The fix: added a 3-second timeout to the fetch calls (enough for a healthy
network, short enough to leave room in the test). Raised the test timeout
ceiling to 15 seconds to absorb slow CI runs. Also fixed a related icon issue:
the "alert-circle" icon name from lucide was deprecated and renamed, so the
CLI's icon scanner couldn't find it — added an alias to map it to the new name.

Takeaway: never let a network timeout equal a test timeout. Give your code a
timeout bound, and give your tests a wider ceiling to absorb variance.

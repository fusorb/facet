---
"@fusorb/facet-components": minor
"@fusorb/facet-layout": patch
---

KanbanCard gains a full action menu (Edit, Duplicate, Export,
Delete) bound to the board API - zero-config or fully customizable
via the `actions` prop. Includes an inline edit dialog and JSON
export.

Chart: hover tracking fixed - tooltip and dot highlight now follow
the actually-hovered series instead of always series 0.

BorderBeamCard: hover brightness boost + will-change for smoother
animation on large screens.

Navbar: hover-dropdown blink fixed - Radix's internal auto-close no
longer fires during hover transitions; click-to-toggle and Escape
support added.

ConsoleLayout: mobile sidebar z-index raised to z-[80] - above all
portaled overlays (dialog/drawer/sheet/alert-dialog at z-[70]) so
component previews never cover the sidebar on small screens.

Topbar z-index raised to z-60 - above body content so floating elements
never render over the top navigation bar on mobile.

Navbar z-index raised to z-60 - above body content so the sticky nav bar
never gets buried under page scroll. Navbar + UserAvatar DropdownMenuContent
raised to z-70 - above the z-60 navbar/topbar bars so hover and user-menu
dropdowns aren't clipped behind their own trigger bar.

AlertDialog z-index raised from z-50 to z-[70] - consistent with
Dialog/Drawer/Sheet overlays so confirm modals (e.g. KanbanCard delete)
always render above the sticky header.

KanbanBoard: Delete action now uses an AlertDialog modal instead of
window.confirm().

Docs: LiveCodePlayground exported and integrated into component pages
as the second preview box - default-usage code is now an editable
live-rendered sandbox (second preview box pattern).

Export `facetChangelog` release log from the package barrel.

(The 21 new surfaces + auth/docs wiring are tracked in the separate
`ready-to-use-components-1.12` and `stepper-kanban-changelog` changesets;
this changeset covers only the polish layer above.)

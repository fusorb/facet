/**
 * @fusorb/facet-components: KanbanBoard
 *
 * A ready-to-use kanban board: columns of cards, drag-and-drop between
 * columns (with native HTML5 DnD), move-card-up/down within a column,
 * add/remove cards, fully data-driven. State lives in `useKanban`; the
 * renderers (KanbanBoard, KanbanColumn, KanbanCard) are pure.
 *
 * Why a kanban? Every project tracker / triage view / status board is a
 * kanban. Consumers shouldn't have to wire 200 lines of DnD + state for it.
 *
 * Usage:
 *   const board = useKanban({ columns: [...] });
 *   <KanbanBoard board={board} />
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Icon, type IconName } from "../icon/index.js";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./dialog.js";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "./alert-dialog.js";
import { Input } from "./input.js";
import { Textarea } from "./textarea.js";
import { Button } from "./button.js";
import { Label } from "./label.js";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./dropdown-menu.js";

/* ── Types ─────────────────────────────────────────────────── */

export interface KanbanCardDef {
  /** Stable id (used as a React key + DnD payload). */
  id: string;
  /** Display title. */
  title: string;
  /** Optional subtitle / one-line description. */
  description?: string;
  /** Optional semantic icon on the card. */
  icon?: IconName;
  /** Optional tags rendered as small chips. */
  tags?: string[];
  /** Optional assignee avatar/initials. */
  assignee?: string;
  /** When the card was last touched. */
  updatedAt?: string;
}

export interface KanbanColumnDef {
  /** Stable id. */
  id: string;
  /** Display title (e.g. "Todo", "In progress", "Done"). */
  title: string;
  /** Optional one-line description under the title. */
  description?: string;
  /** Semantic icon in the column header. */
  icon?: IconName;
  /** Optional accent color for the header pill (CSS color). */
  accent?: string;
  /** Cards in the column (in display order). */
  cards: KanbanCardDef[];
  /** Maximum number of cards allowed (renders a WIP limit pill). */
  limit?: number;
}

export interface UseKanbanOptions {
  columns: KanbanColumnDef[];
  /** Controlled `columns` state. Omit for uncontrolled. */
  onColumnsChange?: (columns: KanbanColumnDef[]) => void;
  /** Called whenever a card moves between columns or within a column. */
  onCardMove?: (input: {
    cardId: string;
    fromColumnId: string;
    toColumnId: string;
    toIndex: number;
  }) => void;
  /** Disable drag-and-drop. The board still renders, but as a static grid. */
  readOnly?: boolean;
}

/** Data submitted when creating a card through the add-card form. */
export interface AddCardData {
  title: string;
  description?: string;
  tags?: string[];
}

/**
 * Render-prop for a fully custom add-card surface (a modal, an inline form,
 * etc.). The kanban stays in control of when it opens / closes and of the
 * resulting column, but you decide what the form looks like.
 */
export type RenderAddCard = (ctx: {
  /** Column the card is being added to. */
  column: KanbanColumnDef;
  /** True while the surface is open. */
  open: boolean;
  /** Close the surface without saving. */
  onClose: () => void;
  /** Persist the card for `column`. */
  onSubmit: (data: AddCardData) => void;
}) => React.ReactNode;

export interface KanbanApi {
  columns: KanbanColumnDef[];
  /** Move a card to a target column at a target index. */
  moveCard: (cardId: string, toColumnId: string, toIndex?: number) => void;
  /** Add a new card to a column (pushes to the end). */
  addCard: (
    columnId: string,
    card: Omit<KanbanCardDef, "id"> & { id?: string },
  ) => string;
  /** Remove a card. Returns true if it existed. */
  removeCard: (cardId: string) => boolean;
  /** Update one card by id (partial). */
  updateCard: (cardId: string, patch: Partial<KanbanCardDef>) => void;
  /** Add a new column. Returns its id. */
  addColumn: (column: Omit<KanbanColumnDef, "id"> & { id?: string }) => string;
  /** Remove an empty column (no-op if it has cards). Returns true if removed. */
  removeColumn: (columnId: string) => boolean;
  /** Look up a card by id (helper). */
  findCard: (
    cardId: string,
  ) => { card: KanbanCardDef; column: KanbanColumnDef } | null;
}

/** A single row in a card's action menu. */
export interface KanbanCardAction {
  /** Stable key used for React reconciliation. */
  key: string;
  /** Label shown in the menu item. */
  label: string;
  /** Optional icon (lucide name). */
  icon?: IconName;
  /** Invoked when the item is chosen. */
  onClick: (card: KanbanCardDef) => void;
  /** Render the item in the destructive tone. */
  destructive?: boolean;
  /** Disable the item. Receives the current card. */
  disabled?: (card: KanbanCardDef) => boolean;
}

/* ── useKanban hook (state only) ──────────────────────────── */

let CARD_ID_SEQ = 0;
const nextCardId = () =>
  `card-${Date.now().toString(36)}-${(CARD_ID_SEQ++).toString(36)}`;

export function useKanban(options: UseKanbanOptions): KanbanApi {
  const { columns: initial, onColumnsChange, onCardMove, readOnly } = options;

  const [internal, setInternal] = React.useState<KanbanColumnDef[]>(initial);

  const setColumns = React.useCallback(
    (
      next:
        KanbanColumnDef[] | ((prev: KanbanColumnDef[]) => KanbanColumnDef[]),
    ) => {
      setInternal((prev) => {
        const value = typeof next === "function" ? next(prev) : next;
        onColumnsChange?.(value);
        return value;
      });
    },
    [onColumnsChange],
  );

  const findCard = React.useCallback(
    (cardId: string) => {
      for (const column of internal) {
        const card = column.cards.find((c) => c.id === cardId);
        if (card) return { card, column };
      }
      return null;
    },
    [internal],
  );

  const moveCard = React.useCallback(
    (cardId: string, toColumnId: string, toIndex?: number) => {
      if (readOnly) return;
      const located = findCard(cardId);
      if (!located) return;
      const { column: fromColumn } = located;
      if (fromColumn.id === toColumnId && toIndex == null) return;

      setColumns((cols) => {
        const next = cols.map((c) => ({ ...c, cards: [...c.cards] }));
        const from = next.find((c) => c.id === fromColumn.id);
        const to = next.find((c) => c.id === toColumnId);
        if (!from || !to) return cols;
        const fromIdx = from.cards.findIndex((c) => c.id === cardId);
        if (fromIdx === -1) return cols;
        const [picked] = from.cards.splice(fromIdx, 1);
        const insertAt =
          toIndex == null
            ? to.cards.length
            : Math.max(0, Math.min(to.cards.length, toIndex));
        // If moving within the same column and the target is past the removed
        // index, the index has shifted by one.
        const adjusted =
          from.id === to.id && insertAt > fromIdx ? insertAt - 1 : insertAt;
        to.cards.splice(adjusted, 0, picked!);
        onCardMove?.({
          cardId,
          fromColumnId: fromColumn.id,
          toColumnId: to.id,
          toIndex: adjusted,
        });
        return next;
      });
    },
    [findCard, onCardMove, readOnly, setColumns],
  );

  const addCard = React.useCallback(
    (columnId: string, card: Omit<KanbanCardDef, "id"> & { id?: string }) => {
      const id = card.id ?? nextCardId();
      setColumns((cols) =>
        cols.map((c) =>
          c.id === columnId
            ? { ...c, cards: [...c.cards, { ...card, id }] }
            : c,
        ),
      );
      return id;
    },
    [setColumns],
  );

  const removeCard = React.useCallback(
    (cardId: string) => {
      let removed = false;
      setColumns((cols) =>
        cols.map((c) => {
          const cards = c.cards.filter((card) => {
            if (card.id === cardId) {
              removed = true;
              return false;
            }
            return true;
          });
          return { ...c, cards };
        }),
      );
      return removed;
    },
    [setColumns],
  );

  const updateCard = React.useCallback(
    (cardId: string, patch: Partial<KanbanCardDef>) => {
      setColumns((cols) =>
        cols.map((c) => ({
          ...c,
          cards: c.cards.map((card) =>
            card.id === cardId ? { ...card, ...patch } : card,
          ),
        })),
      );
    },
    [setColumns],
  );

  const addColumn = React.useCallback(
    (column: Omit<KanbanColumnDef, "id"> & { id?: string }) => {
      const id = column.id ?? `col-${Date.now().toString(36)}`;
      setColumns((cols) => [...cols, { ...column, id }]);
      return id;
    },
    [setColumns],
  );

  const removeColumn = React.useCallback(
    (columnId: string) => {
      let removed = false;
      setColumns((cols) => {
        const target = cols.find((c) => c.id === columnId);
        if (!target || target.cards.length > 0) return cols;
        removed = true;
        return cols.filter((c) => c.id !== columnId);
      });
      return removed;
    },
    [setColumns],
  );

  return {
    columns: internal,
    moveCard,
    addCard,
    removeCard,
    updateCard,
    addColumn,
    removeColumn,
    findCard,
  };
}

/* ── DnD context (kept tiny - pure HTML5, no library) ─────── */

interface DragState {
  cardId: string;
  fromColumnId: string;
}

const KanbanContext = React.createContext<{
  board: KanbanApi;
  readOnly: boolean;
  drag: DragState | null;
  setDrag: (s: DragState | null) => void;
  overColumnId: string | null;
  setOverColumnId: (id: string | null) => void;
  /** Optional custom add-card surface. */
  renderAddCard?: RenderAddCard;
  /** Optional handler for card creation (defaults to board.addCard). */
  onAddCard?: (data: AddCardData, columnId: string) => void;
} | null>(null);

function useKanbanContext(component: string) {
  const ctx = React.useContext(KanbanContext);
  if (!ctx)
    throw new Error(`${component} must be rendered inside <KanbanBoard>.`);
  return ctx;
}

/* ── KanbanCard ──────────────────────────────────────────── */

export interface KanbanCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title" | "onSelect"
> {
  card: KanbanCardDef;
  /** Optional click handler (open detail panel). */
  onSelect?: (card: KanbanCardDef) => void;
  /** Action menu items (Edit / Delete / Export …). When omitted the card
   *  falls back to a built-in set bound to the board API so you get them
   *  out of the box without any extra wiring. */
  actions?: KanbanCardAction[];
  /** Show a drag handle. Default: true. */
  showHandle?: boolean;
  /** Show the action menu (ellipsis). Default: true. */
  showActions?: boolean;
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .map((p) => p[0])
    ?.filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Default action set used when no `actions` prop is supplied to KanbanCard.
 * Every item is wired to the board API so cards are fully actionable
 * out of the box - edit, duplicate, export and delete - with no extra wiring.
 *
 * `onDelete` opens a confirmation modal rather than calling `window.confirm`,
 * so every action flows through a UI modal - not a native browser dialog.
 */
function defaultCardActions(
  board: KanbanApi,
  onEdit: (card: KanbanCardDef) => void,
  onDelete: (card: KanbanCardDef) => void,
): KanbanCardAction[] {
  return [
    {
      key: "edit",
      label: "Edit",
      icon: "pencil",
      onClick: (card) => onEdit(card),
    },
    {
      key: "duplicate",
      label: "Duplicate",
      icon: "copy",
      onClick: (card) => {
        const located = board.findCard(card.id);
        if (!located) return;
        board.addCard(located.column.id, {
          title: `${card.title} (copy)`,
          description: card.description,
          tags: card.tags,
          icon: card.icon,
          assignee: card.assignee,
          updatedAt: new Date().toISOString(),
        });
      },
    },
    {
      key: "export",
      label: "Export as JSON",
      icon: "download",
      onClick: (card) => {
        const data = JSON.stringify(card, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `card-${card.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
    },
    {
      key: "delete",
      label: "Delete",
      icon: "trash2",
      destructive: true,
      onClick: (card) => onDelete(card),
    },
  ];
}

/**
 * A single kanban card. Drop-in: drag to move, click to select. Renders
 * title, description, tags, and assignee avatar.
 */
export const KanbanCard = React.forwardRef<HTMLDivElement, KanbanCardProps>(
  function KanbanCard(
    {
      card,
      onSelect,
      actions,
      showHandle = true,
      showActions = true,
      className,
      ...props
    },
    ref,
  ) {
    const ctx = useKanbanContext("KanbanCard");
    const { drag, setDrag, readOnly } = ctx;

    const [editing, setEditing] = React.useState(false);
    const [editTitle, setEditTitle] = React.useState("");
    const [editDesc, setEditDesc] = React.useState("");
    const [editTags, setEditTags] = React.useState("");
    const [deletingCard, setDeletingCard] =
      React.useState<KanbanCardDef | null>(null);

    React.useEffect(() => {
      if (editing) {
        setEditTitle(card.title);
        setEditDesc(card.description ?? "");
        setEditTags(card.tags?.join(", ") ?? "");
      }
    }, [editing, card]);

    const resolvedActions =
      showActions === false || readOnly
        ? []
        : (actions ??
          defaultCardActions(
            ctx.board,
            () => setEditing(true),
            (card) => setDeletingCard(card),
          ));

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
      if (readOnly) return;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", card.id);
      const located = ctx.board.findCard(card.id);
      if (!located) return;
      setDrag({ cardId: card.id, fromColumnId: located.column.id });
    };

    const handleDragEnd = () => {
      setDrag(null);
      ctx.setOverColumnId(null);
    };

    const isDragging = drag?.cardId === card.id;

    return (
      <div
        ref={ref}
        role="article"
        aria-label={card.title}
        draggable={!readOnly}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => onSelect?.(card)}
        className={cn(
          "group rounded-lg border border-border bg-background p-3 text-left shadow-sm transition-colors",
          !readOnly &&
            "cursor-grab hover:border-primary/40 active:cursor-grabbing",
          isDragging && "opacity-50",
          className,
        )}
        {...props}
      >
        <div className="flex items-start gap-2">
          {card.icon && (
            <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon name={card.icon} className="size-4" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {card.title}
            </p>
            {card.description && (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {card.description}
              </p>
            )}
          </div>
          {showHandle && !readOnly && (
            <Icon
              name="grip-vertical"
              className="size-4 shrink-0 text-muted-foreground/40"
              aria-hidden="true"
            />
          )}
          {resolvedActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="ml-1 flex h-6 w-6 items-center justify-center rounded-md opacity-25 hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Card actions"
                >
                  <Icon name="ellipsis-vertical" className="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {resolvedActions.map((a) => (
                  <DropdownMenuItem
                    key={a.key}
                    onSelect={(e) => {
                      e.preventDefault();
                      a.onClick(card);
                    }}
                    disabled={a.disabled?.(card)}
                    className={a.destructive ? "text-destructive" : undefined}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {a.icon && <Icon name={a.icon} className="mr-2 size-4" />}
                    <span>{a.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {(card.tags?.length || card.assignee) && (
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {card.tags?.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            {card.assignee && (
              <span
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground"
                title={card.assignee}
              >
                {initials(card.assignee)}
              </span>
            )}
          </div>
        )}

        <Dialog open={editing} onOpenChange={setEditing}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit card</DialogTitle>
              <DialogDescription>Update the card details.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const title = editTitle.trim();
                if (!title) return;
                ctx.board.updateCard(card.id, {
                  title,
                  description: editDesc.trim() || undefined,
                  tags: editTags
                    ? editTags
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : undefined,
                });
                setEditing(false);
              }}
            >
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-xs">Tags (comma-separated)</Label>
                  <Input
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!editTitle.trim()}>
                  Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={!!deletingCard}
          onOpenChange={(open) => !open && setDeletingCard(null)}
        >
          <AlertDialogContent variant="destructive">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this card?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently remove "
                {deletingCard?.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  if (deletingCard) ctx.board.removeCard(deletingCard.id);
                  setDeletingCard(null);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  },
);

/* ── KanbanColumn ────────────────────────────────────────── */

export interface KanbanColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  column: KanbanColumnDef;
  /** Optional CTA when the column is empty. */
  emptyHint?: string;
}

/**
 * A kanban column: header + drop zone + scrollable card list. Hosts
 * usually don't render this directly - <KanbanBoard> renders one per
 * column.
 */
export const KanbanColumn = React.forwardRef<HTMLDivElement, KanbanColumnProps>(
  function KanbanColumn(
    { column, emptyHint = "Drop cards here", className, ...props },
    ref,
  ) {
    const ctx = useKanbanContext("KanbanColumn");
    const {
      readOnly,
      drag,
      setDrag,
      overColumnId,
      setOverColumnId,
      board,
      renderAddCard,
      onAddCard,
    } = ctx;
    const isOver = overColumnId === column.id && drag != null;
    const isDragging = drag?.cardId != null;
    const [adding, setAdding] = React.useState(false);
    const [insertAt, setInsertAt] = React.useState<number | null>(null);

    // Figure out which slot the pointer is over. A card drops *before* the
    // card whose vertical midpoint the pointer has crossed, otherwise it
    // appends to the end. This makes top<->middle<->bottom reordering work.
    const computeIndex = (e: React.DragEvent<HTMLDivElement>): number => {
      const colRect = e.currentTarget.getBoundingClientRect();
      const pointerY = e.clientY - colRect.top;
      const cardEls = Array.from(
        e.currentTarget.querySelectorAll<HTMLElement>('[role="article"]'),
      );
      let idx = column.cards.length;
      for (let i = 0; i < cardEls.length; i++) {
        const r = cardEls[i]!.getBoundingClientRect();
        const mid = r.top + r.height / 2 - colRect.top;
        if (pointerY <= mid) {
          idx = i;
          break;
        }
      }
      return idx;
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      if (readOnly) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (overColumnId !== column.id) setOverColumnId(column.id);
      if (isDragging) setInsertAt(computeIndex(e));
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      // Only clear when leaving the column wrapper (not its children).
      if (
        e.currentTarget instanceof Node &&
        e.relatedTarget instanceof Node &&
        e.currentTarget.contains(e.relatedTarget)
      ) {
        return;
      }
      if (overColumnId === column.id) setOverColumnId(null);
      setInsertAt(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const cardId = e.dataTransfer.getData("text/plain");
      if (!cardId || !drag) return;
      board.moveCard(cardId, column.id, computeIndex(e));
      setOverColumnId(null);
      setInsertAt(null);
      setDrag(null);
    };

    const handleSubmit = (data: AddCardData) => {
      if (onAddCard) onAddCard(data, column.id);
      else board.addCard(column.id, data);
      setAdding(false);
    };

    const overLimit =
      column.limit != null && column.cards.length > column.limit;

    return (
      <div
        ref={ref}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex h-full min-h-0 w-72 shrink-0 flex-col rounded-xl border border-border bg-card/50 transition-colors",
          isOver && "border-primary/60 bg-primary/5",
          className,
        )}
        {...props}
      >
        <header className="flex items-center justify-between gap-2 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            {column.icon && (
              <span
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-md"
                style={{
                  background: column.accent
                    ? `${column.accent}1a`
                    : "var(--primary)1a",
                  color: column.accent ?? "var(--primary)",
                }}
              >
                <Icon name={column.icon} className="size-3.5" />
              </span>
            )}
            <h3 className="truncate text-sm font-semibold text-foreground">
              {column.title}
            </h3>
            <span
              className={cn(
                "inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                overLimit
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {column.cards.length}
              {column.limit != null && `/${column.limit}`}
            </span>
          </div>
          {!readOnly && (
            <Dialog open={adding} onOpenChange={setAdding}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label="Add card"
                >
                  <Icon name="plus" className="size-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                {renderAddCard ? (
                  renderAddCard({
                    column,
                    open: adding,
                    onClose: () => setAdding(false),
                    onSubmit: handleSubmit,
                  })
                ) : (
                  <DefaultAddCardForm
                    column={column}
                    onSubmit={handleSubmit}
                    onCancel={() => setAdding(false)}
                  />
                )}
              </DialogContent>
            </Dialog>
          )}
        </header>
        {column.description && (
          <p className="px-3 pb-2 text-xs text-muted-foreground">
            {column.description}
          </p>
        )}
        <div className="flex-1 space-y-2 overflow-y-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {isDragging && !readOnly && insertAt === 0 && (
            <div className="h-px w-full -mx-2 bg-primary" aria-hidden="true" />
          )}
          {column.cards.length === 0 ? (
            <div className="flex h-20 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
              {emptyHint}
            </div>
          ) : (
            column.cards.map((card, idx) => (
              <React.Fragment key={card.id}>
                <KanbanCard card={card} />
                {isDragging && !readOnly && insertAt === idx + 1 && (
                  <div
                    className="h-px w-full -mx-2 bg-primary"
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    );
  },
);

/* ── Default add-card form ────────────────────────────────── */

function DefaultAddCardForm({
  column,
  onSubmit,
  onCancel,
}: {
  column: KanbanColumnDef;
  onSubmit: (data: AddCardData) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [tags, setTags] = React.useState("");
  const handleSave = () => {
    const t = title.trim();
    if (!t) return;
    onSubmit({
      title: t,
      description: description.trim() || undefined,
      tags: tags
        ? tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
    });
  };
  return (
    <>
      <DialogHeader>
        <DialogTitle>Add card to {column.title}</DialogTitle>
        <DialogDescription>Create a new card in this column.</DialogDescription>
      </DialogHeader>
      <div className="mt-4 space-y-3">
        <div>
          <Label className="text-xs">Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Card title"
          />
        </div>
        <div>
          <Label className="text-xs">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
        </div>
        <div>
          <Label className="text-xs">Tags (comma separated)</Label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="bug, frontend"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <DialogClose asChild>
          <Button onClick={handleSave}>Add card</Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
}

/* ── KanbanBoard: all-in-one ──────────────────────────────── */

export interface KanbanBoardProps extends React.HTMLAttributes<HTMLDivElement> {
  board: KanbanApi;
  /** Empty hint per column when there are no cards. */
  emptyHint?: string;
  /** Scroll direction. Default: "horizontal". */
  direction?: "horizontal" | "vertical";
  /** Fully custom add-card surface (modal, inline form, ...). */
  renderAddCard?: RenderAddCard;
  /** Override how a card is created from the add-card form. */
  onAddCard?: (data: AddCardData, columnId: string) => void;
}

/**
 * Drop-in kanban board: renders all columns side-by-side with native
 * drag-and-drop between them. Wrap a long board in a horizontally
 * scrolling container for many columns.
 */
export function KanbanBoard({
  board,
  emptyHint,
  direction = "horizontal",
  renderAddCard,
  onAddCard,
  className,
  ...props
}: KanbanBoardProps) {
  const [drag, setDrag] = React.useState<DragState | null>(null);
  const [overColumnId, setOverColumnId] = React.useState<string | null>(null);

  return (
    <KanbanContext.Provider
      value={{
        board,
        readOnly: false,
        drag,
        setDrag,
        overColumnId,
        setOverColumnId,
        renderAddCard,
        onAddCard,
      }}
    >
      <div
        className={cn(
          direction === "horizontal"
            ? "flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "flex flex-col gap-4",
          className,
        )}
        {...props}
      >
        {board.columns.map((column) => (
          <KanbanColumn key={column.id} column={column} emptyHint={emptyHint} />
        ))}
      </div>
    </KanbanContext.Provider>
  );
}

KanbanBoard.displayName = "KanbanBoard";

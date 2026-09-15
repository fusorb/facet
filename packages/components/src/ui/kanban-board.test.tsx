import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  renderHook,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  KanbanBoard,
  useKanban,
  type KanbanColumnDef,
} from "./kanban-board.js";

function TestBoard({ columns }: { columns: KanbanColumnDef[] }) {
  const board = useKanban({ columns });
  return <KanbanBoard board={board} />;
}

const initialColumns: KanbanColumnDef[] = [
  {
    id: "todo",
    title: "Todo",
    cards: [
      { id: "a", title: "A" },
      { id: "b", title: "B" },
    ],
  },
  {
    id: "doing",
    title: "Doing",
    cards: [{ id: "c", title: "C" }],
  },
];

describe("Kanban", () => {
  it("starts with the supplied columns", () => {
    const { result } = renderHook(() => useKanban({ columns: initialColumns }));
    expect(result.current.columns).toHaveLength(2);
    expect(result.current.columns[0]?.cards).toHaveLength(2);
  });

  it("moves a card between columns", () => {
    const onCardMove = vi.fn();
    const { result } = renderHook(() =>
      useKanban({ columns: initialColumns, onCardMove }),
    );
    act(() => {
      result.current.moveCard("a", "doing");
    });
    const todo = result.current.columns.find((c) => c.id === "todo")!;
    const doing = result.current.columns.find((c) => c.id === "doing")!;
    expect(todo.cards.map((c) => c.id)).toEqual(["b"]);
    expect(doing.cards.map((c) => c.id)).toEqual(["c", "a"]);
    expect(onCardMove).toHaveBeenCalledWith({
      cardId: "a",
      fromColumnId: "todo",
      toColumnId: "doing",
      toIndex: 1,
    });
  });

  it("reorders cards within a column", () => {
    const { result } = renderHook(() => useKanban({ columns: initialColumns }));
    act(() => {
      result.current.moveCard("b", "todo", 0);
    });
    const todo = result.current.columns.find((c) => c.id === "todo")!;
    expect(todo.cards.map((c) => c.id)).toEqual(["b", "a"]);
  });

  it("addCard assigns a generated id when not provided", () => {
    const { result } = renderHook(() => useKanban({ columns: initialColumns }));
    let id: string | undefined;
    act(() => {
      id = result.current.addCard("todo", { title: "D" });
    });
    expect(id).toBeTruthy();
    const todo = result.current.columns.find((c) => c.id === "todo")!;
    expect(todo.cards.map((c) => c.id)).toContain(id!);
  });

  it("removeCard returns true when the card existed", () => {
    const { result } = renderHook(() => useKanban({ columns: initialColumns }));
    let removed: boolean | undefined;
    act(() => {
      removed = result.current.removeCard("a");
    });
    expect(removed).toBe(true);
    const todo = result.current.columns.find((c) => c.id === "todo")!;
    expect(todo.cards.map((c) => c.id)).toEqual(["b"]);
  });

  it("removeColumn refuses to drop a non-empty column", () => {
    const { result } = renderHook(() => useKanban({ columns: initialColumns }));
    let removed: boolean | undefined;
    act(() => {
      removed = result.current.removeColumn("todo");
    });
    expect(removed).toBe(false);
    expect(result.current.columns).toHaveLength(2);
  });

  it("updateCard merges the patch", () => {
    const { result } = renderHook(() => useKanban({ columns: initialColumns }));
    act(() => {
      result.current.updateCard("a", { title: "Updated", tags: ["x"] });
    });
    const found = result.current.findCard("a");
    expect(found?.card.title).toBe("Updated");
    expect(found?.card.tags).toEqual(["x"]);
  });
});

describe("KanbanCard actions", () => {
  const actionColumns: KanbanColumnDef[] = [
    {
      id: "todo",
      title: "Todo",
      cards: [{ id: "a", title: "Task A" }],
    },
  ];

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders an action menu button on each card", () => {
    render(<TestBoard columns={actionColumns} />);
    expect(screen.getAllByLabelText("Card actions")).toHaveLength(1);
  });

  it("opens the action menu with Edit, Duplicate, Export, Delete", async () => {
    render(<TestBoard columns={actionColumns} />);
    await userEvent.click(screen.getByLabelText("Card actions"));
    expect(await screen.findByText("Edit")).toBeTruthy();
    expect(screen.getByText("Duplicate")).toBeTruthy();
    expect(screen.getByText("Export as JSON")).toBeTruthy();
    expect(screen.getByText("Delete")).toBeTruthy();
  });

  it("opens the edit dialog, edits the title, and saves", async () => {
    render(<TestBoard columns={actionColumns} />);
    await userEvent.click(screen.getByLabelText("Card actions"));
    await userEvent.click(await screen.findByText("Edit"));
    const input = screen.getByDisplayValue("Task A");
    fireEvent.change(input, { target: { value: "Task A (edited)" } });
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(screen.getByText("Task A (edited)")).toBeTruthy();
    });
  });

  it("deletes the card after confirming in the modal", async () => {
    render(<TestBoard columns={actionColumns} />);
    await userEvent.click(screen.getByLabelText("Card actions"));
    await userEvent.click(await screen.findByText("Delete"));
    await userEvent.click(
      await screen.findByRole("button", { name: "Delete" }),
    );
    await waitFor(() => {
      expect(screen.queryByText("Task A")).toBeNull();
    });
  });

  it("keeps the card when deletion is cancelled in the modal", async () => {
    render(<TestBoard columns={actionColumns} />);
    await userEvent.click(screen.getByLabelText("Card actions"));
    await userEvent.click(await screen.findByText("Delete"));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByText("Task A")).not.toBeNull();
  });

  it("exports the card as a JSON file", async () => {
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:mock");
    render(<TestBoard columns={actionColumns} />);
    await userEvent.click(screen.getByLabelText("Card actions"));
    await userEvent.click(await screen.findByText("Export as JSON"));
    expect(createObjectURL).toHaveBeenCalled();
  });
});

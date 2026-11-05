import { KanbanCard } from "./kanban-board.js";

export const kanbanBoardExamples = [
  {
    id: "default",
    title: "Default",
    artifact: "kanban-board",
    render: () => <KanbanCard {...({} as any)} />,
  },
];

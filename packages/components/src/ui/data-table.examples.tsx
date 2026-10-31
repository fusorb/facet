/**
 * @category data-display
 * @summary DataTable
 */
import * as React from "react";
import type { Example } from "@fusorb/facet-sandbox/core";
import {
  DataTable,
  type DataTableColumn,
  type DataTableDensity,
} from "./data-table.js";

interface Member {
  id: string;
  name: string;
  role: string;
  status: string;
  email: string;
}

const columns: DataTableColumn<Member>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "role", header: "Role", sortable: true },
  { key: "status", header: "Status" },
  { key: "email", header: "Email", hidden: true },
];

const members: Member[] = [
  { id: "m1", name: "Ada Okafor", role: "Admin", status: "Active", email: "ada@example.dev" },
  { id: "m2", name: "Liam Chen", role: "Editor", status: "Active", email: "liam@example.dev" },
  { id: "m3", name: "Sofia Reyes", role: "Viewer", status: "Invited", email: "sofia@example.dev" },
  { id: "m4", name: "Noah Kim", role: "Editor", status: "Active", email: "noah@example.dev" },
  { id: "m5", name: "Maya Patel", role: "Admin", status: "Active", email: "maya@example.dev" },
  { id: "m6", name: "Elias Novak", role: "Viewer", status: "Suspended", email: "elias@example.dev" },
  { id: "m7", name: "Zara Ahmed", role: "Editor", status: "Invited", email: "zara@example.dev" },
  { id: "m8", name: "Tom Berg", role: "Viewer", status: "Active", email: "tom@example.dev" },
];

export interface DataTableExampleProps {
  searchable?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  exportable?: boolean;
  density?: DataTableDensity;
}

export const dataTableExamples: Example<DataTableExampleProps>[] = [
  {
    id: "default",
    artifact: "data-table",
    title: "Default",
    description:
      "Sortable columns, a hidden-by-default email column, and search. Every axis is a control.",
    defaults: {
      searchable: true,
      selectable: false,
      pagination: false,
      exportable: false,
      density: "comfortable",
    },
    controls: {
      searchable: { label: "Searchable", group: "behavior" },
      selectable: { label: "Selectable rows", group: "behavior" },
      pagination: { label: "Pagination", group: "behavior" },
      exportable: { label: "CSV export", group: "behavior" },
      density: {
        label: "Density",
        group: "layout",
        options: ["compact", "comfortable"],
      },
    },
    render: (p) => (
      <DataTable
        columns={columns}
        data={members}
        rowKey="id"
        searchable={p.searchable}
        selectable={p.selectable}
        pagination={p.pagination}
        exportable={p.exportable}
        density={p.density}
      />
    ),
    code: (p) =>
      `<DataTable columns={columns} data={rows} rowKey="id" searchable={${p.searchable ?? true}} selectable={${p.selectable ?? false}} pagination={${p.pagination ?? false}} density="${p.density ?? "comfortable"}" />`,
    tags: ["composite", "data"],
  },
  {
    id: "paginated",
    artifact: "data-table",
    title: "Paginated + selectable",
    description:
      "Five rows per page with row selection and CSV export wired to the toolbar.",
    defaults: {
      searchable: true,
      selectable: true,
      pagination: true,
      exportable: true,
      density: "compact",
    },
    controls: {
      searchable: { label: "Searchable", group: "behavior" },
      selectable: { label: "Selectable rows", group: "behavior" },
      exportable: { label: "CSV export", group: "behavior" },
      density: {
        label: "Density",
        group: "layout",
        options: ["compact", "comfortable"],
      },
    },
    render: (p) => (
      <DataTable
        columns={columns}
        data={members}
        rowKey="id"
        searchable={p.searchable}
        selectable={p.selectable}
        pagination={p.pagination}
        pageSize={5}
        pageSizeOptions={[5, 10, 20]}
        exportable={p.exportable}
        density={p.density}
      />
    ),
    code: () =>
      `<DataTable columns={columns} data={rows} rowKey="id" pagination pageSize={5} selectable exportable density="compact" />`,
    tags: ["composite", "data", "pagination"],
  },
];

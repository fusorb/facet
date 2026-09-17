/**
 * DataTable: a ready-to-use data table built on the facet Table primitives.
 *
 * Features: column visibility toggle, sortable columns, optional search box,
 * optional CSV export, pagination, and row selection with a header checkbox.
 *
 * Usage:
 *   <DataTable
 *     columns={[
 *       { key: "name", header: "Name" },
 *       { key: "email", header: "Email" },
 *     ]}
 *     data={[
 *       { id: "1", name: "Ada", email: "ada@example.com" },
 *     ]}
 *     searchable
 *     exportable
 *   />
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Input } from "./input.js";
import { Button } from "./button.js";
import { Checkbox } from "./checkbox.js";
import { Skeleton } from "./skeleton.js";
import { Icon } from "../icon/index.js";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./dropdown-menu.js";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "./table.js";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "./pagination.js";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./select.js";
import { stagger } from "@fusorb/facet-motion";

/* ── Types ─────────────────────────────────────────────────── */

export type DataTableDensity = "compact" | "comfortable";

export interface DataTableColumn<T extends object> {
  /** Unique key for the column; used for sorting and CSV export. */
  key: string;
  /** Column header text. */
  header: string;
  /** Accessor for the cell value (defaults to row[key]). */
  accessor?: (row: T) => string | number | null | undefined;
  /** Custom cell renderer. */
  cell?: (row: T) => React.ReactNode;
  /** Hide this column by default (user can still toggle it on). */
  hidden?: boolean;
  /** Label for hiding/showing in the column toggle menu. */
  label?: string;
  /** Disable sorting for this column. */
  sortable?: boolean;
}

/**
 * A pluggable export format. The `export` callback receives the currently
 * visible columns and the sorted (full, unpaginated) rows; it is responsible
 * for producing and saving the file (Blob + anchor, printer dialog, etc.).
 */
export interface DataTableExporter<T extends object> {
  /** Stable id for the exporter. */
  key: string;
  /** Dropdown item label. */
  label: string;
  /** Called when the dropdown item is clicked. */
  export: (columns: DataTableColumn<T>[], rows: T[]) => void;
}

/**
 * A row-level bulk action shown in the toolbar overflow (⋯) menu. The
 * callback receives the full sorted rows and the currently selected rows
 * (empty when `selectable` is off), so actions like "select all",
 * "mark as read" or "delete all" can be implemented by the consumer.
 */
export interface DataTableAction<T extends object> {
  /** Stable id for the action. */
  key: string;
  /** Menu item label. */
  label: string;
  /** Optional icon name resolved through the Icon registry. */
  icon?: string;
  /** Destructive actions render in the destructive color. */
  destructive?: boolean;
  /** Called when the menu item is clicked. */
  action: (rows: T[], selectedRows: T[]) => void;
}

export interface DataTableCopy {
  /** Dropdown label above export options. Default: "Export as". */
  exportLabel: string;
  /** aria-label for the export trigger button. Default: "Export data". */
  exportDataAriaLabel: string;
  /** aria-label for the bulk-actions trigger. Default: "Table actions". */
  tableActionsAriaLabel: string;
  /** aria-label for the "select all" checkbox. Default: "Select all rows". */
  selectAllAriaLabel: string;
  /** aria-label for a row checkbox. Default: "Select row". */
  selectRowAriaLabel: string;
  /** Visible label text in the footer. Default: "Rows per page". */
  rowsPerPageLabel: string;
  /** aria-label for the rows-per-page select. Default: "Rows per page". */
  rowsPerPageAriaLabel: string;
  /** Suffix after the selected count, e.g. "3 selected". Default: "selected". */
  selectedSuffix: string;
  /** Text for the "clear selection" link. Default: "Clear". */
  clearSelectionLabel: string;
  /** Suffix after the total count, e.g. "100 total". Default: "total". */
  totalSuffix: string;
  /** Singular form of "row" in the count. Default: "row". */
  rowCountSingular: string;
  /** Plural form of "rows" in the count. Default: "rows". */
  rowCountPlural: string;
}

export interface DataTableProps<
  T extends object,
> extends React.HTMLAttributes<HTMLDivElement> {
  /** Column definitions. */
  columns: DataTableColumn<T>[];
  /** Row data. Each row should carry a stable `id` for selection keys. */
  data: T[];
  /** Unique key per row, e.g. "id". Defaults to "id". */
  rowKey?: keyof T;
  /** Show a search box filtering rows by stringified cell values. */
  searchable?: boolean;
  /** Placeholder for the search box. Default: "Search..." */
  searchPlaceholder?: string;
  /** Show a CSV export button (as the "CSV" item in the export menu). */
  exportable?: boolean;
  /** File name for the CSV export (no extension). Default: "table-export". */
  exportFileName?: string;
  /**
   * Additional export formats. Each entry adds a dropdown item to the
   * Export menu that calls the provided function with the visible columns
   * and (sorted, unfiltered by page) rows. Use this to wire xlsx/pdf/print
   * exporters without the library depending on those formats.
   *
   *   exporters={[{ key: "xlsx", label: "XLSX", export: (cols, rows) => ... }]}
   */
  exporters?: DataTableExporter<T>[];
  /**
   * Bulk row actions rendered in the toolbar overflow (⋯) menu. Each
   * action receives the full sorted rows and the currently selected rows.
   * Use for "select all", "mark as read", "delete all", and custom flows.
   */
  actions?: DataTableAction<T>[];
  /** Paginate results, `pageSize` rows per page. */
  pagination?: boolean;
  /** Rows per page when `pagination` is set. Default: 10 */
  pageSize?: number;
  /** Selectable rows-per-page options shown in the pagination footer.
   *  Default: [10, 20, 50] */
  pageSizeOptions?: number[];
  /** Enable row selection with checkboxes. */
  selectable?: boolean;
  /** Enabled columns that cannot be hidden via the toggle. */
  requiredColumns?: string[];
  /** Controlled search value. */
  search?: string;
  /** Called when the search box value changes. */
  onSearchChange?: (value: string) => void;
  /** Row height density. Default: "comfortable". */
  density?: DataTableDensity;
  /** Show a loading skeleton instead of the table body. */
  loading?: boolean;
  /** Custom empty-state content (overrides the default "No results found."). */
  emptyState?: React.ReactNode;
  /** Total record count (for displaying in the footer). */
  total?: number;
  /** Override user-visible text strings. All keys fall back to English defaults. */
  copy?: Partial<DataTableCopy>;
}

const defaultDataTableCopy: DataTableCopy = {
  exportLabel: "Export as",
  exportDataAriaLabel: "Export data",
  tableActionsAriaLabel: "Table actions",
  selectAllAriaLabel: "Select all rows",
  selectRowAriaLabel: "Select row",
  rowsPerPageLabel: "Rows per page",
  rowsPerPageAriaLabel: "Rows per page",
  selectedSuffix: "selected",
  clearSelectionLabel: "Clear",
  totalSuffix: "total",
  rowCountSingular: "row",
  rowCountPlural: "rows",
};

/* ── Helpers ───────────────────────────────────────────────── */

function cellValue<T extends object>(
  row: T,
  column: DataTableColumn<T>,
): string {
  if (column.accessor) {
    const v = column.accessor(row);
    return v == null ? "" : String(v);
  }
  const v = (row as Record<string, unknown>)[column.key];
  return v == null ? "" : String(v);
}

function rowKeyValue<T extends object>(row: T, rowKey: keyof T): unknown {
  return (row as Record<string, unknown>)[rowKey as string];
}

function toCsv<T extends object>(
  columns: DataTableColumn<T>[],
  rows: T[],
): string {
  const escape = (value: string) => {
    if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
    return value;
  };
  const header = columns.map((c) => escape(c.header)).join(",");
  const body = rows.map((row) =>
    columns.map((c) => escape(cellValue(row, c))).join(","),
  );
  return [header, ...body].join("\n");
}

function formatDateForExport(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Page numbers with ellipsis for many pages, e.g. [1, "…", 4, 5, 6, "…", 20]. */
function pageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("ellipsis");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

/* ── Main component ────────────────────────────────────────── */

export function DataTable<T extends object>({
  columns,
  data,
  rowKey = "id" as keyof T,
  searchable = false,
  searchPlaceholder = "Search...",
  exportable = false,
  exportFileName = "table-export",
  exporters = [],
  actions = [],
  pagination = false,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50],
  selectable = false,
  requiredColumns = [],
  search: searchProp,
  onSearchChange,
  density = "comfortable",
  loading = false,
  emptyState,
  total,
  className,
  copy,
  ...props
}: DataTableProps<T>) {
  const c = { ...defaultDataTableCopy, ...copy };
  const [internalSearch, setInternalSearch] = React.useState("");
  const rowDensity = density === "compact" ? "py-2" : "py-3";
  const searchValue = searchProp ?? internalSearch;
  const setSearch = onSearchChange ?? setInternalSearch;

  // Rows per page: the `pageSize` prop seeds the initial value, then the
  // footer Select can change it at runtime.
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(pageSize);
  React.useEffect(() => {
    setRowsPerPage(pageSize);
  }, [pageSize]);

  const [visibleColumns, setVisibleColumns] = React.useState<string[]>(() =>
    columns.filter((c) => !c.hidden).map((c) => c.key),
  );
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  // Reset selection when data identity changes.
  React.useEffect(() => {
    setSelected(new Set());
  }, [data]);

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleSort = (key: string) => {
    setSortKey((prevKey) => {
      if (prevKey !== key) {
        setSortDir("asc");
        return key;
      }
      setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
      return key;
    });
  };

  // Filter by search across all visible stringified cell values.
  const filtered = React.useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) =>
      columns.some((col) => cellValue(row, col).toLowerCase().includes(q)),
    );
  }, [data, columns, searchValue]);

  // Sort.
  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered;
    const column = columns.find((c) => c.key === sortKey);
    if (!column || column.sortable === false) return filtered;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = cellValue(a, column);
      const vb = cellValue(b, column);
      return va.localeCompare(vb, undefined, { numeric: true }) * dir;
    });
  }, [filtered, columns, sortKey, sortDir]);

  // Paginate.
  const totalPages = pagination
    ? Math.max(1, Math.ceil(sorted.length / rowsPerPage))
    : 1;
  React.useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);
  const pageRows = pagination
    ? sorted.slice((page - 1) * rowsPerPage, page * rowsPerPage)
    : sorted;
  const rowStaggerDelays = React.useMemo(
    () => stagger(40, { count: pageRows.length }),
    [pageRows.length],
  );

  const shownColumns = columns.filter((c) => visibleColumns.includes(c.key));

  const allSelected =
    selectable &&
    pageRows.length > 0 &&
    pageRows.every((row) => selected.has(String(rowKeyValue(row, rowKey))));
  const someSelected =
    selectable &&
    pageRows.some((row) => selected.has(String(rowKeyValue(row, rowKey))));

  const toggleAll = () => {
    const keys = pageRows.map((row) => String(rowKeyValue(row, rowKey)));
    const next = new Set(selected);
    if (allSelected) {
      keys.forEach((k) => next.delete(k));
    } else {
      keys.forEach((k) => next.add(k));
    }
    setSelected(next);
  };

  const toggleRow = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // The currently selected row objects (empty when selectable is off).
  const selectedRows = selectable
    ? sorted.filter((row) => selected.has(String(rowKeyValue(row, rowKey))))
    : [];

  const handleExport = () => {
    const csv = toCsv(shownColumns, sorted);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${exportFileName}-${formatDateForExport(new Date())}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div {...props} className={cn("space-y-3", className)}>
      {/* Toolbar */}
      {(searchable ||
        exportable ||
        exporters.length > 0 ||
        actions.length > 0 ||
        columns.some((c) => c.hidden) ||
        selectable) && (
        <div className="flex flex-wrap items-center gap-2">
          {searchable && (
            <div className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Icon name="search" className="size-4" />
              </span>
              <Input
                value={searchValue}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-8"
                aria-label={searchPlaceholder}
              />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {(exportable || exporters.length > 0) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={c.exportDataAriaLabel}
                  >
                    <Icon name="upload" className="mr-1.5 size-4" />
                    Export
                    <Icon name="chevron-down" className="ml-1 size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuLabel>{c.exportLabel}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {exportable && (
                    <DropdownMenuItem onSelect={handleExport}>
                      <Icon name="file-down" className="size-4" />
                      CSV
                    </DropdownMenuItem>
                  )}
                  {exporters.map((exporter) => (
                    <DropdownMenuItem
                      key={exporter.key}
                      onSelect={() => exporter.export(shownColumns, sorted)}
                    >
                      <Icon name="file-down" className="size-4" />
                      {exporter.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    aria-label={c.tableActionsAriaLabel}
                  >
                    <Icon name="ellipsis" className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {actions.map((action, index) => (
                    <React.Fragment key={action.key}>
                      {index > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        onSelect={() => action.action(sorted, selectedRows)}
                        className={
                          action.destructive
                            ? "text-destructive focus:text-destructive"
                            : undefined
                        }
                      >
                        {action.icon && (
                          <Icon name={action.icon} className="size-4" />
                        )}
                        {action.label}
                        {action.destructive && selectedRows.length > 0 && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            {selectedRows.length}
                          </span>
                        )}
                      </DropdownMenuItem>
                    </React.Fragment>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {columns.some((c) => c.hidden) && (
              <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-md border border-border p-0.5">
                {columns
                  .filter((c) => c.hidden && !requiredColumns.includes(c.key))
                  .map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => toggleColumn(c.key)}
                      aria-pressed={visibleColumns.includes(c.key)}
                      className={cn(
                        "whitespace-nowrap rounded px-2 py-1 text-xs font-medium transition-colors",
                        visibleColumns.includes(c.key)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      {c.label ?? c.header}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table: horizontal scroll on small screens instead of clipping */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-10">
                  <Checkbox
                    aria-label={c.selectAllAriaLabel}
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    data-state={
                      someSelected && !allSelected ? "indeterminate" : undefined
                    }
                  />
                </TableHead>
              )}
              {shownColumns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    column.sortable === false && "whitespace-nowrap",
                  )}
                >
                  {column.sortable === false ? (
                    column.header
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSort(column.key)}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      aria-label={`Sort by ${column.header}`}
                    >
                      {column.header}
                      <span className="text-muted-foreground">
                        {sortKey === column.key
                          ? sortDir === "asc"
                            ? "↑"
                            : "↓"
                          : "↕"}
                      </span>
                    </button>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, i) => (
                <TableRow key={`loading-${i}`}>
                  {selectable && (
                    <TableCell className={rowDensity}>
                      <Skeleton className="h-4 w-4 rounded-full" />
                    </TableCell>
                  )}
                  {shownColumns.map((column) => (
                    <TableCell
                      key={`loading-${i}-${column.key}`}
                      className={rowDensity}
                    >
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : pageRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={shownColumns.length + (selectable ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyState ?? "No results found."}
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row, i) => {
                const key = String(rowKeyValue(row, rowKey));
                const isSelected = selected.has(key);
                return (
                  <TableRow
                    key={key}
                    data-state={isSelected ? "selected" : undefined}
                    className="animate-facet-fade-up"
                    style={{ animationDelay: `${rowStaggerDelays[i] ?? 0}ms` }}
                  >
                    {selectable && (
                      <TableCell className={rowDensity}>
                        <Checkbox
                          aria-label={c.selectRowAriaLabel}
                          checked={isSelected}
                          onCheckedChange={() => toggleRow(key)}
                        />
                      </TableCell>
                    )}
                    {shownColumns.map((column) => (
                      <TableCell key={column.key} className={rowDensity}>
                        {column.cell
                          ? column.cell(row)
                          : cellValue(row, column)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <div className="min-w-0 truncate">
          {selectable && selected.size > 0 && (
            <span className="text-foreground">
              {selected.size} {c.selectedSuffix}
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="ml-2 text-xs font-medium text-primary hover:underline"
              >
                {c.clearSelectionLabel}
              </button>
            </span>
          )}
          {!selectable && (
            <span>
              {total !== undefined
                ? `${total} ${c.totalSuffix}`
                : `${sorted.length} ${sorted.length === 1 ? c.rowCountSingular : c.rowCountPlural}`}
            </span>
          )}
        </div>
        {pagination && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {c.rowsPerPageLabel}
              </span>
              <Select
                value={String(rowsPerPage)}
                onValueChange={(value) => {
                  setRowsPerPage(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger
                  aria-label={c.rowsPerPageAriaLabel}
                  className="h-8 w-[4.5rem] text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {totalPages > 1 && (
              <Pagination className="w-auto justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      aria-disabled={page <= 1}
                      onClick={(event) => {
                        event.preventDefault();
                        if (page > 1) setPage((p) => Math.max(1, p - 1));
                      }}
                      className={
                        page <= 1 ? "pointer-events-none opacity-40" : ""
                      }
                    />
                  </PaginationItem>
                  {pageNumbers(page, totalPages).map((n, index) =>
                    n === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={n}>
                        <PaginationLink
                          href="#"
                          isActive={n === page}
                          onClick={(event) => {
                            event.preventDefault();
                            setPage(n);
                          }}
                        >
                          {n}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      aria-disabled={page >= totalPages}
                      onClick={(event) => {
                        event.preventDefault();
                        if (page < totalPages)
                          setPage((p) => Math.min(totalPages, p + 1));
                      }}
                      className={
                        page >= totalPages
                          ? "pointer-events-none opacity-40"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

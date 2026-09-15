/**
 * @fusorb/facet-components: Tree
 *
 * A collapsible nested list (Tree) with optional selection. Renders a
 * tree of {id, label, children?, icon?, disabled?}. Hosts can also
 * pass any node-rendering function via the `renderLabel` prop.
 *
 * Why: file browsers, sidebar nav, picker trees, org charts, taxonomy
 * editors all need a tree. Hand-rolling one wastes hours and gets the
 * keyboard nav wrong.
 */

import * as React from "react";
import { cn } from "../utils.js";
import { Icon, type IconName } from "../icon/index.js";

/* ── Types ─────────────────────────────────────────────────── */

export interface TreeNode {
  id: string;
  label: React.ReactNode;
  icon?: IconName;
  disabled?: boolean;
  children?: TreeNode[];
}

export interface TreeProps {
  /** Tree nodes (root level). */
  nodes: TreeNode[];
  /** Initial expanded ids. */
  defaultExpandedIds?: string[];
  /** Controlled expanded ids. */
  expandedIds?: string[];
  /** Called when expansion changes. */
  onExpandedChange?: (ids: string[]) => void;
  /** Selected ids. */
  selectedIds?: string[];
  /** Called when selection changes. */
  onSelectionChange?: (ids: string[]) => void;
  /** Selection mode. Default: "single". */
  selectionMode?: "single" | "multiple" | "none";
  /** Default selected ids (when uncontrolled). */
  defaultSelectedIds?: string[];
  /** Render the node label (overrides the default). */
  renderLabel?: (node: TreeNode) => React.ReactNode;
  /** Indent per level in px. Default: 16. */
  indent?: number;
  /** Show a connecting line for child levels. Default: true. */
  showLines?: boolean;
  /** Extra className for the wrapper. */
  className?: string;
  /** ARIA label for the tree. */
  ariaLabel?: string;
}

/* ── Component ─────────────────────────────────────────────── */

/**
 * Collapsible nested tree. Supports single/multi-select, controlled or
 * uncontrolled expansion, and renders the standard WAI-ARIA tree pattern.
 */
export function Tree({
  nodes,
  defaultExpandedIds,
  expandedIds,
  onExpandedChange,
  selectedIds,
  onSelectionChange,
  selectionMode = "single",
  defaultSelectedIds,
  renderLabel,
  indent = 16,
  showLines = true,
  className,
  ariaLabel = "Tree",
}: TreeProps) {
  const [internalExpanded, setInternalExpanded] = React.useState<string[]>(
    defaultExpandedIds ?? [],
  );
  const [internalSelected, setInternalSelected] = React.useState<string[]>(
    defaultSelectedIds ?? [],
  );

  const exp = expandedIds ?? internalExpanded;
  const sel = selectedIds ?? internalSelected;

  const isExpanded = (id: string) => exp.includes(id);
  const isSelected = (id: string) => sel.includes(id);

  const setExpanded = (next: string[]) => {
    if (expandedIds === undefined) setInternalExpanded(next);
    onExpandedChange?.(next);
  };

  const setSelected = (next: string[]) => {
    if (selectedIds === undefined) setInternalSelected(next);
    onSelectionChange?.(next);
  };

  const toggleExpand = (id: string) => {
    setExpanded(isExpanded(id) ? exp.filter((x) => x !== id) : [...exp, id]);
  };

  const toggleSelect = (id: string) => {
    if (selectionMode === "none") return;
    if (selectionMode === "single") {
      setSelected([id]);
    } else {
      setSelected(isSelected(id) ? sel.filter((x) => x !== id) : [...sel, id]);
    }
  };

  return (
    <ul
      role="tree"
      aria-label={ariaLabel}
      className={cn("space-y-0.5 text-sm", className)}
    >
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          level={0}
          indent={indent}
          showLines={showLines}
          isExpanded={isExpanded}
          isSelected={isSelected}
          onToggleExpand={toggleExpand}
          onToggleSelect={toggleSelect}
          selectionMode={selectionMode}
          renderLabel={renderLabel}
        />
      ))}
    </ul>
  );
}

/* ── Sub: tree item (recursive) ────────────────────────────── */

interface TreeItemProps {
  node: TreeNode;
  level: number;
  indent: number;
  showLines: boolean;
  isExpanded: (id: string) => boolean;
  isSelected: (id: string) => boolean;
  onToggleExpand: (id: string) => void;
  onToggleSelect: (id: string) => void;
  selectionMode: "single" | "multiple" | "none";
  renderLabel?: (node: TreeNode) => React.ReactNode;
}

const TreeItem: React.FC<TreeItemProps> = ({
  node,
  level,
  indent,
  showLines,
  isExpanded,
  isSelected,
  onToggleExpand,
  onToggleSelect,
  selectionMode,
  renderLabel,
}) => {
  const hasChildren = !!node.children?.length;
  const expanded = isExpanded(node.id);
  const selected = isSelected(node.id);

  return (
    <li
      role="treeitem"
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={selected}
    >
      <div
        className={cn(
          "group flex items-center gap-1 rounded-md py-1 pr-2",
          !node.disabled &&
            selectionMode !== "none" &&
            "hover:bg-secondary/60 cursor-pointer",
          node.disabled && "cursor-not-allowed opacity-50",
          selected && "bg-primary/10 text-primary",
        )}
        style={{ paddingLeft: level * indent + 8 }}
        onClick={() => !node.disabled && onToggleSelect(node.id)}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={expanded ? "Collapse" : "Expand"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.id);
            }}
            className="grid size-5 place-items-center rounded text-muted-foreground hover:bg-secondary"
          >
            <Icon
              name={expanded ? "chevron-down" : "chevron-right"}
              className="size-3.5"
            />
          </button>
        ) : (
          <span
            aria-hidden
            className={cn(
              "inline-block size-5 rounded-full",
              showLines && "bg-current/10",
            )}
          />
        )}

        {node.icon && (
          <Icon name={node.icon} className="size-4 text-muted-foreground" />
        )}

        <span className="truncate">
          {renderLabel ? renderLabel(node) : node.label}
        </span>
      </div>

      {hasChildren && expanded && (
        <ul role="group" className="space-y-0.5">
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              indent={indent}
              showLines={showLines}
              isExpanded={isExpanded}
              isSelected={isSelected}
              onToggleExpand={onToggleExpand}
              onToggleSelect={onToggleSelect}
              selectionMode={selectionMode}
              renderLabel={renderLabel}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

Tree.displayName = "Tree";

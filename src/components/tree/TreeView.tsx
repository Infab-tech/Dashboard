"use client";

import { useState } from "react";

export interface TreeNode {
  id: string;
  label: string;
  children: TreeNode[];
}

interface TreeNodeRowProps<T extends TreeNode> {
  node: T;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  getNodeColorClass?: (node: T) => string;
}

function TreeNodeRow<T extends TreeNode>({
  node,
  depth,
  expanded,
  onToggle,
  selectedId,
  onSelect,
  getNodeColorClass,
}: TreeNodeRowProps<T>) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isSelected = selectedId === node.id;
  const colorClass = getNodeColorClass?.(node) ?? "bg-neutral-400";

  return (
    <li>
      <div
        role="treeitem"
        aria-selected={isSelected}
        tabIndex={0}
        onClick={() => onSelect(node.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onSelect(node.id);
        }}
        className={`flex cursor-pointer items-center gap-1.5 rounded-md py-1.5 pr-2 text-sm ${
          isSelected
            ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
            : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        }`}
        style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            aria-label={isExpanded ? "Collapse" : "Expand"}
            className="flex h-4 w-4 flex-shrink-0 items-center justify-center text-neutral-400"
          >
            {isExpanded ? "▾" : "▸"}
          </button>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}
        <span className={`h-2 w-2 flex-shrink-0 rounded-full ${colorClass}`} />
        <span className="truncate">{node.label}</span>
      </div>

      {hasChildren && isExpanded && (
        <ul role="group">
          {node.children.map((child) => (
            <TreeNodeRow
              key={child.id}
              node={child as T}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              selectedId={selectedId}
              onSelect={onSelect}
              getNodeColorClass={getNodeColorClass}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export interface TreeViewProps<T extends TreeNode> {
  nodes: T[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  getNodeColorClass?: (node: T) => string;
  defaultExpandedIds?: string[];
}

/**
 * Generic expandable tree primitive — deliberately task-agnostic (id/label/children
 * plus a caller-supplied color function) so it can be reused for other hierarchies
 * (e.g. the people org-chart) without any task-specific logic baked in.
 */
export function TreeView<T extends TreeNode>({
  nodes,
  selectedId,
  onSelect,
  getNodeColorClass,
  defaultExpandedIds,
}: TreeViewProps<T>) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(defaultExpandedIds ?? []));

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <ul role="tree" className="space-y-0.5">
      {nodes.map((node) => (
        <TreeNodeRow
          key={node.id}
          node={node}
          depth={0}
          expanded={expanded}
          onToggle={toggle}
          selectedId={selectedId}
          onSelect={onSelect}
          getNodeColorClass={getNodeColorClass}
        />
      ))}
    </ul>
  );
}

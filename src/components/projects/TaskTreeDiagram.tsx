"use client";

import type { TaskStatus } from "@prisma/client";
import {
  layoutTree,
  type PositionedTaskNode,
  type TreeableTask,
} from "@/lib/projects/task-tree";

const NODE_W = 168;
const NODE_H = 60;
const H_GAP = 28;
const V_GAP = 52;

const STATUS_BOX_CLASS: Record<TaskStatus, string> = {
  TODO: "border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900",
  IN_PROGRESS: "border-blue-400 bg-blue-50 dark:border-blue-700 dark:bg-blue-950",
  BLOCKED: "border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950",
  DELAYED: "border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950",
  DONE: "border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950",
};

const STATUS_DOT_CLASS: Record<TaskStatus, string> = {
  TODO: "bg-neutral-400",
  IN_PROGRESS: "bg-blue-500",
  BLOCKED: "bg-red-500",
  DELAYED: "bg-amber-500",
  DONE: "bg-emerald-500",
};

export interface DiagramTask extends TreeableTask {
  title: string;
  status: TaskStatus;
}

function pixelX(x: number): number {
  return x * (NODE_W + H_GAP) + NODE_W / 2;
}

function pixelY(depth: number): number {
  return depth * (NODE_H + V_GAP) + NODE_H / 2;
}

function flatten<T extends TreeableTask>(nodes: PositionedTaskNode<T>[]) {
  const flat: PositionedTaskNode<T>[] = [];
  const edges: { parent: PositionedTaskNode<T>; child: PositionedTaskNode<T> }[] = [];
  const walk = (list: PositionedTaskNode<T>[]) => {
    for (const node of list) {
      flat.push(node);
      for (const child of node.children) edges.push({ parent: node, child });
      walk(node.children);
    }
  };
  walk(nodes);
  return { flat, edges };
}

/**
 * Renders the task tree as a literal top-down flow diagram — boxes connected
 * by curved lines, laid out with lib/projects/task-tree.ts's leaf-counting
 * algorithm — instead of an indented list. Hand-rolled SVG/CSS, no diagramming
 * library: static (no drag/pan/zoom), but matches the rest of the app's
 * preference for avoiding extra dependencies.
 */
export function TaskTreeDiagram<T extends DiagramTask>({
  tasks,
  selectedId,
  onSelect,
}: {
  tasks: T[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const layout = layoutTree(tasks);
  const { flat, edges } = flatten(layout.roots);

  if (flat.length === 0) {
    return (
      <p className="text-sm text-neutral-400">No tasks yet — upload an Excel sheet to populate this project.</p>
    );
  }

  const width = layout.leafCount * (NODE_W + H_GAP);
  const height = (layout.maxDepth + 1) * (NODE_H + V_GAP);

  return (
    <div className="overflow-auto rounded-lg border border-neutral-200 p-4 dark:border-neutral-800" style={{ maxHeight: 440 }}>
      <div className="relative" style={{ width, height }}>
        <svg className="pointer-events-none absolute inset-0" width={width} height={height}>
          {edges.map(({ parent, child }) => {
            const x1 = pixelX(parent.x);
            const y1 = pixelY(parent.depth) + NODE_H / 2;
            const x2 = pixelX(child.x);
            const y2 = pixelY(child.depth) - NODE_H / 2;
            const midY = (y1 + y2) / 2;
            return (
              <path
                key={`${parent.task.id}-${child.task.id}`}
                d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                fill="none"
                className="stroke-neutral-300 dark:stroke-neutral-700"
                strokeWidth={1.5}
              />
            );
          })}
        </svg>

        {flat.map((node) => {
          const isSelected = node.task.id === selectedId;
          return (
            <button
              key={node.task.id}
              type="button"
              onClick={() => onSelect(node.task.id)}
              className={`absolute flex flex-col justify-center gap-1 rounded-md border px-3 py-2 text-left text-xs shadow-sm transition-shadow ${
                STATUS_BOX_CLASS[node.task.status]
              } ${isSelected ? "ring-2 ring-neutral-900 dark:ring-neutral-100" : ""}`}
              style={{
                left: pixelX(node.x) - NODE_W / 2,
                top: pixelY(node.depth) - NODE_H / 2,
                width: NODE_W,
                height: NODE_H,
              }}
            >
              <span className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${STATUS_DOT_CLASS[node.task.status]}`} />
                <span className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                  {node.task.title}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

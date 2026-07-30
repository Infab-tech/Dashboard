"use client";

import type { TaskStatus } from "@prisma/client";
import {
  layoutTree,
  type PositionedTaskNode,
  type TreeableTask,
} from "@/lib/projects/task-tree";

const NODE_W = 168;
const NODE_H = 60;
const H_GAP = 40;
const V_GAP = 64;

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
  dependsOnId: string | null;
}

function pixelX(x: number): number {
  return x * (NODE_W + H_GAP) + NODE_W / 2;
}

function pixelY(depth: number): number {
  return depth * (NODE_H + V_GAP) + NODE_H / 2;
}

function flatten<T extends TreeableTask>(nodes: PositionedTaskNode<T>[]) {
  const flat: PositionedTaskNode<T>[] = [];
  const hierarchyEdges: { parent: PositionedTaskNode<T>; child: PositionedTaskNode<T> }[] = [];
  const walk = (list: PositionedTaskNode<T>[]) => {
    for (const node of list) {
      flat.push(node);
      for (const child of node.children) hierarchyEdges.push({ parent: node, child });
      walk(node.children);
    }
  };
  walk(nodes);
  return { flat, hierarchyEdges };
}

/** Anchor points on the two boxes' edges closest to each other, plus a curve through a midpoint. */
function edgePath<T extends TreeableTask>(from: PositionedTaskNode<T>, to: PositionedTaskNode<T>): string {
  const fx = pixelX(from.x);
  const fy = pixelY(from.depth);
  const tx = pixelX(to.x);
  const ty = pixelY(to.depth);

  if (from.depth === to.depth) {
    const [x1, x2] = fx <= tx ? [fx + NODE_W / 2, tx - NODE_W / 2] : [fx - NODE_W / 2, tx + NODE_W / 2];
    const midX = (x1 + x2) / 2;
    const bow = 26;
    return `M ${x1} ${fy} Q ${midX} ${fy - bow} ${x2} ${ty}`;
  }

  const [y1, y2] = from.depth < to.depth ? [fy + NODE_H / 2, ty - NODE_H / 2] : [fy - NODE_H / 2, ty + NODE_H / 2];
  const midY = (y1 + y2) / 2;
  return `M ${fx} ${y1} C ${fx} ${midY}, ${tx} ${midY}, ${tx} ${y2}`;
}

/**
 * Renders the task tree as a literal top-down flow diagram: boxes connected
 * by solid arrows for subtask hierarchy and dashed arrows for "depends on"
 * relationships (independent of tree position — a dependency can point
 * between siblings or across branches), laid out with lib/projects/task-tree.ts's
 * leaf-counting algorithm. Hand-rolled SVG/CSS, no diagramming library.
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
  const { flat, hierarchyEdges } = flatten(layout.roots);

  if (flat.length === 0) {
    return (
      <p className="text-sm text-neutral-400">No tasks yet — upload an Excel sheet to populate this project.</p>
    );
  }

  const byId = new Map(flat.map((node) => [node.task.id, node]));
  const dependencyEdges = flat.flatMap((node) => {
    const blocker = node.task.dependsOnId ? byId.get(node.task.dependsOnId) : undefined;
    return blocker ? [{ from: blocker, to: node }] : [];
  });

  const width = layout.leafCount * (NODE_W + H_GAP);
  const height = (layout.maxDepth + 1) * (NODE_H + V_GAP) + 30;

  return (
    <div className="space-y-2">
      <div className="overflow-auto rounded-lg border border-neutral-200 p-4 dark:border-neutral-800" style={{ maxHeight: 460 }}>
        <div className="relative" style={{ width, height }}>
          <svg className="pointer-events-none absolute inset-0" width={width} height={height}>
            <defs>
              <marker id="tree-arrow-hierarchy" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" className="fill-neutral-400 dark:fill-neutral-600" />
              </marker>
              <marker id="tree-arrow-dependency" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" className="fill-amber-500" />
              </marker>
            </defs>

            {hierarchyEdges.map(({ parent, child }) => (
              <path
                key={`h-${parent.task.id}-${child.task.id}`}
                d={edgePath(parent, child)}
                fill="none"
                markerEnd="url(#tree-arrow-hierarchy)"
                className="stroke-neutral-400 dark:stroke-neutral-600"
                strokeWidth={1.5}
              />
            ))}

            {dependencyEdges.map(({ from, to }) => (
              <path
                key={`d-${from.task.id}-${to.task.id}`}
                d={edgePath(from, to)}
                fill="none"
                markerEnd="url(#tree-arrow-dependency)"
                className="stroke-amber-500"
                strokeWidth={1.5}
                strokeDasharray="5 4"
              />
            ))}
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
      <div className="flex flex-wrap gap-4 text-xs text-neutral-400">
        <span className="flex items-center gap-1.5">
          <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" className="stroke-neutral-400 dark:stroke-neutral-600" strokeWidth={1.5} /></svg>
          Subtask of
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" className="stroke-amber-500" strokeWidth={1.5} strokeDasharray="5 4" /></svg>
          Depends on
        </span>
      </div>
    </div>
  );
}

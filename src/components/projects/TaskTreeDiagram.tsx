"use client";

import type { TaskStatus } from "@prisma/client";
import { buildTaskTree, type TaskTreeNode, type TreeableTask } from "@/lib/projects/task-tree";

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

const PADDING = 44;
const HUB_GAP = 70;
const MIN_ARC_GAP = 14;

/** Circle radius by depth: root ("hub") tasks render bigger than their subtasks. */
function radiusForDepth(depth: number): number {
  if (depth === 0) return 48;
  if (depth === 1) return 36;
  return 28;
}

function baseRingGap(depth: number): number {
  if (depth === 0) return 140;
  if (depth === 1) return 100;
  return 90;
}

/** Distance from a node to its own children's ring — widened if there are enough
 * children that a tight ring would make adjacent circles overlap. */
function ringGapFor(depth: number, childCount: number): number {
  const childRadius = radiusForDepth(depth + 1);
  const neededCircumference = childCount * (2 * childRadius + MIN_ARC_GAP);
  const neededRadius = neededCircumference / (2 * Math.PI);
  return Math.max(baseRingGap(depth), neededRadius);
}

interface PositionedNode<T> {
  task: T;
  x: number;
  y: number;
  r: number;
  depth: number;
}

/** How far a node's own subtree reaches out from its center — used to size each hub's cell. */
function reach<T extends TreeableTask>(node: TaskTreeNode<T>, depth: number): number {
  if (node.children.length === 0) return radiusForDepth(depth);
  const gap = ringGapFor(depth, node.children.length);
  return gap + Math.max(...node.children.map((child) => reach(child, depth + 1)));
}

/**
 * Places a node at (cx, cy) then fans its children out along a ring at an angle
 * subdivided across [angleStart, angleEnd]. Each child's own children get a
 * narrowed angle window centered on the child's angle, so grandchildren radiate
 * further outward instead of curling back through their parent.
 */
function place<T extends TreeableTask>(
  node: TaskTreeNode<T>,
  cx: number,
  cy: number,
  depth: number,
  angleStart: number,
  angleEnd: number,
  positions: Map<string, PositionedNode<T>>,
  hierarchyEdges: { parent: PositionedNode<T>; child: PositionedNode<T> }[],
) {
  const self: PositionedNode<T> = { task: node.task, x: cx, y: cy, r: radiusForDepth(depth), depth };
  positions.set(node.task.id, self);

  const n = node.children.length;
  if (n === 0) return;

  const gap = ringGapFor(depth, n);
  for (let i = 0; i < n; i++) {
    const angle = angleStart + (angleEnd - angleStart) * ((i + 0.5) / n);
    const childX = cx + gap * Math.cos(angle);
    const childY = cy + gap * Math.sin(angle);
    place(node.children[i], childX, childY, depth + 1, angle - 1.1, angle + 1.1, positions, hierarchyEdges);
    hierarchyEdges.push({ parent: self, child: positions.get(node.children[i].task.id)! });
  }
}

/** Lays every top-level task out as its own hub-and-spoke cell, side by side. */
function layoutRadialForest<T extends DiagramTask>(tasks: T[]) {
  const roots = buildTaskTree(tasks);
  const positions = new Map<string, PositionedNode<T>>();
  const hierarchyEdges: { parent: PositionedNode<T>; child: PositionedNode<T> }[] = [];

  if (roots.length === 0) {
    return { positions, hierarchyEdges, flowEdges: [], width: 0, height: 0 };
  }

  const hubReaches = roots.map((root) => reach(root, 0));
  const maxReach = Math.max(...hubReaches);
  const centerY = maxReach + PADDING;

  let cursorX = PADDING;
  roots.forEach((root, i) => {
    const r = hubReaches[i];
    place(root, cursorX + r, centerY, 0, 0, Math.PI * 2, positions, hierarchyEdges);
    cursorX += 2 * r + HUB_GAP;
  });

  // Chain the top-level tasks together in sequence so the diagram always reads as one
  // connected flow — without this, projects whose tasks have no subtasks and no
  // dependsOnId links would render as disconnected floating circles.
  const flowEdges: { from: PositionedNode<T>; to: PositionedNode<T> }[] = [];
  for (let i = 1; i < roots.length; i++) {
    flowEdges.push({
      from: positions.get(roots[i - 1].task.id)!,
      to: positions.get(roots[i].task.id)!,
    });
  }

  return {
    positions,
    hierarchyEdges,
    flowEdges,
    width: cursorX - HUB_GAP + PADDING,
    height: centerY + maxReach + PADDING,
  };
}

/** Curved connector clipped to each circle's edge, bowing left or right of the straight line. */
function circleEdgePath(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number, curveDir: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  const sx = x1 + ux * r1;
  const sy = y1 + uy * r1;
  const ex = x2 - ux * r2;
  const ey = y2 - uy * r2;
  const mx = (sx + ex) / 2;
  const my = (sy + ey) / 2;
  const bow = Math.min(40, dist * 0.18) * curveDir;
  const cx = mx - uy * bow;
  const cy = my + ux * bow;
  return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
}

/** Stable pseudo-random bow direction per edge, so fanned-out curves don't all bow the same way. */
function curveDirFor(a: string, b: string): number {
  let hash = 0;
  const s = a + b;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0;
  return hash % 2 === 0 ? 1 : -1;
}

/**
 * Renders the task tree as a hub-and-spoke flow diagram: each top-level task is a
 * circle with its subtasks fanned out around it on curved connectors (solid for
 * subtask-of, dashed for depends-on), rather than a top-down box tree. Hand-rolled
 * SVG/CSS, no diagramming library. Clicking any circle selects it for the detail
 * panel (see TaskTree.tsx), which is what surfaces that task's status.
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
  const { positions, hierarchyEdges, flowEdges, width, height } = layoutRadialForest(tasks);

  if (positions.size === 0) {
    return (
      <p className="text-sm text-neutral-400">No tasks yet — upload an Excel sheet to populate this project.</p>
    );
  }

  const nodes = [...positions.values()];
  const dependencyEdges = nodes.flatMap((node) => {
    const blocker = node.task.dependsOnId ? positions.get(node.task.dependsOnId) : undefined;
    return blocker ? [{ from: blocker, to: node }] : [];
  });

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
              <marker id="tree-arrow-flow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" className="fill-neutral-500 dark:fill-neutral-400" />
              </marker>
            </defs>

            {flowEdges.map(({ from, to }) => (
              <path
                key={`f-${from.task.id}-${to.task.id}`}
                d={circleEdgePath(from.x, from.y, from.r, to.x, to.y, to.r, curveDirFor(from.task.id, to.task.id))}
                fill="none"
                markerEnd="url(#tree-arrow-flow)"
                className="stroke-neutral-500 dark:stroke-neutral-400"
                strokeWidth={2.5}
              />
            ))}

            {hierarchyEdges.map(({ parent, child }) => (
              <path
                key={`h-${parent.task.id}-${child.task.id}`}
                d={circleEdgePath(parent.x, parent.y, parent.r, child.x, child.y, child.r, curveDirFor(parent.task.id, child.task.id))}
                fill="none"
                markerEnd="url(#tree-arrow-hierarchy)"
                className="stroke-neutral-400 dark:stroke-neutral-600"
                strokeWidth={1.5}
              />
            ))}

            {dependencyEdges.map(({ from, to }) => (
              <path
                key={`d-${from.task.id}-${to.task.id}`}
                d={circleEdgePath(from.x, from.y, from.r, to.x, to.y, to.r, curveDirFor(from.task.id, to.task.id))}
                fill="none"
                markerEnd="url(#tree-arrow-dependency)"
                className="stroke-amber-500"
                strokeWidth={1.5}
                strokeDasharray="5 4"
              />
            ))}
          </svg>

          {nodes.map((node) => {
            const isSelected = node.task.id === selectedId;
            const size = node.r * 2;
            return (
              <button
                key={node.task.id}
                type="button"
                onClick={() => onSelect(node.task.id)}
                className={`absolute flex items-center justify-center rounded-full border p-2 text-center shadow-sm transition-shadow hover:shadow-md ${
                  STATUS_BOX_CLASS[node.task.status]
                } ${node.depth === 0 ? "border-2" : ""} ${isSelected ? "ring-2 ring-neutral-900 dark:ring-neutral-100" : ""}`}
                style={{ left: node.x - node.r, top: node.y - node.r, width: size, height: size }}
              >
                <span className="flex flex-col items-center gap-1">
                  <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${STATUS_DOT_CLASS[node.task.status]}`} />
                  <span
                    className={`line-clamp-2 break-words font-medium leading-tight text-neutral-900 dark:text-neutral-100 ${
                      node.depth === 0 ? "text-xs" : "text-[10px]"
                    }`}
                  >
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
          <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" className="stroke-neutral-500 dark:stroke-neutral-400" strokeWidth={2.5} /></svg>
          Task flow
        </span>
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

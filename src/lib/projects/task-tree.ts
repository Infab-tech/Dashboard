/**
 * Shared tree/flatten/Gantt-position math — used by both the web TaskTree/GanttChart
 * components and the PDF report generator, so the two stay visually consistent.
 */

export interface TreeableTask {
  id: string;
  parentId: string | null;
}

export interface TaskTreeNode<T extends TreeableTask> {
  task: T;
  depth: number;
  children: TaskTreeNode<T>[];
}

export function buildTaskTree<T extends TreeableTask>(tasks: T[]): TaskTreeNode<T>[] {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const childrenOf = new Map<string | null, T[]>();
  for (const task of tasks) {
    const key = task.parentId && byId.has(task.parentId) ? task.parentId : null;
    if (!childrenOf.has(key)) childrenOf.set(key, []);
    childrenOf.get(key)!.push(task);
  }

  function build(parentId: string | null, depth: number): TaskTreeNode<T>[] {
    return (childrenOf.get(parentId) ?? []).map((task) => ({
      task,
      depth,
      children: build(task.id, depth + 1),
    }));
  }

  return build(null, 0);
}

export function flattenWithDepth<T extends TreeableTask>(tasks: T[]): { task: T; depth: number }[] {
  const result: { task: T; depth: number }[] = [];
  const walk = (nodes: TaskTreeNode<T>[]) => {
    for (const node of nodes) {
      result.push({ task: node.task, depth: node.depth });
      walk(node.children);
    }
  };
  walk(buildTaskTree(tasks));
  return result;
}

export interface GanttBounds {
  start: Date;
  end: Date;
}

export interface DatedTask {
  startDate: Date | null;
  dueDate: Date | null;
}

export function computeGanttBounds(tasks: DatedTask[]): GanttBounds | null {
  const times: number[] = [];
  for (const task of tasks) {
    if (task.startDate) times.push(task.startDate.getTime());
    if (task.dueDate) times.push(task.dueDate.getTime());
  }
  if (times.length === 0) return null;
  return { start: new Date(Math.min(...times)), end: new Date(Math.max(...times)) };
}

export interface BarPosition {
  leftPct: number;
  widthPct: number;
}

/** Position of one task's bar within the shared date range, as left%/width%. */
export function computeBarPosition(bounds: GanttBounds, task: DatedTask): BarPosition | null {
  if (!task.startDate || !task.dueDate) return null;
  const rangeMs = bounds.end.getTime() - bounds.start.getTime();
  if (rangeMs <= 0) return { leftPct: 0, widthPct: 100 };

  const leftPct = ((task.startDate.getTime() - bounds.start.getTime()) / rangeMs) * 100;
  const clampedLeft = Math.max(0, Math.min(100, leftPct));
  const rawWidthPct = ((task.dueDate.getTime() - task.startDate.getTime()) / rangeMs) * 100;
  const widthPct = Math.max(1, Math.min(100 - clampedLeft, rawWidthPct));

  return { leftPct: clampedLeft, widthPct };
}

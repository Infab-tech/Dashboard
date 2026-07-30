import type { TaskStatus } from "@prisma/client";
import {
  computeBarPosition,
  computeGanttBounds,
  flattenWithDepth,
  type DatedTask,
  type TreeableTask,
} from "@/lib/projects/task-tree";

const STATUS_BAR_CLASS: Record<TaskStatus, string> = {
  TODO: "bg-neutral-400",
  IN_PROGRESS: "bg-blue-500",
  BLOCKED: "bg-red-500",
  DELAYED: "bg-amber-500",
  DONE: "bg-emerald-500",
};

export interface GanttTask extends TreeableTask, DatedTask {
  title: string;
  status: TaskStatus;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Hand-rolled Gantt bars — not a charting library. Recharts has no native Gantt
 * primitive, so plotting rectangles directly from start/due dates is simpler
 * than forcing one through a bar-chart API. Shares its date-range/position math
 * with the PDF report via lib/projects/task-tree.ts.
 */
export function GanttChart({ tasks }: { tasks: GanttTask[] }) {
  const bounds = computeGanttBounds(tasks);
  const rows = flattenWithDepth(tasks);

  if (!bounds || rows.length === 0) {
    return <p className="text-sm text-neutral-400">No dated tasks yet to plot on a timeline.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between pl-40 text-xs text-neutral-500 dark:text-neutral-400">
        <span>{formatDate(bounds.start)}</span>
        <span>{formatDate(bounds.end)}</span>
      </div>
      <div className="space-y-1.5">
        {rows.map(({ task, depth }) => {
          const position = computeBarPosition(bounds, task);
          return (
            <div key={task.id} className="flex items-center gap-2">
              <span
                className="w-40 flex-shrink-0 truncate text-xs text-neutral-700 dark:text-neutral-300"
                style={{ paddingLeft: `${depth * 0.75}rem` }}
                title={task.title}
              >
                {task.title}
              </span>
              <div className="relative h-3 flex-1 rounded bg-neutral-100 dark:bg-neutral-800">
                {position && (
                  <div
                    className={`absolute h-3 rounded ${STATUS_BAR_CLASS[task.status]}`}
                    style={{ left: `${position.leftPct}%`, width: `${position.widthPct}%` }}
                    title={task.startDate && task.dueDate ? `${formatDate(task.startDate)} – ${formatDate(task.dueDate)}` : undefined}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

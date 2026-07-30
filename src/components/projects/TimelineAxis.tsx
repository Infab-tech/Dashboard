import type { TaskHistoryEventType, TaskStatus } from "@prisma/client";

const DAY_WIDTH = 26;
const LINE_TOP = 46;

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  BLOCKED: "Blocked",
  DELAYED: "Delayed",
  DONE: "Done",
};

const STATUS_DOT_CLASS: Record<TaskStatus, string> = {
  TODO: "bg-neutral-400",
  IN_PROGRESS: "bg-blue-500",
  BLOCKED: "bg-red-500",
  DELAYED: "bg-amber-500",
  DONE: "bg-emerald-500",
};

const EVENT_DOT_CLASS: Record<TaskHistoryEventType, string> = {
  CREATED: "bg-neutral-400",
  STATUS_CHANGED: "bg-blue-500",
  COMPLETED: "bg-emerald-500",
  REMOVED: "bg-neutral-300 dark:bg-neutral-600",
};

const EVENT_LABEL: Record<TaskHistoryEventType, string> = {
  CREATED: "created",
  STATUS_CHANGED: "status changed",
  COMPLETED: "completed",
  REMOVED: "removed",
};

export interface TimelineTask {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: Date | null;
}

export interface TimelineEvent {
  taskTitlePath: string;
  eventType: TaskHistoryEventType;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus | null;
  occurredOn: Date;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayIndex(date: Date, start: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(date).getTime() - start.getTime()) / msPerDay);
}

function formatShort(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * A literal number-line timeline: one point for every single day in the
 * relevant date range, with due-date markers above the line and
 * created/changed/completed activity markers below it — replaces the old
 * task-bar Gantt view.
 */
export function TimelineAxis({
  tasks,
  events,
  projectStartDate,
  projectEndDate,
}: {
  tasks: TimelineTask[];
  events: TimelineEvent[];
  projectStartDate: Date | null;
  projectEndDate: Date | null;
}) {
  const dates: Date[] = [];
  if (projectStartDate) dates.push(projectStartDate);
  if (projectEndDate) dates.push(projectEndDate);
  for (const task of tasks) if (task.dueDate) dates.push(task.dueDate);
  for (const event of events) dates.push(event.occurredOn);

  if (dates.length === 0) {
    return <p className="text-sm text-neutral-400">No dates recorded yet to plot a timeline.</p>;
  }

  const start = startOfDay(new Date(Math.min(...dates.map((d) => d.getTime()))));
  const end = startOfDay(new Date(Math.max(...dates.map((d) => d.getTime()))));
  const totalDays = Math.max(1, dayIndex(end, start) + 1);
  const days = Array.from({ length: totalDays }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const labelInterval = Math.max(1, Math.ceil(totalDays / 24));

  const tasksByDay = new Map<number, TimelineTask[]>();
  for (const task of tasks) {
    if (!task.dueDate) continue;
    const idx = dayIndex(task.dueDate, start);
    if (idx < 0 || idx >= totalDays) continue;
    if (!tasksByDay.has(idx)) tasksByDay.set(idx, []);
    tasksByDay.get(idx)!.push(task);
  }

  const eventsByDay = new Map<number, TimelineEvent[]>();
  for (const event of events) {
    const idx = dayIndex(event.occurredOn, start);
    if (idx < 0 || idx >= totalDays) continue;
    if (!eventsByDay.has(idx)) eventsByDay.set(idx, []);
    eventsByDay.get(idx)!.push(event);
  }

  const xOf = (dayIdx: number) => dayIdx * DAY_WIDTH + DAY_WIDTH / 2 + 16;
  const width = totalDays * DAY_WIDTH + 32;
  const maxStack = Math.max(1, ...[...tasksByDay.values(), ...eventsByDay.values()].map((d) => d.length));
  const height = LINE_TOP + 24 + maxStack * 12 + 24;

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <div className="relative" style={{ width, height }}>
          <div
            className="absolute border-t border-neutral-300 dark:border-neutral-700"
            style={{ top: LINE_TOP, left: 0, width }}
          />

          {days.map((day, i) => {
            const x = xOf(i);
            const showLabel = i % labelInterval === 0 || i === totalDays - 1;
            return (
              <div key={i}>
                <div
                  className="absolute w-px bg-neutral-300 dark:bg-neutral-700"
                  style={{ left: x, top: LINE_TOP - 4, height: 8 }}
                />
                {showLabel && (
                  <span
                    className="absolute -translate-x-1/2 whitespace-nowrap text-[10px] text-neutral-400"
                    style={{ left: x, top: LINE_TOP + 8 }}
                  >
                    {formatShort(day)}
                  </span>
                )}
              </div>
            );
          })}

          {[...tasksByDay.entries()].flatMap(([dayIdx, dayTasks]) =>
            dayTasks.map((task, stackIdx) => (
              <span
                key={task.id}
                title={`${task.title} — due ${formatShort(days[dayIdx])} (${STATUS_LABEL[task.status]})`}
                className={`absolute h-2.5 w-2.5 -translate-x-1/2 rounded-full ${STATUS_DOT_CLASS[task.status]}`}
                style={{ left: xOf(dayIdx), top: LINE_TOP - 12 - stackIdx * 12 }}
              />
            )),
          )}

          {[...eventsByDay.entries()].flatMap(([dayIdx, dayEvents]) =>
            dayEvents.map((event, stackIdx) => (
              <span
                key={`${dayIdx}-${stackIdx}`}
                title={`${event.taskTitlePath}: ${EVENT_LABEL[event.eventType]}${
                  event.eventType === "STATUS_CHANGED"
                    ? ` (${event.fromStatus ? STATUS_LABEL[event.fromStatus] : "—"} → ${
                        event.toStatus ? STATUS_LABEL[event.toStatus] : "—"
                      })`
                    : ""
                } on ${formatShort(days[dayIdx])}`}
                className={`absolute h-2.5 w-2.5 -translate-x-1/2 rounded-full ${EVENT_DOT_CLASS[event.eventType]}`}
                style={{ left: xOf(dayIdx), top: LINE_TOP + 16 + stackIdx * 12 }}
              />
            )),
          )}
        </div>
      </div>
      <p className="text-xs text-neutral-400">
        Dots above the line are task due dates (colored by status); dots below are activity
        detected on each Excel import (created/status changed/completed).
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { TaskHistoryEventType, TaskStatus } from "@prisma/client";

const DAY_WIDTH = 30;
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

function formatLong(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

/**
 * A literal number-line timeline: one point for every single day in the
 * relevant date range (every day gets its own date label, not just a
 * sampled subset), with due-date markers above the line and
 * created/changed/completed activity markers below it. Clicking a day opens
 * a detail list of everything that happened on it — replaces the old
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
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);

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
  const height = LINE_TOP + 30 + maxStack * 12 + 24;

  const selectedTasks = selectedDayIdx !== null ? (tasksByDay.get(selectedDayIdx) ?? []) : [];
  const selectedEvents = selectedDayIdx !== null ? (eventsByDay.get(selectedDayIdx) ?? []) : [];

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
            const isFirstOfMonth = i === 0 || day.getDate() === 1;
            const isSelected = i === selectedDayIdx;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedDayIdx(isSelected ? null : i)}
                className="absolute flex flex-col items-center"
                style={{ left: x - DAY_WIDTH / 2, top: LINE_TOP - 4, width: DAY_WIDTH, height: height - LINE_TOP + 4 }}
              >
                <div className={`w-px ${isSelected ? "bg-neutral-900 dark:bg-neutral-100" : "bg-neutral-300 dark:bg-neutral-700"}`} style={{ height: 8 }} />
                <span
                  className={`mt-1 whitespace-nowrap text-[10px] ${
                    isSelected
                      ? "font-semibold text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-400"
                  }`}
                >
                  {day.getDate()}
                </span>
                {isFirstOfMonth && (
                  <span className="whitespace-nowrap text-[9px] font-medium text-neutral-500 dark:text-neutral-400">
                    {day.toLocaleDateString(undefined, { month: "short" })}
                  </span>
                )}
              </button>
            );
          })}

          {[...tasksByDay.entries()].flatMap(([dayIdx, dayTasks]) =>
            dayTasks.map((task, stackIdx) => (
              <span
                key={task.id}
                title={`${task.title} — due ${formatShort(days[dayIdx])} (${STATUS_LABEL[task.status]})`}
                className={`pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 rounded-full ${STATUS_DOT_CLASS[task.status]}`}
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
                className={`pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 rounded-full ${EVENT_DOT_CLASS[event.eventType]}`}
                style={{ left: xOf(dayIdx), top: LINE_TOP + 16 + stackIdx * 12 }}
              />
            )),
          )}
        </div>
      </div>

      <p className="text-xs text-neutral-400">
        Dots above the line are task due dates (colored by status); dots below are activity
        detected on each Excel import (created/status changed/completed). Click any date to see
        what it covers.
      </p>

      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        {selectedDayIdx === null ? (
          <p className="text-sm text-neutral-400">Click a date on the timeline to see what happened that day.</p>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {formatLong(days[selectedDayIdx])}
            </h3>

            {selectedTasks.length === 0 && selectedEvents.length === 0 ? (
              <p className="text-sm text-neutral-400">Nothing recorded for this day.</p>
            ) : (
              <>
                {selectedTasks.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      Due today
                    </p>
                    <ul className="space-y-1 text-sm">
                      {selectedTasks.map((task) => (
                        <li key={task.id} className="flex items-center gap-2">
                          <span className={`h-2 w-2 flex-shrink-0 rounded-full ${STATUS_DOT_CLASS[task.status]}`} />
                          <span className="text-neutral-900 dark:text-neutral-100">{task.title}</span>
                          <span className="text-neutral-400">— {STATUS_LABEL[task.status]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedEvents.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      Activity
                    </p>
                    <ul className="space-y-1 text-sm">
                      {selectedEvents.map((event, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className={`h-2 w-2 flex-shrink-0 rounded-full ${EVENT_DOT_CLASS[event.eventType]}`} />
                          <span className="text-neutral-900 dark:text-neutral-100">{event.taskTitlePath}</span>
                          <span className="text-neutral-400">
                            —{" "}
                            {event.eventType === "STATUS_CHANGED"
                              ? `${event.fromStatus ? STATUS_LABEL[event.fromStatus] : "—"} → ${
                                  event.toStatus ? STATUS_LABEL[event.toStatus] : "—"
                                }`
                              : EVENT_LABEL[event.eventType]}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

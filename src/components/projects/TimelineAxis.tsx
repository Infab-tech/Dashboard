"use client";

import { useState } from "react";
import type { TaskHistoryEventType, TaskStatus } from "@prisma/client";

const SLOT_WIDTH = 46;
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
  DELAYED: "bg-red-500",
  DONE: "bg-emerald-500",
};

const EVENT_LABEL: Record<TaskHistoryEventType, string> = {
  CREATED: "created",
  STATUS_CHANGED: "status changed",
  COMPLETED: "completed",
  REMOVED: "removed",
};

/** Color by the outcome of the event (what it changed to), not just its type —
 * so blocked/delayed reads red and done/completed reads green on the axis. */
function eventDotClass(event: TimelineEvent): string {
  if (event.eventType === "COMPLETED") return "bg-emerald-500";
  if (event.eventType === "REMOVED") return "bg-neutral-300 dark:bg-neutral-600";
  if (event.eventType === "CREATED") return "bg-neutral-400";
  switch (event.toStatus) {
    case "BLOCKED":
    case "DELAYED":
      return "bg-red-500";
    case "DONE":
      return "bg-emerald-500";
    case "IN_PROGRESS":
      return "bg-blue-500";
    default:
      return "bg-neutral-400";
  }
}

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

interface DaySlot {
  date: Date;
  isStart: boolean;
  isEnd: boolean;
  tasks: TimelineTask[];
  events: TimelineEvent[];
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Pinned locale (not `undefined`) — the server's and the browser's default
// locale can differ, which caused a hydration mismatch on this client component.
function formatShort(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatLong(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

/**
 * A sparse timeline: only days with something on them get a tick — the project
 * start date, task due dates, and detected activity (created/status
 * changed/completed) — instead of every single calendar day, so gaps of
 * inactivity don't bloat the axis. Clicking a date opens a detail list of
 * everything that happened on it.
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
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const slotMap = new Map<number, DaySlot>();
  const slotFor = (date: Date): DaySlot => {
    const key = startOfDay(date).getTime();
    let slot = slotMap.get(key);
    if (!slot) {
      slot = { date: new Date(key), isStart: false, isEnd: false, tasks: [], events: [] };
      slotMap.set(key, slot);
    }
    return slot;
  };

  if (projectStartDate) slotFor(projectStartDate).isStart = true;
  if (projectEndDate) slotFor(projectEndDate).isEnd = true;
  for (const task of tasks) if (task.dueDate) slotFor(task.dueDate).tasks.push(task);
  for (const event of events) slotFor(event.occurredOn).events.push(event);

  const slots = [...slotMap.values()].sort((a, b) => a.date.getTime() - b.date.getTime());

  if (slots.length === 0) {
    return <p className="text-sm text-neutral-400">No dates recorded yet to plot a timeline.</p>;
  }

  const xOf = (idx: number) => idx * SLOT_WIDTH + SLOT_WIDTH / 2 + 16;
  const width = slots.length * SLOT_WIDTH + 32;
  const maxStack = Math.max(1, ...slots.flatMap((slot) => [slot.tasks.length, slot.events.length]));
  const height = LINE_TOP + 30 + maxStack * 12 + 24;

  const selectedSlot = selectedIdx !== null ? slots[selectedIdx] : null;

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <div className="relative" style={{ width, height }}>
          <div
            className="absolute border-t border-neutral-300 dark:border-neutral-700"
            style={{ top: LINE_TOP, left: 0, width }}
          />

          {slots.map((slot, i) => {
            const x = xOf(i);
            const isSelected = i === selectedIdx;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedIdx(isSelected ? null : i)}
                className="absolute flex flex-col items-center"
                style={{ left: x - SLOT_WIDTH / 2, top: LINE_TOP - 4, width: SLOT_WIDTH, height: height - LINE_TOP + 4 }}
              >
                <div
                  className={`w-px ${
                    isSelected
                      ? "bg-neutral-900 dark:bg-neutral-100"
                      : slot.isStart || slot.isEnd
                        ? "bg-indigo-400 dark:bg-indigo-500"
                        : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
                  style={{ height: 8 }}
                />
                <span
                  className={`mt-1 whitespace-nowrap text-[10px] ${
                    isSelected ? "font-semibold text-neutral-900 dark:text-neutral-100" : "text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {formatShort(slot.date)}
                </span>
                {(slot.isStart || slot.isEnd) && (
                  <span className="whitespace-nowrap text-[9px] font-medium text-indigo-500 dark:text-indigo-400">
                    {slot.isStart && slot.isEnd ? "Start & end" : slot.isStart ? "Start" : "End"}
                  </span>
                )}
              </button>
            );
          })}

          {slots.flatMap((slot, i) =>
            slot.tasks.map((task, stackIdx) => (
              <span
                key={task.id}
                title={`${task.title} — due ${formatShort(slot.date)} (${STATUS_LABEL[task.status]})`}
                className={`pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 rounded-full ${STATUS_DOT_CLASS[task.status]}`}
                style={{ left: xOf(i), top: LINE_TOP - 12 - stackIdx * 12 }}
              />
            )),
          )}

          {slots.flatMap((slot, i) =>
            slot.events.map((event, stackIdx) => (
              <span
                key={`${i}-${stackIdx}`}
                title={`${event.taskTitlePath}: ${EVENT_LABEL[event.eventType]}${
                  event.eventType === "STATUS_CHANGED"
                    ? ` (${event.fromStatus ? STATUS_LABEL[event.fromStatus] : "—"} → ${
                        event.toStatus ? STATUS_LABEL[event.toStatus] : "—"
                      })`
                    : ""
                } on ${formatShort(slot.date)}`}
                className={`pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 rounded-full ${eventDotClass(event)}`}
                style={{ left: xOf(i), top: LINE_TOP + 16 + stackIdx * 12 }}
              />
            )),
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
        <span>Dots above the line are due dates; below are activity. Click a date for details.</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-neutral-400" />To do / created</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" />In progress</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" />Blocked / delayed</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Done / completed</span>
      </div>

      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        {!selectedSlot ? (
          <p className="text-sm text-neutral-400">Click a date on the timeline to see what happened that day.</p>
        ) : (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {formatLong(selectedSlot.date)}
              {(selectedSlot.isStart || selectedSlot.isEnd) && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {selectedSlot.isStart && selectedSlot.isEnd ? "Project start & end" : selectedSlot.isStart ? "Project start" : "Project end"}
                </span>
              )}
            </h3>

            {selectedSlot.tasks.length === 0 && selectedSlot.events.length === 0 ? (
              <p className="text-sm text-neutral-400">
                {selectedSlot.isStart || selectedSlot.isEnd ? "No task activity recorded this day." : "Nothing recorded for this day."}
              </p>
            ) : (
              <>
                {selectedSlot.tasks.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      Due today
                    </p>
                    <ul className="space-y-1 text-sm">
                      {selectedSlot.tasks.map((task) => (
                        <li key={task.id} className="flex items-center gap-2">
                          <span className={`h-2 w-2 flex-shrink-0 rounded-full ${STATUS_DOT_CLASS[task.status]}`} />
                          <span className="text-neutral-900 dark:text-neutral-100">{task.title}</span>
                          <span className="text-neutral-400">— {STATUS_LABEL[task.status]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedSlot.events.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      Activity
                    </p>
                    <ul className="space-y-1 text-sm">
                      {selectedSlot.events.map((event, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className={`h-2 w-2 flex-shrink-0 rounded-full ${eventDotClass(event)}`} />
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

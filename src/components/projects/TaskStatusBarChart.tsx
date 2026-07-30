"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import type { TaskStatus } from "@prisma/client";

const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "BLOCKED", "DELAYED", "DONE"];

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  BLOCKED: "Blocked",
  DELAYED: "Delayed",
  DONE: "Done",
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  TODO: "#a3a3a3",
  IN_PROGRESS: "#3b82f6",
  BLOCKED: "#ef4444",
  DELAYED: "#f59e0b",
  DONE: "#10b981",
};

/** One bar per status — an at-a-glance "how much work is left" summary. */
export function TaskStatusBarChart({ tasks }: { tasks: { status: TaskStatus }[] }) {
  if (tasks.length === 0) {
    return <p className="text-sm text-neutral-400">No tasks yet to summarize.</p>;
  }

  const counts = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABEL[status],
    count: tasks.filter((task) => task.status === status).length,
  }));

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={counts} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={24} />
          <Tooltip />
          <Bar dataKey="count" name="Tasks" radius={[4, 4, 0, 0]}>
            {counts.map((entry) => (
              <Cell key={entry.status} fill={STATUS_COLOR[entry.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

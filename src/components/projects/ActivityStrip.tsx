"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ActivityDayPoint } from "@/lib/projects/activity";

const COLORS = { created: "#a3a3a3", changed: "#3b82f6", completed: "#10b981" };

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Daily-activity strip — a recharts stacked bar chart of TaskHistoryEvent
 * counts per day, plus a dot marker row for days with a DailyLog note
 * underneath, sharing the same date axis. Complements TimelineAxis (which
 * marks due dates and activity as points on a day-by-day number line) and
 * TaskStatusBarChart (overall status breakdown).
 */
export function ActivityStrip({ data }: { data: ActivityDayPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-neutral-400">
        No recorded activity yet — this fills in after the first Excel import.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={24} />
            <Tooltip labelFormatter={(label) => formatDate(String(label))} />
            <Bar dataKey="created" stackId="activity" fill={COLORS.created} name="Created" />
            <Bar dataKey="changed" stackId="activity" fill={COLORS.changed} name="Status changed" />
            <Bar dataKey="completed" stackId="activity" fill={COLORS.completed} name="Completed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-neutral-400">
        Reflects what each Excel import detected as of the upload date, not necessarily the exact
        real-world change date. Days with a manual daily-log note are marked below.
      </p>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {data.map((point) => (
          <span
            key={point.date}
            title={point.hasNote ? `Daily log entry on ${point.date}` : undefined}
            className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
              point.hasNote ? "bg-neutral-900 dark:bg-neutral-100" : "bg-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TaskStatus } from "@prisma/client";
import type { TaskWithRelations } from "./TaskTree";

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  BLOCKED: "Blocked",
  DELAYED: "Delayed",
  DONE: "Done",
};

const STATUS_BADGE_CLASS: Record<TaskStatus, string> = {
  TODO: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  BLOCKED: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  DELAYED: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  DONE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  // Pinned locale (not `undefined`) — the server's and the browser's default
  // locale can differ, which caused a hydration mismatch on this client component.
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function TaskDetailPanel({
  projectId,
  task,
  allTasks,
}: {
  projectId: string;
  task: TaskWithRelations;
  allTasks: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [delayReason, setDelayReason] = useState(task.delayReason ?? "");
  const [dependsOnId, setDependsOnId] = useState(task.dependsOnId ?? "");
  const [error, setError] = useState<string | null>(null);

  const showDelayReason = task.status === "BLOCKED" || task.status === "DELAYED";

  const save = (patch: { delayReason?: string | null; dependsOnId?: string | null }) => {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/projects/${projectId}/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Failed to save.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{task.title}</h3>
        <span
          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[task.status]}`}
        >
          {STATUS_LABEL[task.status]}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-neutral-500 dark:text-neutral-400">Assignee</dt>
        <dd className="text-neutral-900 dark:text-neutral-100">{task.assignedTo?.name ?? "Unassigned"}</dd>
        <dt className="text-neutral-500 dark:text-neutral-400">Start date</dt>
        <dd className="text-neutral-900 dark:text-neutral-100">{formatDate(task.startDate)}</dd>
        <dt className="text-neutral-500 dark:text-neutral-400">Due date</dt>
        <dd className="text-neutral-900 dark:text-neutral-100">{formatDate(task.dueDate)}</dd>
        <dt className="text-neutral-500 dark:text-neutral-400">% Complete</dt>
        <dd className="text-neutral-900 dark:text-neutral-100">{task.percentComplete}%</dd>
      </dl>

      {task.notes && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Notes
          </p>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">{task.notes}</p>
        </div>
      )}

      {showDelayReason && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Reason for {task.status === "BLOCKED" ? "block" : "delay"}
          </label>
          <textarea
            value={delayReason}
            onChange={(e) => setDelayReason(e.target.value)}
            rows={2}
            placeholder="Why is this task blocked or delayed?"
            className="w-full rounded-md border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() => save({ delayReason })}
            className="rounded-md bg-neutral-900 px-3 py-1 text-xs font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
          >
            Save reason
          </button>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Waiting on
        </label>
        <div className="flex gap-2">
          <select
            value={dependsOnId}
            onChange={(e) => setDependsOnId(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="">None</option>
            {allTasks
              .filter((t) => t.id !== task.id)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
          </select>
          <button
            type="button"
            disabled={isPending}
            onClick={() => save({ dependsOnId: dependsOnId || null })}
            className="flex-shrink-0 rounded-md bg-neutral-900 px-3 py-1 text-xs font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
          >
            Set
          </button>
        </div>
        {task.dependsOn && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Waiting on <span className="font-medium">{task.dependsOn.title}</span>
            {task.dependsOn.assignedTo && <> — assigned to {task.dependsOn.assignedTo.name}</>}
          </p>
        )}
      </div>

      {task.blockedTasks.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Blocking
          </p>
          <ul className="mt-1 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
            {task.blockedTasks.map((blocked) => (
              <li key={blocked.id}>
                {blocked.title}
                {blocked.assignedTo && <> — assigned to {blocked.assignedTo.name}</>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

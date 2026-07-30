"use client";

import { useState } from "react";
import type { Prisma } from "@prisma/client";
import { TaskTreeDiagram } from "./TaskTreeDiagram";
import { TaskDetailPanel } from "./TaskDetailPanel";

export type TaskWithRelations = Prisma.WorkflowTaskGetPayload<{
  include: {
    assignedTo: true;
    dependsOn: { include: { assignedTo: true } };
    blockedTasks: { include: { assignedTo: true } };
  };
}>;

export function TaskTree({ projectId, tasks }: { projectId: string; tasks: TaskWithRelations[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(tasks[0]?.id ?? null);
  const selectedTask = tasks.find((task) => task.id === selectedId) ?? null;
  const allTaskOptions = tasks.map((task) => ({ id: task.id, title: task.title }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TaskTreeDiagram tasks={tasks} selectedId={selectedId} onSelect={setSelectedId} />
      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        {selectedTask ? (
          <TaskDetailPanel projectId={projectId} task={selectedTask} allTasks={allTaskOptions} />
        ) : (
          <p className="text-sm text-neutral-400">Select a task to see its details.</p>
        )}
      </div>
    </div>
  );
}

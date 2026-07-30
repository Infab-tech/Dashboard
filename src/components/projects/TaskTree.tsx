"use client";

import { useState } from "react";
import type { Prisma, TaskStatus } from "@prisma/client";
import { TreeView, type TreeNode } from "@/components/tree/TreeView";
import { buildTaskTree } from "@/lib/projects/task-tree";
import { TaskDetailPanel } from "./TaskDetailPanel";

export type TaskWithRelations = Prisma.WorkflowTaskGetPayload<{
  include: {
    assignedTo: true;
    dependsOn: { include: { assignedTo: true } };
    blockedTasks: { include: { assignedTo: true } };
  };
}>;

const STATUS_COLOR_CLASS: Record<TaskStatus, string> = {
  TODO: "bg-neutral-400",
  IN_PROGRESS: "bg-blue-500",
  BLOCKED: "bg-red-500",
  DELAYED: "bg-amber-500",
  DONE: "bg-emerald-500",
};

interface TaskNode extends TreeNode {
  status: TaskStatus;
  children: TaskNode[];
}

function toTaskNodes(tasks: TaskWithRelations[]): TaskNode[] {
  const convert = (nodes: ReturnType<typeof buildTaskTree<TaskWithRelations>>): TaskNode[] =>
    nodes.map((node) => ({
      id: node.task.id,
      label: node.task.title,
      status: node.task.status,
      children: convert(node.children),
    }));
  return convert(buildTaskTree(tasks));
}

export function TaskTree({ projectId, tasks }: { projectId: string; tasks: TaskWithRelations[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(tasks[0]?.id ?? null);
  const nodes = toTaskNodes(tasks);
  const selectedTask = tasks.find((task) => task.id === selectedId) ?? null;
  const allTaskOptions = tasks.map((task) => ({ id: task.id, title: task.title }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
        {tasks.length === 0 ? (
          <p className="text-sm text-neutral-400">No tasks yet — upload an Excel sheet to populate this project.</p>
        ) : (
          <TreeView
            nodes={nodes}
            selectedId={selectedId}
            onSelect={setSelectedId}
            getNodeColorClass={(node) => STATUS_COLOR_CLASS[node.status]}
            defaultExpandedIds={nodes.map((node) => node.id)}
          />
        )}
      </div>
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

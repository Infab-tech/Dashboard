import type { TaskStatus } from "@prisma/client";

export interface PersonRef {
  id: string;
  name: string;
  title: string | null;
}

export interface DependencyTaskInput {
  id: string;
  title: string;
  status: TaskStatus;
  assignedTo: PersonRef | null;
  dependsOn: {
    assignedTo: PersonRef | null;
  } | null;
}

export interface DependencyTaskRef {
  id: string;
  title: string;
  status: TaskStatus;
}

/**
 * One person depending on another: `dependentPersonId` can't finish the
 * listed tasks until `blockerPersonId` finishes whatever those tasks'
 * dependsOn-tasks are. Multiple task links between the same pair collapse
 * into one edge (`tasks`) instead of one arrow per task.
 */
export interface PersonDependencyEdge {
  blockerPersonId: string;
  dependentPersonId: string;
  tasks: DependencyTaskRef[];
}

export interface PersonDependencyGraph {
  people: PersonRef[];
  edges: PersonDependencyEdge[];
}

/**
 * Derives a person-level dependency graph from task-level links: if task A
 * (assigned to X) depends on task B (assigned to Y) and X != Y, X depends on
 * Y to complete A. Self-dependencies (same person on both tasks) and tasks
 * with no assignee on either side are skipped — there's no cross-person
 * link to draw.
 */
export function buildPersonDependencyGraph(tasks: DependencyTaskInput[]): PersonDependencyGraph {
  const people = new Map<string, PersonRef>();
  const edges = new Map<string, PersonDependencyEdge>();

  for (const task of tasks) {
    if (task.assignedTo) people.set(task.assignedTo.id, task.assignedTo);
    if (task.dependsOn?.assignedTo) people.set(task.dependsOn.assignedTo.id, task.dependsOn.assignedTo);

    const dependent = task.assignedTo;
    const blocker = task.dependsOn?.assignedTo;
    if (!dependent || !blocker || dependent.id === blocker.id) continue;

    const key = `${blocker.id}::${dependent.id}`;
    const taskRef: DependencyTaskRef = { id: task.id, title: task.title, status: task.status };
    const existing = edges.get(key);
    if (existing) {
      existing.tasks.push(taskRef);
    } else {
      edges.set(key, { blockerPersonId: blocker.id, dependentPersonId: dependent.id, tasks: [taskRef] });
    }
  }

  return { people: [...people.values()], edges: [...edges.values()] };
}

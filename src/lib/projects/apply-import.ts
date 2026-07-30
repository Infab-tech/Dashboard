import type { Prisma, PrismaClient, TaskStatus } from "@prisma/client";
import type { ParsedImport, ParsedTaskRow } from "./excel-import";

export interface ApplyImportResult {
  tasksCreated: number;
  warnings: string[];
}

interface TaskSnapshot {
  pathKey: string;
  status: TaskStatus;
}

/** Walks each task's parent chain to reconstruct the "Task > Subtask" path used for diffing. */
async function snapshotExistingTasks(
  tx: Prisma.TransactionClient,
  projectId: string,
): Promise<TaskSnapshot[]> {
  const tasks = await tx.workflowTask.findMany({
    where: { projectId },
    select: { id: true, title: true, status: true, parentId: true },
  });
  const byId = new Map(tasks.map((task) => [task.id, task]));

  const pathKeyOf = (id: string): string => {
    const task = byId.get(id);
    if (!task) return "";
    return task.parentId ? `${pathKeyOf(task.parentId)} > ${task.title}` : task.title;
  };

  return tasks.map((task) => ({ pathKey: pathKeyOf(task.id), status: task.status }));
}

async function resolvePersonId(
  tx: Prisma.TransactionClient,
  name: string | null,
  cache: Map<string, string>,
): Promise<string | null> {
  if (!name) return null;
  const key = name.trim().toLowerCase();
  if (cache.has(key)) return cache.get(key)!;

  const existing = await tx.person.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
  const id = existing ? existing.id : (await tx.person.create({ data: { name } })).id;
  cache.set(key, id);
  return id;
}

function diffToHistoryEvents(
  projectId: string,
  oldSnapshot: TaskSnapshot[],
  newRows: ParsedTaskRow[],
  now: Date,
): Prisma.TaskHistoryEventCreateManyInput[] {
  const oldByPath = new Map(oldSnapshot.map((task) => [task.pathKey, task.status]));
  const newByPath = new Map(newRows.map((row) => [row.pathKey, row.status]));
  const events: Prisma.TaskHistoryEventCreateManyInput[] = [];

  for (const [pathKey, toStatus] of newByPath) {
    const fromStatus = oldByPath.get(pathKey);
    if (fromStatus === undefined) {
      events.push({ projectId, taskTitlePath: pathKey, eventType: "CREATED", toStatus, occurredOn: now });
    } else if (fromStatus !== toStatus) {
      events.push({
        projectId,
        taskTitlePath: pathKey,
        eventType: "STATUS_CHANGED",
        fromStatus,
        toStatus,
        occurredOn: now,
      });
    }
    if (toStatus === "DONE" && fromStatus !== "DONE") {
      events.push({ projectId, taskTitlePath: pathKey, eventType: "COMPLETED", fromStatus, toStatus, occurredOn: now });
    }
  }

  for (const [pathKey, fromStatus] of oldByPath) {
    if (!newByPath.has(pathKey)) {
      events.push({ projectId, taskTitlePath: pathKey, eventType: "REMOVED", fromStatus, occurredOn: now });
    }
  }

  return events;
}

/**
 * Replaces a project's entire task tree from a parsed Excel import: deletes the
 * existing tasks, recreates them (top-level pass, then child pass so parentId
 * can resolve), logs a TaskHistoryEvent per detected change, and updates the
 * project lead if one resolved. Runs as a single transaction so a failure never
 * leaves the project with a half-replaced tree.
 */
export async function applyProjectImport(
  prisma: PrismaClient,
  projectId: string,
  parsed: ParsedImport,
): Promise<ApplyImportResult> {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const oldSnapshot = await snapshotExistingTasks(tx, projectId);

    await tx.workflowTask.deleteMany({ where: { projectId } });

    const personCache = new Map<string, string>();
    const topLevelRows = parsed.rows.filter((row) => row.parentPathKey === null);
    const childRows = parsed.rows.filter((row) => row.parentPathKey !== null);

    const pathKeyToId = new Map<string, string>();

    for (const row of topLevelRows) {
      const assignedToId = await resolvePersonId(tx, row.assigneeName, personCache);
      const task = await tx.workflowTask.create({
        data: {
          projectId,
          title: row.title,
          status: row.status,
          percentComplete: row.percentComplete,
          startDate: row.startDate,
          dueDate: row.dueDate,
          notes: row.notes,
          assignedToId,
        },
      });
      pathKeyToId.set(row.pathKey, task.id);
    }

    for (const row of childRows) {
      const assignedToId = await resolvePersonId(tx, row.assigneeName, personCache);
      const parentId = row.parentPathKey ? pathKeyToId.get(row.parentPathKey) : undefined;
      const task = await tx.workflowTask.create({
        data: {
          projectId,
          title: row.title,
          status: row.status,
          percentComplete: row.percentComplete,
          startDate: row.startDate,
          dueDate: row.dueDate,
          notes: row.notes,
          assignedToId,
          parentId,
        },
      });
      pathKeyToId.set(row.pathKey, task.id);
    }

    const historyEvents = diffToHistoryEvents(projectId, oldSnapshot, parsed.rows, now);
    if (historyEvents.length > 0) {
      await tx.taskHistoryEvent.createMany({ data: historyEvents });
    }

    if (parsed.projectLeadName) {
      const projectLeadId = await resolvePersonId(tx, parsed.projectLeadName, personCache);
      await tx.project.update({ where: { id: projectId }, data: { projectLeadId } });
    }

    return { tasksCreated: parsed.rows.length, warnings: parsed.warnings };
  });
}

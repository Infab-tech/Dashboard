"use server"

import { prisma } from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function getDailyLogs(query?: string) {
  let where: Prisma.DailyLogWhereInput = {};
  if (query) {
    where = {
      OR: [
        { projectName: { contains: query, mode: "insensitive" } },
        { task: { contains: query, mode: "insensitive" } },
        { assignees: { some: { name: { contains: query, mode: "insensitive" } } } },
      ],
    };
  }
  return await prisma.dailyLog.findMany({
    where,
    orderBy: [
      { date: "desc" },
      { serialNo: "asc" }
    ],
    include: {
      project: { select: { name: true } },
      assignees: { select: { id: true, name: true } }
    }
  });
}

export async function getDailyLog(id: string) {
  return await prisma.dailyLog.findUnique({
    where: { id },
    include: {
      assignees: { select: { id: true } }
    }
  });
}

export async function createDailyLog(data: {
  date: Date;
  serialNo?: number | null;
  projectName: string;
  projectId?: string | null;
  task: string;
  assigneeIds: string[];
  targetDateOrStatus?: string | null;
  remarks?: string | null;
}) {
  const log = await prisma.dailyLog.create({
    data: {
      date: data.date,
      serialNo: data.serialNo,
      projectName: data.projectName,
      projectId: data.projectId || null,
      task: data.task,
      targetDateOrStatus: data.targetDateOrStatus,
      remarks: data.remarks,
      assignees: {
        connect: data.assigneeIds.map(id => ({ id }))
      }
    },
  });

  for (const id of data.assigneeIds) {
    await prisma.personalTask.create({
      data: {
        personId: id,
        title: data.task,
        date: data.date,
        dailyLogId: log.id,
      }
    });
  }

  revalidatePath("/daily-log");
  return log;
}

export async function updateDailyLog(id: string, data: {
  date: Date;
  serialNo?: number | null;
  projectName: string;
  projectId?: string | null;
  task: string;
  assigneeIds: string[];
  targetDateOrStatus?: string | null;
  remarks?: string | null;
}) {
  const log = await prisma.dailyLog.update({
    where: { id },
    data: {
      date: data.date,
      serialNo: data.serialNo,
      projectName: data.projectName,
      projectId: data.projectId || null,
      task: data.task,
      targetDateOrStatus: data.targetDateOrStatus,
      remarks: data.remarks,
      assignees: {
        set: data.assigneeIds.map(id => ({ id }))
      }
    },
  });

  const existingTasks = await prisma.personalTask.findMany({ where: { dailyLogId: log.id } });
  const toDelete = existingTasks.filter(t => !data.assigneeIds.includes(t.personId));
  if (toDelete.length > 0) {
    await prisma.personalTask.deleteMany({ where: { id: { in: toDelete.map(t => t.id) } } });
  }

  for (const personId of data.assigneeIds) {
    const existing = existingTasks.find(t => t.personId === personId);
    if (existing) {
      await prisma.personalTask.update({
        where: { id: existing.id },
        data: {
          title: data.task,
          date: data.date,
        }
      });
    } else {
      await prisma.personalTask.create({
        data: {
          personId,
          title: data.task,
          date: data.date,
          dailyLogId: log.id,
        }
      });
    }
  }

  revalidatePath("/daily-log");
  return log;
}

export async function deleteDailyLog(id: string) {
  await prisma.dailyLog.delete({ where: { id } });
  revalidatePath("/daily-log");
}

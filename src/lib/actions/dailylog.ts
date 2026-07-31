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
        { assignedTo: { contains: query, mode: "insensitive" } },
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
      project: { select: { name: true } }
    }
  });
}

export async function getDailyLog(id: string) {
  return await prisma.dailyLog.findUnique({
    where: { id },
  });
}

export async function createDailyLog(data: {
  date: Date;
  serialNo?: number | null;
  projectName: string;
  projectId?: string | null;
  task: string;
  assignedTo: string;
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
      assignedTo: data.assignedTo,
      targetDateOrStatus: data.targetDateOrStatus,
      remarks: data.remarks,
    },
  });
  revalidatePath("/daily-log");
  return log;
}

export async function updateDailyLog(id: string, data: {
  date: Date;
  serialNo?: number | null;
  projectName: string;
  projectId?: string | null;
  task: string;
  assignedTo: string;
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
      assignedTo: data.assignedTo,
      targetDateOrStatus: data.targetDateOrStatus,
      remarks: data.remarks,
    },
  });
  revalidatePath("/daily-log");
  return log;
}

export async function deleteDailyLog(id: string) {
  await prisma.dailyLog.delete({ where: { id } });
  revalidatePath("/daily-log");
}

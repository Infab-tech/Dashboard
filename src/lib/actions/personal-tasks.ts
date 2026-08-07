"use server";

import { prisma } from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";

export async function getPersonalTasks(personId: string) {
  // Get all tasks for this person that are either incomplete (any date)
  // or were completed today.
  
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const tasks = await prisma.personalTask.findMany({
    where: {
      personId,
      OR: [
        { isCompleted: false },
        { 
          isCompleted: true, 
          completedAt: { gte: todayStart } 
        }
      ]
    },
    orderBy: [
      { isCompleted: 'asc' },
      { date: 'asc' }
    ],
    include: {
      dailyLog: true
    }
  });
  
  return tasks;
}

export async function createPersonalTask(personId: string, title: string) {
  const task = await prisma.personalTask.create({
    data: {
      personId,
      title,
      date: new Date(),
    }
  });
  
  revalidatePath('/my-tasks');
  return task;
}

export async function toggleTaskCompletion(taskId: string, isCompleted: boolean) {
  const task = await prisma.personalTask.update({
    where: { id: taskId },
    data: {
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    }
  });

  revalidatePath('/my-tasks');
  return task;
}

export async function deletePersonalTask(taskId: string) {
  await prisma.personalTask.delete({
    where: { id: taskId }
  });
  revalidatePath('/my-tasks');
}

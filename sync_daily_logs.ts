import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching all daily logs...");
  const logs = await prisma.dailyLog.findMany({
    include: {
      assignees: true,
      personalTasks: true,
    }
  });

  let createdCount = 0;

  for (const log of logs) {
    for (const assignee of log.assignees) {
      // Check if a personal task already exists for this person and daily log
      const exists = log.personalTasks.some(pt => pt.personId === assignee.id);
      
      if (!exists) {
        await prisma.personalTask.create({
          data: {
            personId: assignee.id,
            title: log.task || "No task description",
            date: log.date,
            dailyLogId: log.id,
            isCompleted: log.targetDateOrStatus?.toLowerCase().includes("done") || log.targetDateOrStatus?.toLowerCase().includes("completed") || false,
          }
        });
        createdCount++;
      }
    }
  }

  console.log(`Successfully created ${createdCount} missing personal tasks from existing daily logs.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

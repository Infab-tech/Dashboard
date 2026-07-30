"use server"

import { prisma } from "@/lib/prisma/client";

export async function getProjects() {
  return await prisma.project.findMany({
    orderBy: { name: 'asc' }
  });
}

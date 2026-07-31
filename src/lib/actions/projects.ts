"use server"

import { prisma } from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";

export async function getProjects() {
  return await prisma.project.findMany({
    orderBy: { name: 'asc' }
  });
}

/**
 * Reclaims a `-2`/`-3`/... collision suffix once whatever was blocking the
 * clean `base` code is gone, compacting the whole chain down by one
 * (holder of `base-2` -> `base`, holder of `base-3` -> `base-2`, etc.).
 * Codes only ever get a numbered suffix because `resolveUniqueProjectCode`
 * found `base` taken at creation time — if that's no longer true, nothing
 * should still be stuck on the suffixed version.
 */
async function reclaimCode(base: string) {
  let n = 2;
  let freeSlot = base;
  while (true) {
    const nextCode = `${base}-${n}`;
    const holder = await prisma.project.findUnique({ where: { code: nextCode }, select: { id: true } });
    if (!holder) break;
    await prisma.project.update({ where: { id: holder.id }, data: { code: freeSlot } });
    freeSlot = nextCode;
    n++;
  }
}

export async function deleteProject(id: string) {
  // Sub-projects cascade-delete with this row at the DB level, freeing their
  // codes too — grab them up front since they won't be queryable afterward.
  const project = await prisma.project.findUnique({
    where: { id },
    select: { code: true, subProjects: { select: { code: true } } },
  });

  await prisma.project.delete({ where: { id } });

  const freedCodes = [project?.code, ...(project?.subProjects.map((s) => s.code) ?? [])].filter(
    (code): code is string => Boolean(code),
  );
  for (const code of freedCodes) {
    await reclaimCode(code);
  }

  revalidatePath("/projects");
}

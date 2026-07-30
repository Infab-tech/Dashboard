import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";

export const runtime = "nodejs";

interface PatchBody {
  delayReason?: string | null;
  dependsOnId?: string | null;
}

/**
 * Manual edits only reachable from the tree detail panel — the Excel import has
 * no columns for either field, so this is the only way to set them. Both are
 * wiped on the project's next Excel re-upload (full tree replace).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> },
) {
  const { id: projectId, taskId } = await params;

  const task = await prisma.workflowTask.findFirst({ where: { id: taskId, projectId } });
  if (!task) {
    return NextResponse.json({ error: "Task not found in this project." }, { status: 404 });
  }

  const body: PatchBody = await request.json();
  const data: { delayReason?: string | null; dependsOnId?: string | null } = {};

  if ("delayReason" in body) {
    data.delayReason = body.delayReason?.trim() || null;
  }

  if ("dependsOnId" in body) {
    if (body.dependsOnId === null) {
      data.dependsOnId = null;
    } else if (body.dependsOnId === taskId) {
      return NextResponse.json({ error: "A task cannot depend on itself." }, { status: 400 });
    } else if (body.dependsOnId) {
      const dependsOn = await prisma.workflowTask.findFirst({
        where: { id: body.dependsOnId, projectId },
      });
      if (!dependsOn) {
        return NextResponse.json({ error: "Dependency task not found in this project." }, { status: 400 });
      }
      data.dependsOnId = body.dependsOnId;
    }
  }

  const updated = await prisma.workflowTask.update({ where: { id: taskId }, data });
  return NextResponse.json(updated);
}

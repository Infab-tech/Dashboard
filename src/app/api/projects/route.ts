import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import type { ProjectStatus } from "@prisma/client";
import { resolvePersonId } from "@/lib/projects/people";
import { resolveUniqueProjectCode } from "@/lib/projects/generate-code";

export const runtime = "nodejs";

const VALID_STATUSES: ProjectStatus[] = ["PLANNED", "ONGOING", "ON_HOLD", "COMPLETED"];

interface CreateProjectBody {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  projectLeadName?: string | null;
  customerName?: string;
  parentId?: string | null;
}

export async function POST(request: NextRequest) {
  const body: CreateProjectBody = await request.json();

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Project name is required." }, { status: 400 });
  }

  const customerName = body.customerName?.trim();
  if (!customerName) {
    return NextResponse.json({ error: "Customer is required." }, { status: 400 });
  }

  const parentId = body.parentId?.trim() || null;
  if (parentId) {
    const parent = await prisma.project.findUnique({ where: { id: parentId }, select: { id: true } });
    if (!parent) {
      return NextResponse.json({ error: "Parent project not found." }, { status: 400 });
    }
  }

  const status = body.status && VALID_STATUSES.includes(body.status) ? body.status : "PLANNED";
  const projectLeadId = await resolvePersonId(prisma, body.projectLeadName?.trim() || null);
  const code = await resolveUniqueProjectCode(prisma, name);

  const project = await prisma.project.create({
    data: {
      name,
      code,
      description: body.description?.trim() || null,
      customerName,
      status,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      projectLeadId,
      parentId,
    },
  });

  return NextResponse.json(project, { status: 201 });
}

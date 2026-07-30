import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import type { ProjectStatus } from "@prisma/client";
import { resolvePersonId } from "@/lib/projects/people";

export const runtime = "nodejs";

const VALID_STATUSES: ProjectStatus[] = ["PLANNED", "ONGOING", "ON_HOLD", "COMPLETED"];

interface CreateProjectBody {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  projectLeadName?: string | null;
}

export async function POST(request: NextRequest) {
  const body: CreateProjectBody = await request.json();

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Project name is required." }, { status: 400 });
  }

  const status = body.status && VALID_STATUSES.includes(body.status) ? body.status : "PLANNED";
  const projectLeadId = await resolvePersonId(prisma, body.projectLeadName?.trim() || null);

  const project = await prisma.project.create({
    data: {
      name,
      description: body.description?.trim() || null,
      status,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      projectLeadId,
    },
  });

  return NextResponse.json(project, { status: 201 });
}

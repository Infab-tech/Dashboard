import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import type { ProjectStatus } from "@prisma/client";
import { resolvePersonId } from "@/lib/projects/people";
import { resolveUniqueProjectCode } from "@/lib/projects/generate-code";

export const runtime = "nodejs";

const VALID_STATUSES: ProjectStatus[] = ["PLANNED", "ONGOING", "ON_HOLD", "COMPLETED"];

interface UpdateProjectBody {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  projectLeadName?: string | null;
  customerName?: string;
}

// Edits core project fields. Renaming regenerates `code` from the new name
// (collision-checked against every other project) — codes track the name
// they were derived from instead of freezing at whatever they were assigned
// at creation. See docs/projects.md.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body: UpdateProjectBody = await request.json();

  const existing = await prisma.project.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!existing) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Project name is required." }, { status: 400 });
  }

  const customerName = body.customerName?.trim() || "";

  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const projectLeadId = await resolvePersonId(prisma, body.projectLeadName?.trim() || null);
  const code = name !== existing.name ? await resolveUniqueProjectCode(prisma, name, id) : undefined;

  const project = await prisma.project.update({
    where: { id },
    data: {
      name,
      ...(code ? { code } : {}),
      description: body.description?.trim() || null,
      customerName,
      status: body.status,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      projectLeadId,
    },
  });

  return NextResponse.json(project);
}

import { NextResponse, type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma/client";
import { computePriorityScore } from "@/lib/projects/priority-score";
import { ProjectReportDocument, type ProjectReportData } from "@/lib/pdf/ProjectReportDocument";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      projectLead: true,
      tasks: { include: { assignedTo: true }, orderBy: { createdAt: "asc" } },
      milestones: true,
      people: { include: { person: true } },
      historyEvents: { orderBy: { occurredOn: "desc" }, take: 20 },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const priorityScore = computePriorityScore(project);

  const reportData: ProjectReportData = {
    name: project.name,
    code: project.code,
    status: project.status,
    startDate: project.startDate,
    endDate: project.endDate,
    projectLeadName: project.projectLead?.name ?? null,
    priorityScore,
    tasks: project.tasks.map((task) => ({
      id: task.id,
      parentId: task.parentId,
      title: task.title,
      status: task.status,
      percentComplete: task.percentComplete,
      startDate: task.startDate,
      dueDate: task.dueDate,
      assigneeName: task.assignedTo?.name ?? null,
    })),
    recentHistory: project.historyEvents.map((event) => ({
      taskTitlePath: event.taskTitlePath,
      eventType: event.eventType,
      fromStatus: event.fromStatus,
      toStatus: event.toStatus,
      occurredOn: event.occurredOn,
    })),
    people: project.people.map((personProject) => ({
      name: personProject.person.name,
      role: personProject.roleOnProject,
    })),
    generatedAt: new Date(),
  };

  const buffer = await renderToBuffer(<ProjectReportDocument data={reportData} />);
  const fileName = `${project.name.replace(/[^a-z0-9]+/gi, "-")}-report.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}

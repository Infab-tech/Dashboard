import { prisma } from "@/lib/prisma/client";
import { groupAndSortProjects } from "@/lib/projects/priority-score";
import { ProjectList } from "@/components/projects/ProjectList";
import { NewProjectForm } from "@/components/projects/NewProjectForm";

// Priority ordering and task counts change on every upload/edit — never prerender this page.
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      projectLead: true,
      tasks: { select: { status: true, dueDate: true } },
      milestones: { select: { completedAt: true, dueDate: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const groups = groupAndSortProjects(projects);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Projects</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            All ongoing and finished projects, ordered by what needs attention most.
          </p>
        </div>
        <NewProjectForm />
      </div>

      <ProjectList
        groups={groups.map((group) => ({
          status: group.status,
          projects: group.projects.map((project) => ({
            id: project.id,
            name: project.name,
            code: project.code,
            status: project.status,
            endDate: project.endDate,
            priorityScore: project.priorityScore,
            projectLeadName: project.projectLead?.name ?? null,
          })),
        }))}
      />
    </div>
  );
}

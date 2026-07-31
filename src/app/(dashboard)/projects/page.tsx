import { prisma } from "@/lib/prisma/client";
import { groupAndSortProjects, sortByDate } from "@/lib/projects/priority-score";
import { ProjectList } from "@/components/projects/ProjectList";
import { NewProjectForm } from "@/components/projects/NewProjectForm";

// New projects and edits change the list on every upload/edit — never prerender this page.
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  // Only top-level projects are grouped/sorted here — sub-projects are nested
  // under their parent's card instead of getting their own slot in a status group.
  const [projects, allProjects] = await Promise.all([
    prisma.project.findMany({
      where: { parentId: null },
      include: {
        projectLead: true,
        subProjects: { include: { projectLead: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.project.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const groups = groupAndSortProjects(projects);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Projects</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            All ongoing and finished projects, ordered by start and end date.
          </p>
        </div>
        <NewProjectForm existingProjects={allProjects} />
      </div>

      <ProjectList
        groups={groups.map((group) => ({
          status: group.status,
          projects: group.projects.map((project) => ({
            id: project.id,
            name: project.name,
            code: project.code,
            status: project.status,
            startDate: project.startDate,
            endDate: project.endDate,
            projectLeadName: project.projectLead?.name ?? null,
            subProjects: sortByDate(project.subProjects).map((sub) => ({
              id: sub.id,
              name: sub.name,
              code: sub.code,
              status: sub.status,
              startDate: sub.startDate,
              endDate: sub.endDate,
              projectLeadName: sub.projectLead?.name ?? null,
            })),
          })),
        }))}
      />
    </div>
  );
}

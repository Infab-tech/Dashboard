import Link from "next/link";
import { prisma } from "@/lib/prisma/client";
import { PersonDependencyDiagram } from "@/components/workflow/PersonDependencyDiagram";

// Task assignments/dependencies change on every upload/edit — never prerender this page.
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ project?: string }>;

export default async function WorkflowPage({ searchParams }: { searchParams: SearchParams }) {
  const { project: requestedProjectId } = await searchParams;

  const projects = await prisma.project.findMany({
    select: { id: true, name: true, code: true, parentId: true },
    orderBy: { name: "asc" },
  });

  const topLevel = projects.filter((p) => !p.parentId);
  const subProjectsByParent = new Map<string, typeof projects>();
  for (const p of projects) {
    if (p.parentId) {
      subProjectsByParent.set(p.parentId, [...(subProjectsByParent.get(p.parentId) ?? []), p]);
    }
  }

  const activeId = requestedProjectId ?? topLevel[0]?.id ?? projects[0]?.id ?? null;
  const activeProject = activeId ? (projects.find((p) => p.id === activeId) ?? null) : null;

  const tasks = activeProject
    ? await prisma.workflowTask.findMany({
        where: { projectId: activeProject.id },
        select: {
          id: true,
          title: true,
          status: true,
          assignedTo: { select: { id: true, name: true, title: true } },
          dependsOn: {
            select: { assignedTo: { select: { id: true, name: true, title: true } } },
          },
        },
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Workflow</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Who&apos;s depending on whom to finish what, per project — derived from each task&apos;s
          assignee and its &quot;depends on&quot; link.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="max-h-[600px] space-y-0.5 overflow-auto rounded-lg border border-neutral-200 p-2 dark:border-neutral-800">
          {projects.length === 0 && <p className="p-2 text-sm text-neutral-400">No projects yet.</p>}
          {topLevel.map((p) => (
            <div key={p.id}>
              <Link
                href={`/workflow?project=${p.id}`}
                className={`block truncate rounded-md px-2 py-1.5 text-sm ${
                  p.id === activeId
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                {p.name}
              </Link>
              {(subProjectsByParent.get(p.id) ?? []).map((sub) => (
                <Link
                  key={sub.id}
                  href={`/workflow?project=${sub.id}`}
                  className={`block truncate rounded-md py-1.5 pl-5 pr-2 text-sm ${
                    sub.id === activeId
                      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                      : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
                >
                  ↳ {sub.name}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="min-w-0 space-y-3">
          {activeProject ? (
            <>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {activeProject.name}
                </h2>
                {activeProject.code && <span className="text-sm text-neutral-400">{activeProject.code}</span>}
              </div>
              <PersonDependencyDiagram tasks={tasks} />
            </>
          ) : (
            <p className="text-sm text-neutral-400">Select a project to see its dependency flow.</p>
          )}
        </div>
      </div>
    </div>
  );
}

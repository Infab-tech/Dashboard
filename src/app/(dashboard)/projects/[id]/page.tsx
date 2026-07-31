import Link from "next/link";
import { notFound } from "next/navigation";
import type { ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";
import { computePriorityScore, sortByDate } from "@/lib/projects/priority-score";
import { TaskTree } from "@/components/projects/TaskTree";
import { TimelineAxis, type TimelineTask } from "@/components/projects/TimelineAxis";
import { TaskStatusBarChart } from "@/components/projects/TaskStatusBarChart";
import { UploadTasksForm } from "@/components/projects/UploadTasksForm";
import { NewProjectForm } from "@/components/projects/NewProjectForm";
import { EditProjectForm } from "@/components/projects/EditProjectForm";

// Task tree, timeline, and priority score change on every upload/edit — never prerender this page.
export const dynamic = "force-dynamic";

function toDateInputValue(date: Date | null): string | null {
  if (!date) return null;
  return date.toISOString().slice(0, 10);
}

const STATUS_BADGE_CLASS: Record<ProjectStatus, string> = {
  PLANNED: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  ONGOING: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  ON_HOLD: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

const STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNED: "Planned",
  ONGOING: "Ongoing",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
};

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      projectLead: true,
      parent: true,
      subProjects: { include: { projectLead: true } },
      tasks: {
        include: {
          assignedTo: true,
          dependsOn: { include: { assignedTo: true } },
          blockedTasks: { include: { assignedTo: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      milestones: true,
      historyEvents: { orderBy: { occurredOn: "desc" } },
      people: { include: { person: true } },
    },
  });

  if (!project) notFound();

  const subProjects = sortByDate(project.subProjects);

  const priorityScore = computePriorityScore(project);
  const timelineTasks: TimelineTask[] = project.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    dueDate: task.dueDate,
  }));

  const editProjectData = {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    startDate: project.startDate,
    endDate: project.endDate,
    projectLeadName: project.projectLead?.name || null,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {project.parent && (
            <Link
              href={`/projects/${project.parent.id}`}
              className="mb-1 inline-block text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              ↑ Part of {project.parent.name}
            </Link>
          )}
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{project.name}</h1>
            {project.code && <span className="text-sm text-neutral-400">{project.code}</span>}
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {project.customerName ? `Customer: ${project.customerName}` : "No customer set"}
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {project.projectLead ? `Lead: ${project.projectLead.name}` : "No project lead set"} · {formatDate(project.startDate)} – {formatDate(project.endDate)}
          </p>
          <EditProjectForm
            project={{
              id: project.id,
              name: project.name,
              customerName: project.customerName,
              description: project.description,
              status: project.status,
              startDate: toDateInputValue(project.startDate),
              endDate: toDateInputValue(project.endDate),
              projectLeadName: project.projectLead?.name ?? null,
            }}
          />
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <p className="text-xs text-neutral-400">Priority score</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{priorityScore}</p>
          </div>
          <div className="flex items-center gap-2">
            <EditProjectForm project={editProjectData} />
            <a
              href={`/api/projects/${project.id}/export`}
              className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
            >
              Export PDF
            </a>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Sub-projects
          </h2>
          <NewProjectForm parentId={project.id} parentName={project.name} />
        </div>
        {subProjects.length === 0 ? (
          <p className="text-sm text-neutral-400">No sub-projects yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            {subProjects.map((sub) => (
              <li key={sub.id}>
                <Link
                  href={`/projects/${sub.id}`}
                  className="flex items-center justify-between gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-neutral-900 dark:text-neutral-100">{sub.name}</span>
                      {sub.code && <span className="flex-shrink-0 text-xs text-neutral-400">{sub.code}</span>}
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {sub.customerName ? `Customer: ${sub.customerName}` : "No customer set"}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {sub.projectLead ? `Lead: ${sub.projectLead.name}` : "No project lead set"} ·{" "}
                      {formatDate(sub.startDate)} – {formatDate(sub.endDate)}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[sub.status]}`}
                  >
                    {STATUS_LABEL[sub.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Import tasks
        </h2>
        <UploadTasksForm projectId={project.id} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Task tree
        </h2>
        <TaskTree projectId={project.id} tasks={project.tasks} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Timeline
        </h2>
        <TimelineAxis
          tasks={timelineTasks}
          events={project.historyEvents}
          projectStartDate={project.startDate}
          projectEndDate={project.endDate}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Work breakdown
        </h2>
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <TaskStatusBarChart tasks={project.tasks} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          People
        </h2>
        {project.people.length === 0 ? (
          <p className="text-sm text-neutral-400">No team members recorded yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            {project.people.map((personProject) => (
              <li key={personProject.id} className="flex items-center justify-between px-4 py-2 text-sm">
                <span className="text-neutral-900 dark:text-neutral-100">{personProject.person.name}</span>
                <span className="text-neutral-500 dark:text-neutral-400">{personProject.roleOnProject ?? "—"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

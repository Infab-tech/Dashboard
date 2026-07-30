import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { computePriorityScore } from "@/lib/projects/priority-score";
import { TaskTree } from "@/components/projects/TaskTree";
import { TimelineAxis, type TimelineTask } from "@/components/projects/TimelineAxis";
import { TaskStatusBarChart } from "@/components/projects/TaskStatusBarChart";
import { UploadTasksForm } from "@/components/projects/UploadTasksForm";

// Task tree, timeline, and priority score change on every upload/edit — never prerender this page.
export const dynamic = "force-dynamic";

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

  const priorityScore = computePriorityScore(project);
  const timelineTasks: TimelineTask[] = project.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    dueDate: task.dueDate,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{project.name}</h1>
            {project.code && <span className="text-sm text-neutral-400">{project.code}</span>}
          </div>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {project.projectLead ? `Lead: ${project.projectLead.name}` : "No project lead set"} · {formatDate(project.startDate)} – {formatDate(project.endDate)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-neutral-400">Priority score</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{priorityScore}</p>
          </div>
          <a
            href={`/api/projects/${project.id}/export`}
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
          >
            Export PDF
          </a>
        </div>
      </div>

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

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, type MouseEvent } from "react";
import type { ProjectStatus } from "@prisma/client";
import { deleteProject } from "@/lib/actions/projects";
import { NewProjectForm } from "./NewProjectForm";

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
  // Pinned locale (not the runtime default) — server/browser locale can
  // differ, which causes a hydration mismatch on a client component.
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export interface SubProjectSummary {
  id: string;
  name: string;
  code: string | null;
  customerName: string;
  status: ProjectStatus;
  startDate: Date | null;
  endDate: Date | null;
  projectLeadName: string | null;
}

export interface ProjectCardProps {
  id: string;
  name: string;
  code: string | null;
  customerName: string;
  status: ProjectStatus;
  startDate: Date | null;
  endDate: Date | null;
  projectLeadName: string | null;
  subProjects?: SubProjectSummary[];
}

export function ProjectCard({
  id,
  name,
  code,
  customerName,
  status,
  startDate,
  endDate,
  projectLeadName,
  subProjects = [],
}: ProjectCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // childCount known (top-level row) -> exact warning; undefined (nested row) ->
  // generic wording, since we don't fetch grandchild sub-projects in this list view.
  const handleDelete = (e: MouseEvent, targetId: string, targetName: string, childCount?: number) => {
    e.preventDefault();
    e.stopPropagation();
    const warning =
      childCount === undefined
        ? " If it has its own sub-projects, those go too."
        : childCount > 0
          ? ` This also deletes ${childCount} sub-project${childCount === 1 ? "" : "s"} and everything tied to them (tasks, financials, etc.).`
          : " This removes the project and everything tied to it (tasks, financials, etc.).";
    if (!confirm(`Delete "${targetName}"?${warning} This can't be undone.`)) return;
    startTransition(async () => {
      await deleteProject(targetId);
      router.refresh();
    });
  };

  return (
    <div className="rounded-lg border border-neutral-200 transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600">
      <div className="flex items-center justify-between gap-4 p-4">
        <Link href={`/projects/${id}`} className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-medium text-neutral-900 dark:text-neutral-100">{name}</h3>
            {code && <span className="flex-shrink-0 text-xs text-neutral-400">{code}</span>}
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {customerName ? `Customer: ${customerName}` : "No customer set"}
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {projectLeadName ? `Lead: ${projectLeadName}` : "No project lead set"} · {formatDate(startDate)} →{" "}
            {formatDate(endDate)}
          </p>
        </Link>
        <div className="flex flex-shrink-0 items-center gap-3">
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[status]}`}>
            {STATUS_LABEL[status]}
          </span>
          <button
            type="button"
            onClick={(e) => handleDelete(e, id, name, subProjects.length)}
            disabled={isPending}
            title="Delete project"
            className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            {isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      <div className="px-4 pb-3">
        <NewProjectForm parentId={id} parentName={name} />
      </div>

      {subProjects.length > 0 && (
        <div className="divide-y divide-neutral-100 border-t border-neutral-200 dark:divide-neutral-900 dark:border-neutral-800">
          {subProjects.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between gap-4 py-2 pl-8 pr-4">
              <Link href={`/projects/${sub.id}`} className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    ↳ {sub.name}
                  </span>
                  {sub.code && <span className="flex-shrink-0 text-xs text-neutral-400">{sub.code}</span>}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {sub.customerName ? `Customer: ${sub.customerName}` : "No customer set"} ·{" "}
                  {sub.projectLeadName ? `Lead: ${sub.projectLeadName}` : "No project lead set"} ·{" "}
                  {formatDate(sub.startDate)} → {formatDate(sub.endDate)}
                </p>
              </Link>
              <div className="flex flex-shrink-0 items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[sub.status]}`}>
                  {STATUS_LABEL[sub.status]}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, sub.id, sub.name)}
                  disabled={isPending}
                  title="Delete sub-project"
                  className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import type { ProjectStatus } from "@prisma/client";

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
  return new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export interface ProjectCardProps {
  id: string;
  name: string;
  code: string | null;
  status: ProjectStatus;
  endDate: Date | null;
  priorityScore: number;
  projectLeadName: string | null;
}

export function ProjectCard({ id, name, code, status, endDate, priorityScore, projectLeadName }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${id}`}
      className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 p-4 transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium text-neutral-900 dark:text-neutral-100">{name}</h3>
          {code && <span className="flex-shrink-0 text-xs text-neutral-400">{code}</span>}
        </div>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {projectLeadName ? `Lead: ${projectLeadName}` : "No project lead set"} · Ends {formatDate(endDate)}
        </p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-3">
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[status]}`}>
          {STATUS_LABEL[status]}
        </span>
        <div className="text-right">
          <p className="text-xs text-neutral-400">Priority</p>
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{priorityScore}</p>
        </div>
      </div>
    </Link>
  );
}

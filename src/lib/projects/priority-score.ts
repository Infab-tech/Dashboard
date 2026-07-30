import type { Project, ProjectStatus, WorkflowTask, Milestone } from "@prisma/client";

/** Tunable weights for the three scoring components — must sum to 1. */
export const PRIORITY_WEIGHTS = {
  overdueUrgency: 0.4,
  workRemaining: 0.35,
  endDateProximity: 0.25,
} as const;

const NEAR_DUE_WINDOW_DAYS = 7;
const END_DATE_RAMP_DAYS = 90;

export type ProjectForScoring = Pick<Project, "endDate"> & {
  tasks: Pick<WorkflowTask, "status" | "dueDate">[];
  milestones: Pick<Milestone, "completedAt" | "dueDate">[];
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(from: Date, to: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / msPerDay);
}

/** A: overdue/near-due urgency, pooling tasks and milestones that aren't done yet. */
function computeUrgencyScore(project: ProjectForScoring, now: Date): number {
  let overdueCount = 0;
  let nearDueCount = 0;

  for (const task of project.tasks) {
    if (task.status === "DONE" || !task.dueDate) continue;
    const days = daysBetween(now, task.dueDate);
    if (days < 0) overdueCount++;
    else if (days <= NEAR_DUE_WINDOW_DAYS) nearDueCount++;
  }

  for (const milestone of project.milestones) {
    if (milestone.completedAt || !milestone.dueDate) continue;
    const days = daysBetween(now, milestone.dueDate);
    if (days < 0) overdueCount++;
    else if (days <= NEAR_DUE_WINDOW_DAYS) nearDueCount++;
  }

  return Math.min(100, overdueCount * 15 + nearDueCount * 5);
}

/** B: % of work remaining, flattened across the whole task tree by status. */
function computeWorkRemainingScore(project: ProjectForScoring): number {
  const total = project.tasks.length;
  if (total === 0) return 0;
  const incomplete = project.tasks.filter((task) => task.status !== "DONE").length;
  return (incomplete / total) * 100;
}

/** C: how close the project's own end date is (90-day linear ramp). */
function computeEndDateProximityScore(project: ProjectForScoring, now: Date): number {
  if (!project.endDate) return 0;
  const days = daysBetween(now, project.endDate);
  if (days <= 0) return 100;
  if (days >= END_DATE_RAMP_DAYS) return 0;
  return (100 * (END_DATE_RAMP_DAYS - days)) / END_DATE_RAMP_DAYS;
}

/** Combined 0-100 priority score — higher means needs more attention. */
export function computePriorityScore(project: ProjectForScoring, now: Date = new Date()): number {
  const score =
    PRIORITY_WEIGHTS.overdueUrgency * computeUrgencyScore(project, now) +
    PRIORITY_WEIGHTS.workRemaining * computeWorkRemainingScore(project) +
    PRIORITY_WEIGHTS.endDateProximity * computeEndDateProximityScore(project, now);
  return Math.round(score);
}

export type ProjectForListing = ProjectForScoring & {
  id: string;
  status: ProjectStatus;
  startDate: Date | null;
};

const STATUS_GROUP_ORDER: ProjectStatus[] = ["ONGOING", "ON_HOLD", "PLANNED", "COMPLETED"];

/**
 * Groups projects by status in the fixed order Ongoing -> On Hold -> Planned -> Completed,
 * sorting each group by what needs the most attention: Ongoing/On Hold by priority score
 * (desc), Planned by start date (asc, nothing to score yet), Completed by end date (desc).
 */
export function groupAndSortProjects<T extends ProjectForListing>(
  projects: T[],
  now: Date = new Date(),
): { status: ProjectStatus; projects: (T & { priorityScore: number })[] }[] {
  const scored = projects.map((project) => ({
    ...project,
    priorityScore: computePriorityScore(project, now),
  }));

  return STATUS_GROUP_ORDER.map((status) => {
    const group = scored.filter((project) => project.status === status);

    if (status === "PLANNED") {
      group.sort((a, b) => (a.startDate?.getTime() ?? Infinity) - (b.startDate?.getTime() ?? Infinity));
    } else if (status === "COMPLETED") {
      group.sort((a, b) => (b.endDate?.getTime() ?? 0) - (a.endDate?.getTime() ?? 0));
    } else {
      group.sort((a, b) => b.priorityScore - a.priorityScore);
    }

    return { status, projects: group };
  }).filter((group) => group.projects.length > 0);
}

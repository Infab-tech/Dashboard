import type { ProjectStatus } from "@prisma/client";
import { ProjectCard, type ProjectCardProps } from "./ProjectCard";

const GROUP_LABEL: Record<ProjectStatus, string> = {
  ONGOING: "Ongoing",
  ON_HOLD: "On Hold",
  PLANNED: "Planned",
  COMPLETED: "Completed",
};

export interface ProjectListGroup {
  status: ProjectStatus;
  projects: ProjectCardProps[];
}

/** Renders each status group in the fixed order Ongoing -> On Hold -> Planned -> Completed. */
export function ProjectList({ groups }: { groups: ProjectListGroup[] }) {
  if (groups.length === 0) {
    return <p className="text-sm text-neutral-400">No projects yet.</p>;
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.status} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {GROUP_LABEL[group.status]} ({group.projects.length})
          </h2>
          <div className="space-y-2">
            {group.projects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

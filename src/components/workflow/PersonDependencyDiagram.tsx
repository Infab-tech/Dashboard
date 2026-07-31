"use client";

import { useState } from "react";
import {
  buildPersonDependencyGraph,
  type DependencyTaskInput,
} from "@/lib/workflow/person-dependencies";
import { circleEdgePath, curveDirFor } from "@/lib/diagram/svg-edges";

const NODE_RADIUS = 34;
const PADDING = 60;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

/** Places every person evenly around a circle — there's no tree/hierarchy among
 * people the way there is for tasks, so a ring (rather than a hub-and-spoke
 * layout) is the simplest arrangement that scales with headcount. */
function layoutCircle(personIds: string[]) {
  const positions = new Map<string, { x: number; y: number }>();
  const n = personIds.length;
  if (n === 0) return { positions, width: 0, height: 0 };

  if (n === 1) {
    const size = NODE_RADIUS * 2 + PADDING * 2;
    positions.set(personIds[0], { x: size / 2, y: size / 2 });
    return { positions, width: size, height: size };
  }

  const minGap = NODE_RADIUS * 2 + 20;
  const ringRadius = Math.max(140, (n * minGap) / (2 * Math.PI));
  const center = ringRadius + NODE_RADIUS + PADDING;
  personIds.forEach((id, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    positions.set(id, {
      x: center + ringRadius * Math.cos(angle),
      y: center + ringRadius * Math.sin(angle),
    });
  });
  return { positions, width: center * 2, height: center * 2 };
}

/**
 * Person-level dependency flow diagram for one project: each person who owns
 * a task is a circle on a ring; a curved arrow from A to B means A depends
 * on B to complete one or more tasks (see `buildPersonDependencyGraph`).
 * Clicking a person shows exactly who they're waiting on and who's waiting
 * on them, with the task title(s) behind each link.
 */
export function PersonDependencyDiagram({ tasks }: { tasks: DependencyTaskInput[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { people, edges } = buildPersonDependencyGraph(tasks);
  const { positions, width, height } = layoutCircle(people.map((p) => p.id));

  if (people.length === 0) {
    return (
      <p className="text-sm text-neutral-400">
        No task dependencies with assigned people yet — assign tasks to people and set
        &quot;depends on&quot; links in the task tree to see who&apos;s waiting on whom.
      </p>
    );
  }

  const selected = people.find((p) => p.id === selectedId) ?? null;
  const dependsOn = selected ? edges.filter((e) => e.dependentPersonId === selected.id) : [];
  const blocking = selected ? edges.filter((e) => e.blockerPersonId === selected.id) : [];
  const personById = new Map(people.map((p) => [p.id, p]));

  return (
    <div className="space-y-3">
      <div
        className="overflow-auto rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
        style={{ maxHeight: 460 }}
      >
        <div className="relative" style={{ width, height }}>
          <svg className="pointer-events-none absolute inset-0" width={width} height={height}>
            <defs>
              <marker
                id="workflow-depends-arrow"
                viewBox="0 0 10 10"
                refX="8.5"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 z" className="fill-amber-500" />
              </marker>
            </defs>

            {edges.map((edge) => {
              const from = positions.get(edge.dependentPersonId);
              const to = positions.get(edge.blockerPersonId);
              if (!from || !to) return null;
              const isHighlighted =
                selectedId != null &&
                (edge.dependentPersonId === selectedId || edge.blockerPersonId === selectedId);
              return (
                <path
                  key={`${edge.dependentPersonId}-${edge.blockerPersonId}`}
                  d={circleEdgePath(
                    from.x,
                    from.y,
                    NODE_RADIUS,
                    to.x,
                    to.y,
                    NODE_RADIUS,
                    curveDirFor(edge.dependentPersonId, edge.blockerPersonId),
                  )}
                  fill="none"
                  markerEnd="url(#workflow-depends-arrow)"
                  className={isHighlighted ? "stroke-amber-500" : "stroke-amber-300 dark:stroke-amber-800"}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                />
              );
            })}
          </svg>

          {people.map((person) => {
            const pos = positions.get(person.id);
            if (!pos) return null;
            const isSelected = person.id === selectedId;
            const size = NODE_RADIUS * 2;
            return (
              <button
                key={person.id}
                type="button"
                onClick={() => setSelectedId(isSelected ? null : person.id)}
                title={person.name}
                className={`absolute flex items-center justify-center rounded-full border-2 bg-white text-center shadow-sm transition-shadow hover:shadow-md dark:bg-neutral-900 ${
                  isSelected
                    ? "border-neutral-900 ring-2 ring-neutral-900 dark:border-neutral-100 dark:ring-neutral-100"
                    : "border-neutral-300 dark:border-neutral-700"
                }`}
                style={{ left: pos.x - NODE_RADIUS, top: pos.y - NODE_RADIUS, width: size, height: size }}
              >
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  {initials(person.name)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
        <span className="flex items-center gap-1.5">
          <svg width="20" height="8">
            <line x1="0" y1="4" x2="20" y2="4" className="stroke-amber-500" strokeWidth={2} />
          </svg>
          Arrow points at who&apos;s depended on
        </span>
        <span>Click a person for details</span>
      </div>

      {selected && (
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
            {selected.name}
            {selected.title && <span className="ml-2 text-sm font-normal text-neutral-400">{selected.title}</span>}
          </h3>

          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Depends on
              </p>
              {dependsOn.length === 0 ? (
                <p className="mt-1 text-sm text-neutral-400">Not blocked by anyone.</p>
              ) : (
                <ul className="mt-1 space-y-2">
                  {dependsOn.map((edge) => {
                    const blocker = personById.get(edge.blockerPersonId);
                    return (
                      <li key={edge.blockerPersonId} className="text-sm">
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">{blocker?.name}</span>
                        <span className="text-neutral-400"> — to complete: </span>
                        {edge.tasks.map((t) => t.title).join(", ")}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Blocking
              </p>
              {blocking.length === 0 ? (
                <p className="mt-1 text-sm text-neutral-400">Not blocking anyone.</p>
              ) : (
                <ul className="mt-1 space-y-2">
                  {blocking.map((edge) => {
                    const dependent = personById.get(edge.dependentPersonId);
                    return (
                      <li key={edge.dependentPersonId} className="text-sm">
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">{dependent?.name}</span>
                        <span className="text-neutral-400"> — needs this for: </span>
                        {edge.tasks.map((t) => t.title).join(", ")}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ProjectStatus, TaskHistoryEventType, TaskStatus } from "@prisma/client";
import {
  computeBarPosition,
  computeGanttBounds,
  flattenWithDepth,
  type DatedTask,
  type TreeableTask,
} from "@/lib/projects/task-tree";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica" },
  h1: { fontSize: 18, marginBottom: 4 },
  subtitle: { fontSize: 9, color: "#737373", marginBottom: 12 },
  h2: {
    fontSize: 13,
    marginTop: 16,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d4",
    paddingBottom: 2,
  },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap" },
  summaryItem: { width: "25%", marginBottom: 8 },
  label: { fontSize: 8, color: "#737373", textTransform: "uppercase" },
  value: { fontSize: 11, marginTop: 2 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e5e5", paddingVertical: 4 },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#171717",
    paddingVertical: 4,
    fontFamily: "Helvetica-Bold",
  },
  colTitle: { width: "34%" },
  colStatus: { width: "14%" },
  colAssignee: { width: "18%" },
  colDue: { width: "16%" },
  colPercent: { width: "18%" },
  ganttRow: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  ganttLabel: { width: "30%", fontSize: 8 },
  ganttTrack: { flexGrow: 1, height: 8, backgroundColor: "#f5f5f5", position: "relative" },
  ganttBar: { position: "absolute", top: 0, height: 8 },
  historyRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e5e5", paddingVertical: 3, fontSize: 9 },
  emptyNote: { fontSize: 9, color: "#a3a3a3" },
});

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  BLOCKED: "Blocked",
  DELAYED: "Delayed",
  DONE: "Done",
};

const STATUS_BAR_COLOR: Record<TaskStatus, string> = {
  TODO: "#a3a3a3",
  IN_PROGRESS: "#3b82f6",
  BLOCKED: "#ef4444",
  DELAYED: "#f59e0b",
  DONE: "#10b981",
};

export interface ReportTask extends TreeableTask, DatedTask {
  title: string;
  status: TaskStatus;
  percentComplete: number;
  assigneeName: string | null;
}

export interface ReportHistoryEvent {
  taskTitlePath: string;
  eventType: TaskHistoryEventType;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus | null;
  occurredOn: Date;
}

export interface ReportPerson {
  name: string;
  role: string | null;
}

export interface ProjectReportData {
  name: string;
  code: string | null;
  status: ProjectStatus;
  startDate: Date | null;
  endDate: Date | null;
  projectLeadName: string | null;
  priorityScore: number;
  tasks: ReportTask[];
  recentHistory: ReportHistoryEvent[];
  people: ReportPerson[];
  generatedAt: Date;
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/**
 * Static (non-interactive) PDF report — flattens the tree with indentation
 * rather than trying to reproduce collapse/expand, and represents the daily
 * activity strip as a recent-history table instead of re-plotting a chart in a
 * static layout engine. The Gantt section reuses the same bounds/position math
 * as the on-screen GanttChart component so the two stay visually consistent.
 */
export function ProjectReportDocument({ data }: { data: ProjectReportData }) {
  const bounds = computeGanttBounds(data.tasks);
  const flatTasks = flattenWithDepth(data.tasks);
  const overallPercent =
    data.tasks.length === 0
      ? 0
      : Math.round(data.tasks.reduce((sum, task) => sum + task.percentComplete, 0) / data.tasks.length);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{data.name}</Text>
        <Text style={styles.subtitle}>
          {data.code ? `${data.code} — ` : ""}Generated {formatDate(data.generatedAt)}
        </Text>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{data.status}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Priority score</Text>
            <Text style={styles.value}>{data.priorityScore} / 100</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Start date</Text>
            <Text style={styles.value}>{formatDate(data.startDate)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>End date</Text>
            <Text style={styles.value}>{formatDate(data.endDate)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Project lead</Text>
            <Text style={styles.value}>{data.projectLeadName ?? "—"}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Overall % complete</Text>
            <Text style={styles.value}>{overallPercent}%</Text>
          </View>
        </View>

        <Text style={styles.h2}>Tasks</Text>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.colTitle}>Task</Text>
          <Text style={styles.colStatus}>Status</Text>
          <Text style={styles.colAssignee}>Assignee</Text>
          <Text style={styles.colDue}>Due</Text>
          <Text style={styles.colPercent}>% Complete</Text>
        </View>
        {flatTasks.length === 0 ? (
          <Text style={styles.emptyNote}>No tasks recorded.</Text>
        ) : (
          flatTasks.map(({ task, depth }) => (
            <View key={task.id} style={styles.tableRow}>
              <Text style={[styles.colTitle, { paddingLeft: depth * 10 }]}>{task.title}</Text>
              <Text style={styles.colStatus}>{STATUS_LABEL[task.status]}</Text>
              <Text style={styles.colAssignee}>{task.assigneeName ?? "—"}</Text>
              <Text style={styles.colDue}>{formatDate(task.dueDate)}</Text>
              <Text style={styles.colPercent}>{task.percentComplete}%</Text>
            </View>
          ))
        )}

        {bounds && (
          <>
            <Text style={styles.h2}>Timeline</Text>
            {flatTasks.map(({ task }) => {
              const position = computeBarPosition(bounds, task);
              return (
                <View key={task.id} style={styles.ganttRow}>
                  <Text style={styles.ganttLabel}>{task.title}</Text>
                  <View style={styles.ganttTrack}>
                    {position && (
                      <View
                        style={[
                          styles.ganttBar,
                          {
                            left: `${position.leftPct}%`,
                            width: `${position.widthPct}%`,
                            backgroundColor: STATUS_BAR_COLOR[task.status],
                          },
                        ]}
                      />
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}

        <Text style={styles.h2}>Recent activity</Text>
        {data.recentHistory.length === 0 ? (
          <Text style={styles.emptyNote}>No recorded activity yet.</Text>
        ) : (
          data.recentHistory.map((event, i) => (
            <View key={i} style={styles.historyRow}>
              <Text style={{ width: "18%" }}>{formatDate(event.occurredOn)}</Text>
              <Text style={{ width: "42%" }}>{event.taskTitlePath}</Text>
              <Text style={{ width: "40%" }}>
                {event.eventType === "STATUS_CHANGED"
                  ? `${event.fromStatus ? STATUS_LABEL[event.fromStatus] : "—"} → ${
                      event.toStatus ? STATUS_LABEL[event.toStatus] : "—"
                    }`
                  : event.eventType}
              </Text>
            </View>
          ))
        )}

        <Text style={styles.h2}>People</Text>
        {data.people.length === 0 ? (
          <Text style={styles.emptyNote}>No team members recorded.</Text>
        ) : (
          data.people.map((person, i) => (
            <View key={i} style={styles.historyRow}>
              <Text style={{ width: "50%" }}>{person.name}</Text>
              <Text style={{ width: "50%" }}>{person.role ?? "—"}</Text>
            </View>
          ))
        )}
      </Page>
    </Document>
  );
}

import ExcelJS from "exceljs";
import type { TaskStatus } from "@prisma/client";

/**
 * Pure parsing layer for the project task-tree Excel upload — no Prisma import,
 * so the row-walking/mapping logic can be reasoned about (and unit tested) in
 * isolation from the DB transaction that applies it (see apply-import.ts).
 */

const REQUIRED_COLUMNS = [
  "Project Name",
  "Task",
  "Subtask",
  "Status",
  "Assignee",
  "Project Lead",
  "Start Date",
  "Due Date",
  "% Complete",
  "Notes",
] as const;

type ColumnName = (typeof REQUIRED_COLUMNS)[number];

export interface ParsedTaskRow {
  /** Full ancestry path, e.g. "Design Set > Prop Sourcing" — used to diff across re-uploads. */
  pathKey: string;
  parentPathKey: string | null;
  title: string;
  status: TaskStatus;
  assigneeName: string | null;
  startDate: Date | null;
  dueDate: Date | null;
  percentComplete: number;
  notes: string | null;
}

export interface ParsedImport {
  projectNameHint: string | null;
  projectLeadName: string | null;
  rows: ParsedTaskRow[];
  warnings: string[];
}

export type ParseResult = { ok: true; data: ParsedImport } | { ok: false; errors: string[] };

const STATUS_ALIASES: Record<string, TaskStatus> = {
  "": "TODO",
  "todo": "TODO",
  "to do": "TODO",
  "not started": "TODO",
  "pending": "TODO",
  "in progress": "IN_PROGRESS",
  "in-progress": "IN_PROGRESS",
  "ongoing": "IN_PROGRESS",
  "blocked": "BLOCKED",
  "delayed": "DELAYED",
  "late": "DELAYED",
  "done": "DONE",
  "complete": "DONE",
  "completed": "DONE",
  "finished": "DONE",
};

function resolveCellValue(raw: ExcelJS.CellValue): unknown {
  if (raw != null && typeof raw === "object" && !(raw instanceof Date)) {
    if ("richText" in raw && Array.isArray((raw as ExcelJS.CellRichTextValue).richText)) {
      return (raw as ExcelJS.CellRichTextValue).richText.map((part) => part.text).join("");
    }
    if ("result" in raw) return resolveCellValue((raw as ExcelJS.CellFormulaValue).result as ExcelJS.CellValue);
    if ("text" in raw) return (raw as ExcelJS.CellHyperlinkValue).text;
  }
  return raw;
}

function cellToString(raw: ExcelJS.CellValue): string {
  const value = resolveCellValue(raw);
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function resolveStatus(raw: string, warnings: string[], rowNumber: number): TaskStatus {
  const key = raw.trim().toLowerCase();
  const status = STATUS_ALIASES[key];
  if (status) return status;
  warnings.push(`Row ${rowNumber}: unrecognized status "${raw}", defaulting to To Do.`);
  return "TODO";
}

function parseDateCell(raw: ExcelJS.CellValue, warnings: string[], rowNumber: number, label: string): Date | null {
  const value = resolveCellValue(raw);
  if (value == null || value === "") return null;
  if (value instanceof Date) return value;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    warnings.push(`Row ${rowNumber}: could not parse ${label} value "${String(value)}" as a date — left blank.`);
    return null;
  }
  return parsed;
}

function parsePercent(raw: ExcelJS.CellValue, numFmt: string | undefined): number {
  const value = resolveCellValue(raw);
  if (value == null || value === "") return 0;
  if (typeof value === "number") {
    const isFractionFormat = numFmt?.includes("%") ?? false;
    const scaled = isFractionFormat ? value * 100 : value;
    return Math.min(100, Math.max(0, Math.round(scaled)));
  }
  const numeric = parseFloat(String(value).trim().replace(/%$/, ""));
  if (Number.isNaN(numeric)) return 0;
  return Math.min(100, Math.max(0, Math.round(numeric)));
}

function buildColumnMap(headerRow: ExcelJS.Row): Map<ColumnName, number> | string[] {
  const found = new Map<string, number>();
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    found.set(cellToString(cell.value).trim().toLowerCase(), colNumber);
  });

  const map = new Map<ColumnName, number>();
  const missing: string[] = [];
  for (const name of REQUIRED_COLUMNS) {
    const idx = found.get(name.toLowerCase());
    if (idx == null) missing.push(name);
    else map.set(name, idx);
  }
  return missing.length > 0 ? missing : map;
}

export async function parseProjectExcel(buffer: Buffer): Promise<ParseResult> {
  const workbook = new ExcelJS.Workbook();
  // exceljs's own .d.ts declares an ambient `Buffer extends ArrayBuffer` that
  // shadows Node's real Buffer type for this one call signature — cast at just
  // this boundary rather than weakening our function's public Buffer type.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await workbook.xlsx.load(buffer as any);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return { ok: false, errors: ["The workbook has no sheets."] };
  }

  const columnMapResult = buildColumnMap(sheet.getRow(1));
  if (Array.isArray(columnMapResult)) {
    return { ok: false, errors: [`Missing required column(s): ${columnMapResult.join(", ")}`] };
  }
  const columns = columnMapResult;
  const col = (name: ColumnName) => columns.get(name)!;

  const rows: ParsedTaskRow[] = [];
  const warnings: string[] = [];
  const rowErrors: string[] = [];
  let lastTaskPathKey: string | null = null;
  let projectNameHint: string | null = null;
  let projectLeadName: string | null = null;

  const lastRowNumber = sheet.lastRow?.number ?? 1;
  for (let rowNumber = 2; rowNumber <= lastRowNumber; rowNumber++) {
    const row = sheet.getRow(rowNumber);
    if (row.cellCount === 0) continue;

    const projectNameCell = cellToString(row.getCell(col("Project Name")).value).trim();
    const taskCell = cellToString(row.getCell(col("Task")).value).trim();
    const subtaskCell = cellToString(row.getCell(col("Subtask")).value).trim();
    const statusCell = cellToString(row.getCell(col("Status")).value).trim();
    const assigneeCell = cellToString(row.getCell(col("Assignee")).value).trim();
    const leadCell = cellToString(row.getCell(col("Project Lead")).value).trim();
    const startDateRaw = row.getCell(col("Start Date")).value;
    const dueDateRaw = row.getCell(col("Due Date")).value;
    const percentCell = row.getCell(col("% Complete"));
    const notesCell = cellToString(row.getCell(col("Notes")).value).trim();

    const isBlankRow =
      !projectNameCell &&
      !taskCell &&
      !subtaskCell &&
      !statusCell &&
      !assigneeCell &&
      !leadCell &&
      !startDateRaw &&
      !dueDateRaw &&
      !percentCell.value &&
      !notesCell;
    if (isBlankRow) continue;

    if (projectNameCell && !projectNameHint) projectNameHint = projectNameCell;
    if (leadCell) {
      if (!projectLeadName) projectLeadName = leadCell;
      else if (projectLeadName !== leadCell) {
        warnings.push(
          `Row ${rowNumber}: Project Lead "${leadCell}" differs from the earlier value "${projectLeadName}" — keeping the first one seen.`,
        );
      }
    }

    let pathKey: string;
    let parentPathKey: string | null;
    let title: string;

    if (taskCell) {
      pathKey = taskCell;
      parentPathKey = null;
      title = taskCell;
      lastTaskPathKey = pathKey;
    } else if (subtaskCell) {
      if (!lastTaskPathKey) {
        rowErrors.push(`Row ${rowNumber}: Subtask "${subtaskCell}" has no preceding Task row to attach to.`);
        continue;
      }
      parentPathKey = lastTaskPathKey;
      pathKey = `${lastTaskPathKey} > ${subtaskCell}`;
      title = subtaskCell;
    } else {
      rowErrors.push(`Row ${rowNumber}: neither Task nor Subtask is filled in, but other columns have data.`);
      continue;
    }

    const status = resolveStatus(statusCell, warnings, rowNumber);
    const startDate = parseDateCell(startDateRaw, warnings, rowNumber, "Start Date");
    const dueDate = parseDateCell(dueDateRaw, warnings, rowNumber, "Due Date");
    const percentComplete = status === "DONE" ? 100 : parsePercent(percentCell.value, percentCell.numFmt);

    rows.push({
      pathKey,
      parentPathKey,
      title,
      status,
      assigneeName: assigneeCell || null,
      startDate,
      dueDate,
      percentComplete,
      notes: notesCell || null,
    });
  }

  if (rowErrors.length > 0) {
    return { ok: false, errors: rowErrors };
  }

  return { ok: true, data: { projectNameHint, projectLeadName, rows, warnings } };
}

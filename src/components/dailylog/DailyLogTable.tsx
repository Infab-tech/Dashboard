"use client"

import Link from "next/link";
import { deleteDailyLog } from "@/lib/actions/dailylog";

type DailyLogDetailed = {
  id: string;
  date: Date;
  serialNo: number | null;
  projectName: string;
  task: string;
  assignedTo: string;
  targetDateOrStatus: string | null;
  remarks: string | null;
  project: { name: string } | null;
};

export function DailyLogTable({ logs }: { logs: DailyLogDetailed[] }) {
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this log entry?")) {
      await deleteDailyLog(id);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit"
    });
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-800 text-white">
          <tr>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Sl. No.</th>
            <th className="px-4 py-3 font-semibold">Project</th>
            <th className="px-4 py-3 font-semibold w-1/4">Task</th>
            <th className="px-4 py-3 font-semibold">Assigned To</th>
            <th className="px-4 py-3 font-semibold">Target Date / Status</th>
            <th className="px-4 py-3 font-semibold w-1/4">Remarks</th>
            <th className="px-4 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {logs.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                No daily logs found.
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                  {formatDate(log.date)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {log.serialNo || "-"}
                </td>
                <td className="px-4 py-3 text-gray-900 font-medium">
                  {log.projectName}
                </td>
                <td className="px-4 py-3 text-gray-700 whitespace-pre-wrap">
                  {log.task}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {log.assignedTo}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {log.targetDateOrStatus || "-"}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-pre-wrap text-xs">
                  {log.remarks || "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/daily-log/${log.id}`}
                      className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

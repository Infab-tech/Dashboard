"use client"

import Link from "next/link";
import { useState } from "react";
import { deleteDailyLog } from "@/lib/actions/dailylog";

type DailyLogDetailed = {
  id: string;
  date: Date;
  serialNo: number | null;
  projectName: string;
  task: string;
  assignees: { id: string; name: string }[];
  targetDateOrStatus: string | null;
  remarks: string | null;
  project: { name: string } | null;
};

export function DailyLogTable({ logs }: { logs: DailyLogDetailed[] }) {
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this log entry?")) {
      await deleteDailyLog(id);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // Group logs by formatted date
  const groupedLogs: Record<string, DailyLogDetailed[]> = {};
  logs.forEach(log => {
    const dateKey = formatDate(log.date);
    if (!groupedLogs[dateKey]) {
      groupedLogs[dateKey] = [];
    }
    groupedLogs[dateKey].push(log);
  });

  const dateGroups = Object.entries(groupedLogs);

  const toggleDate = (dateKey: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
  };

  if (dateGroups.length === 0) {
    return (
      <div className="rounded-lg border border-gray-300 shadow-sm bg-white p-8 text-center text-gray-500">
        No daily logs found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dateGroups.map(([dateKey, groupLogs]) => {
        const isExpanded = expandedDates[dateKey] || false;
        
        return (
          <div key={dateKey} className="rounded-lg border border-gray-300 shadow-sm bg-white overflow-hidden">
            <button
              onClick={() => toggleDate(dateKey)}
              className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-gray-900">{dateKey}</span>
                <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {groupLogs.length} tasks
                </span>
              </div>
              <svg 
                className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <div className="border-t border-gray-200 overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-[#1e3a5f] text-white">
                    <tr>
                      <th className="px-4 py-3 font-semibold border border-[#2a4d7a]">Sl. No.</th>
                      <th className="px-4 py-3 font-semibold border border-[#2a4d7a]">Project</th>
                      <th className="px-4 py-3 font-semibold w-1/4 border border-[#2a4d7a]">Task</th>
                      <th className="px-4 py-3 font-semibold border border-[#2a4d7a]">Assigned To</th>
                      <th className="px-4 py-3 font-semibold border border-[#2a4d7a]">Target Date / Status</th>
                      <th className="px-4 py-3 font-semibold w-1/4 border border-[#2a4d7a]">Remarks</th>
                      <th className="px-4 py-3 font-semibold text-right border border-[#2a4d7a]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {groupLogs.map((log, index) => {
                      const bgClass = index % 2 === 0 ? "bg-white" : "bg-gray-50";
                      
                      return (
                        <tr key={log.id} className={`${bgClass} hover:bg-blue-50 transition-colors`}>
                          <td className="px-4 py-2 text-gray-600 border border-gray-300">
                            {log.serialNo || "-"}
                          </td>
                          <td className="px-4 py-2 text-gray-900 font-medium border border-gray-300">
                            {log.projectName}
                          </td>
                          <td className="px-4 py-2 text-gray-700 whitespace-pre-wrap border border-gray-300">
                            {log.task}
                          </td>
                          <td className="px-4 py-2 text-gray-700 border border-gray-300">
                            {log.assignees.map(a => a.name).join(", ")}
                          </td>
                          <td className="px-4 py-2 text-gray-700 border border-gray-300">
                            {log.targetDateOrStatus || "-"}
                          </td>
                          <td className="px-4 py-2 text-gray-600 whitespace-pre-wrap text-xs border border-gray-300">
                            {log.remarks || "-"}
                          </td>
                          <td className="px-2 py-2 text-right align-top border border-gray-300">
                            <div className="flex justify-end gap-1">
                              <Link
                                href={`/daily-log/${log.id}`}
                                className="inline-flex items-center rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDelete(log.id)}
                                className="inline-flex items-center rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

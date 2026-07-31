"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDailyLog, updateDailyLog } from "@/lib/actions/dailylog";

type ProjectOption = { id: string; name: string };
type PersonOption = { id: string; name: string };

export function DailyLogForm({ 
  initialData, 
  projects, 
  people 
}: { 
  initialData?: any;
  projects: ProjectOption[];
  people: PersonOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const dateInput = formData.get("date") as string;
    const projectId = formData.get("projectId") as string;
    const assigneeIds = formData.getAll("assigneeIds") as string[];
    
    // Find project name for fallback/cache
    const selectedProject = projects.find(p => p.id === projectId);
    
    const data = {
      date: new Date(dateInput),
      serialNo: formData.get("serialNo") ? Number(formData.get("serialNo")) : null,
      projectName: selectedProject ? selectedProject.name : "General",
      projectId: projectId || null,
      task: formData.get("task") as string,
      assigneeIds: assigneeIds,
      targetDateOrStatus: (formData.get("targetDateOrStatus") as string) || null,
      remarks: (formData.get("remarks") as string) || null,
    };

    try {
      if (initialData) {
        await updateDailyLog(initialData.id, data);
      } else {
        await createDailyLog(data);
      }
      router.push("/daily-log");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save daily log");
      setLoading(false);
    }
  };

  const defaultDate = initialData?.date 
    ? new Date(initialData.date).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0];

  const defaultAssigneeIds = initialData?.assignees?.map((a: any) => a.id) || [];
  
  // Use local state for checkboxes
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(defaultAssigneeIds);

  const toggleAssignee = (id: string) => {
    setSelectedAssignees(prev => 
      prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
          <input
            name="date"
            type="date"
            required
            defaultValue={defaultDate}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sl. No.</label>
          <input
            name="serialNo"
            type="number"
            defaultValue={initialData?.serialNo || ""}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Project (Optional)</label>
          <select
            name="projectId"
            defaultValue={initialData?.projectId || ""}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
          >
            <option value="">No specific project / General</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-md border border-gray-200">
            {people.map(p => (
              <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
                <input
                  type="checkbox"
                  name="assigneeIds"
                  value={p.id}
                  checked={selectedAssignees.includes(p.id)}
                  onChange={() => toggleAssignee(p.id)}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-800">{p.name}</span>
              </label>
            ))}
          </div>
          {selectedAssignees.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">Please select at least one assignee.</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Task *</label>
          <textarea
            name="task"
            required
            rows={2}
            defaultValue={initialData?.task || ""}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            placeholder="Describe the task..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Date / Status</label>
          <input
            name="targetDateOrStatus"
            defaultValue={initialData?.targetDateOrStatus || ""}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            placeholder="e.g. In Progress, Done, or 06/06/26"
          />
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
        <textarea
          name="remarks"
          rows={3}
          defaultValue={initialData?.remarks || ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          placeholder="Any additional remarks..."
        />
      </div>

      {error && <p className="mb-4 text-sm text-red-600 font-medium">{error}</p>}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/daily-log")}
          className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || selectedAssignees.length === 0}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : "Save Log"}
        </button>
      </div>
    </form>
  );
}

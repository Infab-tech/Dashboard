"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createPersonalTask, toggleTaskCompletion, deletePersonalTask } from "@/lib/actions/personal-tasks";

type Task = {
  id: string;
  title: string;
  date: Date;
  isCompleted: boolean;
  dailyLogId: string | null;
  dailyLog?: {
    id: string;
    projectName: string;
    date: Date;
  } | null;
};

export function PersonalTaskList({ initialTasks, personId }: { initialTasks: Task[], personId: string }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleToggle = (taskId: string, currentStatus: boolean) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, isCompleted: !currentStatus } : t));
    startTransition(async () => {
      try {
        await toggleTaskCompletion(taskId, !currentStatus);
      } catch (err) {
        setTasks(tasks);
        alert("Error updating task");
      }
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    startTransition(async () => {
      try {
        const newTask = await createPersonalTask(personId, newTaskTitle);
        setTasks([...tasks, { ...newTask, dailyLog: null, dailyLogId: null }]);
        setNewTaskTitle("");
      } catch (err) {
        alert("Failed to add task");
      }
    });
  };

  const handleDelete = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    startTransition(async () => {
      try {
        await deletePersonalTask(taskId);
      } catch (err) {
        setTasks(tasks);
        alert("Failed to delete task");
      }
    });
  };

  const incompleteTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
  };

  const getTaskStatusLabel = (date: Date) => {
    if (isToday(new Date(date))) return null;
    if (isPast(new Date(date))) {
      return (
        <span className="ml-2 inline-flex items-center rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
          Overdue
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 bg-neutral-50/50 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">My Tasks</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleAdd} className="flex gap-2 mb-6">
            <input 
              className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="What needs to be done?" 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              disabled={isPending}
            />
            <button 
              type="submit" 
              disabled={isPending || !newTaskTitle.trim()}
              className="inline-flex h-10 items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-neutral-900/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {isPending ? "Adding..." : "Add"}
            </button>
          </form>

          <div className="space-y-3">
            {incompleteTasks.length === 0 && (
              <p className="text-sm text-neutral-500 italic text-center py-4">No pending tasks. You're all caught up!</p>
            )}
            
            {incompleteTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                <div className="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={task.isCompleted} 
                    onChange={() => handleToggle(task.id, task.isCompleted)}
                    className="mt-1 h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-neutral-900">{task.title}</span>
                    <div className="flex items-center text-xs text-neutral-500 mt-1 gap-2 flex-wrap">
                      <span>Added {formatDate(new Date(task.date))}</span>
                      {getTaskStatusLabel(task.date)}
                      
                      {task.dailyLog && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                          <Link href={`/daily-log`} className="hover:underline">
                            Daily Log: {task.dailyLog.projectName} ↗
                          </Link>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {!task.dailyLogId && (
                  <button 
                    type="button"
                    className="h-8 w-8 text-neutral-400 hover:text-red-500 transition-colors flex items-center justify-center rounded-md hover:bg-red-50" 
                    onClick={() => handleDelete(task.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {completedTasks.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white/50 opacity-75 shadow-sm">
          <div className="border-b border-neutral-200 bg-neutral-50/50 px-6 py-3">
            <h2 className="text-sm font-medium text-neutral-500">Completed Today</h2>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-2">
                  <input
                    type="checkbox"
                    checked={task.isCompleted} 
                    onChange={() => handleToggle(task.id, task.isCompleted)}
                    className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <span className="text-sm text-neutral-400 line-through">{task.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

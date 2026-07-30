"use client";

import { useState } from "react";
import { createFinancialEntry } from "@/lib/actions/financials";

export function AddFinancialEntryForm({ projects }: { projects: { id: string; name: string }[] }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    try {
      await createFinancialEntry(formData);
      setMessage({ type: "success", text: "Entry added." });
    } catch (e: unknown) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed to add entry." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Add revenue or expense</h3>
      <form action={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          name="projectId"
          required
          defaultValue=""
          className="w-full rounded-md border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="" disabled>
            Select project
          </option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as "INCOME" | "EXPENSE")}
          className="w-full rounded-md border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Revenue</option>
        </select>

        <input
          name="amount"
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="Amount"
          className="w-full rounded-md border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />

        <input
          name="entryDate"
          type="date"
          required
          className="w-full rounded-md border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />

        <input
          name="description"
          type="text"
          placeholder={type === "EXPENSE" ? "Reason for expense (required)" : "Description (optional)"}
          required={type === "EXPENSE"}
          className="w-full rounded-md border border-neutral-300 bg-white p-2 text-sm sm:col-span-2 dark:border-neutral-700 dark:bg-neutral-900"
        />

        {message && (
          <p
            className={`sm:col-span-2 text-sm ${
              message.type === "error" ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 sm:col-span-2 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {loading ? "Adding…" : "Add entry"}
        </button>
      </form>
    </div>
  );
}

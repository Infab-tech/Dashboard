"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

export function UploadTasksForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSuccessMessage(null);
    setErrors([]);
    setWarnings([]);

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const res = await fetch(`/api/projects/${projectId}/tasks/import`, { method: "POST", body: formData });
      const body = await res.json();

      if (!res.ok) {
        setErrors(body.errors ?? [body.error ?? "Import failed."]);
      } else {
        setWarnings(body.warnings ?? []);
        setSuccessMessage(`Imported ${body.tasksCreated} task${body.tasksCreated === 1 ? "" : "s"}.`);
        router.refresh();
      }

      // Reset so choosing the same file again still fires onChange.
      if (inputRef.current) inputRef.current.value = "";
    });
  };

  return (
    <div className="space-y-2 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {isPending ? "Importing…" : "Upload tasks"}
        </button>
      </div>
      <p className="text-xs text-neutral-400">
        Click, choose an .xlsx file, and it imports right away. Re-uploading replaces this
        project&apos;s entire task tree with what&apos;s in the sheet.
      </p>

      {successMessage && <p className="text-sm text-emerald-600 dark:text-emerald-400">{successMessage}</p>}

      {warnings.length > 0 && (
        <ul className="list-disc space-y-0.5 pl-5 text-sm text-amber-600 dark:text-amber-400">
          {warnings.map((warning, i) => (
            <li key={i}>{warning}</li>
          ))}
        </ul>
      )}

      {errors.length > 0 && (
        <ul className="list-disc space-y-0.5 pl-5 text-sm text-red-600 dark:text-red-400">
          {errors.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

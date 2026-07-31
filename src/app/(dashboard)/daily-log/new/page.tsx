import { DailyLogForm } from "@/components/dailylog/DailyLogForm";

export default function NewDailyLogPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Add Daily Log Entry
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Record a new task, activity, or project update.
        </p>
      </div>

      <DailyLogForm />
    </div>
  );
}

import { getDailyLogs } from "@/lib/actions/dailylog";
import { DailyLogTable } from "@/components/dailylog/DailyLogTable";
import Link from "next/link";

export default async function DailyLogPage(props: {
  searchParams?: Promise<{ query?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const logs = await getDailyLogs(query);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Daily Task Log
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track daily activities, tasks, and project status updates.
          </p>
        </div>
        <Link
          href="/daily-log/new"
          className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 transition-colors"
        >
          Add Entry
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <form className="flex max-w-md items-center gap-2">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="Search by project, task, or assigned to..."
              className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      <DailyLogTable logs={logs} />
    </div>
  );
}

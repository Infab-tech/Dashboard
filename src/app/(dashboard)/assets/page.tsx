import Link from "next/link";
import { getAssets } from "@/lib/actions/assets";
import { AssetsTable } from "@/components/assets/AssetsTable";

export default async function AssetsPage(props: { searchParams: Promise<{ query?: string }> }) {
  const searchParams = await props.searchParams;
  const query = searchParams.query || "";
  const assets = await getAssets(query);

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Assets
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Equipment and fixed assets, their status, and who they're currently assigned to.
          </p>
        </div>
        <div className="mt-4 sm:ml-4 sm:mt-0 flex gap-2 items-center">
          <form className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-gray-900">
            <input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="Search assets..."
              className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            />
            <button type="submit" className="px-3 text-gray-500 hover:text-gray-900 border-l border-gray-300 bg-gray-50 rounded-r-md">
              Search
            </button>
          </form>
          <Link
            href="/assets/new"
            className="inline-flex items-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            Add New Asset
          </Link>
        </div>
      </div>

      <AssetsTable items={assets.map(a => ({ ...a, value: a.value ? Number(a.value) : null })) as any} />
    </div>
  );
}

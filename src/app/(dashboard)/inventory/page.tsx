import Link from "next/link";
import { getInventoryItems } from "@/lib/actions/inventory";
import { InventoryTable } from "@/components/inventory/InventoryTable";

import { GlobalCategory } from "@prisma/client";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function InventoryPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const category = searchParams.category as GlobalCategory | undefined;
  const query = searchParams.query as string | undefined;

  const items = await getInventoryItems(category, query);

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Inventory
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage stock items across all projects and locations.
          </p>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:ml-4 sm:mt-0">
          <form method="GET" action="/inventory" className="relative flex items-center">
            {category && <input type="hidden" name="category" value={category} />}
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input 
              type="search" 
              name="query"
              defaultValue={query}
              placeholder="Search items..." 
              className="block w-full sm:w-64 p-2 pl-10 text-sm border border-gray-300 rounded-md bg-white focus:ring-gray-900 focus:border-gray-900" 
            />
          </form>
          <Link
            href="/inventory/new"
            className="inline-flex items-center justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            Add New Item
          </Link>
        </div>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <Link
            href={`/inventory${query ? `?query=${encodeURIComponent(query)}` : ''}`}
            className={`${!category ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            All Items
          </Link>
          <Link
            href={`/inventory?category=RAW_MATERIALS${query ? `&query=${encodeURIComponent(query)}` : ''}`}
            className={`${category === 'RAW_MATERIALS' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Raw Materials
          </Link>
          <Link
            href={`/inventory?category=BOI${query ? `&query=${encodeURIComponent(query)}` : ''}`}
            className={`${category === 'BOI' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Bought Out Items (BOI)
          </Link>
          <Link
            href={`/inventory?category=CONSUMABLES${query ? `&query=${encodeURIComponent(query)}` : ''}`}
            className={`${category === 'CONSUMABLES' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Consumables
          </Link>
          <Link
            href={`/inventory?category=FABRICATED${query ? `&query=${encodeURIComponent(query)}` : ''}`}
            className={`${category === 'FABRICATED' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Fabricated Items
          </Link>
        </nav>
      </div>

      <InventoryTable items={items} />
    </div>
  );
}

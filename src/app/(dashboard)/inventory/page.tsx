import Link from "next/link";
import { getInventoryItems } from "@/lib/actions/inventory";
import { InventoryTable } from "@/components/inventory/InventoryTable";

import { GlobalCategory } from "@prisma/client";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function InventoryPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const category = searchParams.category as GlobalCategory | undefined;

  const items = await getInventoryItems(category);

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
        <div className="mt-4 sm:ml-4 sm:mt-0">
          <Link
            href="/inventory/new"
            className="inline-flex items-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            Add New Item
          </Link>
        </div>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <Link
            href="/inventory"
            className={`${!category ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            All Items
          </Link>
          <Link
            href="/inventory?category=RAW_MATERIALS"
            className={`${category === 'RAW_MATERIALS' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Raw Materials
          </Link>
          <Link
            href="/inventory?category=BOI"
            className={`${category === 'BOI' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Bought Out Items (BOI)
          </Link>
          <Link
            href="/inventory?category=CONSUMABLES"
            className={`${category === 'CONSUMABLES' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Consumables
          </Link>
          <Link
            href="/inventory?category=FABRICATED"
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

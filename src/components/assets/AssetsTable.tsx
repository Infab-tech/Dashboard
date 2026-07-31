"use client"

import Link from "next/link";
import { deleteAsset } from "@/lib/actions/assets";

type AssetDetailed = {
  id: string;
  name: string;
  modelNumber: string | null;
  category: string | null;
  quantity: number;
  status: string;
  value: any | null;
  assignedTo: { name: string } | null;
};

export function AssetsTable({ items }: { items: AssetDetailed[] }) {
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      await deleteAsset(id);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3">Serial No.</th>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Model No.</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Value</th>
            <th className="px-6 py-3">Qty</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                No assets found.
              </td>
            </tr>
          ) : (
            items.map((item, index) => (
              <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {item.name}
                </td>
                <td className="px-6 py-4">{item.modelNumber || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.status === 'IN_USE' ? 'bg-green-100 text-green-800' :
                    item.status === 'IN_STORAGE' ? 'bg-blue-100 text-blue-800' :
                    item.status === 'UNDER_MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">{item.value ? `₹${item.value}` : '-'}</td>
                <td className="px-6 py-4">{item.quantity}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <Link
                    href={`/assets/${item.id}`}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

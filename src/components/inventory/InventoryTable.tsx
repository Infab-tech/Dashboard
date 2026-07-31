"use client"

import Link from "next/link";
import { deleteInventoryItem } from "@/lib/actions/inventory";

type InventoryItemDetailed = {
  id: string;
  code: string | null;
  name: string;
  referenceNumber: string | null;
  vendor: { id: string; name: string } | null;
  quantity: number;
  unit: string | null;
};

export function InventoryTable({ items }: { items: InventoryItemDetailed[] }) {
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await deleteInventoryItem(id);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3">ID</th>
            <th className="px-6 py-3">Part Name</th>
            <th className="px-6 py-3">Part Number</th>
            <th className="px-6 py-3">Vendor / Manufacturer</th>
            <th className="px-6 py-3">Qty In Stock</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                No inventory items found.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {item.code || '-'}
                </td>
                <td className="px-6 py-4">{item.name}</td>
                <td className="px-6 py-4">{item.referenceNumber || '-'}</td>
                <td className="px-6 py-4">{item.vendor?.name || '-'}</td>
                <td className="px-6 py-4">
                  {item.quantity} {item.unit || ''}
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <Link
                    href={`/inventory/${item.id}`}
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

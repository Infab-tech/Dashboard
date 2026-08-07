"use client"

import Link from "next/link";
import { deleteDeliveryChallan } from "@/lib/actions/delivery-challan";

type DeliveryChallanDetailed = {
  id: string;
  code: string | null;
  date: Date;
  project: { id: string; name: string } | null;
  vendor: { id: string; name: string } | null;
  recipient: string | null;
  address: string | null;
  gstNumber: string | null;
  placeOfSupply: string | null;
  jobReference: string | null;
  jobType: string | null;
  status: string;
  items: any[];
};

export function DeliveryChallanTable({ challans }: { challans: DeliveryChallanDetailed[] }) {
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this delivery challan? This will restore the inventory quantities.")) {
      await deleteDeliveryChallan(id);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3">Challan No</th>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">Bill To</th>
            <th className="px-6 py-3">Address</th>
            <th className="px-6 py-3">GST Number</th>
            <th className="px-6 py-3">Place of Supply</th>
            <th className="px-6 py-3">Job Reference</th>
            <th className="px-6 py-3">Job Type</th>
            <th className="px-6 py-3">Description of Goods</th>
            <th className="px-6 py-3">Qty</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {challans.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                No delivery challans found.
              </td>
            </tr>
          ) : (
            challans.map((challan) => (
              <tr key={challan.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {challan.code || '-'}
                </td>
                <td className="px-6 py-4">{new Date(challan.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  {challan.recipient || challan.vendor?.name || '-'}
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-[150px] truncate" title={challan.address || ""}>{challan.address || '-'}</div>
                </td>
                <td className="px-6 py-4">{challan.gstNumber || '-'}</td>
                <td className="px-6 py-4">{challan.placeOfSupply || '-'}</td>
                <td className="px-6 py-4">{challan.jobReference || '-'}</td>
                <td className="px-6 py-4">{challan.jobType || '-'}</td>
                <td className="px-6 py-4">
                  <div className="max-w-[200px] truncate" title={challan.items.map(i => i.description || i.inventoryItem?.name).join(", ")}>
                    {challan.items.map(i => i.description || i.inventoryItem?.name).join(", ") || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {challan.items.map(i => i.quantity).reduce((a, b) => a + b, 0)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    challan.status === "Open" ? "bg-yellow-50 text-yellow-800 ring-yellow-600/20" : 
                    challan.status === "Closed" ? "bg-green-50 text-green-700 ring-green-600/20" :
                    "bg-gray-50 text-gray-600 ring-gray-500/10"
                  }`}>
                    {challan.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <Link
                    href={`/delivery-challan/${challan.id}`}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(challan.id)}
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

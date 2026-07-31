"use client";

import { useState } from "react";
import { updateVendor, deleteVendor } from "@/lib/actions/vendors";
import { VendorFormModal } from "./VendorFormModal";

type Vendor = any; // We use 'any' for now since TS types aren't regenerated yet

export function VendorTable({ vendors }: { vendors: Vendor[] }) {
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      setIsDeleting(id);
      await deleteVendor(id);
      window.location.reload();
    }
  };

  const filteredVendors = vendors.filter(v => {
    const query = searchQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(query) ||
      (v.code && v.code.toLowerCase().includes(query)) ||
      (v.state && v.state.toLowerCase().includes(query)) ||
      (v.contactPhone && v.contactPhone.toLowerCase().includes(query)) ||
      (v.contactEmail && v.contactEmail.toLowerCase().includes(query)) ||
      (v.gstStatus && v.gstStatus.toLowerCase().includes(query))
    );
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <div className="p-4 border-b border-neutral-200">
        <input
          type="text"
          placeholder="Search vendors by name, code, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-sm rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3">GST</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredVendors.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-neutral-50/50">
                <td className="px-4 py-3 font-medium text-neutral-900">{vendor.code || '-'}</td>
                <td className="px-4 py-3">{vendor.name}</td>
                <td className="px-4 py-3 text-neutral-500">{vendor.contactPhone || vendor.contactEmail || vendor.contactName || '-'}</td>
                <td className="px-4 py-3 text-neutral-500">{vendor.state || '-'}</td>
                <td className="px-4 py-3 text-neutral-500">
                  {vendor.gstStatus ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-800">
                      {vendor.gstStatus}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setEditingVendor(vendor)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(vendor.id)}
                    disabled={isDeleting === vendor.id}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    {isDeleting === vendor.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
            {filteredVendors.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  No vendors found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingVendor && (
        <VendorFormModal
          vendor={editingVendor}
          onClose={() => setEditingVendor(null)}
        />
      )}
    </div>
  );
}

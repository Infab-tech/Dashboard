"use client";

import { useState } from "react";
import { ProcurementForm } from "./ProcurementForm";

export function ProcurementsTable({ 
  procurements,
  projects,
  vendors
}: { 
  procurements: any[];
  projects: any[];
  vendors: any[];
}) {
  const [query, setQuery] = useState("");

  const filtered = procurements.filter(p => {
    const searchString = `${p.project?.name || ''} ${p.vendor?.name || ''} ${p.itemRequired || ''} ${p.status || ''} ${p.remarks || ''}`.toLowerCase();
    return searchString.includes(query.toLowerCase());
  });

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Search procurements..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-sm rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
        />
        <ProcurementForm projects={projects} vendors={vendors} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-4 py-3">Project Name</th>
              <th className="px-4 py-3">Item / Product Required</th>
              <th className="px-4 py-3">Vendor / Supplier Name</th>
              <th className="px-4 py-3">Vendor Type</th>
              <th className="px-4 py-3">Vendor Contact</th>
              <th className="px-4 py-3">Est. Cost</th>
              <th className="px-4 py-3">PO Status</th>
              <th className="px-4 py-3">Order Date</th>
              <th className="px-4 py-3">Expected Delivery</th>
              <th className="px-4 py-3">Remarks</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white text-sm">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-900">{p.project?.name || "—"}</td>
                <td className="px-4 py-3 text-neutral-600">{p.itemRequired || "—"}</td>
                <td className="px-4 py-3 text-neutral-900">{p.vendor?.name || "—"}</td>
                <td className="px-4 py-3 text-neutral-600">{p.vendor?.category || "—"}</td>
                <td className="px-4 py-3 text-neutral-600">
                  {p.vendor?.contactName || p.vendor?.contactEmail || p.vendor?.contactPhone || "—"}
                </td>
                <td className="px-4 py-3 text-neutral-600">{p.amount ? `₹${p.amount.toString()}` : "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-600">{formatDate(p.orderedAt)}</td>
                <td className="px-4 py-3 text-neutral-600">{formatDate(p.expectedDeliveryDate)}</td>
                <td className="px-4 py-3 text-neutral-600">{p.remarks || "—"}</td>
                <td className="px-4 py-3">
                  <ProcurementForm initialData={p} projects={projects} vendors={vendors} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-neutral-500">
                  No procurements found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProcurement, updateProcurement, deleteProcurement } from "@/lib/actions/procurements";

type ProjectOption = { id: string; name: string };
type VendorOption = { id: string; name: string };

export function ProcurementForm({ 
  initialData, 
  projects, 
  vendors 
}: { 
  initialData?: any;
  projects: ProjectOption[];
  vendors: VendorOption[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const amountVal = formData.get("amount") as string;
    
    const data = {
      projectId: (formData.get("projectId") as string) || null,
      vendorId: (formData.get("vendorId") as string) || null,
      itemRequired: (formData.get("itemRequired") as string) || null,
      status: (formData.get("status") as string) || "Not Ordered",
      amount: amountVal ? parseFloat(amountVal) : null,
      orderedAt: formData.get("orderedAt") ? new Date(formData.get("orderedAt") as string) : null,
      expectedDeliveryDate: formData.get("expectedDeliveryDate") ? new Date(formData.get("expectedDeliveryDate") as string) : null,
      remarks: (formData.get("remarks") as string) || null,
    };

    try {
      if (initialData) {
        await updateProcurement(initialData.id, data);
      } else {
        await createProcurement(data);
      }
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save procurement order");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData || !confirm("Are you sure you want to delete this procurement order?")) return;
    setLoading(true);
    try {
      await deleteProcurement(initialData.id);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete");
      setLoading(false);
    }
  };

  const formatDateForInput = (d: string | Date | null) => d ? new Date(d).toISOString().split('T')[0] : "";

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={initialData 
          ? "text-sm font-medium text-blue-600 hover:text-blue-800" 
          : "rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"}
      >
        {initialData ? "Edit" : "Add Procurement"}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 rounded-lg bg-white p-6 shadow-xl border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">
            {initialData ? "Edit Procurement" : "New Procurement"}
          </h3>
          <button type="button" onClick={() => setIsOpen(false)} className="text-sm text-neutral-400 hover:text-neutral-600">
            Cancel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              name="projectId"
              defaultValue={initialData?.projectId || ""}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
            >
              <option value="">-- None --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
            <select
              name="vendorId"
              defaultValue={initialData?.vendorId || ""}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
            >
              <option value="">-- None --</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Item / Product Required</label>
            <input
              type="text"
              name="itemRequired"
              defaultValue={initialData?.itemRequired || ""}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PO Status</label>
            <input
              type="text"
              name="status"
              defaultValue={initialData?.status || "Not Ordered"}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Est. Cost</label>
            <input
              type="number"
              step="0.01"
              name="amount"
              defaultValue={initialData?.amount || ""}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
            <input
              type="date"
              name="orderedAt"
              defaultValue={formatDateForInput(initialData?.orderedAt)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery</label>
            <input
              type="date"
              name="expectedDeliveryDate"
              defaultValue={formatDateForInput(initialData?.expectedDeliveryDate)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea
              name="remarks"
              rows={2}
              defaultValue={initialData?.remarks || ""}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-between items-center pt-4">
          {initialData ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              Delete
            </button>
          ) : (
            <div></div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

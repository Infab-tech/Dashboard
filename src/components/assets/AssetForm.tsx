"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAsset, updateAsset } from "@/lib/actions/assets";
import { AssetStatus } from "@prisma/client";

export function AssetForm({ initialData, people = [], projects = [] }: { initialData?: any, people?: any[], projects?: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      modelNumber: (formData.get("modelNumber") as string) || undefined,
      category: (formData.get("category") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
      quantity: parseInt(formData.get("quantity") as string) || 1,
      status: formData.get("status") as AssetStatus,
      value: formData.get("value") ? parseFloat(formData.get("value") as string) : undefined,
      assignedToId: (formData.get("assignedToId") as string) || undefined,
      projectId: (formData.get("projectId") as string) || undefined,
    };

    try {
      if (initialData?.id) {
        await updateAsset(initialData.id, data);
      } else {
        await createAsset(data);
      }
      router.push("/assets");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to save asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 shadow-sm border border-gray-200 rounded-lg">
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label className="block text-sm font-medium leading-6 text-gray-900">Asset Name *</label>
          <input
            type="text"
            name="name"
            required
            defaultValue={initialData?.name || ""}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-sm font-medium leading-6 text-gray-900">Model Number</label>
          <input
            type="text"
            name="modelNumber"
            defaultValue={initialData?.modelNumber || ""}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium leading-6 text-gray-900">Category</label>
          <input
            type="text"
            name="category"
            defaultValue={initialData?.category || ""}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium leading-6 text-gray-900">Quantity</label>
          <input
            type="number"
            name="quantity"
            min="1"
            defaultValue={initialData?.quantity || 1}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium leading-6 text-gray-900">Status</label>
          <select
            name="status"
            defaultValue={initialData?.status || "IN_STORAGE"}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
          >
            <option value="IN_STORAGE">In Storage</option>
            <option value="IN_USE">In Use</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <label className="block text-sm font-medium leading-6 text-gray-900">Assigned To</label>
          <select
            name="assignedToId"
            defaultValue={initialData?.assignedToId || ""}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
          >
            <option value="">-- Unassigned --</option>
            {people.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <label className="block text-sm font-medium leading-6 text-gray-900">Value (INR)</label>
          <input
            type="number"
            name="value"
            step="0.01"
            defaultValue={initialData?.value ? initialData.value.toString() : ""}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
          />
        </div>
        
        <div className="sm:col-span-6">
          <label className="block text-sm font-medium leading-6 text-gray-900">Description</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={initialData?.description || ""}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-x-4 border-t border-gray-900/10 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-semibold leading-6 text-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          {loading ? "Saving..." : "Save Asset"}
        </button>
      </div>
    </form>
  );
}

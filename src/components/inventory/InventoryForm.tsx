"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInventoryItem, updateInventoryItem } from "@/lib/actions/inventory";
import { createVendor } from "@/lib/actions/vendors";
import { GlobalCategory, BOICategory } from "@prisma/client";

type Project = { id: string; name: string; };
type Vendor = { id: string; name: string; code: string | null; };

type InventoryFormProps = {
  projects: Project[];
  vendors: Vendor[];
  initialData?: any;
};

export function InventoryForm({ projects, vendors, initialData }: InventoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [globalCategory, setGlobalCategory] = useState<GlobalCategory | "">(initialData?.globalCategory || "");
  const [isNewVendor, setIsNewVendor] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    let vendorId = formData.get("vendorId") as string;

    if (isNewVendor) {
      const newVendorName = formData.get("newVendorName") as string;
      const newVendorCode = formData.get("newVendorCode") as string;
      if (!newVendorName || !newVendorCode) {
        setError("Vendor Name and Code are required for new vendor.");
        setIsSubmitting(false);
        return;
      }
      try {
        const newVendor = await createVendor({ name: newVendorName, code: newVendorCode });
        vendorId = newVendor.id;
      } catch (err) {
        setError("Failed to create new vendor. The code might already be in use.");
        setIsSubmitting(false);
        return;
      }
    }

    if (!vendorId) {
      setError("Please select or create a vendor.");
      setIsSubmitting(false);
      return;
    }

    const rawDate = formData.get("dateOfPurchase") as string;
    
    const data = {
      name: formData.get("name") as string,
      globalCategory: formData.get("globalCategory") as GlobalCategory,
      boiCategory: (formData.get("boiCategory") as BOICategory) || null,
      vendorId,
      dateOfPurchase: new Date(rawDate),
      referenceNumber: formData.get("referenceNumber") as string,
      description: formData.get("description") as string,
      poNumber: formData.get("poNumber") as string,
      quantity: parseInt(formData.get("quantity") as string, 10),
      unit: formData.get("unit") as string,
      location: formData.get("location") as string,
      projectId: formData.get("projectId") as string,
    };

    if (isNaN(data.quantity) || !data.globalCategory || !rawDate || !data.poNumber) {
      setError("Please fill out all required fields (Category, Date, PO, Quantity).");
      setIsSubmitting(false);
      return;
    }

    try {
      if (initialData?.id) {
        await updateInventoryItem(initialData.id, data);
      } else {
        await createInventoryItem(data);
      }
      router.push("/inventory");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while saving the item.");
      setIsSubmitting(false);
    }
  };

  const defaultDate = initialData?.dateOfPurchase 
    ? new Date(initialData.dateOfPurchase).toISOString().split('T')[0] 
    : "";

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:p-8">
        <div className="grid max-w-full grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium leading-6 text-gray-900">Global Category *</label>
            <select
              name="globalCategory"
              required
              value={globalCategory}
              onChange={(e) => setGlobalCategory(e.target.value as GlobalCategory)}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm px-3"
            >
              <option value="">-- Select Category --</option>
              <option value="RAW_MATERIALS">Raw Materials</option>
              <option value="BOI">Bought Out Items (BOI)</option>
              <option value="CONSUMABLES">Consumables</option>
              <option value="FABRICATED">Fabricated Items</option>
            </select>
          </div>

          {globalCategory === "BOI" && (
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">BOI Sub-Category *</label>
              <select
                name="boiCategory"
                required
                defaultValue={initialData?.boiCategory || ""}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm px-3"
              >
                <option value="">-- Select Sub-Category --</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="ELECTRONICS">Electronics</option>
                <option value="MECHANICAL">Mechanical</option>
              </select>
            </div>
          )}

          <div className="sm:col-span-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium leading-6 text-gray-900">Vendor *</label>
              <button 
                type="button" 
                onClick={() => setIsNewVendor(!isNewVendor)}
                className="text-xs font-semibold text-gray-900 hover:underline"
              >
                {isNewVendor ? "Select Existing Vendor" : "+ Add New Vendor"}
              </button>
            </div>
            
            {isNewVendor ? (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  name="newVendorName"
                  placeholder="Vendor Name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm px-3"
                />
                <input
                  type="text"
                  name="newVendorCode"
                  placeholder="Code (e.g. MAN)"
                  className="block w-1/3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm px-3 uppercase"
                />
              </div>
            ) : (
              <select
                name="vendorId"
                required={!isNewVendor}
                defaultValue={initialData?.vendorId || ""}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm px-3"
              >
                <option value="">-- Select Vendor --</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.code})</option>
                ))}
              </select>
            )}
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium leading-6 text-gray-900">Date of Purchase *</label>
            <input
              type="date"
              name="dateOfPurchase"
              required
              defaultValue={defaultDate}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm px-3"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-sm font-medium leading-6 text-gray-900">Component Name *</label>
            <input
              type="text"
              name="name"
              required
              defaultValue={initialData?.name || ""}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm px-3"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium leading-6 text-gray-900">Part Number</label>
            <input
              type="text"
              name="referenceNumber"
              defaultValue={initialData?.referenceNumber || ""}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm px-3"
            />
          </div>

          <div className="sm:col-span-6">
            <label className="block text-sm font-medium leading-6 text-gray-900">Description</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={initialData?.description || ""}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm px-3"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium leading-6 text-gray-900">PO Number *</label>
            <input
              type="text"
              name="poNumber"
              required
              defaultValue={initialData?.poNumber || ""}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm px-3 uppercase"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium leading-6 text-gray-900">Quantity *</label>
            <input
              type="number"
              name="quantity"
              required
              min="0"
              defaultValue={initialData?.quantity ?? 0}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm px-3"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium leading-6 text-gray-900">Unit (e.g. pcs, kg)</label>
            <input
              type="text"
              name="unit"
              defaultValue={initialData?.unit || ""}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm px-3"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium leading-6 text-gray-900">Project Allocation</label>
            <select
              name="projectId"
              defaultValue={initialData?.projectId || ""}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm px-3"
            >
              <option value="">-- Unassigned (Shared Pool) --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium leading-6 text-gray-900">Location</label>
            <input
              type="text"
              name="location"
              defaultValue={initialData?.location || ""}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm px-3"
            />
          </div>

        </div>

        {error && <div className="mt-6 text-sm text-red-600">{error}</div>}
      </div>

      <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
        <button type="button" onClick={() => router.back()} className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-50">
          {isSubmitting ? "Saving..." : "Save Item"}
        </button>
      </div>
    </form>
  );
}

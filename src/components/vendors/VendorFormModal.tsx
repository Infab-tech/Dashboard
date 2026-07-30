"use client";

import { useState } from "react";
import { createVendor, updateVendor } from "@/lib/actions/vendors";

export function VendorFormModal({ vendor, onClose }: { vendor?: any, onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      code: formData.get("code") as string || undefined,
      state: formData.get("state") as string || undefined,
      contactPhone: formData.get("contactPhone") as string || undefined,
      gstStatus: formData.get("gstStatus") as string || undefined,
      address: formData.get("address") as string || undefined,
    };

    try {
      if (vendor) {
        await updateVendor(vendor.id, data);
      } else {
        await createVendor(data);
      }
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving the vendor.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">
          {vendor ? "Edit Vendor" : "Add Vendor"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              name="name"
              defaultValue={vendor?.name}
              required
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Vendor Name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Unique Code (Optional)</label>
            <input
              name="code"
              defaultValue={vendor?.code}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="e.g., VEND1"
            />
            <p className="text-xs text-neutral-500 mt-1">If left blank, initials will be generated.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <input
                name="state"
                defaultValue={vendor?.state}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Phone</label>
              <input
                name="contactPhone"
                defaultValue={vendor?.contactPhone}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">GST Status</label>
            <select
              name="gstStatus"
              defaultValue={vendor?.gstStatus || ""}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">Select Status...</option>
              <option value="Registered">Registered</option>
              <option value="Unregistered">Unregistered</option>
              <option value="Overseas">Overseas</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea
              name="address"
              defaultValue={vendor?.address}
              className="w-full border rounded-md px-3 py-2 text-sm"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-neutral-800 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

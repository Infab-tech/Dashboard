"use client";

import { useState } from "react";
import { VendorFormModal } from "./VendorFormModal";

export function VendorHeader() {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
        <p className="text-sm text-neutral-500">Manage your suppliers and their contact information.</p>
      </div>
      <button
        onClick={() => setIsAdding(true)}
        className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors"
      >
        Add Vendor
      </button>

      {isAdding && (
        <VendorFormModal onClose={() => setIsAdding(false)} />
      )}
    </div>
  );
}

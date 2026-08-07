"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDeliveryChallan } from "@/lib/actions/delivery-challan";

const JOB_TYPES = [
  "3D Printer", "ASSEMBLY", "CABLIBRATION", "Calibration", "CMM", "Data", "DEMO", "Design", "discussion", "DPS", 
  "Dye Penetration Test", "E beam welding", "E-BEAM - 001", "E-Beam Welding", "Electoless Nickle Plating", 
  "Electro Plating", "Endurance Test", "Enurence", "FAB WORK", "FAB/MANUFACTURE", "Fabrication", "FIT", 
  "Gauge-DPS", "Gold plating", "GRINDING", "Hadrning", "Harding", "Hardning", "HEAT TREATMENT", "Heat treated", 
  "HT", "Inspection", "Inspection - 001", "Lazer Engraving", "LOAD TEST", "load vs deflection test", "Magnaflux", 
  "Magnaglux", "MECH / CMM", "Microscopy", "Miicro and Macro", "NDT", "Post-Process", "qualification", "RE WORK", 
  "Ref sample", "REWORK", "SAMPLE", "Sample Test", "samples", "Surface Finish", "Surface preparation", 
  "Surface roughness", "Surface Roughness", "TEST", "Testing", "Trail", "UT Testing", "WELD", "Welded sample", 
  "WELDING", "Zinc nickle", "Zinc Posphating"
];

const JOB_REFERENCES = [
  "And/Pass", "Annodization", "CAL-01", "CMM", "Coating", "Data file", "DEMO", "DEMO - 001", "DEMO - 002", 
  "DEMO - 003", "DEMO - 004", "Disscussion", "DOP, Micro Structure", "E beam Welding", "E beam Welding - 001", 
  "E beam welding sample", "E.BEAM_WELD", "F.W", "F.W - 001", "F.W - 002", "Fab", "FAB WORK", "FAB-SAMPLE", 
  "Fabrication", "Fiitment trial", "FIT Check", "Gauge", "H.T - 001", "H.T - 002", "HARDING", "Hardness testing", 
  "Hardning", "HEAT TREATMENT", "Heat treatment", "Heat treatment - 001", "Inspection", "ITC Sample", "L.T - 001", 
  "Load test", "NDT 004", "NDT 015", "Passivation", "Plating", "Polishing", "Re work", "Rework", "REWORK-001", 
  "sample", "Sample trails", "SOLDER WELD", "TESTING", "Testing Inspection", "WELD - 001", "welding", "Welding FW", 
  "Welding required", "Zinc Posphating"
];

type DeliveryChallanFormProps = {
  inventoryItems: any[];
  projects: any[];
};

export function DeliveryChallanForm({ inventoryItems, projects }: DeliveryChallanFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [items, setItems] = useState([{ inventoryItemId: "", description: "", quantity: 1, remarks: "" }]);

  const handleAddItem = () => {
    setItems([...items, { inventoryItemId: "", description: "", quantity: 1, remarks: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      code: formData.get("code") as string,
      date: formData.get("date") as string,
      projectId: formData.get("projectId") as string,
      recipient: formData.get("recipient") as string,
      address: formData.get("address") as string,
      gstNumber: formData.get("gstNumber") as string,
      placeOfSupply: formData.get("placeOfSupply") as string,
      jobReference: formData.get("jobReference") as string,
      jobType: formData.get("jobType") as string,
      status: formData.get("status") as string,
      remarks: formData.get("remarks") as string,
      items: items.filter(item => item.inventoryItemId && item.quantity > 0),
    };

    if (data.items.length === 0) {
      setError("Please add at least one valid inventory item.");
      setIsSubmitting(false);
      return;
    }

    const result = await createDeliveryChallan(data);

    if (result.success) {
      router.push("/delivery-challan");
      router.refresh();
    } else {
      setError(result.error || "Failed to create Delivery Challan");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <datalist id="job-types">
        {JOB_TYPES.map(type => <option key={type} value={type} />)}
      </datalist>

      <datalist id="job-references">
        {JOB_REFERENCES.map(ref => <option key={ref} value={ref} />)}
      </datalist>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="code" className="block text-sm font-medium leading-6 text-gray-900">
            Challan Number
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="code"
              id="code"
              placeholder="e.g. DC-2026-001"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium leading-6 text-gray-900">
            Date
          </label>
          <div className="mt-2">
            <input
              type="date"
              name="date"
              id="date"
              required
              defaultValue={new Date().toISOString().split('T')[0]}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label htmlFor="projectId" className="block text-sm font-medium leading-6 text-gray-900">
            Project (Optional)
          </label>
          <div className="mt-2">
            <select
              name="projectId"
              id="projectId"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
            >
              <option value="">Select a Project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="recipient" className="block text-sm font-medium leading-6 text-gray-900">
            Bill To (Recipient)
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="recipient"
              id="recipient"
              placeholder="Recipient Name"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">
            Address
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="address"
              id="address"
              placeholder="Address"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label htmlFor="gstNumber" className="block text-sm font-medium leading-6 text-gray-900">
            GST Number
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="gstNumber"
              id="gstNumber"
              placeholder="GST Number"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label htmlFor="placeOfSupply" className="block text-sm font-medium leading-6 text-gray-900">
            Place of Supply
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="placeOfSupply"
              id="placeOfSupply"
              placeholder="Place of Supply"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label htmlFor="jobReference" className="block text-sm font-medium leading-6 text-gray-900">
            Job Reference
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="jobReference"
              id="jobReference"
              list="job-references"
              placeholder="Select or type..."
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label htmlFor="jobType" className="block text-sm font-medium leading-6 text-gray-900">
            Job Type
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="jobType"
              id="jobType"
              list="job-types"
              placeholder="Select or type..."
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Items to Dispatch
          </label>
          <button
            type="button"
            onClick={handleAddItem}
            className="text-sm text-gray-900 font-semibold hover:underline"
          >
            + Add Item
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex-1">
                <select
                  value={item.inventoryItemId}
                  onChange={(e) => handleItemChange(index, "inventoryItemId", e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
                >
                  <option value="">Select Inventory Item...</option>
                  {inventoryItems.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} (Qty: {inv.quantity})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, "description", e.target.value)}
                  placeholder="Description of Goods"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
                />
              </div>
              <div className="w-24">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                  placeholder="Qty"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={item.remarks}
                  onChange={(e) => handleItemChange(index, "remarks", e.target.value)}
                  placeholder="Remarks"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="mt-1.5 text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="remarks" className="block text-sm font-medium leading-6 text-gray-900">
          General Remarks
        </label>
        <div className="mt-2">
          <textarea
            name="remarks"
            id="remarks"
            rows={3}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Delivery Challan"}
        </button>
      </div>
    </form>
  );
}

import { DeliveryChallanForm } from "@/components/delivery-challan/DeliveryChallanForm";
import { getInventoryItems } from "@/lib/actions/inventory";
import { getProjects } from "@/lib/actions/projects";

export default async function NewDeliveryChallanPage() {
  const inventoryItems = await getInventoryItems();
  const projects = await getProjects();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Create Delivery Challan
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Record items being dispatched from the inventory.
        </p>
      </div>

      <DeliveryChallanForm 
        inventoryItems={inventoryItems} 
        projects={projects} 
      />
    </div>
  );
}

import { getProjects } from "@/lib/actions/projects";
import { getVendors } from "@/lib/actions/vendors";
import { InventoryForm } from "@/components/inventory/InventoryForm";

export default async function NewInventoryItemPage() {
  const [projects, vendors] = await Promise.all([
    getProjects(),
    getVendors()
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Add New Inventory Item
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter the details for the new stock item.
        </p>
      </div>

      <InventoryForm projects={projects} vendors={vendors} />
    </div>
  );
}

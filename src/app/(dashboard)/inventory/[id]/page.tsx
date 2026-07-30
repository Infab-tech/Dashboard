import { notFound } from "next/navigation";
import { getInventoryItem } from "@/lib/actions/inventory";
import { getProjects } from "@/lib/actions/projects";
import { getVendors } from "@/lib/actions/vendors";
import { InventoryForm } from "@/components/inventory/InventoryForm";

export default async function EditInventoryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const [item, projects, vendors] = await Promise.all([
    getInventoryItem(id),
    getProjects(),
    getVendors()
  ]);

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Edit Inventory Item
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Update the details for {item.code}.
        </p>
      </div>

      <InventoryForm projects={projects} vendors={vendors} initialData={item} />
    </div>
  );
}

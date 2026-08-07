import Link from "next/link";
import { getDeliveryChallans } from "@/lib/actions/delivery-challan";
import { DeliveryChallanTable } from "@/components/delivery-challan/DeliveryChallanTable";
import { getProjects } from "@/lib/actions/projects";

export default async function DeliveryChallanPage() {
  const challans = await getDeliveryChallans();
  const projects = await getProjects(); // To map project names if needed, or pass them to form

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Delivery Challans
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage dispatch of inventory items.
          </p>
        </div>
        <div className="mt-4 flex sm:ml-4 sm:mt-0">
          <Link
            href="/delivery-challan/new"
            className="inline-flex items-center justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            Create Challan
          </Link>
        </div>
      </div>

      <DeliveryChallanTable challans={challans} />
    </div>
  );
}

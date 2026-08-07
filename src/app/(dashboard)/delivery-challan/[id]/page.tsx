import { prisma } from "@/lib/prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function DeliveryChallanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const challan = await prisma.deliveryChallan.findUnique({
    where: { id },
    include: {
      project: true,
      vendor: true,
      items: {
        include: {
          inventoryItem: true,
        },
      },
    },
  });

  if (!challan) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Delivery Challan: {challan.code || "N/A"}
          </h1>
          <p className="text-sm text-gray-500">
            Date: {new Date(challan.date).toLocaleDateString()}
          </p>
        </div>
        <Link
          href="/delivery-challan"
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Back to List
        </Link>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm font-medium leading-6 text-gray-900">Status</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700">
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                  challan.status === "Open" ? "bg-yellow-50 text-yellow-800 ring-yellow-600/20" : 
                  challan.status === "Closed" ? "bg-green-50 text-green-700 ring-green-600/20" :
                  "bg-gray-50 text-gray-600 ring-gray-500/10"
                }`}>
                  {challan.status}
                </span>
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium leading-6 text-gray-900">Bill To</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700">{challan.recipient || "N/A"}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium leading-6 text-gray-900">Address</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700">{challan.address || "N/A"}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium leading-6 text-gray-900">GST Number</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700">{challan.gstNumber || "N/A"}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium leading-6 text-gray-900">Place of Supply</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700">{challan.placeOfSupply || "N/A"}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium leading-6 text-gray-900">Project</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700">{challan.project?.name || "N/A"}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium leading-6 text-gray-900">Job Reference</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700">{challan.jobReference || "N/A"}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium leading-6 text-gray-900">Job Type</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700">{challan.jobType || "N/A"}</dd>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-sm font-medium leading-6 text-gray-900">General Remarks</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700">{challan.remarks || "No remarks."}</dd>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Items Dispatched</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Inventory Item</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description of Goods</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quantity</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {challan.items.map((item) => (
                <tr key={item.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {item.inventoryItem.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.description || "-"}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.quantity}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.remarks || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

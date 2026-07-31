import { AssetForm } from "@/components/assets/AssetForm";
import { prisma } from "@/lib/prisma/client";

export default async function NewAssetPage() {
  const people = await prisma.person.findMany({ orderBy: { name: 'asc' } });

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Add New Asset
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Register a new equipment or fixed asset into the system.
          </p>
        </div>
      </div>

      <AssetForm people={people} />
    </div>
  );
}

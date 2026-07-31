import { AssetForm } from "@/components/assets/AssetForm";
import { getAsset } from "@/lib/actions/assets";
import { prisma } from "@/lib/prisma/client";
import { notFound } from "next/navigation";

type PageProps = Promise<{ id: string }>;

export default async function EditAssetPage(props: { params: PageProps }) {
  const params = await props.params;
  const asset = await getAsset(params.id);
  
  if (!asset) {
    notFound();
  }

  const people = await prisma.person.findMany({ orderBy: { name: 'asc' } });

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Edit Asset: {asset.name}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Update asset details, quantity, or assignment.
          </p>
        </div>
      </div>

      <AssetForm initialData={{ ...asset, value: asset.value ? Number(asset.value) : null }} people={people} />
    </div>
  );
}

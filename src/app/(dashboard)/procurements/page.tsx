import { getProcurements } from "@/lib/actions/procurements";
import { prisma } from "@/lib/prisma/client";
import { ProcurementsTable } from "@/components/procurements/ProcurementsTable";

export const dynamic = "force-dynamic";

export default async function ProcurementsPage() {
  const [procurements, projects, vendors] = await Promise.all([
    getProcurements(),
    prisma.project.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.vendor.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Procurements</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Track procurement orders and services from vendors.
        </p>
      </div>

      <ProcurementsTable 
        procurements={procurements} 
        projects={projects} 
        vendors={vendors} 
      />
    </div>
  );
}

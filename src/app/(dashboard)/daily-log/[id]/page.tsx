import { DailyLogForm } from "@/components/dailylog/DailyLogForm";
import { getDailyLog } from "@/lib/actions/dailylog";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma/client";

type PageProps = Promise<{ id: string }>;

export default async function EditDailyLogPage(props: { params: PageProps }) {
  const params = await props.params;
  const log = await getDailyLog(params.id);

  if (!log) {
    notFound();
  }

  const projects = await prisma.project.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  const people = await prisma.person.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Edit Daily Log Entry
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Update the task details, status, or assignment.
        </p>
      </div>

      <DailyLogForm initialData={log} projects={projects} people={people} />
    </div>
  );
}

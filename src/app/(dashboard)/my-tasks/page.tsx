import { Metadata } from "next";
import { getCurrentPerson } from "@/lib/actions/users";
import { getPersonalTasks } from "@/lib/actions/personal-tasks";
import { PersonalTaskList } from "@/components/personal-tasks/PersonalTaskList";

export const metadata: Metadata = {
  title: "My Tasks | InFAB",
};

export default async function MyTasksPage() {
  const person = await getCurrentPerson();

  if (!person) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Profile Missing</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  You do not have an associated Person record to assign tasks to. Please contact your administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tasks = await getPersonalTasks(person.id);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-muted-foreground mt-1 text-sm text-neutral-500">
          Manage your personal checklist and daily log assignments.
        </p>
      </div>
      
      <PersonalTaskList initialTasks={tasks} personId={person.id} />
    </div>
  );
}

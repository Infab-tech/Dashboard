import { prisma } from "@/lib/prisma/client";

export default async function PeoplePage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">People</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Users currently granted access to the system.
        </p>
      </div>

      <div className="rounded-md border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Name</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Email</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Unique Code</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Role</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-neutral-900">{u.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700 border border-neutral-200">
                      {u.code || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        u.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { revokeUserAccess } from "@/lib/actions/users";

export default async function PeoplePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole = "USER";
  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { supabaseAuthId: user.id },
      select: { role: true },
    });
    if (dbUser) userRole = dbUser.role;
  }

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
              {userRole === "ADMIN" && <th className="px-4 py-3 text-right font-medium text-neutral-500">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white">
            {users.length === 0 ? (
              <tr>
                <td colSpan={userRole === "ADMIN" ? 6 : 5} className="px-4 py-8 text-center text-neutral-500">
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
                        !u.isActive 
                          ? "bg-red-100 text-red-700" 
                          : u.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {!u.isActive ? "REVOKED" : u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  {userRole === "ADMIN" && (
                    <td className="px-4 py-3 text-right">
                      {u.isActive ? (
                        <form action={revokeUserAccess.bind(null, u.id)}>
                          <button type="submit" className="text-red-600 hover:text-red-800 text-xs font-medium">
                            Revoke Access
                          </button>
                        </form>
                      ) : (
                        <div className="flex justify-end gap-3">
                          <form action={async () => {
                            "use server";
                            const { restoreUserAccess } = await import("@/lib/actions/users");
                            await restoreUserAccess(u.id);
                          }}>
                            <button type="submit" className="text-emerald-600 hover:text-emerald-800 text-xs font-medium">
                              Grant Access Back
                            </button>
                          </form>
                          <form action={async () => {
                            "use server";
                            const { deleteUserAccount } = await import("@/lib/actions/users");
                            await deleteUserAccount(u.id);
                          }}>
                            <button type="submit" className="text-red-600 hover:text-red-800 text-xs font-medium">
                              Delete
                            </button>
                          </form>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

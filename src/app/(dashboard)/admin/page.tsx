import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { FinancialsPanel } from "@/components/admin/FinancialsPanel";

// Financials ranks projects by live-recomputed revenue and flags over-budget
// alerts on every load — never prerender this page.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { supabaseAuthId: user.id },
    select: { role: true },
  });

  if (dbUser?.role !== "ADMIN") {
    redirect("/"); // Block non-admins from accessing the Admin panel entirely
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Admin & Financials</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Global head controls, user management, and sensitive project financials (income/expenses).
        </p>
      </div>
      
      <AdminTabs
        usersTab={<CreateUserForm />}
        financialsTab={<FinancialsPanel />}
      />
    </div>
  );
}

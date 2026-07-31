import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { FinancialsPanel } from "@/components/admin/FinancialsPanel";

export const dynamic = "force-dynamic";

export default async function FinancialsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { supabaseAuthId: user.id },
    select: { role: true },
  });

  if (dbUser?.role !== "ADMIN") {
    redirect("/"); // Block non-admins from accessing the Financials panel
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Financials</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Sensitive project financials (income/expenses) ranked by live-recomputed revenue.
        </p>
      </div>
      
      <FinancialsPanel />
    </div>
  );
}

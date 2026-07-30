import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole = "USER"; // Default fallback
  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { supabaseAuthId: user.id },
      select: { role: true },
    });
    if (dbUser) {
      userRole = dbUser.role;
    }
  }

  return <AppShell userRole={userRole} isLoggedIn={!!user}>{children}</AppShell>;
}

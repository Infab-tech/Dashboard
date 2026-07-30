import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

/** Throws if the current session isn't a signed-in Admin — used to guard
 * financials mutations at the server-action/API layer, not just the page. */
export async function requireAdmin(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized.");

  const dbUser = await prisma.user.findUnique({
    where: { supabaseAuthId: user.id },
    select: { role: true },
  });
  if (dbUser?.role !== "ADMIN") throw new Error("Admin access required.");
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserRole } from "@prisma/client";

export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as UserRole) || UserRole.USER;

  if (!name || !email || !password) {
    throw new Error("Missing required fields");
  }

  // 1. Generate Initials code
  const parts = name.split(" ").filter(Boolean);
  let initials = parts.map((p) => p[0]).join("").toUpperCase();
  
  // Try to find a unique code
  let uniqueCode = `INFAB-${initials}`;
  let isUnique = false;
  let counter = 1;

  while (!isUnique) {
    const existing = await prisma.user.findFirst({ where: { code: uniqueCode } });
    if (existing) {
      counter++;
      uniqueCode = `INFAB-${initials}${counter}`;
    } else {
      isUnique = true;
    }
  }

  // 2. Create user in Supabase auth (bypass RLS using service key)
  const supabaseAdmin = createAdminClient();
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || "Failed to create authentication account");
  }

  // 3. Create user in Prisma
  await prisma.user.create({
    data: {
      supabaseAuthId: authData.user.id,
      name,
      email,
      role,
      code: uniqueCode,
      // Optional: create a linked Person record automatically
      personRecord: {
        create: {
          name,
          code: uniqueCode,
        }
      }
    },
  });

  revalidatePath("/people");
  revalidatePath("/admin");

  return { success: true, code: uniqueCode };
}

export async function revokeUserAccess(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.supabaseAuthId, {
    ban_duration: '87600h' // Ban for 10 years
  });
  if (error) {
    console.error("Failed to ban in Supabase Auth:", error);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false }
  });

  revalidatePath("/people");
}

export async function restoreUserAccess(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.supabaseAuthId, {
    ban_duration: 'none' // Lift the ban
  });

  if (error) {
    throw new Error(error.message || "Failed to restore user access in Auth");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: true }
  });

  revalidatePath("/people");
}

export async function deleteUserAccount(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const supabaseAdmin = createAdminClient();
  await supabaseAdmin.auth.admin.deleteUser(user.supabaseAuthId);

  await prisma.user.delete({
    where: { id: userId }
  });

  revalidatePath("/people");
}

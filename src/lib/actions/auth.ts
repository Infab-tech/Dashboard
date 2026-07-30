"use server";

import { createClient } from "@/lib/supabase/server";

export async function changePassword(formData: FormData) {
  const newPassword = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!newPassword || newPassword !== confirmPassword) {
    throw new Error("Passwords do not match or are empty.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { FinancialEntryType } from "@prisma/client";

export async function createFinancialEntry(formData: FormData) {
  await requireAdmin();

  const projectId = formData.get("projectId") as string;
  const type = formData.get("type") as FinancialEntryType;
  const amountRaw = formData.get("amount") as string;
  const entryDateRaw = formData.get("entryDate") as string;
  const description = ((formData.get("description") as string) || "").trim();

  if (!projectId || !type || !amountRaw || !entryDateRaw) {
    throw new Error("Project, type, amount, and date are required.");
  }
  if (type !== "INCOME" && type !== "EXPENSE") {
    throw new Error("Invalid entry type.");
  }

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number.");
  }

  const entryDate = new Date(entryDateRaw);
  if (Number.isNaN(entryDate.getTime())) {
    throw new Error("Invalid date.");
  }

  if (type === "EXPENSE" && !description) {
    throw new Error("A reason is required for expenses.");
  }

  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
  if (!project) {
    throw new Error("Project not found.");
  }

  await prisma.financialEntry.create({
    data: {
      projectId,
      type,
      category: "General",
      amount,
      entryDate,
      description: description || null,
    },
  });

  revalidatePath("/admin");
}

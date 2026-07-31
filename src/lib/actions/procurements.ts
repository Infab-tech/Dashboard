"use server"

import { prisma } from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";

export async function getProcurements() {
  return await prisma.procurementOrder.findMany({
    include: {
      project: { select: { name: true } },
      vendor: { select: { name: true, category: true, contactName: true, contactEmail: true, contactPhone: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createProcurement(data: {
  projectId?: string | null;
  vendorId?: string | null;
  itemRequired?: string | null;
  status?: string;
  amount?: number | null;
  orderedAt?: Date | null;
  expectedDeliveryDate?: Date | null;
  remarks?: string | null;
}) {
  const result = await prisma.procurementOrder.create({
    data
  });
  revalidatePath("/procurements");
  return result;
}

export async function updateProcurement(id: string, data: {
  projectId?: string | null;
  vendorId?: string | null;
  itemRequired?: string | null;
  status?: string;
  amount?: number | null;
  orderedAt?: Date | null;
  expectedDeliveryDate?: Date | null;
  remarks?: string | null;
}) {
  const result = await prisma.procurementOrder.update({
    where: { id },
    data
  });
  revalidatePath("/procurements");
  return result;
}

export async function deleteProcurement(id: string) {
  await prisma.procurementOrder.delete({ where: { id } });
  revalidatePath("/procurements");
}

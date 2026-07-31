"use server"

import { prisma } from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";
import { AssetStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";

export async function getAssets(query?: string) {
  return await prisma.asset.findMany({
    where: query ? {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { modelNumber: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } }
      ]
    } : undefined,
    include: { project: true, assignedTo: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getAsset(id: string) {
  return await prisma.asset.findUnique({
    where: { id },
    include: { assignedTo: true, project: true }
  });
}

export async function createAsset(data: {
  name: string;
  category?: string;
  modelNumber?: string;
  description?: string;
  quantity: number;
  status: AssetStatus;
  value?: number;
  purchaseDate?: Date;
  assignedToId?: string;
  projectId?: string;
}) {
  await prisma.asset.create({
    data: {
      name: data.name,
      category: data.category || null,
      modelNumber: data.modelNumber || null,
      description: data.description || null,
      quantity: data.quantity,
      status: data.status,
      value: data.value ? new Prisma.Decimal(data.value) : null,
      purchaseDate: data.purchaseDate || null,
      assignedToId: data.assignedToId || null,
      projectId: data.projectId || null,
    }
  });

  revalidatePath("/assets");
}

export async function updateAsset(id: string, data: {
  name: string;
  category?: string;
  modelNumber?: string;
  description?: string;
  quantity: number;
  status: AssetStatus;
  value?: number;
  purchaseDate?: Date;
  assignedToId?: string;
  projectId?: string;
}) {
  await prisma.asset.update({
    where: { id },
    data: {
      name: data.name,
      category: data.category || null,
      modelNumber: data.modelNumber || null,
      description: data.description || null,
      quantity: data.quantity,
      status: data.status,
      value: data.value ? new Prisma.Decimal(data.value) : null,
      purchaseDate: data.purchaseDate || null,
      assignedToId: data.assignedToId || null,
      projectId: data.projectId || null,
    }
  });

  revalidatePath("/assets");
}

export async function deleteAsset(id: string) {
  await prisma.asset.delete({
    where: { id }
  });

  revalidatePath("/assets");
}

"use server"

import { prisma } from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";
import { GlobalCategory, BOICategory } from "@prisma/client";

export async function getInventoryItems(category?: GlobalCategory) {
  return await prisma.inventoryItem.findMany({
    where: category ? { globalCategory: category } : undefined,
    include: { project: true, vendor: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getInventoryItem(id: string) {
  return await prisma.inventoryItem.findUnique({
    where: { id },
    include: { vendor: true }
  });
}

export async function createInventoryItem(data: {
  name: string;
  globalCategory: GlobalCategory;
  boiCategory?: BOICategory | null;
  vendorId: string;
  dateOfPurchase: Date;
  referenceNumber?: string;
  description?: string;
  poNumber: string;
  quantity: number;
  unit?: string;
  location?: string;
  projectId?: string;
}) {
  const vendor = await prisma.vendor.findUnique({ where: { id: data.vendorId } });
  if (!vendor) throw new Error("Vendor not found");

  const poSuffix = data.poNumber.slice(-5).padStart(5, '0');
  const vendorCode = vendor.code || 'UNK';
  
  const day = String(data.dateOfPurchase.getUTCDate()).padStart(2, '0');
  const month = String(data.dateOfPurchase.getUTCMonth() + 1).padStart(2, '0');
  const dateStr = `${day}${month}`;

  const code = `${poSuffix}${vendorCode}${dateStr}`;

  await prisma.inventoryItem.create({
    data: {
      code,
      name: data.name,
      globalCategory: data.globalCategory,
      boiCategory: data.globalCategory === 'BOI' ? data.boiCategory : null,
      vendorId: data.vendorId,
      dateOfPurchase: data.dateOfPurchase,
      referenceNumber: data.referenceNumber || null,
      description: data.description || null,
      poNumber: data.poNumber,
      quantity: data.quantity,
      unit: data.unit || null,
      location: data.location || null,
      projectId: data.projectId || null,
    }
  });

  revalidatePath("/inventory");
}

export async function updateInventoryItem(id: string, data: {
  name: string;
  globalCategory: GlobalCategory;
  boiCategory?: BOICategory | null;
  vendorId: string;
  dateOfPurchase: Date;
  referenceNumber?: string;
  description?: string;
  poNumber: string;
  quantity: number;
  unit?: string;
  location?: string;
  projectId?: string;
}) {
  await prisma.inventoryItem.update({
    where: { id },
    data: {
      name: data.name,
      globalCategory: data.globalCategory,
      boiCategory: data.globalCategory === 'BOI' ? data.boiCategory : null,
      vendorId: data.vendorId,
      dateOfPurchase: data.dateOfPurchase,
      referenceNumber: data.referenceNumber || null,
      description: data.description || null,
      poNumber: data.poNumber,
      quantity: data.quantity,
      unit: data.unit || null,
      location: data.location || null,
      projectId: data.projectId || null,
    }
  });

  revalidatePath("/inventory");
}

export async function deleteInventoryItem(id: string) {
  await prisma.inventoryItem.delete({
    where: { id }
  });

  revalidatePath("/inventory");
}

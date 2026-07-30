"use server"

import { prisma } from "@/lib/prisma/client";

export async function getVendors() {
  return await prisma.vendor.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function createVendor(data: { name: string; code: string }) {
  return await prisma.vendor.create({
    data: {
      name: data.name,
      code: data.code
    }
  });
}

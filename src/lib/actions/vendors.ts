"use server"

import { prisma } from "@/lib/prisma/client";

export async function getVendors() {
  return await prisma.vendor.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function createVendor(data: { name: string; code?: string; category?: string; contactName?: string; contactEmail?: string; contactPhone?: string; address?: string; state?: string; gstStatus?: string; }) {
  // If no code provided, generate initials from name with sequential 4-digit number
  let code = data.code;
  if (!code) {
    const cleanWords = data.name.split(/[^A-Za-z0-9]/).filter(Boolean);
    const prefix = cleanWords.map(w => w[0]).join('').toUpperCase().substring(0, 5) || 'VEND';
    
    const existing = await prisma.vendor.findMany({
      where: { code: { startsWith: `${prefix}-` } },
      orderBy: { code: 'desc' }
    });
    
    let nextNum = 1;
    for (const v of existing) {
      if (v.code) {
        const match = v.code.match(/-(\d{2})$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num >= nextNum) {
            nextNum = num + 1;
            break;
          }
        }
      }
    }
    
    code = `${prefix}-${String(nextNum).padStart(2, '0')}`;
  }

  return await prisma.vendor.create({
    data: {
      ...data,
      code
    }
  });
}

export async function updateVendor(id: string, data: any) {
  return await prisma.vendor.update({
    where: { id },
    data
  });
}

export async function deleteVendor(id: string) {
  return await prisma.vendor.delete({
    where: { id }
  });
}

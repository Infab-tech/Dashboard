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
    const initials = data.name.split(' ').map(w => w[0]).join('').replace(/[^A-Za-z0-9]/g, '').toUpperCase().substring(0, 5) || 'VEND';
    
    const existing = await prisma.vendor.findMany({
      where: { code: { startsWith: `${initials}-` } },
      orderBy: { code: 'desc' },
      take: 1
    });
    
    let nextNum = 1;
    if (existing.length > 0 && existing[0].code) {
      const match = existing[0].code.match(/-(\d{4})$/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    
    code = `${initials}-${String(nextNum).padStart(4, '0')}`;
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

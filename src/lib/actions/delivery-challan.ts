"use server";

import { prisma } from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";

export async function getDeliveryChallans() {
  return await prisma.deliveryChallan.findMany({
    include: {
      project: true,
      vendor: true,
      items: {
        include: {
          inventoryItem: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });
}

export async function createDeliveryChallan(data: any) {
  try {
    const { code, date, projectId, vendorId, recipient, address, gstNumber, placeOfSupply, jobReference, jobType, status, remarks, items } = data;

    const newChallan = await prisma.$transaction(async (tx: any) => {
      const challan = await tx.deliveryChallan.create({
        data: {
          code,
          date: date ? new Date(date) : new Date(),
          projectId: projectId || null,
          vendorId: vendorId || null,
          recipient,
          address,
          gstNumber,
          placeOfSupply,
          jobReference,
          jobType,
          status: status || "Open",
          remarks,
          items: {
            create: items.map((item: any) => ({
              inventoryItemId: item.inventoryItemId,
              description: item.description,
              quantity: parseInt(item.quantity, 10),
              remarks: item.remarks,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      for (const item of challan.items) {
        await tx.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return challan;
    });

    revalidatePath("/delivery-challan");
    revalidatePath("/inventory");
    return { success: true, data: newChallan };
  } catch (error: any) {
    console.error("Failed to create Delivery Challan:", error);
    return { success: false, error: error.message || "Failed to create Delivery Challan" };
  }
}

export async function deleteDeliveryChallan(id: string) {
  try {
    await prisma.$transaction(async (tx: any) => {
      const challan = await tx.deliveryChallan.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!challan) throw new Error("Challan not found");

      for (const item of challan.items) {
        await tx.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: {
            quantity: {
              increment: item.quantity,
            },
          },
        });
      }

      await tx.deliveryChallan.delete({
        where: { id },
      });
    });

    revalidatePath("/delivery-challan");
    revalidatePath("/inventory");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete Delivery Challan:", error);
    return { success: false, error: error.message || "Failed to delete Delivery Challan" };
  }
}

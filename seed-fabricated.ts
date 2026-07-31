import { PrismaClient, GlobalCategory } from '@prisma/client';

const prisma = new PrismaClient();

// Data extracted from the fabricated inventory image
const rawFabricatedData = [
  { sNo: 7, partName: "PISTON CUTRING", ref: "MBIPL-PS-3001-009", material: "SS", grade: "SS 304", vendor: "SPARTAN", inStock: 24, used: 24, balance: 0, units: "Nos" },
  { sNo: 8, partName: "PISTON O-RING", ref: "MBIPL-PS-3001-011", material: "SS", grade: "SS 304", vendor: "SPARTAN", inStock: 24, used: 24, balance: 0, units: "Nos" },
  { sNo: 9, partName: "BELLEVILE DISK SPRING", ref: "MBIPL-PS-3001-012", material: "HCS / C90", grade: "AISI 1080 / EN", vendor: "N.N. ENGINEERING", inStock: 48, used: 48, balance: 0, units: "Nos" },
  { sNo: 10, partName: "BILLIEVEIL DISK SPRING O-RING", ref: "MBIPL-PS-3001-013", material: "SS", grade: "SS 304", vendor: "SPARTAN", inStock: 24, used: 24, balance: 0, units: "Nos" },
  { sNo: 11, partName: "BELLEVILLE DISK SPRING CUTRING", ref: "MBIPL-PS-3001-014", material: "SS", grade: "SS 304", vendor: "SPARTAN", inStock: 24, used: 24, balance: 0, units: "Nos" },
  { sNo: 12, partName: "LOCKING PLATE (PISTON)", ref: "MBIPL-PS-3001-015", material: "SS", grade: "316-AMS 5653", vendor: "ADEL", inStock: 24, used: 24, balance: 0, units: "Nos" },
  { sNo: 13, partName: "SWITCH CASING", ref: "MBIPL-PS-3001-016", material: "AL", grade: "6061-T6 (AMS 4027)", vendor: "ADEL", inStock: 24, used: 24, balance: 0, units: "Nos" },
  { sNo: 14, partName: "CONNECTOR PLATE", ref: "MBIPL-PS-3001-017", material: "SS", grade: "316-AMS 5653", vendor: "ADEL", inStock: 24, used: 24, balance: 0, units: "Nos" },
  
  { sNo: 15, partName: "ENCLOSER - PB & EMDP", ref: "MBIPL-PS-3004-001", material: "SS316L", grade: "316-AMS 5653", vendor: "ADEL", inStock: 16, used: 16, balance: 0, units: "Nos" },
  { sNo: 16, partName: "NEEDLE - PB & EMDP", ref: "MBIPL-PS-3004-002", material: "SS316L", grade: "316-AMS 5653", vendor: "ADEL", inStock: 16, used: 16, balance: 0, units: "Nos" },
  { sNo: 17, partName: "LOCKING PLATE", ref: "MBIPL-PS-3004-003", material: "AL", grade: "6061-T6 (AMS 4027)", vendor: "ADEL", inStock: 16, used: 16, balance: 0, units: "Nos" },
  { sNo: 18, partName: "PISTON", ref: "MBIPL-PS-3004-004", material: "AL", grade: "6061-T6 (AMS 4027)", vendor: "ADEL", inStock: 16, used: 16, balance: 0, units: "Nos" },
  { sNo: 19, partName: "TOP CAP- PB", ref: "MBIPL-PS-3004-006", material: "AL", grade: "6061-T6 (AMS 4027)", vendor: "ADEL", inStock: 8, used: 8, balance: 0, units: "Nos" },
  { sNo: 20, partName: "TEFLON SLEEVE", ref: "MBIPL-PS-3004-007", material: "PTFE", grade: "AMS 3656", vendor: "ADEL", inStock: 16, used: 16, balance: 0, units: "Nos" },
  { sNo: 21, partName: "BOTTOM CAP – PB", ref: "MBIPL-PS-3004-008", material: "AL", grade: "6061-T6 (AMS 4027)", vendor: "ADEL", inStock: 8, used: 8, balance: 0, units: "Nos" },
  { sNo: 22, partName: "CONNECTOR PLATE - PB", ref: "MBIPL-PS-3004-009", material: "SS316L", grade: "316-AMS 5653", vendor: "ADEL", inStock: 8, used: 8, balance: 0, units: "Nos" },
  { sNo: 23, partName: "SWITCH CASING", ref: "MBIPL-PS-3004-011", material: "AL", grade: "6061-T6 (AMS 4027)", vendor: "ADEL", inStock: 16, used: 16, balance: 0, units: "Nos" },
  { sNo: 24, partName: "TOP CAP- EMDP", ref: "MBIPL-PS-3005-002", material: "AL", grade: "6061-T6 (AMS 4027)", vendor: "ADEL", inStock: 8, used: 8, balance: 0, units: "Nos" },
  { sNo: 25, partName: "BOTTOM CAP – EMDP", ref: "MBIPL-PS-3005-003", material: "AL", grade: "6061-T6 (AMS 4027)", vendor: "ADEL", inStock: 8, used: 8, balance: 0, units: "Nos" },
  { sNo: 26, partName: "CONNECTOR PLATE - EMDP", ref: "MBIPL-PS-3005-004", material: "SS316L", grade: "316-AMS 5653", vendor: "ADEL", inStock: 8, used: 8, balance: 0, units: "Nos" },
  
  { sNo: 27, partName: "PROCESS CONNECTOR", ref: "MBIPL-PT-4001-001", material: "SS316L", grade: "316-AMS 5653", vendor: "ADEL", inStock: 0, used: 12, balance: -12, units: "Nos" },
  { sNo: 28, partName: "PRESSURE SENSOR CELL ADAPTOR", ref: "MBIPL-PT-4001-002", material: "SS316L", grade: "316-AMS 5653", vendor: "ADEL", inStock: 0, used: 12, balance: -12, units: "Nos" },
  { sNo: 29, partName: "ENCLOSURE", ref: "MBIPL-PT-4001-006", material: "SS316L", grade: "316-AMS 5653", vendor: "ADEL", inStock: 0, used: 12, balance: -12, units: "Nos" },
  
  { sNo: 30, partName: "PROCESS CONNECTOR", ref: "MBIPL-PT-4003-001", material: "SS316L", grade: "316-AMS 5654", vendor: "ADEL", inStock: 0, used: 55, balance: -55, units: "Nos" },
  { sNo: 31, partName: "PS CELL ADAPTOR", ref: "MBIPL-PT-4003-002", material: "BRASS", grade: "AMS", vendor: "ADEL", inStock: 0, used: 55, balance: -55, units: "Nos" },
  { sNo: 32, partName: "ENCLOSURE", ref: "MBIPL-PT-4003-006", material: "SS316L", grade: "316-AMS 5653", vendor: "ADEL", inStock: 0, used: 55, balance: -55, units: "Nos" },
  
  { sNo: 33, partName: "HOUSING", ref: "MB2K-I5-8000-001-000", material: "AL", grade: "6061-T6 (AMS 4027)", vendor: "ADEL", inStock: 0, used: 6, balance: -6, units: "Nos" },
  { sNo: 34, partName: "ADJUSTMENT SCREW", ref: "MB2K-I5-8000-002-000", material: "SS316L", grade: "316-AMS 5653", vendor: "ADEL", inStock: 0, used: 6, balance: -6, units: "Nos" },
  { sNo: 35, partName: "ACTUATING ELEMENT", ref: "MB2K-I5-8000-003-000", material: "SS316L", grade: "316-AMS 5654", vendor: "ADEL", inStock: 0, used: 6, balance: -6, units: "Nos" },
  { sNo: 36, partName: "AE GUIDE", ref: "MB2K-I5-8000-004-000", material: "SS316L", grade: "316-AMS 5655", vendor: "ADEL", inStock: 0, used: 6, balance: -6, units: "Nos" },
  { sNo: 37, partName: "SNAP DISC", ref: "MB2K-I5-8000-005-000", material: "C98", grade: "EN", vendor: "N.N. ENGINEERING", inStock: 0, used: 6, balance: -6, units: "Nos" },
  { sNo: 38, partName: "CONNECTING ROD", ref: "MB2K-I5-8000-006-000", material: "SS316L", grade: "316-AMS 5655", vendor: "ADEL", inStock: 0, used: 6, balance: -6, units: "Nos" },
  { sNo: 39, partName: "SPLIT RING", ref: "MB2K-I5-8000-007-000", material: "SS", grade: "SS 304", vendor: "SPARTAN", inStock: 0, used: 6, balance: -6, units: "Nos" },
  { sNo: 40, partName: "DISC SEAT", ref: "MB2K-I5-8000-008-000", material: "SS316L", grade: "316-AMS 5655", vendor: "ADEL", inStock: 0, used: 6, balance: -6, units: "Nos" },
  { sNo: 41, partName: "LEVER PLATE TOP", ref: "MB2K-I5-8000-012-000", material: "SS316L", grade: "316-AMS 5656", vendor: "ADEL", inStock: 0, used: 6, balance: -6, units: "Nos" },
  { sNo: 42, partName: "LEVER PLATE BOTTOM", ref: "MB2K-I5-8000-013-000", material: "SS316L", grade: "316-AMS 5657", vendor: "ADEL", inStock: 0, used: 6, balance: -6, units: "Nos" },
  { sNo: 43, partName: "INNER LEVER", ref: "MB2K-I5-8000-015-000", material: "SS316L", grade: "316-AMS 5659", vendor: "ADEL", inStock: 0, used: 6, balance: -6, units: "Nos" },
  { sNo: 44, partName: "OUTER LEVER", ref: "MB2K-I5-8000-016-000", material: "SS316L", grade: "316-AMS 5660", vendor: "ADEL", inStock: 0, used: 6, balance: -6, units: "Nos" },
  { sNo: 45, partName: "L-POST", ref: "MB2K-I5-8000-017-000", material: "SS316L", grade: "316-AMS 5661", vendor: "ADEL", inStock: 0, used: 6, balance: -6, units: "Nos" },
  { sNo: 46, partName: "CONNECTOR ADAPTOR", ref: "MB2K-I5-8000-018-000", material: "SS316L", grade: "316-AMS 5662", vendor: "ADEL", inStock: 0, used: 6, balance: -6, units: "Nos" }
];

async function main() {
  console.log('Seeding fabricated items inventory...');

  for (const item of rawFabricatedData) {
    let vendor = null;
    if (item.vendor) {
      // Find or create vendor
      vendor = await prisma.vendor.findFirst({ where: { name: item.vendor } });
      if (!vendor) {
        vendor = await prisma.vendor.create({ data: { name: item.vendor } });
      }
    }

    await prisma.inventoryItem.create({
      data: {
        name: item.partName,
        referenceNumber: item.ref,
        description: `Material: ${item.material} | Grade: ${item.grade}`,
        globalCategory: GlobalCategory.FABRICATED,
        vendorId: vendor?.id || null,
        // Using "inStock" for quantity, as physical inventory cannot be negative
        quantity: item.inStock,
        unit: item.units,
      }
    });
  }

  console.log(`Successfully imported ${rawFabricatedData.length} fabricated items!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

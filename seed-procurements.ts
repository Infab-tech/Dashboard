import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const data = [
  { projectName: "ITC Heater", itemRequired: null, vendorName: "Malu group.", status: "Not Ordered", remarks: null },
  { projectName: "ITC Heater", itemRequired: "Adhesive", vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "Pressure Transducer 280 & 330 Bar", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "Pressure Transducer 280 & 330 Bar", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "Pressure Switch A1, A2 & A3", itemRequired: "EXTRA UNITS FOR BACK UP AND 2 BROKEN UNIT", vendorName: "ADEL", status: "Quotation Received", remarks: null },
  { projectName: "Pressure Switch A1, A2 & A3", itemRequired: "SNAP DISC HEAT TREATMENT", vendorName: "UNICARB", status: "Dispatched", remarks: null },
  { projectName: "Pressure Switch EMDP", itemRequired: "SPRING SEAL", vendorName: "SEIZO", status: "Not Ordered", remarks: null },
  { projectName: "Pressure Switch EMDP", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "Pressure Switch Parking Brake", itemRequired: "SPRING SEAL", vendorName: "SEIZO", status: "Not Ordered", remarks: null },
  { projectName: "Pressure Switch Parking Brake", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "Pressure Switch DPS", itemRequired: "WELDING", vendorName: "LPSC", status: "Not Ordered", remarks: "NEED TO GET SLOT FOR SPOT WELDING TRIAL" },
  { projectName: "Pressure Switch DPS", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "IIT Guwahati Fabrication", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "IIT Guwahati Fabrication", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "ICMR Chip Development", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "ICMR Chip Development", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "mRNA Chip Development", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "mRNA Chip Development", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "Cantilever Development", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "Cantilever Development", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "Double Emulsion", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "Double Emulsion", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "Single Emulsion", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "Single Emulsion", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "Cancer on Chip (BIRAC)", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "Cancer on Chip (BIRAC)", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "Hall Sensor", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "Hall Sensor", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "High Temperature Pressure Transducer", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
  { projectName: "High Temperature Pressure Transducer", itemRequired: null, vendorName: null, status: "Not Ordered", remarks: null },
];

async function main() {
  await prisma.procurementOrder.deleteMany({});
  console.log("Cleared existing procurements.");

  for (const row of data) {
    // 1. Get or create project
    let project = null;
    if (row.projectName) {
      project = await prisma.project.findFirst({
        where: { name: { equals: row.projectName, mode: 'insensitive' } }
      });
      if (!project) {
        project = await prisma.project.create({
          data: { name: row.projectName, status: "PLANNED" }
        });
      }
    }

    // 2. Get or create vendor
    let vendor = null;
    if (row.vendorName) {
      vendor = await prisma.vendor.findFirst({
        where: { name: { equals: row.vendorName, mode: 'insensitive' } }
      });
      if (!vendor) {
        vendor = await prisma.vendor.create({
          data: { name: row.vendorName }
        });
      }
    }

    // 3. Create Procurement Order
    await prisma.procurementOrder.create({
      data: {
        projectId: project ? project.id : null,
        vendorId: vendor ? vendor.id : null,
        itemRequired: row.itemRequired,
        status: row.status,
        remarks: row.remarks
      }
    });
  }

  console.log(`Successfully seeded ${data.length} procurements.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

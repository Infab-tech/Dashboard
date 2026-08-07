import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const challansData = [
  { date: "2024-04-20T00:00:00Z", code: "INFAB/24-25/001", recipient: "CENTUM", address: "BANGALORE", gstNumber: "29AADCC97...", placeOfSupply: "BANGALORE", jobReference: "Fab", jobType: "Fabrication", description: "CMM Test part", quantity: 1, status: "Closed" },
  { date: "2024-04-20T00:00:00Z", code: "INFAB/24-25/002", recipient: "CENTUM", address: "BANGALORE", gstNumber: "29AADCC97...", placeOfSupply: "BANGALORE", jobReference: "Fab", jobType: "Fabrication", description: "Testing Jig", quantity: 1, status: "Closed" },
  { date: "2024-04-24T00:00:00Z", code: "INFAB/24-25/003", recipient: "BELLATRIX", address: "BANGALORE", gstNumber: "29AAACB12...", placeOfSupply: "BANGALORE", jobReference: "E.BEAM_WELD", jobType: "E beam welding", description: "Thruster Body", quantity: 1, status: "Open" },
  { date: "2024-04-26T00:00:00Z", code: "INFAB/24-25/004", recipient: "CENTUM", address: "BANGALORE", gstNumber: "29AADCC97...", placeOfSupply: "BANGALORE", jobReference: "Fab", jobType: "Fabrication", description: "Dummy part", quantity: 1, status: "Closed" },
  { date: "2024-04-26T00:00:00Z", code: "INFAB/24-25/005", recipient: "BELLATRIX", address: "BANGALORE", gstNumber: "29AAACB12...", placeOfSupply: "BANGALORE", jobReference: "E.BEAM_WELD", jobType: "E beam welding", description: "Injector", quantity: 2, status: "Open" },
  { date: "2024-05-02T00:00:00Z", code: "INFAB/24-25/006", recipient: "INDO MIM", address: "BANGALORE", gstNumber: "29AAACI34...", placeOfSupply: "BANGALORE", jobReference: "Fab", jobType: "Fabrication", description: "Base Plate", quantity: 4, status: "Closed" },
  { date: "2024-05-04T00:00:00Z", code: "INFAB/24-25/007", recipient: "INDO MIM", address: "BANGALORE", gstNumber: "29AAACI34...", placeOfSupply: "BANGALORE", jobReference: "Fab", jobType: "Fabrication", description: "Support Stand", quantity: 4, status: "Closed" },
  { date: "2024-05-10T00:00:00Z", code: "INFAB/24-25/008", recipient: "KINECO KAMAN", address: "BELAGAVI", gstNumber: "29AAACK56...", placeOfSupply: "BELAGAVI", jobReference: "F.W", jobType: "WELD", description: "Cover Plate", quantity: 1, status: "Closed" },
  { date: "2024-05-12T00:00:00Z", code: "INFAB/24-25/009", recipient: "KINECO KAMAN", address: "BELAGAVI", gstNumber: "29AAACK56...", placeOfSupply: "BELAGAVI", jobReference: "F.W", jobType: "WELD", description: "Main Frame", quantity: 1, status: "Closed" },
  { date: "2024-05-15T00:00:00Z", code: "INFAB/24-25/010", recipient: "KINECO KAMAN", address: "BELAGAVI", gstNumber: "29AAACK56...", placeOfSupply: "BELAGAVI", jobReference: "F.W", jobType: "WELD", description: "Support Bracket", quantity: 2, status: "Closed" },
];

async function main() {
  // Try to find a default inventory item or create one
  let defaultItem = await prisma.inventoryItem.findFirst();
  if (!defaultItem) {
    defaultItem = await prisma.inventoryItem.create({
      data: {
        name: "General Supplied Part",
        code: "GEN-001",
        quantity: 1000,
      }
    });
  }

  console.log("Deleting old seeded data to refresh it...");
  await prisma.deliveryChallan.deleteMany({
    where: {
      code: {
        in: challansData.map(c => c.code)
      }
    }
  });

  console.log("Seeding delivery challans...");

  for (const c of challansData) {
    const existing = await prisma.deliveryChallan.findUnique({ where: { code: c.code } });
    if (existing) {
      console.log(`Skipping ${c.code}, already exists.`);
      continue;
    }

    await prisma.deliveryChallan.create({
      data: {
        code: c.code,
        date: new Date(c.date),
        recipient: c.recipient,
        address: c.address,
        gstNumber: c.gstNumber,
        placeOfSupply: c.placeOfSupply,
        jobReference: c.jobReference,
        jobType: c.jobType,
        status: c.status,
        items: {
          create: {
            inventoryItemId: defaultItem.id,
            description: c.description,
            quantity: c.quantity,
          }
        }
      }
    });
    console.log(`Created ${c.code}`);
  }

  console.log("Seeding finished.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

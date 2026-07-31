import { PrismaClient, AssetStatus } from '@prisma/client';

const prisma = new PrismaClient();

const assetsData = [
  { name: 'HOT PLATE', modelNumber: '8"', value: 3068, quantity: 1 },
  { name: 'VESPEL', modelNumber: null, value: 89000, quantity: 1 },
  { name: 'SPECIAL LENSE', modelNumber: '75mm*50mm', value: 1770, quantity: 10 },
  { name: 'MICRO SCOPE', modelNumber: null, value: null, quantity: 2 },
  { name: 'DEAD WEIGHT TESTER', modelNumber: null, value: null, quantity: 1 },
  { name: '3D PRINTER', modelNumber: null, value: 20000, quantity: 1 },
  { name: 'MINI DRILLING MACHINE', modelNumber: null, value: null, quantity: 1 },
  { name: 'FLUIGENT', modelNumber: null, value: null, quantity: 1 },
  { name: 'Slygard', modelNumber: '184', value: 15930, quantity: 1, description: '1.1kg' },
  { name: 'KB 1040', modelNumber: 'Medical grade', value: 3422, quantity: 1 },
  { name: 'DESKTOPS', modelNumber: null, value: null, quantity: 2 },
  { name: 'WORK STATIONS', modelNumber: null, value: null, quantity: 1 },
  { name: 'LAPTOPS', modelNumber: 'Intel i3+APPLE', value: null, quantity: 5 },
  { name: 'CHAIRS', modelNumber: null, value: null, quantity: 27 },
  { name: 'PEDESTRIAL', modelNumber: null, value: null, quantity: 6 },
  { name: 'PRINTER', modelNumber: null, value: null, quantity: 3 },
  { name: 'MOVABLE FANS', modelNumber: null, value: null, quantity: 3 },
  { name: 'Anycubic Resin White', modelNumber: null, value: null, quantity: 1 },
  { name: 'Anycubic Resin Clear', modelNumber: null, value: null, quantity: 2 },
  { name: 'IPS (ISOPRPYL ALCOHOL)', modelNumber: null, value: null, quantity: 1 },
  { name: 'ACETONE', modelNumber: null, value: null, quantity: 1 },
  { name: 'KOHESI BOND (Part A & B)', modelNumber: null, value: null, quantity: 1 },
  { name: 'Locktite (Thread Locker)', modelNumber: null, value: null, quantity: 1 },
  { name: 'Locktite 572', modelNumber: null, value: null, quantity: 1 },
  { name: 'Locktite 262', modelNumber: null, value: null, quantity: 1 },
  { name: 'Locktite 272', modelNumber: null, value: null, quantity: 1 },
  { name: 'Locktite Super glue', modelNumber: null, value: null, quantity: 1 },
  { name: 'Locktite Primer/Activator(SF 7649)', modelNumber: null, value: null, quantity: 1 },
  { name: 'Locktite Epoxy EA 9394 (Part A QT ES)', modelNumber: null, value: null, quantity: 1 },
  { name: 'Locktite Epoxy EA 9394 (Part B 80Z ES)', modelNumber: null, value: null, quantity: 1 },
  { name: 'DOWSIL 3145 RTV (Adhesive/Sealant)', modelNumber: null, value: null, quantity: 1 },
  { name: 'Araldite (Klear 5 Epoxy Adhesive)', modelNumber: null, value: null, quantity: 2 },
  { name: 'Silicon Oil (LA86)', modelNumber: null, value: null, quantity: 2 },
  { name: 'Snoop (Liquid leak detector)', modelNumber: null, value: null, quantity: 1 },
  { name: 'DI Water', modelNumber: null, value: null, quantity: 3 },
  { name: 'Aircraft Fuel', modelNumber: null, value: null, quantity: 1 },
  { name: 'Hydraulic Oil', modelNumber: null, value: null, quantity: 1 },
  { name: 'Vespel Rod Sample', modelNumber: null, value: null, quantity: 1 },
  { name: 'Polymide Tape 1mil Rolls-Silicone', modelNumber: null, value: null, quantity: 1 }
];

async function main() {
  await prisma.asset.deleteMany({}); // Optional: clear existing if any test data is there

  for (const item of assetsData) {
    await prisma.asset.create({
      data: {
        name: item.name,
        modelNumber: item.modelNumber,
        value: item.value,
        quantity: item.quantity,
        description: item.description || null,
        status: 'IN_STORAGE' as AssetStatus,
      }
    });
  }

  console.log(`Successfully seeded ${assetsData.length} assets.`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: 'asc' }
  });

  // First, nullify all codes to prevent unique constraint conflicts during update
  await prisma.vendor.updateMany({
    data: { code: null }
  });

  // Keep track of prefixes to increment counters
  const prefixCounters: Record<string, number> = {};

  for (const vendor of vendors) {
    const cleanWords = vendor.name.split(/[^A-Za-z0-9]/).filter(Boolean);
    const prefix = cleanWords.map(w => w[0]).join('').toUpperCase().substring(0, 5) || 'VEND';

    if (!prefixCounters[prefix]) {
      prefixCounters[prefix] = 1;
    } else {
      prefixCounters[prefix]++;
    }

    const nextNum = prefixCounters[prefix];
    const newCode = `${prefix}-${String(nextNum).padStart(2, '0')}`;

    await prisma.vendor.update({
      where: { id: vendor.id },
      data: { code: newCode }
    });
  }

  console.log(`Successfully updated codes for ${vendors.length} vendors.`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

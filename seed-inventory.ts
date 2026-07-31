import { PrismaClient, GlobalCategory, BOICategory } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function parseCategory(cat: string): { globalCategory: GlobalCategory | null; boiCategory: BOICategory | null } {
  const c = cat.toLowerCase();
  
  if (c.includes('consumable')) {
    return { globalCategory: 'CONSUMABLES', boiCategory: null };
  }
  
  if (c.includes('raw material')) {
    return { globalCategory: 'RAW_MATERIALS', boiCategory: null };
  }
  
  if (c.includes('boughtout') || c.includes('electronics component')) {
    let boi: BOICategory = 'MECHANICAL';
    if (c.includes('electronic')) boi = 'ELECTRONICS';
    if (c.includes('electro-mechanical')) boi = 'ELECTRICAL';
    
    return { globalCategory: 'BOI', boiCategory: boi };
  }

  return { globalCategory: null, boiCategory: null };
}

async function main() {
  const tsvPath = path.join(process.cwd(), 'raw-inventory.tsv');
  const content = fs.readFileSync(tsvPath, 'utf-8');
  
  const lines = content.split('\n').filter(l => l.trim() !== '');
  
  for (const line of lines) {
    const cols = line.split('\t').map(c => c.trim());
    if (cols.length < 8) continue;
    
    const [name, ref, material, grade, vendorName, qtyStr, unit, category] = cols;
    const qty = parseInt(qtyStr, 10) || 0;
    
    // Process Vendor
    let vendorId: string | null = null;
    if (vendorName && vendorName !== '-' && vendorName !== 'nan') {
      let vendor = await prisma.vendor.findFirst({ where: { name: vendorName } });
      if (!vendor) {
        vendor = await prisma.vendor.create({
          data: { name: vendorName, category: 'SUPPLIER' }
        });
      }
      vendorId = vendor.id;
    }

    const { globalCategory, boiCategory } = parseCategory(category);
    
    let description = '';
    if (material && material !== 'nan') description += `Material: ${material}. `;
    if (grade && grade !== 'nan' && grade !== '-') description += `Grade: ${grade}.`;
    
    await prisma.inventoryItem.create({
      data: {
        name,
        referenceNumber: ref && ref !== '-' && ref !== 'nan' ? ref : null,
        description: description.trim() || null,
        quantity: qty,
        unit: unit && unit !== 'nan' ? unit : null,
        globalCategory,
        boiCategory,
        vendorId,
        // PO Number is explicitly omitted as requested
      }
    });
  }
  
  console.log(`Successfully seeded ${lines.length} inventory items.`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

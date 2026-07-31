import { PrismaClient, ProjectStatus } from '@prisma/client';

const prisma = new PrismaClient();

const projectsData = [
  { name: "ITC Heater", customer: "ITC Limited", lead: "Jacob", startDate: null, status: "ONGOING", priority: "High" },
  { name: "Pressure Transducer 280 & 330 Bar", customer: "ADA/ MB", lead: "Jacob", startDate: "2022-07-01", status: "ONGOING", priority: "High" },
  { name: "Pressure Switch A1, A2 & A3", customer: "ADA/ MB", lead: "Jacob", startDate: "2022-07-01", status: "ONGOING", priority: "High" },
  { name: "Pressure Switch EMDP", customer: "ADA/ MB", lead: "Jacob", startDate: "2024-02-01", status: "ONGOING", priority: "High" },
  { name: "Pressure Switch Parking Brake", customer: "ADA/ MB", lead: "Jacob", startDate: "2024-02-01", status: "ONGOING", priority: "High" },
  { name: "Pressure Switch DPS", customer: "ADA/ MB", lead: "Jacob", startDate: "2022-07-01", status: "ONGOING", priority: "High" },
  { name: "IIT Guwahati Fabrication", customer: "IITG", lead: "Saara", startDate: null, status: "COMPLETED", priority: "Low" },
  { name: "ICMR Chip Development", customer: "ICMR", lead: "Yousuf", startDate: null, status: "ONGOING", priority: "Medium" },
  { name: "mRNA Chip Development", customer: "TIGS", lead: "Yousuf", startDate: null, status: "ON_HOLD", priority: "Low" },
  { name: "Cantilever Development", customer: "Gloport Photonix", lead: "Saara", startDate: null, status: "PLANNED", priority: "Medium" },
  { name: "Double Emulsion", customer: "INFAB-Internal", lead: "Yousuf", startDate: null, status: "ONGOING", priority: "Medium" },
  { name: "Single Emulsion", customer: "INFAB-Internal", lead: "Yousuf", startDate: null, status: "COMPLETED", priority: "Medium" },
  { name: "Cancer on Chip (BIRAC)", customer: "BIRAC", lead: "Yousuf", startDate: null, status: "ONGOING", priority: "Medium" },
  { name: "Hall Sensor", customer: "MB", lead: "Raman", startDate: null, status: "ONGOING", priority: "High" },
  { name: "High Temperature Pressure Transducer", customer: "ADA/ MB", lead: "Jacob", startDate: null, status: "ONGOING", priority: "High" }
];

async function main() {
  for (const p of projectsData) {
    // Upsert person (Project Lead)
    let person = await prisma.person.findFirst({ where: { name: p.lead } });
    if (!person) {
      person = await prisma.person.create({ data: { name: p.lead } });
    }

    const description = `Customer: ${p.customer} | Priority: ${p.priority}`;

    await prisma.project.create({
      data: {
        name: p.name,
        description,
        status: p.status as ProjectStatus,
        startDate: p.startDate ? new Date(p.startDate) : null,
        projectLeadId: person.id
      }
    });
  }
  console.log(`Successfully seeded ${projectsData.length} projects.`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

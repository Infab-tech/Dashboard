import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rawLogs = [
  // 01/07/26
  { date: "2026-07-01", serialNo: 1, projectName: "CMTI", task: "Endurance test", assignedTo: "Chandru / Amos", targetDateOrStatus: "In Progress", remarks: "Test started at 8:00 PM. 5000 cycles completed with no issues." },
  { date: "2026-07-01", serialNo: 2, projectName: "ITC", task: "Simulation", assignedTo: "Jacob", targetDateOrStatus: "In Progress", remarks: "Simulation is ongoing." },
  { date: "2026-07-01", serialNo: 3, projectName: "DPS", task: "Welding fixture sent for rework - dimensions were not specific", assignedTo: "Jacob", targetDateOrStatus: "06/06/26", remarks: "Rework is ongoing." },
  { date: "2026-07-01", serialNo: 4, projectName: "EMDP", task: "Send 6 new sets of components to Infab", assignedTo: "Jacob", targetDateOrStatus: "01/07/26", remarks: "Sending today." },
  { date: "2026-07-01", serialNo: 5, projectName: "Pressure Switch", task: "Collect snap discs from Unicarb", assignedTo: "Jacob", targetDateOrStatus: "01/07/26", remarks: "Collecting today." },
  { date: "2026-07-01", serialNo: 6, projectName: "ITC", task: "Design review with Chhaperia", assignedTo: "Jacob", targetDateOrStatus: "30/06/26", remarks: "Confirmed yesterday and drawing sent." },
  { date: "2026-07-01", serialNo: 7, projectName: "Steel Drawing", task: "Sent steel drawing to Muthuraman", assignedTo: "Jacob", targetDateOrStatus: "30/06/26", remarks: "Drawing sent." },
  
  // 02/07/26
  { date: "2026-07-02", serialNo: 1, projectName: "EMDP", task: "Sent 6 new sets of components to Infab", assignedTo: "Jacob", targetDateOrStatus: "01/07/26", remarks: "Completed" },
  { date: "2026-07-02", serialNo: 2, projectName: "CMTI", task: "Endurance test", assignedTo: "Chandru / Amos", targetDateOrStatus: "04/07/26", remarks: "Expected to be completed by 04-07-2026 (Saturday)." },
  { date: "2026-07-02", serialNo: 3, projectName: "CMTI", task: "Confirm Aura plastic drawing", assignedTo: "Muthuraman", targetDateOrStatus: "02/07/26", remarks: "Awaiting confirmation." },
  { date: "2026-07-02", serialNo: 4, projectName: "Pressure Switch", task: "Collect snap discs from Unicarb", assignedTo: "Jacob", targetDateOrStatus: "01/07/26", remarks: "Delayed from Unicarb. Expected to be completed by 03-07-2026." },
  { date: "2026-07-02", serialNo: 5, projectName: "DPS", task: "Fabrication of new welding fixture", assignedTo: "Jacob", targetDateOrStatus: "In Progress", remarks: "Rework is not feasible, so a new fixture is being fabricated. Jacob will provide the timeline today." },
  { date: "2026-07-02", serialNo: 6, projectName: "ITC", task: "Simulation", assignedTo: "Amos", targetDateOrStatus: "Not Yet Started", remarks: "If started today, it is expected to take 3-4 weeks to complete." },
  { date: "2026-07-02", serialNo: 7, projectName: "Pressure Switch", task: "High Temperature Pressure Transducer", assignedTo: "Jacob", targetDateOrStatus: "10/07/26", remarks: "Product is expected to be received by 10-11 July 2026." },
  { date: "2026-07-02", serialNo: 8, projectName: "Fabrication / Rework", task: "Identify and finalize a new vendor for fabrication/rework", assignedTo: "Chandru / Tejaswini", targetDateOrStatus: "Done", remarks: "On Saturday, Muthuraman and Amos will meet vendors at their premises for evaluation." },
  
  // 03/07/26
  { date: "2026-07-03", serialNo: 1, projectName: "EMDP", task: "Received 6 new sets of components but in 1 part there is a deviation", assignedTo: "Chandru / Jacob", targetDateOrStatus: null, remarks: null },
  { date: "2026-07-03", serialNo: 2, projectName: "DPA", task: "Vendor confirmation is pending and expected to be sent tomorrow", assignedTo: "Jacob", targetDateOrStatus: "06/07/26", remarks: null },
  { date: "2026-07-03", serialNo: 3, projectName: "Pressure Switch", task: "Following up with Unicarb", assignedTo: "Tejaswini / Jacob", targetDateOrStatus: "06/07/26", remarks: "Unable to reach them, Jacob visiting plant physically." },
  { date: "2026-07-03", serialNo: 4, projectName: "ITC", task: "Evaluating recent samples, shared patentable features", assignedTo: "Jacob", targetDateOrStatus: null, remarks: null },
  { date: "2026-07-03", serialNo: 5, projectName: "BLS", task: "Need update", assignedTo: "Prem", targetDateOrStatus: "05/07/26", remarks: null },
  
  // 06/07/26
  { date: "2026-07-06", serialNo: 1, projectName: "EMDP", task: "Part inspection", assignedTo: "Chandru / Jacob", targetDateOrStatus: "06/07/26", remarks: "Sealed ring preparation by Jacob on 10-07-2026." },
  { date: "2026-07-06", serialNo: 2, projectName: "DPS", task: "Welding fixtures and discs are ready", assignedTo: "Jacob", targetDateOrStatus: "Shipping", remarks: "Welding inspection by Amos & Chandru." },
  { date: "2026-07-06", serialNo: 3, projectName: "DPS", task: "Collect welding documents OR sample from LPSC", assignedTo: "Amos / Chandru", targetDateOrStatus: "06/07/26", remarks: null },
  { date: "2026-07-06", serialNo: 4, projectName: "Pressure Switch and Disc", task: "Collect snap discs from Unicarb", assignedTo: "Jacob", targetDateOrStatus: "06/07/26", remarks: null },
  { date: "2026-07-06", serialNo: 5, projectName: "NDA", task: "Obtain signature", assignedTo: "Tejaswini", targetDateOrStatus: null, remarks: null },
  { date: "2026-07-06", serialNo: 6, projectName: "Pressure Switch Assembly", task: "Complete High Temperature Pressure Transducer assembly", assignedTo: "Jacob", targetDateOrStatus: "08/07/26", remarks: null },
  { date: "2026-07-06", serialNo: 7, projectName: "ITC", task: "Collect adhesive from Venki", assignedTo: "Tejaswini", targetDateOrStatus: null, remarks: null },
  { date: "2026-07-06", serialNo: 8, projectName: "Pressure Switch Assembly", task: "Soldering, epoxy potting, and wire correction", assignedTo: "Prem", targetDateOrStatus: "07/07/26", remarks: "Monitored by Amos & Chandru." },
  { date: "2026-07-06", serialNo: 9, projectName: "Pressure Switch", task: "High Temperature Pressure Transducer", assignedTo: "Jacob", targetDateOrStatus: "10/07/26", remarks: "Starts work today." },
  { date: "2026-07-06", serialNo: 10, projectName: "BLS", task: "Need update", assignedTo: "Prem", targetDateOrStatus: null, remarks: "As Prem went for customer visit with Muthuraman, will update soon." },

  // 07/07/26
  { date: "2026-07-07", serialNo: 1, projectName: "DPS", task: "Unicarb collect snap disc", assignedTo: "Tejaswini", targetDateOrStatus: null, remarks: "We have not received from Unicarb, snap discs are not ready." },
  { date: "2026-07-07", serialNo: 2, projectName: "LPSC", task: "Collect fixtures from Saara", assignedTo: "Saara", targetDateOrStatus: "Done", remarks: "Given by Jacob." },
  { date: "2026-07-07", serialNo: 3, projectName: "NDA", task: "Obtain signature", assignedTo: "Tejaswini", targetDateOrStatus: "Done", remarks: "Got signature from new vendor, need to get signature from Raman." },
  { date: "2026-07-07", serialNo: 4, projectName: "Pressure Switch Assembly", task: "Soldering, epoxy potting, and wire correction", assignedTo: "Prem", targetDateOrStatus: "07/07/26", remarks: "Monitored by Amos & Chandru." },
  { date: "2026-07-07", serialNo: 5, projectName: "ITC", task: "Received MICA rod", assignedTo: "Jacob", targetDateOrStatus: null, remarks: null },

  // 08/07/26
  { date: "2026-07-08", serialNo: 1, projectName: "Pressure Switch", task: "High Temperature PT", assignedTo: "Jacob", targetDateOrStatus: "10/07/26", remarks: null },
  { date: "2026-07-08", serialNo: 2, projectName: "BLS", task: "Need update", assignedTo: "Prem / Jacob / Regin", targetDateOrStatus: "10/07/26", remarks: "Working from 06-07-2026. 70% of work completed - this will be completed by 10-07-2026." },
  { date: "2026-07-08", serialNo: 3, projectName: "BIRAC", task: "Collecting laser cut Acrylic OHP sheets with vendor and sending to Yousuf", assignedTo: "Tejaswini", targetDateOrStatus: null, remarks: "On 07-07-2026 gave for laser cutting." },
  { date: "2026-07-08", serialNo: 4, projectName: "AMOS", task: "Sharing quotation", assignedTo: "Yousuf", targetDateOrStatus: null, remarks: null },
  { date: "2026-07-08", serialNo: 5, projectName: "ADA Projects", task: "Looking for Oscilloscope", assignedTo: "Tejaswini / Amos", targetDateOrStatus: "09/07/26", remarks: "CLOSED" },
  { date: "2026-07-08", serialNo: 6, projectName: "DPS", task: "FIXTURE TO BE SUBMITTED TO LPSC", assignedTo: "Chandru", targetDateOrStatus: null, remarks: "CLOSED" },
  { date: "2026-07-08", serialNo: 7, projectName: "DMDE", task: "SIMULATION", assignedTo: "AMOS", targetDateOrStatus: null, remarks: "2 OF 11" },
  { date: "2026-07-08", serialNo: 8, projectName: "ITC", task: "Ordering ZENO max sheets 10 nos, and Adhesive 1 Roll (Polyimide High Temp. sheet)", assignedTo: "Tejaswini", targetDateOrStatus: null, remarks: null },

  // 09/07/26
  { date: "2026-07-09", serialNo: 1, projectName: "ICMR", task: "Yousuf sent quotation to Prem", assignedTo: "", targetDateOrStatus: null, remarks: null },
  { date: "2026-07-09", serialNo: 2, projectName: "DPS", task: "Unicarb collect snap disc", assignedTo: "Tejaswini", targetDateOrStatus: "09/07/26", remarks: "Received 10 snap discs, Muthuraman following up with Fazal for remaining snap discs." },

  // 10-07-2026
  { date: "2026-07-10", serialNo: 1, projectName: "BLS", task: "Document completed", assignedTo: "Prem", targetDateOrStatus: "10-07-2026", remarks: null },

  // 13-07-2026
  { date: "2026-07-13", serialNo: 1, projectName: "ADA", task: "requirements for QT Testing with CMTI are being discussed with Sho", assignedTo: "Amos", targetDateOrStatus: null, remarks: null },
  { date: "2026-07-13", serialNo: 2, projectName: "ADA", task: "EIP structure is under preparation.", assignedTo: "Amos", targetDateOrStatus: null, remarks: null },
  { date: "2026-07-13", serialNo: 3, projectName: "Pressure switch", task: "Pressure switch model is ready and will be sent to CMTI.", assignedTo: "Amos", targetDateOrStatus: null, remarks: null },
  { date: "2026-07-13", serialNo: 4, projectName: "DPS", task: "Snap disc testing is being carried out today.", assignedTo: "Prem/ Amos", targetDateOrStatus: "13-07-2026", remarks: "Received snapdisc on 11-07-2026" },
  { date: "2026-07-13", serialNo: 5, projectName: "DPS", task: "Snap disc was received on 11 July 2026.", assignedTo: "", targetDateOrStatus: null, remarks: null },
  { date: "2026-07-13", serialNo: 6, projectName: "DPS", task: "Fixture has been handed over to Subromeni.", assignedTo: "Amos", targetDateOrStatus: null, remarks: null },
  { date: "2026-07-13", serialNo: 7, projectName: "Pressure switch", task: "Two complete models have been completed. Results are expected", assignedTo: "Amos", targetDateOrStatus: "13-07-2026", remarks: null },
  { date: "2026-07-13", serialNo: 8, projectName: "Pressure switch", task: "High-temperature pressure switch development has been completed", assignedTo: "Jacob", targetDateOrStatus: "15-07-2026", remarks: "Delay from Friday to Wednesday due to ill health" },
  { date: "2026-07-13", serialNo: 9, projectName: "Pressure switch", task: "Payment for Yeshtech and high-temperature PT needs to be processed by Muthuraman.", assignedTo: "", targetDateOrStatus: null, remarks: null },
  { date: "2026-07-13", serialNo: 10, projectName: "Pressure switch", task: "Jacob will visit tomorrow regarding the seal ring from manufacturer.", assignedTo: "", targetDateOrStatus: null, remarks: null },
  { date: "2026-07-13", serialNo: 11, projectName: "ITC", task: "Friday Tejaswini send Vespel sample and 3d printing parts", assignedTo: "Jacob", targetDateOrStatus: "10-07-2026", remarks: null },

  // 14-07-2026
  { date: "2026-07-14", serialNo: 1, projectName: "Dibakar, vishal collaborating with IIT Palakad regarding formal Moeli", task: "", assignedTo: "Saara", targetDateOrStatus: null, remarks: null },
  { date: "2026-07-14", serialNo: 2, projectName: "G Switch project has good, long vision we can go for this project", task: "", assignedTo: "Saara", targetDateOrStatus: null, remarks: null },
  { date: "2026-07-14", serialNo: 3, projectName: "G Switch", task: "Saara is preparing technical proposal", assignedTo: "", targetDateOrStatus: null, remarks: null },
  { date: "2026-07-14", serialNo: 4, projectName: "ITC", task: "Solution 1 BIC we have to do deliver 10 nos", assignedTo: "Jacob", targetDateOrStatus: null, remarks: "He will talk with KOTI" },
  { date: "2026-07-14", serialNo: 5, projectName: "Spring", task: "Finding new Vendor and some other work", assignedTo: "Jacob/ Prem", targetDateOrStatus: null, remarks: null },
  { date: "2026-07-14", serialNo: 6, projectName: "Pressure switch", task: "High temperature PT will completed tomorrow", assignedTo: "Jacob", targetDateOrStatus: "15-07-2026", remarks: null },
  { date: "2026-07-14", serialNo: 7, projectName: "DPS", task: "he will discuss with Unicarb", assignedTo: "Muthuraman/Amos", targetDateOrStatus: "15-07-2026", remarks: "We have enough snap disc around 40 disc but also we require 100 nos more" },
  { date: "2026-07-14", serialNo: 8, projectName: "BLS", task: "Improvement require for BLS document", assignedTo: "Prem", targetDateOrStatus: null, remarks: "Follow up with them for update" },
];

async function main() {
  await prisma.dailyLog.deleteMany({}); // Clear existing logs

  for (const log of rawLogs) {
    let matchingProject = await prisma.project.findFirst({
      where: {
        name: {
          equals: log.projectName,
          mode: 'insensitive',
        }
      }
    });

    // If project doesn't exist, create it so they can select it
    if (!matchingProject) {
      matchingProject = await prisma.project.create({
        data: {
          name: log.projectName,
          status: 'ONGOING'
        }
      });
    }

    // Parse the assignedTo string (e.g. "Chandru / Amos" or "Jacob")
    const assigneesList = log.assignedTo
      ? log.assignedTo.split(/[\/,]/).map(s => s.trim()).filter(Boolean)
      : [];
    
    const personIds = [];
    for (const personName of assigneesList) {
      let person = await prisma.person.findFirst({
        where: { name: { contains: personName, mode: 'insensitive' } }
      });
      
      if (!person) {
        person = await prisma.person.create({
          data: { name: personName }
        });
      }
      personIds.push(person.id);
    }

    await prisma.dailyLog.create({
      data: {
        date: new Date(log.date),
        serialNo: log.serialNo,
        projectName: log.projectName, // Keeping string as fallback/cache
        projectId: matchingProject.id,
        task: log.task,
        targetDateOrStatus: log.targetDateOrStatus,
        remarks: log.remarks,
        assignees: {
          connect: personIds.map(id => ({ id }))
        }
      }
    });
  }

  console.log(`Successfully seeded ${rawLogs.length} daily logs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

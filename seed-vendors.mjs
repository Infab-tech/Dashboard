import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const ocrText = `
C-0000160 AARU PLASTIC ACTIVE True
C-0000076 ADEL ASSESORIES PRIVATE LIMITED ACTIVE True
C-0000062 AERIUM TECH PRIVATE LIMITED ACTIVE True
C-0000094 AEROSPACE ENGINEERS PRIVATE LIMITED ACTIVE True
C-0000075 AIM FIRE SERVICES ACTIVE True
C-0000039 AMAR RADIO CORPORATION ACTIVE True
C-0000187 AMPLE DIGITAL PRIVATE ACTIVE
C-0000149 ASACO ACTIVE True
C-0000180 AV MEDIA NETWORKS ACTIVE
C-0000178 AVILS INFRA PVT LTD ACTIVE
C-0000173 Adhesive specialities ACTIVE True
C-0000156 Advanced Metallurgical Laboratory ACTIVE True
C-0000038 Ailga Rubber Works ACTIVE True
C-0000054 Airtel ACTIVE True
C-0000010 Akash ACTIVE
C-0000053 All India Institute of Medical Sciences , New Delhi ACTIVE
C-0000046 Amar Biosystems Pvt. Ltd ACTIVE True
C-0000073 Amos Heeber ACTIVE
C-0000217 Ample Digital Pvt Ltd ACTIVE True
C-0000183 Ample Technologies private Limited ACTIVE
C-0000061 Amrita Vishwa Vidyapeetham ACTIVE
C-0000068 Aragen Life Sciences Limited ACTIVE
C-0000063 Aronlabz Tech Pvt Ltd ACTIVE True
C-0000191 Assam University ACTIVE
C-0000122 AuBha Photonics Pvt. Ltd. ACTIVE True
C-0000059 BANGALORE FLUID SYSTEM COMPONENTS PVT.LTD. ACTIVE
C-0000174 BEETEL TELETECH LIMITED ACTIVE True
C-0000031 BHAVIK IT SOLUTIONS ACTIVE True
C-0000067 BIONOVA SUPPLIES ACTIVE True
C-0000043 BITS BioCyTiH Foundation ACTIVE
C-0000138 Bangalore University ACTIVE
C-0000071 Barjinder Kaur ACTIVE
C-0000083 Bescom ACTIVE True
C-0000150 Bharath scientific world ACTIVE True
C-0000208 Bighub Solutions Private Limited . ACTIVE
C-0000160 Bio Varam ACTIVE
C-0000003 Birla Institute of Technology & Science ACTIVE True
C-0000134 Birla Institute of Technology (BIT)-Mesra ACTIVE
C-0000121 Birla Institute of Technology And Science - Pilani ACTIVE
C-0000025 Birla Institute of Technology and Science Pilani - Hyderabad campus ACTIVE
C-0000021 Bit- Tul (Pvt) Ltd ACTIVE
C-0000062 BlTS BioCyTiH Foundation ACTIVE
C-0000088 Bob Martin Company ACTIVE Export (WOPAY) Import True
C-0000023 Brain and Spine Hospital ACTIVE True
C-0000193 Bridge Health Medical And Digital Solutions Pvt Ltd ACTIVE
C-0000044 Burji Speed On Clutches ACTIVE True
C-0000045 CALIBRE POWER CONTROLS ACTIVE True
C-0000075 CAPLINQ ACTIVE
C-0000040 CENTRE FOR DEVELOPMENT OF ADVANCED COMPUTING, KOLKATA ACTIVE
C-0000165 CHHAPERIA ELECTRO COMPONENTS PVT LTD. ACTIVE True
C-0000202 COSMIC TEC ACTIVE
C-0000128 COSMICTECH INFOSYSTEMS PVT LTD ACTIVE True
C-0000084 CSIR - CENTRAL ELECTRONICS ENGINEERING RESEARCH INSTITUTE , PILANI ACTIVE True
C-0000117 CSIR - CENTRAL FOOD TECHNOLOGICAL RESEARCH INSTITUTE ACTIVE
C-0000063 CSIR – Central Scientific Instruments Organisation (CSIO) ACTIVE True
C-0000165 CSIR-Advanced Materials and Processes Research Institute(AMPRI) ACTIVE
C-0000126 CSIR-Indian Institute of Chemical Technology ACTIVE
C-0000054 CSIR-Indian Institute of Toxicology Research ACTIVE True
C-0000076 CSIR-National Institute for Interdisciplinary Science and Technology (NIIST) ACTIVE True
C-0000048 CSIR–Indian Institute Of Chemical Technology (CSIR-IICT) ACTIVE True
C-0000131 CUBISTRY TECK SOLUTION ACTIVE True
C-0000036 Campus Component Pvt. Ltd. ACTIVE True
C-0000174 Camtronix ACTIVE True
C-0000011 Central Electronics Engineering Research Institute ACTIVE True
C-0000154 Central Manufacturing Technology Institute ACTIVE True
C-0000186 Central University of Karnataka ACTIVE
C-0000015 Centre for Cellular and Molecular Platforms ACTIVE True
C-0000014 Centre for Cellular and Molecular Platforms(C-CAMP), Bangalore ACTIVE
C-0000142 Centre for Development of Advanced Computing (C-DAC) ACTIVE True
C-0000114 Centre for Development of Advanced Computing, India ACTIVE
C-0000008 Chaitanya Athale ACTIVE
C-0000088 College of Engineering Trivandrum ACTIVE
C-0000122 DHL EXPRESS (INDIA) PVT. LTD ACTIVE
C-0000090 DIVANSHI AVIATION SERVICES PVT LTD ACTIVE True
C-0000152 DIVYANSHI AVIATION SERVICES PVT.LTD. ACTIVE
C-0000203 DR. Jayaprakash K S ACTIVE
C-0000042 DSS IMAGETECH PVT. LTD ACTIVE
C-0000175 DURGA PRINTERS ACTIVE True
C-0000074 Daksh Ventures ACTIVE True
C-0000119 Darwin Microfluidics ACTIVE
C-0000159 Dayananda Sagar University ACTIVE
C-0000004 Deskera Systems India Private Limited ACTIVE
C-0000117 Deskera Sysyem India Pvt Ltd ACTIVE True
C-0000120 Digi Key ACTIVE
C-0000058 DigiKey ACTIVE Export (WOPAY) Import True
C-0000209 Dingxu (Suzhou) Microcontrol Technology Co., Ltd ACTIVE
C-0000007 Dr Meduri Ravi ACTIVE True
C-0000017 Dr Subhradip Karmakar ACTIVE
C-0000002 Dr. ABDUL KALAM TECHNICAL UNIVERSITY ACTIVE
C-0000023 Dr. Abhishek Samanta ACTIVE
C-0000012 Dr. Amit Asthana ACTIVE
C-0000009 Dr. Cyril Prasanna Raj P. Professor ACTIVE True
C-0000004 Dr. Deepak Kumar Sharma ACTIVE True
C-0000195 Dr. Harapriya Mohapatra ACTIVE
C-0000002 Dr. P. Badani ACTIVE True
C-0000020 Dr. Prajakta Dandekar Jain ACTIVE
C-0000084 Dr. Ramya Dhandapani ACTIVE
C-0000005 Dr. Shashi Raj ACTIVE True
C-0000019 Dr. Shweta Bhatt ACTIVE
C-0000008 Dr. Srinivasan Seshadri Simhan ACTIVE True
C-0000015 Dr. Subha Narayan Rath ACTIVE
C-0000006 Dr. Subhankar Mukherjee ACTIVE True
C-0000087 Dr. Suman Chakraborty ACTIVE
C-0000192 EIS Techinfra solutions india pvt ltd ACTIVE
C-0000111 ELEMENT14 ACTIVE True
C-0000024 EMBRYYO TECHNOLOGIES PRIVATE LIMITED ACTIVE True
C-0000102 EMTECH FOUNDATION ACTIVE True
C-0000146 Eduquis Technologies Private Limited ACTIVE True
C-0000169 Eonix Technologies Pvt Ltd ACTIVE
C-0000207 Eppendorf India Private Limited ACTIVE
C-0000136 FEDEX EXPRESS TRANSPORTATION AND SUPPLY CHAIN SERVICES (I) PVT LTD ACTIVE True
C-0000113 FESTO INDIA PRIVATE LIMITED ACTIVE True
C-0000127 FLU-TECH ENGINEERING PVT LTD ACTIVE True
C-0000089 FLU-TEF WIRES&CABLES; Private Limited ACTIVE True
C-0000047 Fides Electronics Private Limited ACTIVE
C-0000035 Fides Electronics Pvt Ltd ACTIVE True
C-0000011 Fluigent SAS ACTIVE
C-0000086 Frank Technologies Private Limited ACTIVE
C-0000014 Fubeus Technology Pvt. Ltd. ACTIVE True
C-0000118 G R STEEL ACTIVE True
C-0000164 GLOW CURVE ACTIVE
C-0000115 GRACE PEST CONTROL SERVICE ACTIVE True
C-0000080 GRAPHICA GAUGES AND TOOLS ACTIVE True
C-0000106 Geological and Metallurgical Laboratories ACTIVE True
C-0000016 Global Medical Education & Research Foundation (GMERF) ACTIVE True
C-0000154 Globe -tech fortune Industries pvt. ltd ACTIVE True
C-0000172 Gloport Photonix Innovations Pvt. Ltd ACTIVE True
C-0000052 Godrej Pest control services ACTIVE True
C-0000040 Gopower Electech Private Limited ACTIVE True
C-0000093 Guangzhou JST Seals Technology Co., Ltd. ACTIVE
C-0000139 Gujarat Biotechnology Research Centre ACTIVE
C-0000130 HARPER STEEL STRIPS ACTIVE True
C-0000053 HP IT world ACTIVE True
C-0000212 Healinc Pvt Ltd ACTIVE
C-0000166 Heat Sense Therm ACTIVE True
C-0000184 Hexagon B2B Solutions ACTIVE
C-0000135 Holmarc Opto-Mechatronics Ltd ACTIVE
C-0000205 Human Space Flight Centre - ISRO ACTIVE
C-0000089 ICAR-IVRI Izatnagar ACTIVE
C-0000169 ICMR- National Institute of Virology, (Mumbai Unit) ACTIVE True
C-0000170 IDEAS AHEAD AV SOLUTIONS PRIVATED LIMITED ACTIVE
C-0000058 IIT Kharagpur ACTIVE
C-0000035 IIT MADRAS ACTIVE
C-0000118 IIT Nagpur ACTIVE
C-0000176 IKON INSTRUMENTS ACTIVE
C-0000039 INDIAN INSTITUTE OF TECHNOLOGY HYDERABAD ACTIVE True
C-0000161 INFAB SEMICONDUCTOR PVT LTD. ACTIVE
C-0000003 INNOVENT SPACES PRIVATE LIMITED ACTIVE
C-0000211 INTEGRATED MICROSYSTEM ACTIVE
C-0000172 IP CONNECT ACTIVE
C-0000167 IPS Academy, Institute of Engineering & Science ACTIVE
C-0000045 ISG Rubber Industries ACTIVE True
C-0000072 ITC Limited ACTIVE True
C-0000007 Immuneel Therapeutics Private Limited ACTIVE
C-0000152 Impact Callibration ACTIVE True
C-0000151 Indian Institute Of Technology Dharwad ACTIVE
C-0000150 Indian Institute Of Technology Madras ACTIVE
C-0000026 Indian Institute Of Technology–Madras ACTIVE
C-0000110 Indian Institute of Bhilai ACTIVE
C-0000206 Indian Institute of Medical Sciences Banaras Hindu University ACTIVE
C-0000095 Indian Institute of Science ACTIVE
C-0000018 Indian Institute of Science (IISc) ACTIVE True
C-0000129 Indian Institute of Science Education and Research (IISER) ACTIVE
C-0000158 Indian Institute of Science Education and Research (IISER) Kolkata ACTIVE
C-0000029 Indian Institute of Science Education and Research, Pune ACTIVE
C-0000037 Indian Institute of Science Education and Research, Tirupati ACTIVE
C-0000196 Indian Institute of Science IISC ACTIVE
C-0000216 Indian Institute of Technology ACTIVE
C-0000142 Indian Institute of Technology (Indian School of Mines), Dhanbad ACTIVE
C-0000166 Indian Institute of Technology Bhilai ACTIVE
C-0000200 Indian Institute of Technology Bhubaneswar ACTIVE True
C-0000194 Indian Institute of Technology Bombay ACTIVE True
C-0000093 Indian Institute of Technology Delhi ACTIVE True
C-0000151 Indian Institute of Technology Dharwad (IIT Dharwad) ACTIVE True
C-0000094 Indian Institute of Technology Guwahati ACTIVE True
C-0000219 Indian Institute of Technology Indore ACTIVE
C-0000057 Indian Institute of Technology Kanpur ACTIVE
C-0000097 Indian Institute of Technology Kharagpur ACTIVE
C-0000051 Indian Institute of Technology Patna ACTIVE
C-0000031 Indian Institute of Technology Roorkee ACTIVE
C-0000111 Indian Institute of Technology Tirupati ACTIVE
C-0000055 Indian Institute of Technology Tirupati, ACTIVE
C-0000104 Indian Institute of Technology, Dharwad ACTIVE
C-0000168 Indian Union Electronic ACTIVE True
C-0000147 Industrial marketing ACTIVE True
C-0000112 Innvolution Health Care Pvt Ltd ACTIVE
C-0000028 Institute of Engineering and Technology, Lucknow(U.P.) ACTIVE
C-0000056 Institute of Nano Science & Technology (INST) ACTIVE
C-0000041 Interactive Research School for Health Affairs (IRSHA) ACTIVE
C-0000123 Jawaharlal Institute of Postgraduate Medical Education and Research ACTIVE
C-0000097 Jiaozuo Commercial FineWin Co.,Ltd ACTIVE True
C-0000101 K.N.D STEEL SYNDICATE ACTIVE True
C-0000100 KAMRANS PROCESS CONTROL ACTIVE
C-0000145 KEVIN ELECTROCHEM ACTIVE True
C-0000124 KII PRINT ACTIVE True
C-0000163 KNF PUMPS + SYSTEM PVT LTD ACTIVE
C-0000143 KOHESI BOND ACTIVE True
C-0000104 KRIYAON SOLUTIONS AND AUTOMATION PRIVATE LIMITED ACTIVE True
C-0000099 KUN-SCALEXUSS INNOVATIONS PRIVATE LIMITED ACTIVE True
C-0000034 Knowteq Info LLP ACTIVE True
C-0000210 LABINDIA INSTRUMENTS PTD ACTIVE
C-0000042 LAKSHMI ENGINEERING AND COMPONENTS ACTIVE True
C-0000057 Land and Lifespace Pvt Ltd ACTIVE True
C-0000024 Lee Spring Company India Private Limited ACTIVE
C-0000019 Littin Varghese ACTIVE True
C-0000064 M/S. AEROSPACE ALLOY CORPORATION ACTIVE True
C-0000168 M/s CosmicTech Infosystems Private Limited ACTIVE
C-0000056 M/s VASA SCIENTIFIC CO ACTIVE True
C-0000085 M/s. Vaidyanatheshwara Instruments Pvt. Ltd. ACTIVE True
C-0000176 MAXSELL METAL ACTIVE True
C-0000033 METALLIC BELLOWS INDIA PRIVATE LIMITED INACTIVE True
C-0000001 METALLIC BELLOWS INDIA PVT LTD ACTIVE True
C-0000164 MEUKRON TECHNOLOGIES PRIVATE LIMITED ACTIVE True
C-0000027 MIT-ADT University ACTIVE
C-0000143 MOLPATH PRIVATE LIMITED ACTIVE
C-0000218 MS AUTOMATIONS PRIVATE LIMITED ACTIVE
C-0000214 MYRNA BIOLOGICS PVT LTD ACTIVE
C-0000109 Magod Laser Machining Private Limited ACTIVE True
C-0000078 Mahesh V & Associates ACTIVE True
C-0000153 Makenica Private Limited ACTIVE True
C-0000116 Malaviya National Institute of Technology ACTIVE
C-0000030 Manipal Academy of Higher Education ACTIVE
C-0000099 Manipal Academy of Higher Education, A/C Manipal School of Life Sciences ACTIVE
C-0000052 Manipal Government of Karnataka-Bioincubator-BioNEST ACTIVE
C-0000177 Manipal Institute of Technology ACTIVE
C-0000081 Marco Rubber & Plastics ACTIVE True
C-0000131 Maxware Technologies Private Limited ACTIVE
C-0000156 Maxware Technologies Privated Limited ACTIVE
C-0000170 MediNeo Innovations LL ACTIVE True
C-0000161 Meril Diagnostics Private Limited ACTIVE True
C-0000061 MicroChemicals ACTIVE True
C-0000032 Micron Engineering ACTIVE True
C-0000022 Micropack Private Limited ACTIVE True
C-0000197 Microqubic AG ACTIVE
C-0000201 Monitors india ACTIVE
C-0000100 Mouser ACTIVE True
C-0000069 Muthuraman Swaminathan ACTIVE
C-0000081 N N Engineering Enterprises ACTIVE
C-0000051 N.N Engineering Enterprises ACTIVE True
C-0000018 NETRI ACTIVE Export (WOPAY) Import True
C-0000046 NIPER Hajipur ACTIVE
C-0000038 NIPER Hyderabad ACTIVE
C-0000050 NVC CHENNAI POWER TECHNOLOGY ACTIVE True
C-0000017 Nagman Instruments And Electronics Private Limited ACTIVE True
C-0000182 National Brain Research Centre, Manesar ACTIVE
C-0000033 National Centre for Biological Science ACTIVE
C-0000047 National Centre for Biological Sciences ACTIVE True
C-0000145 National Institute Of Pharmaceutical ( Niper) ACTIVE
C-0000149 National Institute of Animal Biotechnology ACTIVE
C-0000119 National Institute of Pharmaceutical Education And Research (NIPER) Hyderabad ACTIVE True
C-0000126 National Institute of Pharmaceutical Education and Research (NIPER) Ahmedabad ACTIVE True
C-0000077 National Institute of Pharmaceutical Education and Research (NIPER)- Guwahati ACTIVE
C-0000096 National Institute of Pharmaceutical Education and Research, Kolkata ACTIVE
C-0000148 National Institute of Science Education & Research Bhubaneswar ACTIVE True
C-0000101 National Institute of Technology Hamirpur ACTIVE
C-0000067 National Institute of Technology, Raipur ACTIVE
C-0000147 Netaji Subhas University of Technology(NSUT) ACTIVE
C-0000010 Nitte Meenakshi Institute of Technology ACTIVE True
C-0000079 ONLINE SOLUTIONS (IMAGING) PVT. LTD. ACTIVE
C-0000082 OPTIMXT INDIA TECH ACTIVE
C-0000132 Omcarve Laser Crafts ACTIVE True
C-0000137 Opto GmbH (Asia) Pte Ltd ACTIVE
C-0000114 Organic Bioelectronics Lab (BIOEL) ACTIVE True
C-0000146 PATSON MACHINE TOOLS ACTIVE
C-0000141 PES university ACTIVE True
C-0000158 PLAN MEASURING SERVICES LLP ACTIVE True
C-0000095 POLYMER PLASTICS CORPORATION ACTIVE True
C-0000133 PRIDUS GLOBAL PHARMA PVT. LTD ACTIVE
C-0000109 PRISM Scientific ACTIVE
C-0000137 PURPLE DESK IMPEX ACTIVE True
C-0000136 Parul Institute of Pharmacy ACTIVE
C-0000092 Plaksha University ACTIVE True
C-0000025 Podrain Electronics Pvt Ltd ACTIVE True
C-0000072 Prem Arokiaraj ACTIVE
C-0000013 Prof. Tarun Kanti Bhattacharyya ACTIVE
C-0000041 Prolyx Microelectronics Private Limited ACTIVE True
C-0000037 QuNu Labs Private Limted ACTIVE True
C-0000127 R.C.Patel Institute of Pharmaceutical Education and Research ACTIVE
C-0000213 RAGAS TECHNOLOGIES ACTIVE True
C-0000106 RAR Life Sciences ACTIVE
C-0000026 RIBODRIBONPRO TECHNOLOGIES PRIVATE LIMITED ACTIVE True
C-0000190 RITHICK ENTERPRISES ACTIVE
C-0000135 RMM and ASSOCIATES ACTIVE True
C-0000110 ROBU.IN ACTIVE True
C-0000105 Raghavendra Spectro Metallurgical Laboratory ACTIVE True
C-0000044 Rajalakshmi Engineering College ACTIVE
C-0000070 Rajita M ACTIVE
C-0000066 Rajiv Gandhi Centre for Biotechnology ACTIVE
C-0000065 Rajiv Gandhi Institute of Petroleum Technology (RGIPT) ACTIVE
C-0000085 Raman Research Institute ACTIVE
C-0000091 Raman Researh Institute ACTIVE
C-0000005 Ramanujam ACTIVE
C-0000083 Research Centre Imarat ACTIVE
C-0000112 Rhydo Technologies Pvt Ltd ACTIVE True
C-0000185 S.N. SCIENTIFIC SUPPLIERS ACTIVE
C-0000132 SAGIX SOLUTIONS INDIA ACTIVE
C-0000070 SANGHVI AEROSPACE PVT LTD ACTIVE True
C-0000138 SARA FURNITURE AND INTERIORS ACTIVE True
C-0000134 SFA TOOLINGS ACTIVE True
C-0000125 SHREE RAPID TECHNOLOGIES-SRT ACTIVE True
C-0000080 SHREEHAAS LABORATORIES ACTIVE
C-0000188 SILVACO SINGAPORE PTE LTD ACTIVE
C-0000107 SJS Mineral & Metallurgical Laboratories LLP ACTIVE True
C-0000064 SRM Institute of Science& Technology ACTIVE
C-0000175 SUGI ELECTRONICS LLP ACTIVE
C-0000028 SUHA INDUSTRIES ACTIVE True
C-0000121 SUJAN INDUSTRIES ACTIVE True
C-0000124 Sahajanand Medical Pvt Ltd ACTIVE
C-0000016 Sardar Vallabhbhai National Institute of Technology (SVNIT) ACTIVE True
C-0000173 Securetel Networks Inc. ACTIVE
C-0000107 Sekkei Bio Pvt Ltd ACTIVE
C-0000181 Sharanya Total Telecom Solutions ACTIVE
C-0000022 Shiv Nadar University ACTIVE
C-0000189 Shivkripa Enterprises ACTIVE
C-0000077 Shree Rapid Technologies ACTIVE True
C-0000060 Siltech corporation Inc ACTIVE True
C-0000078 Spartan Spring Industries ACTIVE True
C-0000029 Speciality Fasteners International ACTIVE True
C-0000128 Sri Sivasubramaniya Nadar College of Engineering ACTIVE
C-0000130 Sri Venkateshwara Enterprises(DTDC) ACTIVE
C-0000012 Stathera, Inc. ACTIVE True
C-0000123 Systemgauge & Tools India Pvt. Ltd ACTIVE True
C-0000079 TE Connectivity India Pvt Ltd. ACTIVE True
C-0000162 THE PROFESSIONAL COURIERS ACTIVE
C-0000074 THREAD GAUGE PRODUCTS PVT. LTD ACTIVE True
C-0000155 TKG SCIENTIFIC INSTRUMENTS PRIVATE LIMITED ACTIVE
C-0000086 TRINITY NDT WELDSOULTIONS PVT.LTD/ ACTIVE True
C-0000105 TROPICAL ANIMAL GENETICS PRIVATE LIMITED ACTIVE
C-0000006 Tarun Kanti ACTIVE
C-0000102 Tata Institute for Genetics and Society ACTIVE
C-0000098 The Great Refillers ACTIVE True
C-0000087 Trinity NDT WeldSolutions Pvt. Ltd. ACTIVE True
C-0000071 UNICARB ACTIVE True
C-0000115 UNIGENETICS INSTRUMENTS PVT. LTD ACTIVE
C-0000133 UNIQUE MEASUREMENT SERVICE ACTIVE True
C-0000060 UPES Bidholi Campus ACTIVE
C-0000157 UPS EXPRESS PRIVATE LIMITED ACTIVE True
C-0000125 UR ADVANCED THERAPEUTICS ACTIVE
C-0000171 UR ADVANCED THERAPEUTICS PRIVATE LIMITED ACTIVE True
C-0000009 University of Hyderabad ACTIVE
C-0000059 VAIDYANATHESHWARA INSTRUMENTS PRIVATE LIMITED ACTIVE True
C-0000092 VANDIT POLYCRAFT PVT LTD ACTIVE True
C-0000116 VIJAY LAXMI IMPEX ACTIVE True
C-0000167 VIJAY TRADING CORPORATION ACTIVE True
C-0000199 VISION RESEARCH INC ACTIVE
C-0000179 VOLSTAR BUSINESS SOLUTIONS PRIVATE LIMITED ACTIVE
C-0000048 VR INTERIOR ACTIVE True
C-0000032 Vellore Institute of Technology (VIT) ACTIVE
C-0000144 Vellore Institute of Technology - (VIT - Chennai) ACTIVE
C-0000198 Voltstar Buisness Solutions Private Limited ACTIVE
C-0000153 Walthy Precision Co Ltd ACTIVE
C-0000108 Wanya LifeSciences Pvt Ltd ACTIVE
C-0000204 Winze Technologies Pvt. Ltd ACTIVE
C-0000073 Wroffy Technologies Private Limited ACTIVE True
C-0000163 XL ADDITIVE MANUFACTURING SERVICES ACTIVE True
C-0000113 XYZ Pvt Ltd ACTIVE
C-0000098 YASHTEC Instrumentation & Engineering Source ACTIVE True
C-0000140 Yashwantrao Chavan Institute of Science Satara (Autonomous), MS, India. ACTIVE
C-0000021 Yield Engineering Systems India Private Limited ACTIVE True
C-0000215 ZYNERRA BIOSCIENCE ACTIVE
C-0000157 Zenith ACTIVE True
`;

async function main() {
  console.log("Deleting existing vendors...");
  await prisma.vendor.deleteMany({});
  
  const matches = [...ocrText.matchAll(/^(C-\d{7})\s+(.*?)\s+(?:ACTIVE|INACTIVE)/gm)];
  let count = 0;
  
  const initialCounts = {};
  
  for (const match of matches) {
    const contactCode = match[1];
    const name = match[2];
    
    let initials = name.split(/[\s\-]/).map(w => w[0]).join('').replace(/[^A-Za-z0-9]/g, '').toUpperCase().substring(0, 5);
    if (!initials) initials = "VEND";
    
    initialCounts[initials] = (initialCounts[initials] || 0) + 1;
    const seq = String(initialCounts[initials]).padStart(4, '0');
    const code = `${initials}-${seq}`;
    
    try {
      await prisma.vendor.create({
        data: {
          name,
          code,
          place: "",
          state: "",
          postalCode: "",
          address: ""
        }
      });
      count++;
    } catch (e) {
      console.error('Failed to create:', name, e.message);
    }
  }
  
  console.log(`Successfully seeded ${count} vendors.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

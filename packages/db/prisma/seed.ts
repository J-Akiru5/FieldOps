import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

async function getAdminAuthUserId(): Promise<string> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error || !data?.users?.length) {
    throw new Error(`Could not fetch admin auth user: ${error?.message ?? "no users found"}`);
  }
  const admin = data.users.find((u) => u.email === "admin@syntaxure.dev");
  if (!admin) throw new Error("admin@syntaxure.dev auth user not found");
  return admin.id;
}

async function main() {
  console.log("Seeding FieldOps database...");

  const adminAuthUserId = await getAdminAuthUserId();
  console.log(`  Admin auth user ID: ${adminAuthUserId}`);

  // Clean existing data in dependency order
  await prisma.notification.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.jobLineItem.deleteMany();
  await prisma.salesTransaction.deleteMany();
  await prisma.jobAssignment.deleteMany();
  await prisma.job.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.appliance.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.staffMember.deleteMany();
  await prisma.appSettings.deleteMany();

  // ── Staff ──
  const staff = await Promise.all([
    prisma.staffMember.create({
      data: { authUserId: adminAuthUserId, name: "Raul Reyes", role: "OWNER" },
    }),
    prisma.staffMember.create({
      data: { authUserId: "partner@jrraircon.com", name: "Angelo Santos", role: "PARTNER" },
    }),
    prisma.staffMember.create({
      data: { authUserId: "tech1@jrraircon.com", name: "Jun Dela Cruz", role: "TECHNICIAN" },
    }),
    prisma.staffMember.create({
      data: { authUserId: "tech2@jrraircon.com", name: "Bong Gonzales", role: "TECHNICIAN" },
    }),
  ]);
  console.log(`  Staff: ${staff.length} members`);

  // ── Customers ──
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: "Maria Clara Santos",
        phone: "0917-555-1001",
        email: "maria@email.ph",
        address: "123 Rizal Ave, Makati",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Pedro Penduko",
        phone: "0918-555-2002",
        email: "pedrop@email.ph",
        address: "456 Mabini St, Quezon City",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Juanita Del Rosario",
        phone: "0919-555-3003",
        address: "789 Bonifacio Dr, Pasig",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Carlos Villanueva",
        phone: "0920-555-4004",
        email: "carlosv@email.ph",
        address: "12 Aguinaldo Hwy, Cavite",
      },
    }),
    prisma.customer.create({
      data: { name: "Luzviminda Reyes", phone: "0921-555-5005", address: "34 Roxas Blvd, Manila" },
    }),
    prisma.customer.create({
      data: {
        name: "Jose Rizal Memorial School",
        phone: "0922-555-6006",
        address: "56 Paseo de Roxas, Makati",
      },
    }),
  ]);
  console.log(`  Customers: ${customers.length}`);

  // ── Appliances ──
  const appliances = await Promise.all([
    // Maria — 2 AC units
    prisma.appliance.create({
      data: {
        customerId: customers[0].id,
        type: "AIRCON",
        brand: "Carrier",
        model: "XCool 2.0HP",
        capacityHP: 2.0,
        serialNumber: "CR-2023-001",
        locationNotes: "Living room",
      },
    }),
    prisma.appliance.create({
      data: {
        customerId: customers[0].id,
        type: "AIRCON",
        brand: "Daikin",
        model: "FTKM-1.5HP",
        capacityHP: 1.5,
        serialNumber: "DK-2024-052",
        locationNotes: "Master bedroom",
      },
    }),
    // Pedro — split AC + TV
    prisma.appliance.create({
      data: {
        customerId: customers[1].id,
        type: "AIRCON",
        brand: "Panasonic",
        model: "CS-1.0HP",
        capacityHP: 1.0,
        serialNumber: "PN-2023-117",
        locationNotes: "Bedroom",
      },
    }),
    prisma.appliance.create({
      data: {
        customerId: customers[1].id,
        type: "ELECTRONICS",
        brand: "Samsung",
        model: 'QLED 55"',
        locationNotes: "Living room",
      },
    }),
    // Juanita — window AC
    prisma.appliance.create({
      data: {
        customerId: customers[2].id,
        type: "AIRCON",
        brand: "Kolin",
        model: "KAG-1.5WC",
        capacityHP: 1.5,
        serialNumber: "KL-2024-003",
        locationNotes: "Office",
      },
    }),
    // Carlos — inverter AC
    prisma.appliance.create({
      data: {
        customerId: customers[3].id,
        type: "AIRCON",
        brand: "LG",
        model: "DualCool 2.5HP",
        capacityHP: 2.5,
        serialNumber: "LG-2024-088",
        locationNotes: "Living room",
      },
    }),
    // Luzviminda — commercial AC
    prisma.appliance.create({
      data: {
        customerId: customers[4].id,
        type: "AIRCON",
        brand: "Mitsubishi",
        model: "Mr. Slim 3HP",
        capacityHP: 3.0,
        serialNumber: "MT-2023-210",
        locationNotes: "Restaurant main hall",
      },
    }),
    // School — multiple ACs
    prisma.appliance.create({
      data: {
        customerId: customers[5].id,
        type: "AIRCON",
        brand: "TCL",
        model: "T-Pro 1.5HP",
        capacityHP: 1.5,
        serialNumber: "TC-2024-301",
        locationNotes: "Room A",
      },
    }),
    prisma.appliance.create({
      data: {
        customerId: customers[5].id,
        type: "AIRCON",
        brand: "TCL",
        model: "T-Pro 1.5HP",
        capacityHP: 1.5,
        serialNumber: "TC-2024-302",
        locationNotes: "Room B",
      },
    }),
    prisma.appliance.create({
      data: {
        customerId: customers[5].id,
        type: "ELECTRONICS",
        brand: "Acer",
        model: "Projector X1",
        locationNotes: "AV Room",
      },
    }),
  ]);
  console.log(`  Appliances: ${appliances.length}`);

  // ── Inventory ──
  const inv = await Promise.all([
    prisma.inventoryItem.create({
      data: {
        sku: "FR-22-001",
        name: "R22 Freon (tank)",
        unit: "tank",
        quantityOnHand: 8,
        safetyStockThreshold: 3,
        unitCost: 2800,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: "FR-410-001",
        name: "R410A Freon (tank)",
        unit: "tank",
        quantityOnHand: 5,
        safetyStockThreshold: 2,
        unitCost: 4200,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: "FLTR-001",
        name: "Air filter (standard)",
        unit: "pc",
        quantityOnHand: 40,
        safetyStockThreshold: 10,
        unitCost: 250,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: "FLTR-HEPA",
        name: "HEPA filter",
        unit: "pc",
        quantityOnHand: 12,
        safetyStockThreshold: 5,
        unitCost: 850,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: "CLEAN-001",
        name: "Coil cleaner (1L)",
        unit: "bottle",
        quantityOnHand: 15,
        safetyStockThreshold: 4,
        unitCost: 350,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: "COMP-001",
        name: "Compressor 2HP",
        unit: "unit",
        quantityOnHand: 2,
        safetyStockThreshold: 1,
        unitCost: 8500,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: "CAP-001",
        name: "Capacitor 45uF",
        unit: "pc",
        quantityOnHand: 20,
        safetyStockThreshold: 5,
        unitCost: 180,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: "THERMO-001",
        name: "Thermostat digital",
        unit: "pc",
        quantityOnHand: 6,
        safetyStockThreshold: 2,
        unitCost: 1200,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: "PIPE-001",
        name: 'Copper pipe 3/8" (per ft)',
        unit: "ft",
        quantityOnHand: 50,
        safetyStockThreshold: 10,
        unitCost: 120,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: "ELEC-WIRE",
        name: "Electrical wire 12awg (per m)",
        unit: "m",
        quantityOnHand: 30,
        safetyStockThreshold: 8,
        unitCost: 45,
      },
    }),
  ]);
  console.log(`  Inventory: ${inv.length} items`);

  // ── Inquiries ──
  const inquiries = await Promise.all([
    prisma.inquiry.create({
      data: {
        contactName: "Anna Garcia",
        phone: "0917-111-1111",
        message: "AC not cooling — needs urgent repair",
        source: "PHONE",
        status: "NEW",
      },
    }),
    prisma.inquiry.create({
      data: {
        contactName: "Ben Cruz",
        phone: "0918-222-2222",
        message: "Interested in inverter AC installation for new condo",
        source: "SITE",
        status: "NEW",
      },
    }),
    prisma.inquiry.create({
      data: {
        contactName: "Clara Mendoza",
        phone: "0919-333-3333",
        message: "Water leaking from indoor unit",
        source: "PHONE",
        status: "CONTACTED",
      },
    }),
    prisma.inquiry.create({
      data: {
        contactName: "Dennis Pangan",
        phone: "0920-444-4444",
        email: "dennis@email.ph",
        message: "Quarterly maintenance for 5 AC units in office",
        source: "SITE",
        status: "CONVERTED",
      },
    }),
    prisma.inquiry.create({
      data: {
        contactName: "Elena Vargas",
        phone: "0921-555-5555",
        message: "TV repair — no display",
        source: "WALK_IN",
        status: "CLOSED",
      },
    }),
    prisma.inquiry.create({
      data: {
        contactName: "Felix Bautista",
        phone: "0922-666-6666",
        message: "Need cleaning service for 2 split-type ACs",
        source: "PHONE",
        status: "NEW",
      },
    }),
    prisma.inquiry.create({
      data: {
        contactName: "Gloria Macapagal",
        phone: "0923-777-7777",
        message: "AC making loud noise when turned on",
        source: "PHONE",
        status: "CONTACTED",
      },
    }),
    prisma.inquiry.create({
      data: {
        contactName: "Hector Tolentino",
        phone: "0924-888-8888",
        email: "hector@email.ph",
        message: "Looking to buy new aircon + installation",
        source: "SITE",
        status: "CONVERTED",
      },
    }),
    prisma.inquiry.create({
      data: {
        contactName: "Irene Pascual",
        phone: "0925-999-9999",
        message: "Compressor replacement inquiry",
        source: "WALK_IN",
        status: "NEW",
      },
    }),
    prisma.inquiry.create({
      data: {
        contactName: "Jayson Abad",
        phone: "0926-101-0101",
        message: "AC preventive maintenance for 3 units",
        source: "SITE",
        status: "CONVERTED",
      },
    }),
    prisma.inquiry.create({
      data: {
        contactName: "Karen Villar",
        phone: "0927-202-0202",
        message: "Refrigerator not cooling — electronics division",
        source: "PHONE",
        status: "NEW",
      },
    }),
    prisma.inquiry.create({
      data: {
        contactName: "Lito Mercado",
        phone: "0928-303-0303",
        message: "Installation of split AC in new house",
        source: "WALK_IN",
        status: "NEW",
      },
    }),
  ]);
  console.log(`  Inquiries: ${inquiries.length}`);

  // ── Jobs ──
  const now = new Date();
  const days = (n: number) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        customerId: customers[0].id,
        applianceId: appliances[0].id,
        type: "REPAIR",
        status: "COMPLETED",
        scheduledAt: days(-5),
        laborFee: 2500,
      },
    }),
    prisma.job.create({
      data: {
        customerId: customers[0].id,
        applianceId: appliances[1].id,
        type: "MAINTENANCE",
        status: "SCHEDULED",
        scheduledAt: days(2),
        laborFee: 1500,
      },
    }),
    prisma.job.create({
      data: {
        customerId: customers[1].id,
        applianceId: appliances[2].id,
        type: "REPAIR",
        status: "IN_PROGRESS",
        scheduledAt: days(0),
        laborFee: 1800,
      },
    }),
    prisma.job.create({
      data: {
        customerId: customers[2].id,
        applianceId: appliances[4].id,
        type: "MAINTENANCE",
        status: "COMPLETED",
        scheduledAt: days(-10),
        laborFee: 1200,
      },
    }),
    prisma.job.create({
      data: {
        customerId: customers[3].id,
        applianceId: appliances[5].id,
        type: "INSTALLATION",
        status: "SCHEDULED",
        scheduledAt: days(5),
        laborFee: 5500,
      },
    }),
    prisma.job.create({
      data: {
        customerId: customers[4].id,
        applianceId: appliances[6].id,
        type: "REPAIR",
        status: "SCHEDULED",
        scheduledAt: days(1),
        laborFee: 3200,
      },
    }),
    prisma.job.create({
      data: {
        customerId: customers[5].id,
        applianceId: appliances[7].id,
        type: "MAINTENANCE",
        status: "COMPLETED",
        scheduledAt: days(-3),
        laborFee: 2000,
      },
    }),
    prisma.job.create({
      data: {
        customerId: customers[5].id,
        applianceId: appliances[8].id,
        type: "MAINTENANCE",
        status: "SCHEDULED",
        scheduledAt: days(3),
        laborFee: 2000,
      },
    }),
  ]);
  console.log(`  Jobs: ${jobs.length}`);

  // ── Job Assignments ──
  const assignments = await Promise.all([
    prisma.jobAssignment.create({ data: { jobId: jobs[0].id, staffMemberId: staff[2].id } }),
    prisma.jobAssignment.create({ data: { jobId: jobs[1].id, staffMemberId: staff[2].id } }),
    prisma.jobAssignment.create({ data: { jobId: jobs[2].id, staffMemberId: staff[3].id } }),
    prisma.jobAssignment.create({ data: { jobId: jobs[3].id, staffMemberId: staff[2].id } }),
    prisma.jobAssignment.create({ data: { jobId: jobs[4].id, staffMemberId: staff[3].id } }),
    prisma.jobAssignment.create({ data: { jobId: jobs[5].id, staffMemberId: staff[2].id } }),
    prisma.jobAssignment.create({ data: { jobId: jobs[6].id, staffMemberId: staff[3].id } }),
    prisma.jobAssignment.create({ data: { jobId: jobs[7].id, staffMemberId: staff[2].id } }),
  ]);
  console.log(`  Job Assignments: ${assignments.length}`);

  // ── Job Line Items (materials used on completed jobs) ──
  await Promise.all([
    prisma.jobLineItem.create({
      data: {
        jobId: jobs[0].id,
        inventoryItemId: inv[2].id,
        quantityUsed: 1,
        unitCostAtConsumption: 250,
      },
    }),
    prisma.jobLineItem.create({
      data: {
        jobId: jobs[0].id,
        inventoryItemId: inv[4].id,
        quantityUsed: 0.5,
        unitCostAtConsumption: 350,
      },
    }),
    prisma.jobLineItem.create({
      data: {
        jobId: jobs[3].id,
        inventoryItemId: inv[2].id,
        quantityUsed: 1,
        unitCostAtConsumption: 250,
      },
    }),
    prisma.jobLineItem.create({
      data: {
        jobId: jobs[3].id,
        inventoryItemId: inv[7].id,
        quantityUsed: 1,
        unitCostAtConsumption: 1200,
      },
    }),
    prisma.jobLineItem.create({
      data: {
        jobId: jobs[6].id,
        inventoryItemId: inv[2].id,
        quantityUsed: 2,
        unitCostAtConsumption: 250,
      },
    }),
    prisma.jobLineItem.create({
      data: {
        jobId: jobs[6].id,
        inventoryItemId: inv[0].id,
        quantityUsed: 0.3,
        unitCostAtConsumption: 2800,
      },
    }),
  ]);
  console.log("  Job Line Items: 6");

  // ── Stock Movements ──
  await Promise.all([
    prisma.stockMovement.create({
      data: {
        inventoryItemId: inv[2].id,
        jobId: jobs[0].id,
        type: "DEDUCTION",
        quantity: 1,
        resultingQuantity: 39,
      },
    }),
    prisma.stockMovement.create({
      data: {
        inventoryItemId: inv[4].id,
        jobId: jobs[0].id,
        type: "DEDUCTION",
        quantity: 0.5,
        resultingQuantity: 14.5,
      },
    }),
    prisma.stockMovement.create({
      data: { inventoryItemId: inv[0].id, type: "RESTOCK", quantity: 5, resultingQuantity: 8 },
    }),
    prisma.stockMovement.create({
      data: { inventoryItemId: inv[5].id, type: "RESTOCK", quantity: 2, resultingQuantity: 2 },
    }),
    prisma.stockMovement.create({
      data: {
        inventoryItemId: inv[2].id,
        jobId: jobs[3].id,
        type: "DEDUCTION",
        quantity: 1,
        resultingQuantity: 38,
      },
    }),
  ]);
  console.log("  Stock Movements: 5");

  // ── Sales Transactions ──
  await Promise.all([
    prisma.salesTransaction.create({
      data: {
        jobId: jobs[0].id,
        invoiceNumber: "INV-2026-001",
        grossAmount: 3500,
        materialCost: 425,
        netProfit: 3075,
        vatType: "VAT_INCLUSIVE",
        paymentStatus: "PAID",
      },
    }),
    prisma.salesTransaction.create({
      data: {
        jobId: jobs[3].id,
        invoiceNumber: "INV-2026-002",
        grossAmount: 3000,
        materialCost: 1450,
        netProfit: 1550,
        vatType: "VAT_INCLUSIVE",
        paymentStatus: "PAID",
      },
    }),
    prisma.salesTransaction.create({
      data: {
        jobId: jobs[6].id,
        invoiceNumber: "INV-2026-003",
        grossAmount: 2500,
        materialCost: 1340,
        netProfit: 1160,
        vatType: "NON_VAT",
        paymentStatus: "PARTIAL",
      },
    }),
  ]);
  console.log("  Sales: 3");

  // ── Settings ──
  await prisma.appSettings.create({
    data: {
      id: "singleton",
      companyName: "J.R.R. Aircon & Electronics",
      scheduleReminderHours: 24,
      lowStockThreshold: 5,
      defaultVatType: "VAT_INCLUSIVE",
      workingHoursStart: "08:00",
      workingHoursEnd: "17:00",
    },
  });
  console.log("  Settings: singleton");

  // ── Notifications ──
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: staff[0].authUserId,
        type: "inquiry",
        title: "New inquiry received",
        body: "Anna Garcia — AC not cooling, needs urgent repair",
        metadata: {},
      },
    }),
    prisma.notification.create({
      data: {
        userId: staff[0].authUserId,
        type: "job",
        title: "Job completed",
        body: "Repair job for Maria Clara Santos marked as completed",
        metadata: {},
      },
    }),
    prisma.notification.create({
      data: {
        userId: staff[2].authUserId,
        type: "schedule",
        title: "Upcoming job tomorrow",
        body: "Preventive maintenance for Luzviminda Reyes at 9:00 AM",
        metadata: {},
      },
    }),
    prisma.notification.create({
      data: {
        userId: staff[0].authUserId,
        type: "inventory",
        title: "Low stock alert",
        body: "Compressor 2HP at safety threshold (2 remaining)",
        metadata: {},
      },
    }),
  ]);
  console.log("  Notifications: 4");

  console.log("\nSeed complete.");
  console.log(
    `  Summary: ${staff.length} staff | ${customers.length} customers | ${appliances.length} appliances`
  );
  console.log(
    `  ${inquiries.length} inquiries | ${jobs.length} jobs | ${inv.length} inventory items`
  );
  console.log(`  Ready to test all CRUD workflows.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function hash(password: string) {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Users ───────────────────────────────────────────────────────────────

  // Admin
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@healthcare.app" },
    update: {},
    create: { name: "System Admin", email: "admin@healthcare.app", password: await hash("Admin@123456"), role: "ADMIN", emailVerified: new Date() },
  });
  await prisma.admin.upsert({ where: { userId: adminUser.id }, update: {}, create: { userId: adminUser.id } });

  // Doctors
  const doctorUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: "dr.emily@healthcare.app" },
      update: {},
      create: { name: "Dr. Emily Chen", email: "dr.emily@healthcare.app", password: await hash("Doctor@123456"), role: "DOCTOR", emailVerified: new Date() },
    }),
    prisma.user.upsert({
      where: { email: "dr.rahul@healthcare.app" },
      update: {},
      create: { name: "Dr. Rahul Sharma", email: "dr.rahul@healthcare.app", password: await hash("Doctor@123456"), role: "DOCTOR", emailVerified: new Date() },
    }),
    prisma.user.upsert({
      where: { email: "dr.priya@healthcare.app" },
      update: {},
      create: { name: "Dr. Priya Patel", email: "dr.priya@healthcare.app", password: await hash("Doctor@123456"), role: "DOCTOR", emailVerified: new Date() },
    }),
  ]);

  const doctorProfiles = await Promise.all([
    prisma.doctor.upsert({
      where: { userId: doctorUsers[0].id },
      update: { specialization: "Cardiology", qualification: "MBBS, MD (Cardiology)", licenseNumber: "MED-2024-101", yearsExperience: 10, consultationFee: 800, clinicName: "Heart Care Clinic", clinicAddress: "12 MG Road, Bangalore", phone: "+91 98765 43210", bio: "Specialist in interventional cardiology with 10 years experience.", isVerified: true, availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], availableFrom: "09:00", availableTo: "17:00" },
      create: { userId: doctorUsers[0].id, specialization: "Cardiology", qualification: "MBBS, MD (Cardiology)", licenseNumber: "MED-2024-101", yearsExperience: 10, consultationFee: 800, clinicName: "Heart Care Clinic", clinicAddress: "12 MG Road, Bangalore", phone: "+91 98765 43210", bio: "Specialist in interventional cardiology with 10 years experience.", isVerified: true, availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], availableFrom: "09:00", availableTo: "17:00" },
    }),
    prisma.doctor.upsert({
      where: { userId: doctorUsers[1].id },
      update: { specialization: "General Practice", qualification: "MBBS", licenseNumber: "MED-2024-102", yearsExperience: 7, consultationFee: 500, clinicName: "City Health Clinic", clinicAddress: "45 Park Street, Mumbai", phone: "+91 98765 43211", bio: "General physician with expertise in preventive healthcare.", isVerified: true, availableDays: ["Monday", "Wednesday", "Friday", "Saturday"], availableFrom: "10:00", availableTo: "18:00" },
      create: { userId: doctorUsers[1].id, specialization: "General Practice", qualification: "MBBS", licenseNumber: "MED-2024-102", yearsExperience: 7, consultationFee: 500, clinicName: "City Health Clinic", clinicAddress: "45 Park Street, Mumbai", phone: "+91 98765 43211", bio: "General physician with expertise in preventive healthcare.", isVerified: true, availableDays: ["Monday", "Wednesday", "Friday", "Saturday"], availableFrom: "10:00", availableTo: "18:00" },
    }),
    prisma.doctor.upsert({
      where: { userId: doctorUsers[2].id },
      update: { specialization: "Pediatrics", qualification: "MBBS, MD (Pediatrics)", licenseNumber: "MED-2024-103", yearsExperience: 8, consultationFee: 600, clinicName: "Little Stars Clinic", clinicAddress: "78 Anna Salai, Chennai", phone: "+91 98765 43212", bio: "Dedicated pediatrician caring for children from birth to 18 years.", isVerified: true, availableDays: ["Tuesday", "Thursday", "Saturday"], availableFrom: "09:00", availableTo: "16:00" },
      create: { userId: doctorUsers[2].id, specialization: "Pediatrics", qualification: "MBBS, MD (Pediatrics)", licenseNumber: "MED-2024-103", yearsExperience: 8, consultationFee: 600, clinicName: "Little Stars Clinic", clinicAddress: "78 Anna Salai, Chennai", phone: "+91 98765 43212", bio: "Dedicated pediatrician caring for children from birth to 18 years.", isVerified: true, availableDays: ["Tuesday", "Thursday", "Saturday"], availableFrom: "09:00", availableTo: "16:00" },
    }),
  ]);

  // Patients
  const patientUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: "alex@healthcare.app" },
      update: {},
      create: { name: "Alex Johnson", email: "alex@healthcare.app", password: await hash("Patient@123456"), role: "PATIENT", emailVerified: new Date() },
    }),
    prisma.user.upsert({
      where: { email: "priya@healthcare.app" },
      update: {},
      create: { name: "Priya Mehta", email: "priya@healthcare.app", password: await hash("Patient@123456"), role: "PATIENT", emailVerified: new Date() },
    }),
    prisma.user.upsert({
      where: { email: "ravi@healthcare.app" },
      update: {},
      create: { name: "Ravi Kumar", email: "ravi@healthcare.app", password: await hash("Patient@123456"), role: "PATIENT", emailVerified: new Date() },
    }),
    prisma.user.upsert({
      where: { email: "sneha@healthcare.app" },
      update: {},
      create: { name: "Sneha Reddy", email: "sneha@healthcare.app", password: await hash("Patient@123456"), role: "PATIENT", emailVerified: new Date() },
    }),
  ]);

  const patientProfiles = await Promise.all([
    prisma.patient.upsert({
      where: { userId: patientUsers[0].id },
      update: {},
      create: {
        userId: patientUsers[0].id, gender: "MALE", bloodGroup: "O+",
        phone: "+91 99887 76655", address: "23 Koramangala, Bangalore",
        allergies: ["Penicillin"], emergencyContactName: "Sarah Johnson",
        emergencyContactPhone: "+91 99887 76656",
      },
    }),
    prisma.patient.upsert({
      where: { userId: patientUsers[1].id },
      update: {},
      create: {
        userId: patientUsers[1].id, gender: "FEMALE", bloodGroup: "B+",
        phone: "+91 99887 76657", address: "56 Bandra West, Mumbai",
        allergies: ["Aspirin", "Sulfa drugs"], emergencyContactName: "Amit Mehta",
        emergencyContactPhone: "+91 99887 76658",
      },
    }),
    prisma.patient.upsert({
      where: { userId: patientUsers[2].id },
      update: {},
      create: {
        userId: patientUsers[2].id, gender: "MALE", bloodGroup: "A+",
        phone: "+91 99887 76659", address: "89 T Nagar, Chennai",
        allergies: [], emergencyContactName: "Kavya Kumar",
        emergencyContactPhone: "+91 99887 76660",
      },
    }),
    prisma.patient.upsert({
      where: { userId: patientUsers[3].id },
      update: {},
      create: {
        userId: patientUsers[3].id, gender: "FEMALE", bloodGroup: "AB+",
        phone: "+91 99887 76661", address: "12 Jubilee Hills, Hyderabad",
        allergies: ["Latex"], emergencyContactName: "Kiran Reddy",
        emergencyContactPhone: "+91 99887 76662",
      },
    }),
  ]);

  console.log("✅ Users & profiles created");

  // ─── Appointments ─────────────────────────────────────────────────────────

  const now = new Date();
  const appointments = [
    // Upcoming
    { patientId: patientProfiles[0].id, doctorId: doctorProfiles[0].id, scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), status: "CONFIRMED" as const, reason: "Chest pain and shortness of breath", duration: 30 },
    { patientId: patientProfiles[1].id, doctorId: doctorProfiles[0].id, scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), status: "PENDING" as const, reason: "Routine cardiac checkup", duration: 30 },
    { patientId: patientProfiles[2].id, doctorId: doctorProfiles[1].id, scheduledAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), status: "CONFIRMED" as const, reason: "Fever and cold for 3 days", duration: 20 },
    { patientId: patientProfiles[3].id, doctorId: doctorProfiles[2].id, scheduledAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), status: "PENDING" as const, reason: "Child vaccination schedule", duration: 20 },
    // Today
    { patientId: patientProfiles[0].id, doctorId: doctorProfiles[1].id, scheduledAt: new Date(now.getTime() + 2 * 60 * 60 * 1000), status: "CONFIRMED" as const, reason: "Follow-up consultation", duration: 20 },
    // Past - completed
    { patientId: patientProfiles[0].id, doctorId: doctorProfiles[0].id, scheduledAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), status: "COMPLETED" as const, reason: "Blood pressure monitoring", duration: 30, notes: "BP normal. Continue medication." },
    { patientId: patientProfiles[1].id, doctorId: doctorProfiles[1].id, scheduledAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), status: "COMPLETED" as const, reason: "General checkup", duration: 20, notes: "All vitals normal." },
    { patientId: patientProfiles[2].id, doctorId: doctorProfiles[0].id, scheduledAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), status: "COMPLETED" as const, reason: "ECG test review", duration: 30, notes: "ECG normal. No concerns." },
    { patientId: patientProfiles[3].id, doctorId: doctorProfiles[1].id, scheduledAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), status: "CANCELLED" as const, reason: "Stomach pain", duration: 20 },
    { patientId: patientProfiles[1].id, doctorId: doctorProfiles[2].id, scheduledAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), status: "COMPLETED" as const, reason: "Child health checkup", duration: 20, notes: "Healthy. Vitamins prescribed." },
  ];

  for (const apt of appointments) {
    await prisma.appointment.create({ data: apt });
  }

  console.log("✅ Appointments created");

  // ─── Medical Records ──────────────────────────────────────────────────────

  const records = [
    { patientId: patientProfiles[0].id, doctorId: doctorProfiles[0].id, type: "LAB_RESULT" as const, title: "Complete Blood Count (CBC)", description: "Routine blood test. All values within normal range.", tags: ["blood", "routine"], recordedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
    { patientId: patientProfiles[0].id, doctorId: doctorProfiles[0].id, type: "IMAGING" as const, title: "Chest X-Ray Report", description: "No abnormalities detected. Lungs clear.", tags: ["xray", "chest"], recordedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) },
    { patientId: patientProfiles[0].id, doctorId: doctorProfiles[0].id, type: "PRESCRIPTION" as const, title: "Amlodipine 5mg Prescription", description: "For blood pressure management. Take once daily.", tags: ["bp", "medication"], recordedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
    { patientId: patientProfiles[1].id, doctorId: doctorProfiles[1].id, type: "LAB_RESULT" as const, title: "Thyroid Function Test", description: "TSH levels slightly elevated. Follow-up in 3 months.", tags: ["thyroid", "hormones"], recordedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
    { patientId: patientProfiles[1].id, type: "VACCINATION" as const, title: "COVID-19 Booster Dose", description: "Covishield booster administered. No adverse reactions.", tags: ["vaccine", "covid"], recordedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
    { patientId: patientProfiles[2].id, doctorId: doctorProfiles[0].id, type: "IMAGING" as const, title: "ECG Report", description: "Normal sinus rhythm. No ST changes.", tags: ["ecg", "heart"], recordedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) },
    { patientId: patientProfiles[2].id, type: "LAB_RESULT" as const, title: "Lipid Profile Test", description: "LDL slightly high. Dietary changes recommended.", tags: ["cholesterol", "lipid"], recordedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) },
    { patientId: patientProfiles[3].id, doctorId: doctorProfiles[2].id, type: "VACCINATION" as const, title: "Hepatitis B Vaccination", description: "First dose administered successfully.", tags: ["vaccine", "hepatitis"], recordedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) },
    { patientId: patientProfiles[3].id, type: "DISCHARGE_SUMMARY" as const, title: "Hospital Discharge Summary", description: "Admitted for appendectomy. Discharged in stable condition.", tags: ["surgery", "discharge"], recordedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) },
  ];

  for (const record of records) {
    await prisma.medicalRecord.create({ data: record });
  }

  console.log("✅ Medical records created");

  // ─── Medicine Reminders ───────────────────────────────────────────────────

  const reminders = await Promise.all([
    // Alex - active reminders
    prisma.medicineReminder.create({
      data: {
        patientId: patientProfiles[0].id, medicineName: "Amlodipine", dosage: "5mg",
        frequency: "DAILY", times: ["08:00", "20:00"], color: "#3b82f6",
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        instructions: "Take with water after meals", status: "ACTIVE",
      },
    }),
    prisma.medicineReminder.create({
      data: {
        patientId: patientProfiles[0].id, medicineName: "Metformin", dosage: "500mg",
        frequency: "TWICE_DAILY", times: ["07:30", "19:30"], color: "#22c55e",
        startDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        instructions: "Take before meals", status: "ACTIVE",
      },
    }),
    prisma.medicineReminder.create({
      data: {
        patientId: patientProfiles[0].id, medicineName: "Vitamin D3", dosage: "1000 IU",
        frequency: "DAILY", times: ["09:00"], color: "#f59e0b",
        startDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        instructions: "Take with breakfast", status: "ACTIVE",
      },
    }),
    // Priya - active reminders
    prisma.medicineReminder.create({
      data: {
        patientId: patientProfiles[1].id, medicineName: "Levothyroxine", dosage: "50mcg",
        frequency: "DAILY", times: ["06:30"], color: "#8b5cf6",
        startDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        instructions: "Take on empty stomach, 30 min before breakfast", status: "ACTIVE",
      },
    }),
    prisma.medicineReminder.create({
      data: {
        patientId: patientProfiles[1].id, medicineName: "Iron Supplement", dosage: "65mg",
        frequency: "DAILY", times: ["13:00"], color: "#ef4444",
        startDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        instructions: "Take with Vitamin C for better absorption", status: "ACTIVE",
      },
    }),
    // Ravi - reminders
    prisma.medicineReminder.create({
      data: {
        patientId: patientProfiles[2].id, medicineName: "Atorvastatin", dosage: "10mg",
        frequency: "DAILY", times: ["21:00"], color: "#06b6d4",
        startDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
        instructions: "Take at night", status: "ACTIVE",
      },
    }),
    // Sneha - paused reminder
    prisma.medicineReminder.create({
      data: {
        patientId: patientProfiles[3].id, medicineName: "Amoxicillin", dosage: "500mg",
        frequency: "THREE_TIMES_DAILY", times: ["08:00", "14:00", "20:00"], color: "#ec4899",
        startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        instructions: "Complete full course", status: "PAUSED",
      },
    }),
  ]);

  console.log("✅ Medicine reminders created");

  // ─── Dose Logs (last 14 days) ─────────────────────────────────────────────

  const doseLogs = [];
  for (let day = 13; day >= 0; day--) {
    const date = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);

    // Alex - Amlodipine (morning + evening)
    for (const time of ["08:00", "20:00"]) {
      const [h, m] = time.split(":").map(Number);
      const scheduledAt = new Date(date);
      scheduledAt.setHours(h, m, 0, 0);
      const rand = Math.random();
      doseLogs.push({
        reminderId: reminders[0].id, patientId: patientProfiles[0].id,
        scheduledAt, status: rand > 0.15 ? "TAKEN" as const : "MISSED" as const,
        takenAt: rand > 0.15 ? scheduledAt : undefined,
      });
    }

    // Alex - Metformin
    for (const time of ["07:30", "19:30"]) {
      const [h, m] = time.split(":").map(Number);
      const scheduledAt = new Date(date);
      scheduledAt.setHours(h, m, 0, 0);
      const rand = Math.random();
      doseLogs.push({
        reminderId: reminders[1].id, patientId: patientProfiles[0].id,
        scheduledAt, status: rand > 0.1 ? "TAKEN" as const : rand > 0.05 ? "MISSED" as const : "SKIPPED" as const,
        takenAt: rand > 0.1 ? scheduledAt : undefined,
      });
    }

    // Priya - Levothyroxine
    const scheduledAt1 = new Date(date);
    scheduledAt1.setHours(6, 30, 0, 0);
    const rand1 = Math.random();
    doseLogs.push({
      reminderId: reminders[3].id, patientId: patientProfiles[1].id,
      scheduledAt: scheduledAt1, status: rand1 > 0.2 ? "TAKEN" as const : "MISSED" as const,
      takenAt: rand1 > 0.2 ? scheduledAt1 : undefined,
    });

    // Ravi - Atorvastatin
    const scheduledAt2 = new Date(date);
    scheduledAt2.setHours(21, 0, 0, 0);
    const rand2 = Math.random();
    doseLogs.push({
      reminderId: reminders[5].id, patientId: patientProfiles[2].id,
      scheduledAt: scheduledAt2, status: rand2 > 0.25 ? "TAKEN" as const : "MISSED" as const,
      takenAt: rand2 > 0.25 ? scheduledAt2 : undefined,
    });
  }

  await prisma.doseLog.createMany({ data: doseLogs });

  console.log("✅ Dose logs created");

  // ─── Doctor Slots ─────────────────────────────────────────────────────────

  const slots = [];
  for (let day = 1; day <= 7; day++) {
    const date = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
    date.setHours(0, 0, 0, 0);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends

    for (const [start, end] of [["09:00", "09:30"], ["09:30", "10:00"], ["10:00", "10:30"], ["10:30", "11:00"], ["14:00", "14:30"], ["14:30", "15:00"], ["15:00", "15:30"]]) {
      slots.push({ doctorId: doctorProfiles[0].id, date, startTime: start, endTime: end, isBooked: false });
      slots.push({ doctorId: doctorProfiles[1].id, date, startTime: start, endTime: end, isBooked: false });
    }
  }

  await prisma.doctorSlot.createMany({ data: slots, skipDuplicates: true });

  console.log("✅ Doctor slots created");

  // ─── Notifications ────────────────────────────────────────────────────────

  await prisma.notification.createMany({
    data: [
      { userId: patientUsers[0].id, title: "Appointment Confirmed", body: "Your appointment with Dr. Emily Chen is confirmed for tomorrow.", channel: "BROWSER", isRead: false },
      { userId: patientUsers[0].id, title: "Medicine Reminder", body: "Time to take Amlodipine 5mg", channel: "EMAIL", isRead: true },
      { userId: patientUsers[1].id, title: "Lab Results Ready", body: "Your thyroid function test results are now available.", channel: "BROWSER", isRead: false },
      { userId: doctorUsers[0].id, title: "New Appointment Request", body: "Priya Mehta has requested an appointment.", channel: "BROWSER", isRead: false },
      { userId: doctorUsers[1].id, title: "Appointment Today", body: "You have 3 appointments scheduled today.", channel: "BROWSER", isRead: true },
    ],
  });

  console.log("✅ Notifications created");

  // ─── Summary ──────────────────────────────────────────────────────────────

  console.log("\n🎉 All dummy data seeded successfully!\n");
  console.log("═══════════════════════════════════════════════════");
  console.log("  LOGIN CREDENTIALS");
  console.log("═══════════════════════════════════════════════════");
  console.log("  ADMIN");
  console.log("  Email:    admin@healthcare.app");
  console.log("  Password: Admin@123456");
  console.log("───────────────────────────────────────────────────");
  console.log("  DOCTORS");
  console.log("  dr.emily@healthcare.app  / Doctor@123456  (Cardiology)");
  console.log("  dr.rahul@healthcare.app  / Doctor@123456  (General Practice)");
  console.log("  dr.priya@healthcare.app  / Doctor@123456  (Pediatrics)");
  console.log("───────────────────────────────────────────────────");
  console.log("  PATIENTS");
  console.log("  alex@healthcare.app   / Patient@123456");
  console.log("  priya@healthcare.app  / Patient@123456");
  console.log("  ravi@healthcare.app   / Patient@123456");
  console.log("  sneha@healthcare.app  / Patient@123456");
  console.log("═══════════════════════════════════════════════════\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
